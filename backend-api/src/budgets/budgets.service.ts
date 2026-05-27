import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class BudgetsService {
  constructor(private prisma: PrismaService) {}

  // 1. Configurar Presupuesto Global Mensual
  async setMonthlyBudget(userId: string, amount: number) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { monthlyBudget: amount },
      select: { id: true, name: true, monthlyBudget: true }
    });
    return { success: true, message: 'Presupuesto mensual actualizado', user };
  }

  // 2. Configurar Presupuesto por Categoría
  async setCategoryBudget(userId: string, categoryId: string, amount: number) {
    const category = await this.prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) throw new NotFoundException('Categoría no encontrada');

    const budget = await this.prisma.categoryBudget.upsert({
      where: {
        userId_categoryId: {
          userId,
          categoryId
        }
      },
      update: { amount },
      create: {
        userId,
        categoryId,
        amount
      },
      include: { category: true }
    });

    return { success: true, message: 'Presupuesto de categoría establecido', budget };
  }

  // 3. Analizar estado del presupuesto vs. una lista de compras
  async analyzeBudget(userId: string, listId: string) {
    // a. Obtener los presupuestos
    const user = await this.prisma.user.findUnique({ 
      where: { id: userId },
      include: { budgets: { include: { category: true } } }
    });
    
    if (!user) throw new NotFoundException('Usuario no encontrado');

    // b. Obtener la lista y simular su precio en el supermercado más barato
    const list = await this.prisma.shoppingList.findUnique({
      where: { id: listId },
      include: { 
        items: { 
          include: { 
            canonicalProduct: { include: { category: true } }
          } 
        } 
      }
    });

    if (!list) throw new NotFoundException('Lista no encontrada');

    // Mapeamos los costos reales por categoría en base al catálogo
    // NOTA: Para una predicción precisa, usamos el precio promedio histórico, 
    // pero para un MVP usaremos el último precio registrado.
    let totalEstimatedCost = 0;
    const categorySpending: Record<string, number> = {};

    for (const item of list.items) {
      const categoryName = item.canonicalProduct.category?.name || 'Otros';
      
      const productMatches = await this.prisma.productMatch.findMany({
        where: { canonicalProductId: item.canonicalProductId },
        include: { priceHistory: { orderBy: { timestamp: 'desc' }, take: 1 } }
      });

      // Calcular el precio promedio disponible para esta simulación
      let sum = 0;
      let count = 0;
      for (const match of productMatches) {
        if (match.priceHistory.length > 0) {
          sum += match.priceHistory[0].price;
          count++;
        }
      }
      const avgPrice = count > 0 ? Math.round((sum / count) * 100) / 100 : 0;
      const subtotal = Math.round(avgPrice * item.quantity * 100) / 100;
      
      totalEstimatedCost = Math.round((totalEstimatedCost + subtotal) * 100) / 100;
      categorySpending[categoryName] = Math.round(((categorySpending[categoryName] || 0) + subtotal) * 100) / 100;
    }

    // c. Generar Alertas si se excede el presupuesto
    const alerts = [];
    
    // Alerta global
    if (user.monthlyBudget && totalEstimatedCost > user.monthlyBudget) {
      const excess = Math.round((totalEstimatedCost - user.monthlyBudget) * 100) / 100;
      alerts.push({
        type: 'BUDGET_WARNING',
        title: 'Presupuesto Global Excedido',
        message: `Esta lista excede tu presupuesto mensual por RD$ ${excess.toFixed(2)}.`
      });
      
      // Guardar alerta en DB de forma asíncrona
      await this.prisma.alert.create({
        data: {
          userId,
          type: 'BUDGET_WARNING',
          title: 'Presupuesto Global Excedido',
          message: `Esta lista excede tu presupuesto mensual por RD$ ${excess.toFixed(2)}.`
        }
      });
    }

    // Alertas por categoría
    for (const budget of user.budgets) {
      const spent = Math.round((categorySpending[budget.category.name] || 0) * 100) / 100;
      if (spent > budget.amount) {
        alerts.push({
          type: 'BUDGET_WARNING',
          title: `Límite en ${budget.category.name} Excedido`,
          message: `Has superado tu límite de RD$ ${budget.amount} en ${budget.category.name} (Gasto estimado: RD$ ${spent.toFixed(2)}).`
        });
      }
    }

    return {
      monthlyBudget: user.monthlyBudget || 0,
      totalEstimatedCost: Math.round(totalEstimatedCost * 100) / 100,
      isOverBudget: user.monthlyBudget ? totalEstimatedCost > user.monthlyBudget : false,
      categorySpending,
      alerts
    };
  }

  async getDashboardData(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { budgets: { include: { category: true } } }
      });

      // 1. Simulación de Ahorro: Revisar todas las listas del usuario y calcular cuánto podría ahorrar.
      const lists = await this.prisma.shoppingList.findMany({
        where: { ownerId: userId },
        include: { items: { include: { canonicalProduct: true } } }
      });

      let totalPotentialSavings = 0;
      const recommendations = [];

      for (const list of lists) {
        // En una app real, usaríamos CompareService, pero aquí simulamos un % de ahorro basado en items
        let listMax = 0;
        let listMin = 0;
        
        for (const item of list.items) {
          // Obtener precios históricos del producto para calcular min y max
          const matches = await this.prisma.productMatch.findMany({
            where: { canonicalProductId: item.canonicalProductId },
            include: { priceHistory: { orderBy: { timestamp: 'desc' }, take: 1 } }
          });
          
          let pMax = 0;
          let pMin = Infinity;
          for (const m of matches) {
            if (m.priceHistory.length > 0) {
              const p = m.priceHistory[0].price;
              if (p > pMax) pMax = p;
              if (p < pMin) pMin = p;
            }
          }
          if (pMin !== Infinity && pMax > pMin) {
            listMax += (pMax * item.quantity);
            listMin += (pMin * item.quantity);
          }
        }

        if (listMax > listMin) {
          const saving = Math.round((listMax - listMin) * 100) / 100;
          totalPotentialSavings = Math.round((totalPotentialSavings + saving) * 100) / 100;
          if (saving > 100) {
            recommendations.push({
              title: `Oportunidad en ${list.name}`,
              message: `Puedes ahorrar hasta RD$ ${saving.toLocaleString('es-DO')} si optimizas esta lista en otro supermercado.`
            });
          }
        }
      }

      // 2. Recomendaciones de Ahorro (Budget limits)
      if (user?.monthlyBudget) {
        recommendations.push({
          title: 'Simulación de Presupuesto',
          message: `Mantener tu ritmo actual de compras te ahorrará RD$ ${Math.round((user.monthlyBudget * 0.15) * 100) / 100} al mes.`
        });
      }

      return {
        monthlySavings: Math.round(totalPotentialSavings * 100) / 100,
        offers: [], // Ofertas reales pueden conectarse luego
        recommendations,
        budgetAlerts: user?.budgets.length > 0 ? true : false
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      return { monthlySavings: 0, offers: [], recommendations: [] };
    }
  }
}
