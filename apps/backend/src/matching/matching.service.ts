import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoadService } from '../load/load.service';

@Injectable()
export class MatchingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly loadService: LoadService,
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

  // ... previous logic
  async getAvailableMatchesForDriver(
    driverId: string,
    page: number = 1,
    limit: number = 10,
    city?: string,
    vehicleType?: string,
  ) {
    const driverProfileId = await this.resolveDriverProfileId(driverId);
    if (!driverProfileId) {
      throw new NotFoundException('Driver not found');
    }

    const driver = await this.prisma.driverProfile.findUnique({
      where: { id: driverProfileId },
      include: { vehicles: true },
    });

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    if (driver.vehicles.length === 0) {
      return { matches: [], total: 0, page, limit };
    }

    const availableLoads = await this.loadService.getAvailableLoads();

    let filteredLoads = availableLoads;

    if (city) {
      filteredLoads = filteredLoads.filter(
        (load) =>
          load.originCity.toLowerCase().includes(city.toLowerCase()) ||
          load.destinationCity.toLowerCase().includes(city.toLowerCase()),
      );
    }

    if (vehicleType) {
      filteredLoads = filteredLoads.filter(
        (load) => load.requiredVehicleType === vehicleType,
      );
    }

    const matches = filteredLoads
      .map((load) => {
        let score = 0;

        // Basic vehicle type matching
        const vehicleMatch = driver.vehicles.some(
          (v) => v.type === load.requiredVehicleType,
        );

        if (vehicleMatch) {
          score += 50;
        }

        // Add trust score influence
        score += driver.trustScore * 5;

        return {
          load,
          score,
        };
      })
      .filter((match) => match.score > 0)
      .sort((a, b) => b.score - a.score);

    const total = matches.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedMatches = matches.slice(startIndex, endIndex);

    return {
      matches: paginatedMatches,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async createMatchSuggestion(loadId: string, driverId: string) {
    const load = await this.prisma.load.findUnique({
      where: { id: loadId },
    });

    if (!load) {
      throw new NotFoundException('Load not found');
    }

    if (load.status !== 'POSTED') {
      throw new BadRequestException('Load is no longer available');
    }

    const driverProfileId = await this.resolveDriverProfileId(driverId);
    if (!driverProfileId) {
      throw new NotFoundException('Driver not found');
    }

    const driver = await this.prisma.driverProfile.findUnique({
      where: { id: driverProfileId },
      include: { vehicles: true },
    });

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    // Calculate score
    let score = 0;
    const vehicleMatch = driver.vehicles.some(
      (v) => v.type === load.requiredVehicleType,
    );

    if (vehicleMatch) {
      score += 50;
    }
    score += driver.trustScore * 5;

    // Check if match suggestion already exists
    const existing = await this.prisma.matchSuggestion.findUnique({
      where: {
        loadId_driverId: {
          loadId,
          driverId: driverProfileId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException(
        'Match suggestion already exists for this load and driver',
      );
    }

    return this.prisma.matchSuggestion.create({
      data: {
        loadId,
        driverId: driverProfileId,
        score,
        status: 'OFFERED',
      },
    });
  }
}
