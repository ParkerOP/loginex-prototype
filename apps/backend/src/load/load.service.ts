import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LoadService {
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

    // Prototype-friendly fallback: auto-provision shipper user/profile by user id.
    const existingUser = await this.prisma.user.findUnique({
      where: { id: shipperIdOrUserId },
      select: { id: true, role: true, phone: true },
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

  async createLoad(data: {
    shipperId: string;
    originAddress: string;
    originCity: string;
    destinationAddress: string;
    destinationCity: string;
    cargoDescription: string;
    requiredVehicleType: string;
    weight?: number;
    scheduledTime: string;
    specialInstructions?: string;
  }) {
    // TODO: Integrate Google Maps Geocoding API for address normalization and lat/lng extraction
    // TODO: Store accurate coordinates for routing and distance calculations
    // Basic validation
    const shipperProfileId = await this.resolveShipperProfileId(data.shipperId);
    if (!shipperProfileId) {
      throw new NotFoundException('Shipper not found');
    }

    return this.prisma.load.create({
      data: {
        shipperId: shipperProfileId,
        originAddress: data.originAddress,
        originCity: data.originCity,
        destinationAddress: data.destinationAddress,
        destinationCity: data.destinationCity,
        cargoDescription: data.cargoDescription,
        requiredVehicleType: data.requiredVehicleType,
        weight: data.weight,
        scheduledTime: new Date(data.scheduledTime),
        specialInstructions: data.specialInstructions,
        status: 'POSTED',
      },
    });
  }

  async getLoadsForShipper(shipperId: string) {
    const shipperProfileId = await this.resolveShipperProfileId(shipperId);
    if (!shipperProfileId) {
      return [];
    }

    return this.prisma.load.findMany({
      where: { shipperId: shipperProfileId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAvailableLoads() {
    return this.prisma.load.findMany({
      where: { status: 'POSTED' },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getLoadById(id: string) {
    return this.prisma.load.findUnique({
      where: { id },
      include: {
        shipper: true,
        booking: {
          include: {
            trip: true,
            driver: true,
          },
        },
      },
    });
  }
}
