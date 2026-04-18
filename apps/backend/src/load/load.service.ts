import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LoadService {
  constructor(private readonly prisma: PrismaService) {}

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
    const shipper = await this.prisma.shipperProfile.findUnique({
      where: { id: data.shipperId },
    });
    if (!shipper) {
      throw new NotFoundException('Shipper not found');
    }

    return this.prisma.load.create({
      data: {
        shipperId: data.shipperId,
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
    return this.prisma.load.findMany({
      where: { shipperId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAvailableLoads() {
    return this.prisma.load.findMany({
      where: { status: 'POSTED' },
      orderBy: { createdAt: 'desc' },
    });
  }
}
