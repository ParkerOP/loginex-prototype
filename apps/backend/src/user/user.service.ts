import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDeviceTokenDto } from './dto/create-device-token.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async registerDeviceToken(
    userId: string,
    createDeviceTokenDto: CreateDeviceTokenDto,
  ) {
    const { token, platform } = createDeviceTokenDto;

    // Use upsert to handle existing tokens (e.g., if re-installing app)
    const deviceToken = await this.prisma.deviceToken.upsert({
      where: { token },
      update: { userId, platform }, // Update the user association if it changed
      create: {
        userId,
        token,
        platform,
      },
    });

    return deviceToken;
  }

  async getUserProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        phone: true,
        role: true,
        shipperProfile: true,
        driverProfile: true,
      },
    });
  }

  async getDrivers() {
    return this.prisma.user.findMany({
      where: { role: 'DRIVER' },
      select: {
        id: true,
        phone: true,
        role: true,
        driverProfile: true,
      },
    });
  }
}
