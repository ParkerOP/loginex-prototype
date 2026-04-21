import { Controller, Post, Body } from '@nestjs/common';
import { BookingService } from './booking.service';
import { AcceptBookingDto } from './dto/accept-booking.dto';

@Controller('v1/bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post('accept')
  async acceptLoad(@Body() acceptBookingDto: AcceptBookingDto): Promise<any> {
    return this.bookingService.acceptLoad(acceptBookingDto);
  }
}
