import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { LoadModule } from './load/load.module';
import { MatchingModule } from './matching/matching.module';
import { BookingModule } from './booking/booking.module';
import { TripModule } from './trip/trip.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    LoadModule,
    MatchingModule,
    BookingModule,
    TripModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
