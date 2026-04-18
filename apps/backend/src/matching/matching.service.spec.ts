import { Test, TestingModule } from '@nestjs/testing';
import { MatchingService } from './matching.service';
import { PrismaService } from '../prisma/prisma.service';
import { LoadService } from '../load/load.service';
import { NotFoundException } from '@nestjs/common';

describe('MatchingService', () => {
  let service: MatchingService;
  let prismaService: PrismaService;
  let loadService: LoadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchingService,
        {
          provide: PrismaService,
          useValue: {
            driverProfile: {
              findUnique: jest.fn(),
            },
          },
        },
        {
          provide: LoadService,
          useValue: {
            getAvailableLoads: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MatchingService>(MatchingService);
    prismaService = module.get<PrismaService>(PrismaService);
    loadService = module.get<LoadService>(LoadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAvailableMatchesForDriver', () => {
    it('should throw NotFoundException if driver not found', async () => {
      (prismaService.driverProfile.findUnique as jest.Mock).mockResolvedValue(
        null,
      );

      await expect(
        service.getAvailableMatchesForDriver('driver-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return empty array if driver has no vehicles', async () => {
      (prismaService.driverProfile.findUnique as jest.Mock).mockResolvedValue({
        id: 'driver-1',
        vehicles: [],
      });

      const result = await service.getAvailableMatchesForDriver('driver-1');
      expect(result).toEqual([]);
    });

    it('should correctly score loads based on vehicle type and trust score', async () => {
      (prismaService.driverProfile.findUnique as jest.Mock).mockResolvedValue({
        id: 'driver-1',
        trustScore: 4.0,
        vehicles: [{ type: 'TATA_ACE' }],
      });

      (loadService.getAvailableLoads as jest.Mock).mockResolvedValue([
        { id: 'load-1', requiredVehicleType: 'TATA_ACE' },
        { id: 'load-2', requiredVehicleType: '14_FT' },
      ]);

      const result = await service.getAvailableMatchesForDriver('driver-1');

      // Expected scores:
      // load-1: 50 (vehicle match) + (4.0 * 5) = 70
      // load-2: 0 (no match) + (4.0 * 5) = 20

      expect(result.length).toBe(2);
      expect(result[0].score).toBe(70);
      expect(result[0].load.id).toBe('load-1');
      expect(result[1].score).toBe(20);
      expect(result[1].load.id).toBe('load-2');
    });
  });
});
