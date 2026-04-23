import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(private readonly prisma: PrismaService) {}

  private async resolveShipperProfileId(shipperIdOrUserId: string) {
    const byProfileId = await this.prisma.shipperProfile.findUnique({
      where: { id: shipperIdOrUserId },
      select: { id: true },
    });
    if (byProfileId) {
      return byProfileId.id;
    }

    const byUserId = await this.prisma.shipperProfile.findUnique({
      where: { userId: shipperIdOrUserId },
      select: { id: true },
    });
    if (byUserId) {
      return byUserId.id;
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { id: shipperIdOrUserId },
      select: { id: true, role: true },
    });

    if (!existingUser) {
      await this.prisma.user.create({
        data: {
          id: shipperIdOrUserId,
          role: 'SHIPPER',
          phone: `proto-shipper-${shipperIdOrUserId}`,
        },
      });
    } else if (existingUser.role !== 'SHIPPER') {
      await this.prisma.user.update({
        where: { id: shipperIdOrUserId },
        data: { role: 'SHIPPER' },
      });
    }

    const createdProfile = await this.prisma.shipperProfile.upsert({
      where: { userId: shipperIdOrUserId },
      update: {},
      create: {
        userId: shipperIdOrUserId,
        name: 'Prototype Shipper',
        planType: 'SME',
      },
      select: { id: true },
    });

    return createdProfile.id;
  }

  private async resolveDriverProfileId(driverIdOrUserId: string) {
    const byProfileId = await this.prisma.driverProfile.findUnique({
      where: { id: driverIdOrUserId },
      select: { id: true },
    });
    if (byProfileId) {
      return byProfileId.id;
    }

    const byUserId = await this.prisma.driverProfile.findUnique({
      where: { userId: driverIdOrUserId },
      select: { id: true },
    });
    if (byUserId) {
      return byUserId.id;
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { id: driverIdOrUserId },
      select: { id: true, role: true },
    });

    if (!existingUser) {
      await this.prisma.user.create({
        data: {
          id: driverIdOrUserId,
          role: 'DRIVER',
          phone: `proto-driver-${driverIdOrUserId}`,
        },
      });
    } else if (existingUser.role !== 'DRIVER') {
      await this.prisma.user.update({
        where: { id: driverIdOrUserId },
        data: { role: 'DRIVER' },
      });
    }

    const createdProfile = await this.prisma.driverProfile.upsert({
      where: { userId: driverIdOrUserId },
      update: {},
      create: {
        userId: driverIdOrUserId,
        name: 'Prototype Driver',
        licenseNumber: `SIM-${driverIdOrUserId.slice(0, 10)}`,
      },
      select: { id: true },
    });

    return createdProfile.id;
  }

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
    const shipperProfileId = await this.resolveShipperProfileId(shipperId);
    if (!shipperProfileId) {
      return [];
    }

    return this.prisma.invoice.findMany({
      where: { shipperId: shipperProfileId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getEarningsForDriver(driverId: string) {
    const driverProfileId = await this.resolveDriverProfileId(driverId);
    if (!driverProfileId) {
      return {
        total: 0,
        history: [],
      };
    }

    const trips = await this.prisma.trip.findMany({
      where: {
        driverId: driverProfileId,
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
