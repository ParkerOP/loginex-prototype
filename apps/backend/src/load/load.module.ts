import { Module } from '@nestjs/common';
import { LoadService } from './load.service';
import { LoadController } from './load.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [LoadService],
  controllers: [LoadController],
  exports: [LoadService],
})
export class LoadModule {}
