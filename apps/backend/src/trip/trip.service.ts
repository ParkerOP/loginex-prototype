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
  constructor(
    private readonly prisma: PrismaService,
    private readonly billingService: BillingService,
  ) {}

  async updateTripStatus(data: {
    tripId: string;
    driverId: string;
    status: string;
  }) {
    const trip = await this.prisma.trip.findUnique({
      where: { id: data.tripId },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    if (trip.driverId !== data.driverId) {
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

    return this.prisma.locationPing.create({
      data: {
        tripId: data.tripId,
        latitude: data.latitude,
        longitude: data.longitude,
        accuracy: data.accuracy,
      },
    });
  }

  async submitPOD(data: {
    tripId: string;
    driverId: string;
    imageUrl: string;
    notes?: string;
  }) {
    const trip = await this.prisma.trip.findUnique({
      where: { id: data.tripId },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    if (trip.driverId !== data.driverId) {
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
    return this.prisma.trip.findMany({
      where: { driverId },
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
