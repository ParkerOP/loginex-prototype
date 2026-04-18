import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { LoadService } from './load.service';

@Controller('v1/loads')
export class LoadController {
  constructor(private readonly loadService: LoadService) {}

  @Post()
  async createLoad(@Body() body: any): Promise<any> {
    // In a real implementation we would use proper DTOs and validation
    return this.loadService.createLoad(body);
  }

  @Get('shipper/:shipperId')
  async getLoadsForShipper(
    @Param('shipperId') shipperId: string,
  ): Promise<any> {
    return this.loadService.getLoadsForShipper(shipperId);
  }
}
