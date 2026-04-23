import { Logger } from '@nestjs/common';
import { BillingService } from '../billing/billing.service';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const VALID_TRANSITIONS = {
  STARTED: ['IN_TRANSIT'],
  IN_TRANSIT: ['ARRIVED'],
  ARRIVED: ['DELIVERED'],
  DELIVERED: [],
};

@Injectable()
export class TripService {
  private readonly logger = new Logger(TripService.name);

  // Haversine formula to calculate distance between two coordinates in meters
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  constructor(
    private readonly prisma: PrismaService,
    private readonly billingService: BillingService,
  ) {}

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

  async updateTripStatus(data: {
    tripId: string;
    driverId: string;
    status: string;
  }) {
    const driverProfileId = await this.resolveDriverProfileId(data.driverId);
    if (!driverProfileId) {
      throw new BadRequestException('Driver not authorized for this trip');
    }

    const trip = await this.prisma.trip.findUnique({
      where: { id: data.tripId },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    if (trip.driverId !== driverProfileId) {
      throw new BadRequestException('Driver not authorized for this trip');
    }

    const allowedNextStates =
      VALID_TRANSITIONS[trip.status as keyof typeof VALID_TRANSITIONS];
    if (
      !allowedNextStates ||
      !allowedNextStates.includes(data.status as never)
    ) {
      throw new BadRequestException(
        `Invalid status transition from ${trip.status} to ${data.status}`,
      );
    }

    return this.prisma.trip.update({
      where: { id: data.tripId },
      data: { status: data.status },
    });
  }

  // TODO: Integrate Google Maps Distance Matrix / Directions API to calculate real-time ETA based on pings
  // TODO: Implement map-matching to snap noisy GPS pings to roads
  async addLocationPing(data: {
    tripId: string;
    latitude: number;
    longitude: number;
    accuracy?: number;
  }) {
    const trip = await this.prisma.trip.findUnique({
      where: { id: data.tripId },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    if (trip.status === 'DELIVERED') {
      throw new BadRequestException('Trip is already completed');
    }

    const lastPing = await this.prisma.locationPing.findFirst({
      where: { tripId: data.tripId },
      orderBy: { createdAt: 'desc' },
    });

    if (lastPing) {
      const distance = this.calculateDistance(
        lastPing.latitude,
        lastPing.longitude,
        data.latitude,
        data.longitude,
      );
      const timeDiffSeconds =
        (new Date().getTime() - lastPing.createdAt.getTime()) / 1000;

      // If time diff is > 0 and speed is > 150 km/h (approx 41.6 m/s), flag as potential fraud (GPS spoofing)
      if (timeDiffSeconds > 0) {
        const speedMps = distance / timeDiffSeconds;
        if (speedMps > 41.6) {
          this.logger.warn(
            `FRAUD ALERT: Unrealistic speed detected for trip ${data.tripId}. Speed: ${(speedMps * 3.6).toFixed(2)} km/h`,
          );
          // In a real system, we might flag the trip or driver profile in the DB here
        }
      }
    }

    return this.prisma.locationPing.create({
      data: {
        tripId: data.tripId,
        latitude: data.latitude,
        longitude: data.longitude,
        accuracy: data.accuracy,
      },
    });
  }

  async addLocationPingBatch(
    tripId: string,
    pings: { latitude: number; longitude: number; accuracy?: number }[],
  ) {
    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    if (trip.status === 'DELIVERED') {
      throw new BadRequestException('Trip is already completed');
    }

    const pingData = pings.map((ping) => ({
      tripId,
      latitude: ping.latitude,
      longitude: ping.longitude,
      accuracy: ping.accuracy,
    }));

    return this.prisma.locationPing.createMany({
      data: pingData,
    });
  }

  async submitPOD(data: {
    tripId: string;
    driverId: string;
    imageUrl: string;
    notes?: string;
  }) {
    const driverProfileId = await this.resolveDriverProfileId(data.driverId);
    if (!driverProfileId) {
      throw new BadRequestException('Driver not authorized for this trip');
    }

    const trip = await this.prisma.trip.findUnique({
      where: { id: data.tripId },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    if (trip.driverId !== driverProfileId) {
      throw new BadRequestException('Driver not authorized for this trip');
    }

    if (trip.status !== 'DELIVERED' && trip.status !== 'ARRIVED') {
      throw new BadRequestException(
        'Trip must be arrived or delivered to submit POD',
      );
    }

    const pod = await this.prisma.proofOfDelivery.create({
      data: {
        tripId: data.tripId,
        imageUrl: data.imageUrl,
        notes: data.notes,
      },
    });

    // Mark trip as delivered if not already
    if (trip.status !== 'DELIVERED') {
      await this.prisma.trip.update({
        where: { id: data.tripId },
        data: { status: 'DELIVERED' },
      });
      // Handle Phase D billing and invoice generation
      await this.billingService.handleTripCompletion(data.tripId);
    }

    return pod;
  }

  async submitRating(data: {
    tripId: string;
    shipperId: string;
    score: number;
    comment?: string;
  }) {
    const trip = await this.prisma.trip.findUnique({
      where: { id: data.tripId },
      include: { booking: { include: { load: true } } },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    if (trip.status !== 'DELIVERED') {
      throw new BadRequestException(
        'Trip must be delivered to submit a rating',
      );
    }

    if (trip.booking.load.shipperId !== data.shipperId) {
      throw new BadRequestException(
        'Only the shipper of this load can rate it',
      );
    }

    // Wrap rating and trust score update in a transaction
    return this.prisma.$transaction(async (prisma) => {
      const rating = await prisma.rating.create({
        data: {
          tripId: data.tripId,
          driverId: trip.driverId,
          shipperId: data.shipperId,
          score: data.score,
          comment: data.comment,
        },
      });

      // Recalculate driver trust score using database aggregation for better performance
      const aggregation = await prisma.rating.aggregate({
        where: { driverId: trip.driverId },
        _avg: { score: true },
      });

      const newScore = aggregation._avg.score ?? data.score;

      await prisma.driverProfile.update({
        where: { id: trip.driverId },
        data: { trustScore: newScore },
      });

      return rating;
    });
  }

  async getTripsByDriver(driverId: string) {
    const driverProfileId = await this.resolveDriverProfileId(driverId);
    if (!driverProfileId) {
      return [];
    }

    return this.prisma.trip.findMany({
      where: { driverId: driverProfileId },
      include: {
        booking: {
          include: {
            load: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getLocationPings(tripId: string) {
    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    return this.prisma.locationPing.findMany({
      where: { tripId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getReturnLoadSuggestions(tripId: string) {
    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
      include: { booking: { include: { load: true } } },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    if (trip.status !== 'DELIVERED') {
      throw new BadRequestException(
        'Return loads are only suggested for completed trips',
      );
    }

    const dropoffCity = trip.booking.load.destinationCity;

    // For the prototype, find any posted load originating in the drop-off city.
    // In reality, this would use geospatial proximity and scheduled times.
    return this.prisma.load.findMany({
      where: {
        status: 'POSTED',
        originCity: dropoffCity,
      },
      orderBy: { createdAt: 'desc' },
      take: 5, // Just return top 5
    });
  }
}
