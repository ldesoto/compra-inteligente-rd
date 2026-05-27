import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AdminService {
  private flagsPath = path.join(__dirname, 'flags.json');

  constructor(private prisma: PrismaService) {}

  private readFlags() {
    try {
      if (fs.existsSync(this.flagsPath)) {
        const raw = fs.readFileSync(this.flagsPath, 'utf8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('Error leyendo feature flags:', e);
    }
    // Fallback por defecto si hay un problema
    return {
      ocrEnabled: true,
      aiEnabled: true,
      supermarketsEnabled: true,
      offersEnabled: true,
      debugMode: false,
    };
  }

  private writeFlags(flags: any) {
    try {
      fs.writeFileSync(this.flagsPath, JSON.stringify(flags, null, 2), 'utf8');
      return true;
    } catch (e) {
      console.error('Error escribiendo feature flags:', e);
      return false;
    }
  }

  async getFlags() {
    return this.readFlags();
  }

  async updateFlags(newFlags: any) {
    const current = this.readFlags();
    const updated = { ...current, ...newFlags };
    this.writeFlags(updated);
    return updated;
  }

  async getDashboardStats() {
    const [users, products, supermarkets, receipts, alerts, productMatches] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.canonicalProduct.count(),
      this.prisma.supermarket.count(),
      this.prisma.receipt.count(),
      this.prisma.alert.count(),
      this.prisma.productMatch.count(),
    ]);

    let dbSize = '0 MB';
    try {
      const stats = fs.statSync(path.join(process.cwd(), 'prisma', 'dev.db'));
      dbSize = (stats.size / (1024 * 1024)).toFixed(2) + ' MB';
    } catch (e) {}

    return {
      success: true,
      stats: {
        totalUsers: users,
        totalProducts: products,
        totalSupermarkets: supermarkets,
        totalReceipts: receipts,
        totalAlerts: alerts,
        totalProductMatches: productMatches,
        systemStatus: 'OPERATIVO',
        databaseSize: dbSize,
      },
    };
  }

  async getLogs() {
    // Obtenemos alertas reales del sistema (o de usuarios) para mostrar como logs
    const realAlerts = await this.prisma.alert.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      select: {
        type: true,
        title: true,
        message: true,
        createdAt: true
      }
    });

    const formattedLogs = realAlerts.map(alert => {
      let level = 'INFO';
      if (alert.type === 'BUDGET_WARNING' || alert.type === 'FAKE_OFFER') level = 'WARNING';
      if (alert.type === 'SYSTEM_ERROR') level = 'ERROR';

      return {
        timestamp: alert.createdAt.toISOString(),
        level,
        message: `[${alert.title}] ${alert.message}`
      };
    });

    // Añadimos un par de logs operativos base si está muy vacío
    if (formattedLogs.length === 0) {
      formattedLogs.push({
        timestamp: new Date().toISOString(),
        level: 'INFO',
        message: '📡 Sistema Inicializado correctamente. Base de datos SQLite activa.'
      });
    }

    return {
      success: true,
      logs: formattedLogs
    };
  }

  async triggerRollback() {
    // Simulamos un rollback rápido de feature flags a valores de fábrica seguros
    const defaultFlags = {
      ocrEnabled: true,
      aiEnabled: true,
      supermarketsEnabled: true,
      offersEnabled: true,
      debugMode: false,
    };
    this.writeFlags(defaultFlags);
    return {
      success: true,
      message: 'Configuración general restablecida a los valores seguros de producción. Caché depurada.',
      flags: defaultFlags
    };
  }

  async getSupermarkets() {
    return this.prisma.supermarket.findMany({
      orderBy: { name: 'asc' }
    });
  }

  async toggleSupermarket(id: string, isActive: boolean) {
    return this.prisma.supermarket.update({
      where: { id },
      data: { isActive }
    });
  }

  async getUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        monthlyBudget: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async deleteUser(id: string) {
    return this.prisma.user.delete({
      where: { id }
    });
  }
}
