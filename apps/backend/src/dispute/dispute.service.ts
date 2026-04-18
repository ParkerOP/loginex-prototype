import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DisputeService {
  constructor(private readonly prisma: PrismaService) {}

  async createDispute(data: {
    tripId: string;
    raisedById: string; // The User ID (driver or shipper)
    reason: string;
  }) {
    const trip = await this.prisma.trip.findUnique({
      where: { id: data.tripId },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    return this.prisma.dispute.create({
      data: {
        tripId: data.tripId,
        raisedById: data.raisedById,
        reason: data.reason,
        status: 'OPEN',
      },
    });
  }

  async getDisputesForTrip(tripId: string) {
    return this.prisma.dispute.findMany({
      where: { tripId },
      orderBy: { createdAt: 'desc' },
      include: { raisedBy: { select: { id: true, role: true } } },
    });
  }

  async getAllActiveDisputes() {
    return this.prisma.dispute.findMany({
      where: { status: 'OPEN' },
      orderBy: { createdAt: 'desc' },
      include: { trip: true, raisedBy: { select: { id: true, role: true } } },
    });
  }
}
