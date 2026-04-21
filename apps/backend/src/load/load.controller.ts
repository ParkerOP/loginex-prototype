import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { LoadService } from './load.service';
import { CreateLoadDto } from './dto/create-load.dto';

@Controller('v1/loads')
export class LoadController {
  constructor(private readonly loadService: LoadService) {}

  @Post()
  async createLoad(@Body() createLoadDto: CreateLoadDto): Promise<any> {
    return this.loadService.createLoad(createLoadDto);
  }

  @Get('shipper/:shipperId')
  async getLoadsForShipper(
    @Param('shipperId') shipperId: string,
  ): Promise<any> {
    return this.loadService.getLoadsForShipper(shipperId);
  }
}
