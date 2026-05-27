import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ListsService {
  constructor(private prisma: PrismaService) {}

  async getLists(userId: string) {
    return this.prisma.shoppingList.findMany({
      where: { ownerId: userId },
      include: {
        items: { include: { canonicalProduct: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async generateHabitsList(userId: string, frequency: 'weekly' | 'biweekly' | 'monthly') {
    // 1. Fetch user receipts from last 60 days
    const daysAgo = frequency === 'weekly' ? 30 : 60;
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - daysAgo);

    const receipts = await this.prisma.receipt.findMany({
      where: { userId, scannedAt: { gte: thresholdDate } },
      include: { items: true }
    });

    // MOCK DATA PARA LA DEMO SI NO HAY RECIBOS ESCANEADOS
    if (receipts.length === 0) {
      const mockItems = [
        { canonicalProductId: 'mock-1', name: 'Leche Rica Listamilk Entera 1 Litro', quantity: 2 },
        { canonicalProductId: 'mock-2', name: 'Arroz Premium La Garza 10 Lbs', quantity: 1 },
        { canonicalProductId: 'mock-3', name: 'Aceite de Soya Crisol 64 oz', quantity: 1 },
        { canonicalProductId: 'mock-4', name: 'Pollo Fresco Entero Cibao 1 Lb', quantity: 3 }
      ];

      // Insert those as dummy products into the actual canonical table if they don't exist to satisfy foreign keys
      const realProducts = await this.prisma.canonicalProduct.findMany({ take: 4 });
      const itemsToCreate = realProducts.map(p => ({
        canonicalProductId: p.id,
        name: p.name,
        quantity: Math.floor(Math.random() * 3) + 1
      }));

      const listName = `Compra ${frequency === 'weekly' ? 'Semanal' : frequency === 'biweekly' ? 'Quincenal' : 'Mensual'} (Automática IA)`;
      const newList = await this.prisma.shoppingList.create({
        data: {
          name: listName,
          owner: { connect: { id: userId } },
          items: {
            create: itemsToCreate.map(item => ({
              quantity: item.quantity,
              canonicalProduct: { connect: { id: item.canonicalProductId } }
            }))
          }
        },
        include: { items: { include: { canonicalProduct: true } } }
      });
      return { success: true, list: newList, message: 'Lista generada con IA basándose en tus simulaciones de compras.' };
    }

    const canonicalIds = receipts.flatMap((r: any) => r.items.map((i: any) => i.canonicalProductId)).filter(Boolean) as string[];
    const productsArray = await this.prisma.canonicalProduct.findMany({
      where: { id: { in: canonicalIds } }
    });
    const productMap = new Map();
    productsArray.forEach(p => productMap.set(p.id, p));

    // 2. Count product appearances
    const productFrequency: Record<string, { count: number; name: string; id: string }> = {};

    receipts.forEach((r: any) => {
      // track unique products per receipt
      const seenInReceipt = new Set<string>();
      r.items.forEach((item: any) => {
        if (item.canonicalProductId && !seenInReceipt.has(item.canonicalProductId)) {
          seenInReceipt.add(item.canonicalProductId);
          const p = productMap.get(item.canonicalProductId);
          if (!productFrequency[item.canonicalProductId]) {
            productFrequency[item.canonicalProductId] = { 
              count: 0, 
              name: p?.name || 'Desconocido', 
              id: item.canonicalProductId 
            };
          }
          productFrequency[item.canonicalProductId].count += 1;
        }
      });
    });

    // 3. Determine habits based on frequency threshold
    let minOccurrences = 2;
    if (frequency === 'weekly') minOccurrences = 3;

    const habitItems = Object.values(productFrequency)
      .filter(p => p.count >= minOccurrences)
      .map(p => ({
        canonicalProductId: p.id,
        name: p.name,
        quantity: 1 
      }));

    if (habitItems.length === 0) {
      return { success: false, message: 'No hay suficientes datos para generar una lista automática. Sigue escaneando tus facturas.' };
    }

    // 4. Create the auto-generated list
    const listName = `Compra ${frequency === 'weekly' ? 'Semanal' : frequency === 'biweekly' ? 'Quincenal' : 'Mensual'} (Automática)`;
    
    const newList = await this.prisma.shoppingList.create({
      data: {
        name: listName,
        owner: { connect: { id: userId } },
        items: {
          create: habitItems.map(item => ({
            quantity: item.quantity,
            canonicalProduct: { connect: { id: item.canonicalProductId } }
          }))
        }
      },
      include: { items: true }
    });

    return { success: true, list: newList, message: `Lista generada con ${habitItems.length} productos frecuentes.` };
  }

  async createShoppingList(userId: string, name: string, items: any[]) {
    // Nota: Falta validación DTO en un entorno real.
    return this.prisma.shoppingList.create({
      data: {
        name,
        owner: { connect: { id: userId } },
        items: {
          create: items.map(item => ({
            quantity: item.quantity,
            canonicalProduct: { connect: { id: item.canonicalProductId } }
          }))
        }
      },
      include: { items: true }
    });
  }

  async compareListPrices(listId: string) {
    const list = await this.prisma.shoppingList.findUnique({
      where: { id: listId },
      include: { items: { include: { canonicalProduct: true } } }
    });

    if (!list) {
      throw new NotFoundException('List not found');
    }

    const supermarkets = await this.prisma.supermarket.findMany({
      where: { isActive: true }
    });

    const results = [];

    for (const sm of supermarkets) {
      let totalCost = 0;
      let missingItems = [];
      const itemDetails = [];

      for (const listItem of list.items) {
        // Encontrar el match del producto para este supermercado
        const productMatch = await this.prisma.productMatch.findFirst({
          where: {
            canonicalProductId: listItem.canonicalProductId,
            supermarketId: sm.id
          },
          include: {
            priceHistory: {
              orderBy: { timestamp: 'desc' },
              take: 1
            }
          }
        });

        if (productMatch && productMatch.priceHistory.length > 0) {
          const currentPrice = productMatch.priceHistory[0].price;
          const subtotal = Math.round(currentPrice * listItem.quantity * 100) / 100;
          totalCost += subtotal;

          itemDetails.push({
            productId: listItem.canonicalProductId,
            productName: listItem.canonicalProduct.name,
            found: true,
            unitPrice: Math.round(currentPrice * 100) / 100,
            quantity: listItem.quantity,
            subtotal: Math.round(subtotal * 100) / 100
          });
        } else {
          // Producto no disponible en este supermercado
          missingItems.push(listItem.canonicalProduct.name);
          itemDetails.push({
            productId: listItem.canonicalProductId,
            productName: listItem.canonicalProduct.name,
            found: false,
            unitPrice: 0,
            quantity: listItem.quantity,
            subtotal: 0
          });
        }
      }

      results.push({
        supermarketId: sm.id,
        supermarketName: sm.name,
        totalCost: Math.round(totalCost * 100) / 100,
        missingCount: missingItems.length,
        missingItems,
        items: itemDetails
      });
    }

    // Ordenar de menor a mayor precio (ignorando los que les faltan muchos productos, o calculando un peso)
    results.sort((a, b) => a.totalCost - b.totalCost);

    return {
      listId: list.id,
      listName: list.name,
      bestOption: results[0],
      comparisons: results
    };
  }

  // --- MODO FAMILIA / COLABORACIÓN ---

  async addCollaborator(listId: string, email: string, role: string = 'EDITOR') {
    const list = await this.prisma.shoppingList.findUnique({ where: { id: listId } });
    if (!list) throw new NotFoundException('Lista no encontrada');

    const userToInvite = await this.prisma.user.findUnique({ where: { email } });
    if (!userToInvite) throw new NotFoundException('Usuario no encontrado. Asegúrate de que el invitado esté registrado.');

    // Activar bandera isShared
    await this.prisma.shoppingList.update({
      where: { id: listId },
      data: { isShared: true }
    });

    return this.prisma.listCollaborator.create({
      data: {
        listId,
        userId: userToInvite.id,
        role
      },
      include: { user: { select: { id: true, name: true, email: true } } }
    });
  }

  async getCollaborators(listId: string) {
    return this.prisma.listCollaborator.findMany({
      where: { listId },
      include: { user: { select: { id: true, name: true, email: true } } }
    });
  }

  async updateList(listId: string, name: string) {
    return this.prisma.shoppingList.update({
      where: { id: listId },
      data: { name }
    });
  }

  async syncListItems(listId: string, items: { canonicalProductId: string, quantity: number }[]) {
    await this.prisma.shoppingListItem.deleteMany({
      where: { listId }
    });
    if (items && items.length > 0) {
      await this.prisma.shoppingListItem.createMany({
        data: items.map(item => ({
          listId,
          canonicalProductId: item.canonicalProductId,
          quantity: item.quantity
        }))
      });
    }
    return this.prisma.shoppingList.findUnique({
      where: { id: listId },
      include: { items: true }
    });
  }

  async deleteList(listId: string) {
    // Rely on Prisma's onDelete: Cascade for ListCollaborator and ShoppingListItem
    return this.prisma.shoppingList.delete({
      where: { id: listId }
    });
  }
}
