import { Controller, Post, Body, Param, Put, Get } from '@nestjs/common';
import { TripService } from './trip.service';

@Controller('v1/trips')
export class TripController {
  constructor(private readonly tripService: TripService) {}

  @Put(':id/status')
  async updateTripStatus(
    @Param('id') id: string,
    @Body() body: { status: string; driverId: string },
  ) {
    return this.tripService.updateTripStatus({
      tripId: id,
      driverId: body.driverId,
      status: body.status,
    });
  }

  @Post(':id/pings')
  async addLocationPing(
    @Param('id') id: string,
    @Body() body: { latitude: number; longitude: number; accuracy?: number },
  ) {
    return this.tripService.addLocationPing({
      tripId: id,
      latitude: body.latitude,
      longitude: body.longitude,
      accuracy: body.accuracy,
    });
  }

  @Post(':id/pod')
  async submitPOD(
    @Param('id') id: string,
    @Body() body: { imageUrl: string; notes?: string; driverId: string },
  ) {
    return this.tripService.submitPOD({
      tripId: id,
      driverId: body.driverId,
      imageUrl: body.imageUrl,
      notes: body.notes,
    });
  }

  @Post(':id/rating')
  async submitRating(
    @Param('id') id: string,
    @Body() body: { score: number; comment?: string; shipperId: string },
  ) {
    return this.tripService.submitRating({
      tripId: id,
      shipperId: body.shipperId,
      score: body.score,
      comment: body.comment,
    });
  }

  @Get('driver/:driverId')
  async getTripsByDriver(@Param('driverId') driverId: string) {
    return this.tripService.getTripsByDriver(driverId);
  }

  @Get(':id/return-loads')
  async getReturnLoads(@Param('id') id: string) {
    return this.tripService.getReturnLoadSuggestions(id);
  }
}
