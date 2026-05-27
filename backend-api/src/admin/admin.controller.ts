import { Controller, Get, Post, Patch, Delete, Body, Param, ParseBoolPipe, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from './admin.guard';

@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('dashboard')
  async getDashboard() {
    return this.adminService.getDashboardStats();
  }

  @Get('flags')
  async getFlags() {
    return this.adminService.getFlags();
  }

  @Post('flags')
  async updateFlags(@Body() body: any) {
    return this.adminService.updateFlags(body);
  }

  @Get('logs')
  async getLogs() {
    return this.adminService.getLogs();
  }

  @Post('rollback')
  async triggerRollback() {
    return this.adminService.triggerRollback();
  }

  @Get('supermarkets')
  async getSupermarkets() {
    return this.adminService.getSupermarkets();
  }

  @Patch('supermarkets/:id')
  async toggleSupermarket(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean
  ) {
    return this.adminService.toggleSupermarket(id, isActive);
  }

  @Get('users')
  async getUsers() {
    return this.adminService.getUsers();
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }
}
