import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma.module';
import { ListsModule } from './lists/lists.module';
import { CompareModule } from './compare/compare.module';
import { AuthModule } from './auth/auth.module';
import { ScraperModule } from './scraper/scraper.module';
import { BudgetsModule } from './budgets/budgets.module';
import { AiModule } from './ai/ai.module';
import { OcrModule } from './ocr/ocr.module';
import { AdminModule } from './admin/admin.module';

import { StatsModule } from './stats/stats.module';

@Module({
  imports: [
    PrismaModule,
    ListsModule,
    CompareModule,
    AuthModule,
    ScraperModule,
    BudgetsModule,
    AiModule,
    OcrModule,
    AdminModule,
    StatsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
