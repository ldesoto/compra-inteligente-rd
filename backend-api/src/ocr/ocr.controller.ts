import { Controller, Post, Body, Get, Query, ForbiddenException } from '@nestjs/common';
import { OcrService } from './ocr.service';
import { AdminService } from '../admin/admin.service';

@Controller('ocr')
export class OcrController {
  constructor(
    private readonly ocrService: OcrService,
    private readonly adminService: AdminService
  ) {}

  @Post('scan')
  async scanReceipt(@Body() body: { userId: string; imageBase64: string }) {
    const flags = await this.adminService.getFlags();
    if (!flags.ocrEnabled) {
      throw new ForbiddenException('El servicio de OCR está desactivado por administración temporalmente.');
    }
    return this.ocrService.processReceipt(body.userId, body.imageBase64);
  }

  @Get('inflation')
  async getInflation(@Query('userId') userId: string) {
    return this.ocrService.getPersonalInflation(userId);
  }
}
