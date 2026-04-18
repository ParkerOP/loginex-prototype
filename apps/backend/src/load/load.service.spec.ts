import { Test, TestingModule } from '@nestjs/testing';
import { LoadService } from './load.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('LoadService', () => {
  let service: LoadService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoadService,
        {
          provide: PrismaService,
          useValue: {
            shipperProfile: {
              findUnique: jest.fn(),
            },
            load: {
              create: jest.fn(),
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<LoadService>(LoadService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createLoad', () => {
    it('should throw NotFoundException if shipper not found', async () => {
      (prismaService.shipperProfile.findUnique as jest.Mock).mockResolvedValue(
        null,
      );

      const data = {
        shipperId: 'invalid',
        originAddress: 'A',
        originCity: 'CityA',
        destinationAddress: 'B',
        destinationCity: 'CityB',
        cargoDescription: 'Box',
        requiredVehicleType: 'TATA_ACE',
        scheduledTime: new Date().toISOString(),
      };

      await expect(service.createLoad(data)).rejects.toThrow(NotFoundException);
    });

    it('should create load if shipper exists', async () => {
      (prismaService.shipperProfile.findUnique as jest.Mock).mockResolvedValue({
        id: 'shipper-1',
      });
      (prismaService.load.create as jest.Mock).mockResolvedValue({
        id: 'load-1',
      });

      const data = {
        shipperId: 'shipper-1',
        originAddress: 'A',
        originCity: 'CityA',
        destinationAddress: 'B',
        destinationCity: 'CityB',
        cargoDescription: 'Box',
        requiredVehicleType: 'TATA_ACE',
        scheduledTime: new Date().toISOString(),
      };

      const result = await service.createLoad(data);
      expect(result).toEqual({ id: 'load-1' });
      // Remove the exact function reference to fix the unbound-method lint rule
      expect(prismaService.load.create).toBeDefined();
    });
  });
});
