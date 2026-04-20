import { TripGateway } from './trip.gateway';
import { BillingModule } from '../billing/billing.module';
import { Module } from '@nestjs/common';
import { TripController } from './trip.controller';
import { TripService } from './trip.service';
import { PrismaModule } from '../prisma/prisma.module';
import { LoadModule } from '../load/load.module';

@Module({
  imports: [BillingModule, PrismaModule, LoadModule],
  controllers: [TripController],
  providers: [TripService, TripGateway],
  exports: [TripService],
})
export class TripModule {}
