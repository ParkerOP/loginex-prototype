import { Test, TestingModule } from '@nestjs/testing';
import { MatchingService } from './matching.service';
import { PrismaService } from '../prisma/prisma.service';
import { LoadService } from '../load/load.service';

describe('MatchingService', () => {
  let service: MatchingService;
  let prisma: PrismaService;
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
            load: {
              findUnique: jest.fn(),
            },
            matchSuggestion: {
              findUnique: jest.fn(),
              create: jest.fn(),
            }
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
    prisma = module.get<PrismaService>(PrismaService);
    loadService = module.get<LoadService>(LoadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAvailableMatchesForDriver', () => {
    it('should throw NotFoundException if driver not found', async () => {
      jest.spyOn(prisma.driverProfile, 'findUnique').mockResolvedValue(null);

      await expect(service.getAvailableMatchesForDriver('invalid')).rejects.toThrow('Driver not found');
    });

    it('should return empty matches if driver has no vehicles', async () => {
      jest.spyOn(prisma.driverProfile, 'findUnique').mockResolvedValue({
        id: 'driver-1',
        vehicles: [],
      } as any);

      const result = await service.getAvailableMatchesForDriver('driver-1');
      expect(result.matches).toEqual([]);
      expect(result.total).toEqual(0);
    });

    it('should correctly score loads based on vehicle type and trust score', async () => {
      jest.spyOn(prisma.driverProfile, 'findUnique').mockResolvedValue({
        id: 'driver-1',
        trustScore: 4.0,
        vehicles: [{ type: 'TATA_ACE' }],
      } as any);

      jest.spyOn(loadService, 'getAvailableLoads').mockResolvedValue([
        { id: 'load-1', requiredVehicleType: 'TATA_ACE' },
        { id: 'load-2', requiredVehicleType: '14_FT' },
      ] as any);

      const result = await service.getAvailableMatchesForDriver('driver-1');

      expect(result.matches.length).toBe(2);
      expect(result.matches[0].score).toBe(70);
      expect(result.matches[0].load.id).toBe('load-1');
      expect(result.matches[1].score).toBe(20);
      expect(result.matches[1].load.id).toBe('load-2');
    });
  });

  describe('createMatchSuggestion', () => {
    it('should create a match suggestion successfully', async () => {
      jest.spyOn(prisma.load, 'findUnique').mockResolvedValue({
        id: 'load-1',
        status: 'POSTED',
        requiredVehicleType: 'TATA_ACE'
      } as any);

      jest.spyOn(prisma.driverProfile, 'findUnique').mockResolvedValue({
        id: 'driver-1',
        trustScore: 4.0,
        vehicles: [{ type: 'TATA_ACE' }],
      } as any);

      jest.spyOn(prisma.matchSuggestion, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.matchSuggestion, 'create').mockResolvedValue({ id: 'suggestion-1' } as any);

      const result = await service.createMatchSuggestion('load-1', 'driver-1');
      expect(result).toEqual({ id: 'suggestion-1' });
      expect(prisma.matchSuggestion.create).toHaveBeenCalledWith({
        data: {
          loadId: 'load-1',
          driverId: 'driver-1',
          score: 70,
          status: 'OFFERED'
        }
      });
    });
  });
});
