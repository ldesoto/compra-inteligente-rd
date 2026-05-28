import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async getBudgetStats(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { monthlyBudget: true }
    });

    const monthlyBudget = user?.monthlyBudget || 0;

    // Obtener inicio y fin del mes actual
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Gasto Confirmado del Mes
    const confirmedAgg = await this.prisma.purchase.aggregate({
      where: {
        userId,
        status: 'CONFIRMED',
        purchaseDate: { gte: startOfMonth, lte: endOfMonth }
      },
      _sum: { confirmedTotal: true }
    });
    const confirmedSpent = confirmedAgg._sum.confirmedTotal || 0;

    // Gasto Estimado Pendiente (Listas en estado COMPARED o PLANNED que no han sido compradas)
    const pendingAgg = await this.prisma.shoppingList.aggregate({
      where: {
        ownerId: userId,
        status: { in: ['COMPARED', 'PLANNED'] },
        // asumiendo que no han vencido, etc.
      },
      _sum: { estimatedTotal: true }
    });
    const estimatedPending = pendingAgg._sum.estimatedTotal || 0;

    const available = monthlyBudget - confirmedSpent - estimatedPending;
    const usagePercentage = monthlyBudget > 0 ? ((confirmedSpent + estimatedPending) / monthlyBudget) * 100 : 0;

    return {
      monthlyBudget,
      confirmedSpent,
      estimatedPending,
      available,
      usagePercentage: Math.round(usagePercentage * 100) / 100
    };
  }
}
