import { Controller, Get, Post } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('loads')
  getAllLoads() {
    return this.adminService.getAllLoads();
  }

  @Get('users')
  getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Post('simulate')
  simulateLoadLifecycle() {
    return this.adminService.simulateLoadLifecycle();
  }
}
