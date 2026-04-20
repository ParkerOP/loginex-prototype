import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { LoadModule } from './load/load.module';
import { MatchingModule } from './matching/matching.module';
import { BookingModule } from './booking/booking.module';
import { TripModule } from './trip/trip.module';
import { BillingModule } from './billing/billing.module';
import { DisputeModule } from './dispute/dispute.module';
import { PrototypeAuthMiddleware } from './auth/prototype-auth.middleware';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    LoadModule,
    MatchingModule,
    BookingModule,
    TripModule,
    BillingModule,
    DisputeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(PrototypeAuthMiddleware)
      .forRoutes('*'); // Apply globally to populate req.user for prototype
  }
}
