import { Controller, Get, Post, Body, Param, Delete, Patch, Put, UseGuards, Req } from '@nestjs/common';
import { ListsService } from './lists.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('lists')
export class ListsController {
  constructor(private readonly listsService: ListsService) {}

  @Get()
  async getLists(@Req() req) {
    return this.listsService.getLists(req.user.id);
  }

  @Post()
  async createList(@Req() req, @Body() body: any) {
    return this.listsService.createShoppingList(req.user.id, body.name, body.items || []);
  }

  @Get(':id/compare')
  async compareList(@Param('id') id: string) {
    return this.listsService.compareListPrices(id);
  }

  @Post('recurrent')
  async generateRecurrentList(@Req() req, @Body() body: { frequency: 'weekly' | 'biweekly' | 'monthly' }) {
    return this.listsService.generateHabitsList(req.user.id, body.frequency);
  }

  // --- NUEVOS ENDPOINTS MODO FAMILIA ---
  
  @Post(':id/collaborators')
  async addCollaborator(@Param('id') listId: string, @Body() body: { email: string, role: string }) {
    return this.listsService.addCollaborator(listId, body.email, body.role);
  }
  
  @Get(':id/collaborators')
  async getCollaborators(@Param('id') listId: string) {
    return this.listsService.getCollaborators(listId);
  }

  @Post(':id/mark-purchased')
  async markPurchased(@Req() req, @Param('id') listId: string, @Body() body: any) {
    return this.listsService.markListAsPurchased(req.user.id, listId, body);
  }

  @Patch(':id')
  async updateList(@Param('id') id: string, @Body() body: { name: string }) {
    return this.listsService.updateList(id, body.name);
  }

  @Put(':id/items')
  async syncListItems(@Param('id') id: string, @Body() body: { items: any[] }) {
    return this.listsService.syncListItems(id, body.items);
  }

  @Delete(':id')
  async deleteList(@Param('id') id: string) {
    return this.listsService.deleteList(id);
  }
}
