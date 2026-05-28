import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('budget')
  async getBudgetStats(@Req() req) {
    return this.statsService.getBudgetStats(req.user.id);
  }
}
