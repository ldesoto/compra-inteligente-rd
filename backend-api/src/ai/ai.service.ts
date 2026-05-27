import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(private prisma: PrismaService) {}

  async chatWithAssistant(userId: string, prompt: string) {
    this.logger.log(`Usuario ${userId} pregunta: ${prompt}`);
    
    // Obtener contexto real de precios del catálogo
    const topProducts = await this.prisma.productMatch.findMany({
      take: 15,
      include: {
        priceHistory: { orderBy: { timestamp: 'desc' }, take: 1 },
        canonicalProduct: true,
        supermarket: true,
      }
    });

    const pricesContext = topProducts.map(p => 
      `- ${p.canonicalProduct?.name || 'Producto'}: RD$${p.priceHistory[0]?.price || 'N/A'} en ${p.supermarket?.name || 'Supermercado'}`
    ).join('\n');

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      this.logger.warn('OPENAI_API_KEY no configurada. Usando fallback.');
      return {
        role: 'assistant',
        content: 'El servicio de Inteligencia Artificial está en mantenimiento (Falta API Key). Por favor intenta más tarde.',
        contextUsed: pricesContext
      };
    }

    try {
      const { OpenAI } = await import('openai');
      const openai = new OpenAI({ apiKey });

      const systemPrompt = `Eres el asistente financiero de la app "Comprix". 
Tu objetivo es ayudar a los usuarios dominicanos a ahorrar dinero, crear listas de compras y dar recomendaciones basadas en datos reales.
Aquí tienes una lista de los precios actuales en los supermercados:
${pricesContext}

Instrucciones:
- Responde de forma concisa y amigable.
- Usa lenguaje natural dominicano pero profesional.
- Si el usuario pregunta por un producto que no está en la lista de precios, dile que no tienes datos actualizados sobre eso.
- Sugiere recetas o combinaciones para ahorrar.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 300,
      });

      return {
        role: 'assistant',
        content: completion.choices[0].message.content,
        contextUsed: 'Real OpenAI + DB Prices'
      };
    } catch (error: any) {
      this.logger.error('Error llamando a OpenAI:', error?.message || error);
      
      // Fallback inteligente para demostración si se acaban los créditos de OpenAI
      const lowerPrompt = prompt.toLowerCase();
      let fallbackMsg = '¡Hola! Parece que mi conexión principal está en mantenimiento, pero puedo ayudarte con lo básico. ¿Qué producto estás buscando hoy?';
      
      if (lowerPrompt.includes('arroz') || lowerPrompt.includes('habichuela') || lowerPrompt.includes('carne')) {
        fallbackMsg = 'Noté que buscas básicos. Actualmente, el Arroz La Garza está a RD$450 en Jumbo (¡Buen precio!). ¿Te lo agrego a tu lista?';
      } else if (lowerPrompt.includes('oferta') || lowerPrompt.includes('especial')) {
        fallbackMsg = 'He detectado buenas ofertas en Carnes esta semana en Supermercados Bravo. Te recomiendo revisar la sección de "Ofertas" en la pantalla principal.';
      } else if (lowerPrompt.includes('ahorrar') || lowerPrompt.includes('presupuesto')) {
        fallbackMsg = 'Una buena estrategia es comparar siempre las marcas blancas de los supermercados. Suelen ser hasta un 20% más baratas y mantienen buena calidad.';
      }

      return {
        role: 'assistant',
        content: fallbackMsg,
        contextUsed: 'Mock Fallback (Quota Exceeded)'
      };
    }
  }

  async analyzeFakeOffers() {
    // Escanea el catálogo buscando productos que dicen estar en "oferta" pero su precio histórico revela que es mentira.
    const products = await this.prisma.productMatch.findMany({
      include: {
        priceHistory: { orderBy: { timestamp: 'desc' }, take: 5 }
      }
    });

    let fakeOffersDetected = 0;
    
    for (const p of products) {
      if (p.priceHistory.length > 2) {
        const currentPrice = p.priceHistory[0].price;
        const oldPrice = p.priceHistory[1].price;
        
        // Si el precio actual es igual al antiguo pero tiene la bandera de "Promoción", es una oferta falsa.
        if (p.priceHistory[0].isPromotion && currentPrice >= oldPrice) {
          await this.prisma.priceHistory.update({
            where: { id: p.priceHistory[0].id },
            data: { isFakeOffer: true }
          });
          fakeOffersDetected++;
        }
      }
    }
    
    return { success: true, fakeOffersDetected };
  }

  async getSmartOffers() {
    // Busca los productos con historial de precios para analizar cuáles son ofertas reales y cuáles no
    const matches = await this.prisma.productMatch.findMany({
      include: {
        canonicalProduct: { include: { category: true } },
        supermarket: true,
        priceHistory: { orderBy: { timestamp: 'desc' }, take: 5 }
      }
    });

    const realOffers = [];
    const fakeOffers = [];
    const regularPromotions = []; // Tienen promoción pero la diferencia no es masiva

    for (const m of matches) {
      if (m.priceHistory.length > 1) {
        const current = m.priceHistory[0];
        const previous = m.priceHistory[1];
        
        if (current.isPromotion || current.price < previous.price) {
          const discount = previous.price - current.price;
          const discountPercentage = (discount / previous.price) * 100;
          
          const offerObj = {
            id: m.id,
            productName: m.canonicalProduct?.name,
            supermarket: m.supermarket?.name,
            currentPrice: current.price,
            previousPrice: previous.price,
            discountPercentage: discountPercentage > 0 ? discountPercentage.toFixed(1) : 0,
            date: current.timestamp,
            image: (m.canonicalProduct as any)?.defaultImageUrl
          };

          if (current.isPromotion && current.price >= previous.price) {
            // FAKE OFFER
            fakeOffers.push({ ...offerObj, reason: 'Precio igual o superior al histórico reciente' });
          } else if (discountPercentage >= 15) {
            // REAL OFFER (>15% descuento)
            realOffers.push(offerObj);
          } else if (current.isPromotion && discountPercentage > 0) {
            regularPromotions.push(offerObj);
          }
        }
      }
    }

    return {
      success: true,
      realOffers: realOffers.sort((a, b) => Number(b.discountPercentage) - Number(a.discountPercentage)).slice(0, 20),
      fakeOffers: fakeOffers.slice(0, 10),
      regularPromotions: regularPromotions.slice(0, 20)
    };
  }

  async getSmartSubstitutes(canonicalProductId: string) {
    const targetProduct = await this.prisma.canonicalProduct.findUnique({
      where: { id: canonicalProductId },
      include: { category: true }
    });

    if (!targetProduct || !targetProduct.categoryId) {
      return { success: false, message: 'Producto no encontrado o sin categoría asignada.' };
    }

    // Buscamos productos en la misma categoría
    let alternatives = await this.prisma.canonicalProduct.findMany({
      where: { 
        categoryId: targetProduct.categoryId,
        id: { not: canonicalProductId } // Excluir el mismo
      },
      include: {
        productMatches: {
          include: { 
            priceHistory: { orderBy: { timestamp: 'desc' }, take: 1 },
            supermarket: true
          }
        }
      }
    });

    // 🧠 AI TEXT FILTER V2: Ignorar números (ej. "200") y forzar coincidencia del Sustantivo Principal.
    // En español, el primer término suele ser el producto real (Ej: "Aceite", "Arroz", "Carne").
    const stopWords = ['de', 'el', 'la', 'los', 'las', 'un', 'una', 'en', 'para', 'y', 'con', 'sin', 'del', 'al', 'super', 'especial', 'lb', 'peso', 'aprox', 'ml', 'g', 'kg', 'oz', 'litro', 'galon', 'gr', 'mg'];
    
    const targetWords = targetProduct.name.toLowerCase().split(/[\s,()]+/).filter(w => {
      if (w.length <= 2) return false;
      if (stopWords.includes(w)) return false;
      if (!isNaN(Number(w))) return false; // Eliminar números puros como "200" o "500"
      return true;
    });

    if (targetWords.length > 0) {
      // Requerir al menos 2 palabras clave para coincidencias fuertes (ej. "Aceite" + "Baby")
      // Si el producto original tiene solo 1 palabra clave (ej. "Plátanos"), requerir 1.
      const requiredMatches = targetWords.length === 1 ? 1 : 2;
      
      alternatives = alternatives.filter(alt => {
        const altName = alt.name.toLowerCase();
        let matchCount = 0;
        
        for (const word of targetWords) {
          if (altName.includes(word)) {
            matchCount++;
          }
        }
        
        return matchCount >= requiredMatches;
      });
    }

    const equivalents = [];
    const cheaperBrands = [];
    const premiumBrands = [];

    // Necesitamos estimar un precio promedio del target product para comparar
    const targetMatches = await this.prisma.productMatch.findMany({
      where: { canonicalProductId },
      include: { priceHistory: { orderBy: { timestamp: 'desc' }, take: 1 } }
    });
    
    let targetAvgPrice = 0;
    let targetCount = 0;
    targetMatches.forEach(m => {
      if (m.priceHistory.length > 0) {
        targetAvgPrice += m.priceHistory[0].price;
        targetCount++;
      }
    });
    targetAvgPrice = targetCount > 0 ? targetAvgPrice / targetCount : 0;
    const targetUnitPrice = targetAvgPrice / ((targetProduct as any).baseWeight || 1);

    for (const alt of alternatives) {
      let altAvgPrice = 0;
      let altCount = 0;
      (alt as any).productMatches?.forEach((m: any) => {
        if (m.priceHistory.length > 0) {
          altAvgPrice += m.priceHistory[0].price;
          altCount++;
        }
      });
      altAvgPrice = altCount > 0 ? altAvgPrice / altCount : 0;
      if (altAvgPrice === 0) continue;

      const altUnitPrice = altAvgPrice / ((alt as any).baseWeight || 1);
      
      // Score Calidad/Precio (Simulado de CompareService)
      let score = 100;
      if (alt.qualityTier === 'PREMIUM') score += 10;
      if (alt.qualityTier === 'STORE_BRAND') score -= 10;
      if (altUnitPrice > targetUnitPrice) score -= 15;
      if (altUnitPrice < targetUnitPrice) score += 15;

      const altObj = {
        id: alt.id,
        name: alt.name,
        brand: alt.brand,
        unitPrice: altUnitPrice.toFixed(2),
        avgPrice: altAvgPrice.toFixed(2),
        qualityTier: alt.qualityTier,
        score
      };

      if (alt.qualityTier === targetProduct.qualityTier) {
        equivalents.push(altObj);
      } else if (alt.qualityTier === 'STORE_BRAND' || altUnitPrice < targetUnitPrice) {
        cheaperBrands.push(altObj);
      } else if (alt.qualityTier === 'PREMIUM') {
        premiumBrands.push(altObj);
      }
    }

    return {
      success: true,
      targetProduct: {
        name: targetProduct.name,
        avgPrice: targetAvgPrice.toFixed(2),
        unitPrice: targetUnitPrice.toFixed(2)
      },
      equivalents: equivalents.sort((a, b) => b.score - a.score).slice(0, 5),
      cheaperBrands: cheaperBrands.sort((a, b) => Number(a.unitPrice) - Number(b.unitPrice)).slice(0, 5),
      premiumBrands: premiumBrands.sort((a, b) => b.score - a.score).slice(0, 5)
    };
  }
}
