import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TripService } from '../trip/trip.service';
import { BookingService } from '../booking/booking.service';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private prisma: PrismaService,
    private tripService: TripService,
    private bookingService: BookingService,
  ) {}

  async getDashboardStats() {
    const totalUsers = await this.prisma.user.count();
    const totalShippers = await this.prisma.shipperProfile.count();
    const totalDrivers = await this.prisma.driverProfile.count();
    const totalLoads = await this.prisma.load.count();
    const activeLoads = await this.prisma.load.count({
      where: { status: { in: ['POSTED', 'MATCHING', 'BOOKED', 'IN_TRANSIT'] } },
    });
    const totalTrips = await this.prisma.trip.count();
    const activeTrips = await this.prisma.trip.count({
      where: { status: { in: ['STARTED', 'IN_TRANSIT', 'ARRIVED'] } },
    });
    const completedTrips = await this.prisma.trip.count({
      where: { status: 'DELIVERED' },
    });

    return {
      totalUsers,
      totalShippers,
      totalDrivers,
      totalLoads,
      activeLoads,
      totalTrips,
      activeTrips,
      completedTrips,
    };
  }

  async getAllLoads() {
    return this.prisma.load.findMany({
      include: {
        shipper: { include: { user: true } },
        booking: {
          include: { driver: { include: { user: true } }, trip: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async getAllUsers() {
    return this.prisma.user.findMany({
      include: {
        shipperProfile: true,
        driverProfile: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async simulateLoadLifecycle() {
    this.logger.log('Starting full load lifecycle simulation...');

    // 1. Create Mock Shipper
    const shipperUser = await this.prisma.user.create({
      data: {
        phone: `+1${Math.floor(Math.random() * 1000000000)}`,
        role: 'SHIPPER',
        shipperProfile: {
          create: {
            name: 'Simulated Corp',
            planType: 'PRO',
          },
        },
      },
      include: { shipperProfile: true },
    });

    // 2. Create Mock Driver
    const driverUser = await this.prisma.user.create({
      data: {
        phone: `+1${Math.floor(Math.random() * 1000000000)}`,
        role: 'DRIVER',
        driverProfile: {
          create: {
            name: 'Simulated Driver',
            licenseNumber: 'SIM-LIC-123',
          },
        },
      },
      include: { driverProfile: true },
    });

    // 3. Create Load
    const load = await this.prisma.load.create({
      data: {
        shipperId: shipperUser.shipperProfile!.id,
        originAddress: '123 Origin St',
        originCity: 'Mumbai',
        destinationAddress: '456 Dest St',
        destinationCity: 'Pune',
        cargoDescription: 'Simulated Cargo',
        requiredVehicleType: 'TATA_ACE',
        scheduledTime: new Date(),
        status: 'POSTED',
      },
    });
    this.logger.log(`Load ${load.id} created.`);

    // 4. Create Match Suggestion
    await this.prisma.matchSuggestion.create({
      data: {
        loadId: load.id,
        driverId: driverUser.driverProfile!.id,
        score: 95.5,
        status: 'OFFERED',
      },
    });
    this.logger.log(`Match suggested for Load ${load.id}.`);

    // 5. Driver Accepts / Booking Created
    const { trip } = await this.bookingService.acceptLoad({
      loadId: load.id,
      driverId: driverUser.driverProfile!.id,
    });
    this.logger.log(`Load ${load.id} booked. Trip ${trip.id} started.`);

    // 6. Simulate Pings & Transit
    await this.tripService.updateTripStatus({
      tripId: trip.id,
      driverId: driverUser.driverProfile!.id,
      status: 'IN_TRANSIT',
    });

    // First Ping
    await this.tripService.addLocationPing({
      tripId: trip.id,
      latitude: 18.5204,
      longitude: 73.8567,
      accuracy: 10,
    });
    this.logger.log(`Trip ${trip.id} is in transit. Initial ping recorded.`);

    // Wait a tiny bit then send a second ping very far away to trigger the fraud alert logic for demonstration
    await new Promise((resolve) => setTimeout(resolve, 100));

    await this.tripService.addLocationPing({
      tripId: trip.id,
      latitude: 19.076, // Mumbai (approx 120km away)
      longitude: 72.8777,
      accuracy: 10,
    });
    this.logger.log(
      `Trip ${trip.id} second ping recorded. Fraud flag should have triggered.`,
    );

    // 7. Arrive & Deliver
    await this.tripService.updateTripStatus({
      tripId: trip.id,
      driverId: driverUser.driverProfile!.id,
      status: 'ARRIVED',
    });
    this.logger.log(`Trip ${trip.id} arrived.`);

    await this.tripService.submitPOD({
      tripId: trip.id,
      driverId: driverUser.driverProfile!.id,
      imageUrl: 'https://via.placeholder.com/150',
      notes: 'Simulated delivery successful',
    });
    this.logger.log(`Trip ${trip.id} delivered. POD submitted.`);

    return {
      success: true,
      message: 'Simulation completed successfully',
      data: {
        loadId: load.id,
        tripId: trip.id,
        shipper: shipperUser,
        driver: driverUser,
      },
    };
  }
}
