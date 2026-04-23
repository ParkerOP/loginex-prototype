import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(private readonly prisma: PrismaService) {}

  async handleTripCompletion(tripId: string) {
    // Wrap in transaction to ensure both fee and invoice are created safely
    return this.prisma.$transaction(async (prisma) => {
      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
        include: {
          driver: true,
          booking: {
            include: { load: { include: { shipper: true } } },
          },
        },
      });

      if (!trip) {
        throw new Error('Trip not found');
      }

      // 1. Calculate Platform Fee
      let feeAmount = 0;
      if (trip.driver.planType === 'FREE') {
        feeAmount = 50.0;
      } else {
        feeAmount = 10.0;
      }

      const feeRecord = await prisma.platformFeeRecord.create({
        data: {
          tripId: trip.id,
          amount: feeAmount,
          status: 'PENDING',
        },
      });

      // 2. Generate Invoice for Shipper
      let tripCost = 500.0;

      if (trip.booking.load.shipper.planType === 'SME') {
        tripCost = 450.0;
      }

      const invoice = await prisma.invoice.create({
        data: {
          tripId: trip.id,
          shipperId: trip.booking.load.shipperId,
          amount: tripCost,
          status: 'ISSUED',
          fileUrl: `https://dummy-bucket.s3.amazonaws.com/invoices/${trip.id}.pdf`,
        },
      });

      this.logger.log(`Created fee record and invoice for trip ${trip.id}`);

      return { feeRecord, invoice };
    });
  }

  async getInvoicesForShipper(shipperId: string) {
    return this.prisma.invoice.findMany({
      where: { shipperId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getEarningsForDriver(driverId: string) {
    const trips = await this.prisma.trip.findMany({
      where: {
        driverId: driverId,
        status: 'DELIVERED',
      },
      include: {
        booking: {
          include: {
            load: true,
          },
        },
      },
    });

    const earnings = trips.map((trip) => {
      const baseEarn = 400.0;
      return {
        tripId: trip.id,
        amount: baseEarn,
        date: trip.updatedAt,
      };
    });

    return {
      total: earnings.reduce((sum, e) => sum + e.amount, 0),
      history: earnings,
    };
  }
}
