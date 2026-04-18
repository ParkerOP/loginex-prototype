import { Test, TestingModule } from '@nestjs/testing';
import { BookingService } from './booking.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('BookingService', () => {
  let service: BookingService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingService,
        {
          provide: PrismaService,
          useValue: {
            load: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BookingService>(BookingService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('acceptLoad', () => {
    it('should throw NotFoundException if load is not found', async () => {
      (prismaService.load.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.acceptLoad({ loadId: '1', driverId: 'driver-1' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if load is not POSTED', async () => {
      (prismaService.load.findUnique as jest.Mock).mockResolvedValue({
        id: '1',
        status: 'BOOKED',
      });

      await expect(
        service.acceptLoad({ loadId: '1', driverId: 'driver-1' }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
