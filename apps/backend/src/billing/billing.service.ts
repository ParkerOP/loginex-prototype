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
      // Base logic: Pro drivers get lower fees or zero fees, Free drivers pay a fixed amount per trip
      let feeAmount = 0;
      if (trip.driver.planType === 'FREE') {
        feeAmount = 50.0; // Example fixed fee for free tier
      } else {
        feeAmount = 10.0; // Example lower fee for pro tier
      }

      const feeRecord = await prisma.platformFeeRecord.create({
        data: {
          tripId: trip.id,
          amount: feeAmount,
          status: 'PENDING',
        },
      });

      // TODO: Integrate RazorPay UPI for capturing payments and verifying transaction webhooks
      // 2. Generate Invoice for Shipper
      // Assuming a base rate based on weight/distance for now, simplified to a fixed value
      let tripCost = 500.0;

      // Pro/SME shippers might get discounts or bulk invoicing later,
      // but for now we issue an invoice per trip.
      if (trip.booking.load.shipper.planType === 'SME') {
        tripCost = 450.0; // SME discount
      }

      const invoice = await prisma.invoice.create({
        data: {
          tripId: trip.id,
          shipperId: trip.booking.load.shipperId,
          amount: tripCost,
          status: 'ISSUED',
          fileUrl: `https://dummy-bucket.s3.amazonaws.com/invoices/${trip.id}.pdf`, // Mock PDF link
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
}
