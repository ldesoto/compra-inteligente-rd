import { Controller, Post, Body, Get, Param, ForbiddenException } from '@nestjs/common';
import { AiService } from './ai.service';
import { AdminService } from '../admin/admin.service';

@Controller('ai')
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly adminService: AdminService
  ) {}

  @Post('chat')
  async chat(@Body() body: { userId: string; prompt: string }) {
    const flags = await this.adminService.getFlags();
    if (!flags.aiEnabled) {
      return { success: false, reply: 'El motor de sugerencias por IA está temporalmente en mantenimiento o desactivado por administración.' };
    }
    return this.aiService.chatWithAssistant(body.userId, body.prompt);
  }

  @Get('scan-fake-offers')
  async scanFakeOffers() {
    return this.aiService.analyzeFakeOffers();
  }

  @Get('smart-offers')
  async getSmartOffers() {
    const flags = await this.adminService.getFlags();
    if (!flags.aiEnabled || !flags.offersEnabled) {
      return [];
    }
    return this.aiService.getSmartOffers();
  }

  @Get('substitutes/:id')
  async getSmartSubstitutes(@Param('id') canonicalProductId: string) {
    const flags = await this.adminService.getFlags();
    if (!flags.aiEnabled) {
      return [];
    }
    return this.aiService.getSmartSubstitutes(canonicalProductId);
  }
}
