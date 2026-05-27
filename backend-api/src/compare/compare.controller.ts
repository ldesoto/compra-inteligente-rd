import { Controller, Get, Param, Post, Body, Query } from '@nestjs/common';
import { CompareService } from './compare.service';

@Controller('compare')
export class CompareController {
  constructor(private readonly compareService: CompareService) {}

  @Get('list/:id')
  compareList(@Param('id') id: string) {
    return this.compareService.compareList(id);
  }

  @Post('quick')
  compareQuick(@Body() data: { items: any[] }) {
    return this.compareService.compareQuick(data.items);
  }

  @Get('product/:id')
  compareProduct(@Param('id') id: string) {
    return this.compareService.compareProduct(id);
  }

  @Get('branch/:id')
  compareByBranch(
    @Param('id') id: string,
    @Query('lat') lat: string,
    @Query('lng') lng: string,
  ) {
    return this.compareService.compareByBranch(id, parseFloat(lat), parseFloat(lng));
  }
}
