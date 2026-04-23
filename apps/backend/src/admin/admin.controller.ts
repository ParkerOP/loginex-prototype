import { Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
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

  @Get('investor-metrics')
  getInvestorMetrics() {
    return this.adminService.getInvestorMetrics();
  }

  @Get('users')
  getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Post('simulate')
  simulateLoadLifecycle() {
    return this.adminService.simulateLoadLifecycle();
  }

  @Post('simulate-batch/:count')
  simulateLoadLifecycleBatch(@Param('count', ParseIntPipe) count: number) {
    return this.adminService.simulateBatch(count);
  }
}
