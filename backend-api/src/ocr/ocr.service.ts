import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import OpenAI from 'openai';

@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);
  private openai: OpenAI;

  constructor(private prisma: PrismaService) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async processReceipt(userId: string, base64Image: string) {
    this.logger.log(`Procesando factura para usuario ${userId}...`);
    
    // Ensure base64 string doesn't have the data URL prefix for OpenAI if it does
    const base64Data = base64Image.includes('base64,') ? base64Image.split('base64,')[1] : base64Image;
    
    const isUrl = base64Image.startsWith('http://') || base64Image.startsWith('https://');
    const formattedImageUrl = isUrl ? base64Image : `data:image/jpeg;base64,${base64Data}`;

    let extractedData;
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: 'Eres un sistema de OCR para recibos de supermercados. Extrae todos los productos y devuelve el resultado en JSON estricto con el siguiente esquema: { "items": [{ "rawName": "string", "quantity": "number", "unitPrice": "number", "totalPrice": "number" }], "totalAmount": "number" }'
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Analiza este recibo:' },
              { type: 'image_url', image_url: { url: formattedImageUrl } }
            ]
          }
        ]
      });

      const jsonStr = response.choices[0]?.message?.content;
      if (!jsonStr) throw new Error('OpenAI no devolvió datos');
      extractedData = JSON.parse(jsonStr);
    } catch (e) {
      this.logger.error('Error procesando imagen OCR', e);
      return { success: false, message: 'Fallo al escanear la imagen. Intenta con otra foto.' };
    }
    
    const items = extractedData.items || [];
    const totalAmount = extractedData.totalAmount || 0;
    
    // 1. Guardar la Factura Principal
    const receipt = await this.prisma.receipt.create({
      data: {
        userId,
        totalAmount,
      }
    });

    // 2. Procesar cada ítem y hacer "Matching" Inteligente con nuestro catálogo
    const processedItems = [];
    
    for (const item of items) {
      // Intentar buscar una coincidencia en el catálogo para el "Personal Inflation Tracking"
      // En producción usaríamos búsqueda Fuzzy o Embeddings.
      const firstWord = item.rawName.split(' ')[0];
      const catalogMatch = await this.prisma.canonicalProduct.findFirst({
        where: { name: { contains: firstWord } } 
      });

      // Calcular validación de confianza OCR (básica)
      let confidence = 100;
      if (!catalogMatch) confidence = 40; // No se encontró coincidencia directa
      else if (catalogMatch.name.length !== item.rawName.length) confidence = 85;

      const receiptItem = await this.prisma.receiptItem.create({
        data: {
          receiptId: receipt.id,
          rawScannedName: item.rawName,
          quantity: item.quantity || 1,
          unitPrice: item.unitPrice || 0,
          totalPrice: item.totalPrice || 0,
          canonicalProductId: catalogMatch ? catalogMatch.id : null
        }
      });
      processedItems.push({ ...receiptItem, confidence });
    }
    
    return {
      success: true,
      message: 'Factura procesada y guardada en el historial de gastos.',
      receipt: {
        id: receipt.id,
        total: receipt.totalAmount,
        itemsCount: processedItems.length,
        items: processedItems
      }
    };
  }

  async getPersonalInflation(userId: string) {
    // Calcula cómo han subido de precio los productos que escanea en sus facturas.
    const receipts = await this.prisma.receipt.findMany({
      where: { userId },
      include: { 
        items: true
      },
      orderBy: { scannedAt: 'asc' }
    });

    if (receipts.length === 0) {
      return {
        success: false,
        message: 'No hay suficientes facturas escaneadas para calcular tu inflación personal.'
      };
    }

    // Manual fetch of canonical products to bypass ungenerated schema relations
    const canonicalIds = receipts.flatMap(r => r.items.map(i => i.canonicalProductId)).filter(Boolean) as string[];
    const productsArray = await this.prisma.canonicalProduct.findMany({
      where: { id: { in: canonicalIds } },
      include: { category: true }
    });
    const productMap = new Map();
    productsArray.forEach(p => productMap.set(p.id, p));

    // 1. Evolución del Gasto (Mensual y Trimestral)
    const monthlySpending: Record<string, number> = {};
    const quarterlySpending: Record<string, number> = {};
    const categorySpending: Record<string, number> = {};
    
    // Para medir "Productos que más subieron", necesitamos agrupar por canonicalProduct.id
    const productPriceHistory: Record<string, { name: string; prices: number[] }> = {};

    let totalSpent = 0;

    for (const receipt of receipts) {
      const date = receipt.scannedAt;
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      const quarterKey = `${date.getFullYear()}-Q${Math.floor(date.getMonth() / 3) + 1}`;
      
      monthlySpending[monthKey] = (monthlySpending[monthKey] || 0) + receipt.totalAmount;
      quarterlySpending[quarterKey] = (quarterlySpending[quarterKey] || 0) + receipt.totalAmount;
      totalSpent += receipt.totalAmount;

      for (const item of receipt.items) {
        const canonicalProduct = item.canonicalProductId ? productMap.get(item.canonicalProductId) : null;
        
        // Gasto por categoría
        const catName = canonicalProduct?.category?.name || 'Sin Categoría';
        categorySpending[catName] = (categorySpending[catName] || 0) + item.totalPrice;

        // Historial de precios de producto
        if (item.canonicalProductId && canonicalProduct) {
          if (!productPriceHistory[item.canonicalProductId]) {
            productPriceHistory[item.canonicalProductId] = {
              name: canonicalProduct.name,
              prices: []
            };
          }
          // Guardamos el unitPrice
          productPriceHistory[item.canonicalProductId].prices.push(item.unitPrice);
        }
      }
    }

    // 2. Categorías más caras (ordenadas de mayor a menor)
    const topCategories = Object.entries(categorySpending)
      .sort((a, b) => b[1] - a[1])
      .map(([name, total]) => ({ name, total }));

    // 3. Productos que más subieron de precio (Inflación)
    const inflationItems = [];
    for (const prodId in productPriceHistory) {
      const p = productPriceHistory[prodId];
      if (p.prices.length > 1) {
        const firstPrice = p.prices[0];
        const lastPrice = p.prices[p.prices.length - 1];
        if (firstPrice > 0) {
          const percentIncrease = ((lastPrice - firstPrice) / firstPrice) * 100;
          if (percentIncrease > 0) {
            inflationItems.push({
              name: p.name,
              firstPrice,
              lastPrice,
              percentIncrease: Math.round(percentIncrease)
            });
          }
        }
      }
    }

    // Ordenar los que más subieron
    inflationItems.sort((a, b) => b.percentIncrease - a.percentIncrease);

    // 4. Impacto Económico Personal (cuánto más estás pagando ahora vs antes por lo mismo)
    let totalInflationImpact = 0;
    inflationItems.forEach(i => {
      totalInflationImpact += (i.lastPrice - i.firstPrice);
    });

    return {
      success: true,
      totalSpent,
      monthlySpending,
      quarterlySpending,
      topCategories: topCategories.slice(0, 5), // Top 5
      inflationItems: inflationItems.slice(0, 5), // Top 5 productos que más subieron
      totalInflationImpact,
      personalInflationRate: totalSpent > 0 ? ((totalInflationImpact / totalSpent) * 100).toFixed(2) : 0
    };
  }
}
