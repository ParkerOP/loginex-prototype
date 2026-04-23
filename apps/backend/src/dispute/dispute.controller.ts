import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { DisputeService } from './dispute.service';

@Controller('disputes')
export class DisputeController {
  constructor(private readonly disputeService: DisputeService) {}

  @Post()
  async createDispute(
    @Body() body: { tripId: string; raisedById: string; reason: string },
  ) {
    return this.disputeService.createDispute(body);
  }

  @Get('trip/:tripId')
  async getDisputesForTrip(@Param('tripId') tripId: string) {
    return this.disputeService.getDisputesForTrip(tripId);
  }

  @Get('active')
  async getActiveDisputes() {
    return this.disputeService.getAllActiveDisputes();
  }
}
