import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookingService {
  constructor(private readonly prisma: PrismaService) {}

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

    // Prototype-friendly fallback: auto-provision driver user/profile by user id.
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

  async acceptLoad(data: { loadId: string; driverId: string }) {
    // Check if the load is available
    const load = await this.prisma.load.findUnique({
      where: { id: data.loadId },
    });

    if (!load) {
      throw new NotFoundException('Load not found');
    }

    if (load.status !== 'POSTED') {
      throw new BadRequestException(
        'Load is no longer available. Current status: ' + load.status,
      );
    }

    // Check if the driver exists
    const driverProfileId = await this.resolveDriverProfileId(data.driverId);
    if (!driverProfileId) {
      throw new NotFoundException('Driver profile not found');
    }

    // Explicit check for existing booking to prevent race conditions or duplicate accepts
    const existingBooking = await this.prisma.booking.findUnique({
      where: { loadId: data.loadId },
    });

    if (existingBooking) {
      throw new BadRequestException(
        'Load has already been booked by another driver',
      );
    }

    // Wrap the booking and state change in a transaction
    return this.prisma.$transaction(async (prisma) => {
      // 1. Create the booking
      const booking = await prisma.booking.create({
        data: {
          loadId: data.loadId,
          driverId: driverProfileId,
          status: 'CONFIRMED',
        },
      });

      // 2. Update load status
      await prisma.load.update({
        where: { id: data.loadId },
        data: { status: 'BOOKED' },
      });

      // 3. Initialize a Trip
      const trip = await prisma.trip.create({
        data: {
          bookingId: booking.id,
          driverId: driverProfileId,
          status: 'STARTED', // Ensure the trip starts in STARTED state
        },
      });

      return { booking, trip };
    });
  }
}
