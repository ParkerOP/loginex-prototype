import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoadService } from '../load/load.service';

@Injectable()
export class MatchingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly loadService: LoadService,
  ) {}

  // TODO: Future enhancement: add real geospatial matching
  async getAvailableMatchesForDriver(driverId: string) {
    const driver = await this.prisma.driverProfile.findUnique({
      where: { id: driverId },
      include: { vehicles: true },
    });

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    if (driver.vehicles.length === 0) {
      return [];
    }

    const availableLoads = await this.loadService.getAvailableLoads();

    const matches = availableLoads
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

    return matches;
  }
}
