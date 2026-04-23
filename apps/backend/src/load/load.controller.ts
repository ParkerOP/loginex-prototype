import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { LoadService } from './load.service';
import { CreateLoadDto } from './dto/create-load.dto';

@Controller('v1/loads')
export class LoadController {
  constructor(private readonly loadService: LoadService) {}

  @Get('available')
  async getAvailableLoads() {
    return this.loadService.getAvailableLoads();
  }

  @Post()
  async createLoad(@Body() createLoadDto: CreateLoadDto) {
    return this.loadService.createLoad(createLoadDto);
  }

  @Get('shipper/:shipperId')
  async getLoadsForShipper(@Param('shipperId') shipperId: string) {
    return this.loadService.getLoadsForShipper(shipperId);
  }

  @Get(':id')
  async getLoadById(@Param('id') id: string) {
    return this.loadService.getLoadById(id);
  }
}
