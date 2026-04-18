import { Module } from '@nestjs/common';
import { MatchingService } from './matching.service';
import { MatchingController } from './matching.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { LoadModule } from '../load/load.module';

@Module({
  imports: [PrismaModule, LoadModule],
  providers: [MatchingService],
  controllers: [MatchingController],
  exports: [MatchingService],
})
export class MatchingModule {}
