import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { BudgetsService } from './budgets.service';

@Controller('budgets')
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Post('monthly')
  async setMonthlyBudget(@Body() body: { userId: string; amount: number }) {
    return this.budgetsService.setMonthlyBudget(body.userId, body.amount);
  }

  @Post('category')
  async setCategoryBudget(@Body() body: { userId: string; categoryId: string; amount: number }) {
    return this.budgetsService.setCategoryBudget(body.userId, body.categoryId, body.amount);
  }

  @Get('analyze')
  async analyzeBudget(@Query('userId') userId: string, @Query('listId') listId: string) {
    return this.budgetsService.analyzeBudget(userId, listId);
  }

  @Get('dashboard')
  async getDashboardData(@Query('userId') userId: string) {
    // Si no hay userId en desarrollo, usamos uno por defecto o nulo
    return this.budgetsService.getDashboardData(userId || 'test-user-id');
  }
}
