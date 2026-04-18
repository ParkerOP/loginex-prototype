import { Controller, Post, Body } from '@nestjs/common';
import { BookingService } from './booking.service';

@Controller('v1/bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post('accept')
  async acceptLoad(
    @Body() body: { loadId: string; driverId: string },
  ): Promise<any> {
    return this.bookingService.acceptLoad(body);
  }
}
