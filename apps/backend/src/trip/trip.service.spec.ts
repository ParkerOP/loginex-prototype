import { BillingService } from '../billing/billing.service';
import { Test, TestingModule } from '@nestjs/testing';
import { TripService } from './trip.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

const mockPrismaService = {
  trip: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  },
  locationPing: {
    create: jest.fn(),
  },
  proofOfDelivery: {
    create: jest.fn(),
  },
  rating: {
    create: jest.fn(),
    aggregate: jest.fn(),
  },
  driverProfile: {
    update: jest.fn(),
  },
  load: {
    findMany: jest.fn(),
  },
  $transaction: jest.fn(),
};

describe('TripService', () => {
  let service: TripService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TripService,
        { provide: PrismaService, useValue: mockPrismaService },
        {
          provide: BillingService,
          useValue: { handleTripCompletion: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<TripService>(TripService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateTripStatus', () => {
    it('should update status successfully', async () => {
      mockPrismaService.trip.findUnique.mockResolvedValue({
        id: '1',
        driverId: 'driver1',
        status: 'STARTED',
      });
      mockPrismaService.trip.update.mockResolvedValue({
        id: '1',
        status: 'IN_TRANSIT',
      });

      const result = await service.updateTripStatus({
        tripId: '1',
        driverId: 'driver1',
        status: 'IN_TRANSIT',
      });

      expect(result.status).toBe('IN_TRANSIT');
      expect(mockPrismaService.trip.update).toHaveBeenCalled();
    });

    it('should throw BadRequestException on invalid transition', async () => {
      mockPrismaService.trip.findUnique.mockResolvedValue({
        id: '1',
        driverId: 'driver1',
        status: 'STARTED',
      });

      await expect(
        service.updateTripStatus({
          tripId: '1',
          driverId: 'driver1',
          status: 'DELIVERED',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('submitPOD', () => {
    it('should submit POD and change status to DELIVERED', async () => {
      mockPrismaService.trip.findUnique.mockResolvedValue({
        id: '1',
        driverId: 'driver1',
        status: 'ARRIVED',
      });
      mockPrismaService.proofOfDelivery.create.mockResolvedValue({
        id: 'pod1',
      });

      const result = await service.submitPOD({
        tripId: '1',
        driverId: 'driver1',
        imageUrl: 'http://example.com/pod.jpg',
      });

      expect(result.id).toBe('pod1');
      expect(mockPrismaService.trip.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { status: 'DELIVERED' },
      });
    });
  });

  describe('submitRating', () => {
    it('should submit rating and recalculate trust score', async () => {
      mockPrismaService.trip.findUnique.mockResolvedValue({
        id: '1',
        driverId: 'driver1',
        status: 'DELIVERED',
        booking: { load: { shipperId: 'shipper1' } },
      });

      mockPrismaService.$transaction.mockImplementation(async (cb) => {
        return cb(mockPrismaService);
      });

      mockPrismaService.rating.create.mockResolvedValue({
        id: 'rating1',
        score: 4,
      });
      mockPrismaService.rating.aggregate.mockResolvedValue({
        _avg: { score: 4.5 },
      });

      const result = await service.submitRating({
        tripId: '1',
        shipperId: 'shipper1',
        score: 4,
      });

      expect(result.id).toBe('rating1');
      expect(mockPrismaService.driverProfile.update).toHaveBeenCalledWith({
        where: { id: 'driver1' },
        data: { trustScore: 4.5 },
      });
    });
  });

  describe('getTripsByDriver', () => {
    it('should return trips for a given driver', async () => {
      const mockTrips = [
        { id: 'trip-1', driverId: 'driver-1', booking: { load: {} } },
      ];

      mockPrismaService.trip.findMany.mockResolvedValue(mockTrips);

      const result = await service.getTripsByDriver('driver-1');

      expect(mockPrismaService.trip.findMany).toHaveBeenCalledWith({
        where: { driverId: 'driver-1' },
        include: {
          booking: {
            include: {
              load: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockTrips);
    });
  });

  describe('getReturnLoadSuggestions', () => {
    it('should return loads originating in the dropoff city', async () => {
      mockPrismaService.trip.findUnique.mockResolvedValue({
        id: '1',
        status: 'DELIVERED',
        booking: { load: { destinationCity: 'Mumbai' } },
      });

      mockPrismaService.load.findMany.mockResolvedValue([
        { id: 'load1', originCity: 'Mumbai' },
      ]);

      const result = await service.getReturnLoadSuggestions('1');

      expect(result).toHaveLength(1);
      expect(mockPrismaService.load.findMany).toHaveBeenCalledWith({
        where: { status: 'POSTED', originCity: 'Mumbai' },
        orderBy: { createdAt: 'desc' },
        take: 5,
      });
    });
  });
});
