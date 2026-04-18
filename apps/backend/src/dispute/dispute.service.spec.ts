import { PrismaService } from '../prisma/prisma.service';
import { Test, TestingModule } from '@nestjs/testing';
import { DisputeService } from './dispute.service';

describe('DisputeService', () => {
  let service: DisputeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DisputeService,
        {
          provide: PrismaService,
          useValue: {
            $transaction: jest.fn(),
            trip: { findUnique: jest.fn() },
            platformFeeRecord: { create: jest.fn() },
            invoice: { create: jest.fn() },
          },
        },
      ],
    }).compile();

    service = module.get<DisputeService>(DisputeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
