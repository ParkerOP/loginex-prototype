import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaModule } from '../prisma/prisma.module';
import { TripModule } from '../trip/trip.module';
import { BookingModule } from '../booking/booking.module';

@Module({
  imports: [PrismaModule, TripModule, BookingModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
