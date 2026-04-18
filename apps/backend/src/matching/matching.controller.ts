import { Controller, Get, Param } from '@nestjs/common';
import { MatchingService } from './matching.service';

@Controller('v1/matches')
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @Get('available/:driverId')
  async getAvailableMatchesForDriver(
    @Param('driverId') driverId: string,
  ): Promise<any> {
    return this.matchingService.getAvailableMatchesForDriver(driverId);
  }
}
