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

  async getInvestorMetrics() {
    const [
      totalLoads,
      distinctMatchedLoads,
      totalBookings,
      totalTrips,
      deliveredTrips,
      loadStatusGroups,
      tripStatusGroups,
      invoiceAgg,
      pendingFeeAgg,
      paidFeeAgg,
      openDisputes,
      resolvedDisputes,
      podCount,
      avgTrustScoreAgg,
    ] = await Promise.all([
      this.prisma.load.count(),
      this.prisma.matchSuggestion.findMany({
        distinct: ['loadId'],
        select: { loadId: true },
      }),
      this.prisma.booking.count(),
      this.prisma.trip.count(),
      this.prisma.trip.count({ where: { status: 'DELIVERED' } }),
      this.prisma.load.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
      this.prisma.trip.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
      this.prisma.invoice.aggregate({
        _sum: { amount: true },
        _count: { _all: true },
      }),
      this.prisma.platformFeeRecord.aggregate({
        where: { status: 'PENDING' },
        _sum: { amount: true },
      }),
      this.prisma.platformFeeRecord.aggregate({
        where: { status: 'PAID' },
        _sum: { amount: true },
      }),
      this.prisma.dispute.count({ where: { status: 'OPEN' } }),
      this.prisma.dispute.count({ where: { status: 'RESOLVED' } }),
      this.prisma.proofOfDelivery.count(),
      this.prisma.driverProfile.aggregate({
        _avg: { trustScore: true },
      }),
    ]);

    const loadStatusBreakdown = Object.fromEntries(
      loadStatusGroups.map((group) => [group.status, group._count._all]),
    );
    const tripStatusBreakdown = Object.fromEntries(
      tripStatusGroups.map((group) => [group.status, group._count._all]),
    );

    const posted = totalLoads;
    const matched = distinctMatchedLoads.length;
    const booked = totalBookings;
    const delivered = deliveredTrips;
    const deliveredConversionPct =
      posted > 0 ? Number(((delivered / posted) * 100).toFixed(2)) : 0;
    const podCoveragePct =
      delivered > 0 ? Number(((podCount / delivered) * 100).toFixed(2)) : 0;

    return {
      funnel: {
        posted,
        matched,
        booked,
        started: totalTrips,
        delivered,
        deliveredConversionPct,
      },
      revenue: {
        invoiceCount: invoiceAgg._count._all,
        invoiceTotal: Number(invoiceAgg._sum.amount || 0),
        platformFeePending: Number(pendingFeeAgg._sum.amount || 0),
        platformFeeCollected: Number(paidFeeAgg._sum.amount || 0),
      },
      trustAndRisk: {
        avgDriverTrustScore: Number((avgTrustScoreAgg._avg.trustScore || 0).toFixed(2)),
        openDisputes,
        resolvedDisputes,
        podCount,
        podCoveragePct,
      },
      breakdown: {
        loadStatus: loadStatusBreakdown,
        tripStatus: tripStatusBreakdown,
      },
    };
  }

  async simulateLoadLifecycle(options?: {
    fraudMode?: boolean;
    createDispute?: boolean;
  }) {
    this.logger.log('Starting full load lifecycle simulation...');
    const fraudMode = options?.fraudMode ?? true;
    const createDispute = options?.createDispute ?? false;

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
      latitude: fraudMode ? 19.076 : 18.6101, // fraud mode triggers unrealistic movement
      longitude: fraudMode ? 72.8777 : 73.8102,
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

    let disputeId: string | null = null;
    if (createDispute) {
      const dispute = await this.prisma.dispute.create({
        data: {
          tripId: trip.id,
          raisedById: shipperUser.id,
          reason: 'Prototype investor demo dispute: delayed unloading',
          status: 'OPEN',
        },
      });
      disputeId = dispute.id;
      this.logger.log(`Dispute ${dispute.id} opened for trip ${trip.id}.`);
    }

    return {
      success: true,
      message: 'Simulation completed successfully',
      data: {
        loadId: load.id,
        tripId: trip.id,
        disputeId,
        fraudMode,
        shipper: shipperUser,
        driver: driverUser,
      },
    };
  }

  async simulateBatch(count: number) {
    const safeCount = Math.min(Math.max(count, 1), 25);
    const simulationResults: Array<{
      loadId: string;
      tripId: string;
      disputeId: string | null;
      fraudMode: boolean;
      shipper: unknown;
      driver: unknown;
    }> = [];

    for (let index = 0; index < safeCount; index += 1) {
      // Sprinkle a few dispute scenarios for richer admin demo data.
      const shouldCreateDispute = index % 4 === 0;
      const shouldSimulateFraud = index % 3 === 0;
      const result = await this.simulateLoadLifecycle({
        createDispute: shouldCreateDispute,
        fraudMode: shouldSimulateFraud,
      });
      simulationResults.push(result.data);
    }

    return {
      success: true,
      message: `Batch simulation completed for ${safeCount} lifecycle runs`,
      data: simulationResults,
    };
  }
}
