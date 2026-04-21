import {
  Controller,
  Get,
  Query,
  UnauthorizedException,
  Post,
  Body,
} from '@nestjs/common';
import { MatchingService } from './matching.service';
import { CurrentUser } from '../auth/current-user.decorator';
import { SuggestMatchDto } from './dto/suggest-match.dto';

@Controller('v1/matches')
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @Get('available')
  async getAvailableMatchesForDriver(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('city') city?: string,
    @Query('vehicleType') vehicleType?: string,
  ): Promise<any> {
    if (!user || !user.id || user.role !== 'DRIVER') {
      throw new UnauthorizedException(
        'Access denied. Only DRIVER role can access available matches.',
      );
    }

    const parsedPage = page ? parseInt(page, 10) : 1;
    const parsedLimit = limit ? parseInt(limit, 10) : 10;

    return this.matchingService.getAvailableMatchesForDriver(
      user.id,
      parsedPage,
      parsedLimit,
      city,
      vehicleType,
    );
  }

  @Post('suggest')
  async suggestMatch(
    @CurrentUser() user: any,
    @Body() suggestMatchDto: SuggestMatchDto,
  ): Promise<any> {
    if (!user || !user.id || user.role !== 'DRIVER') {
      throw new UnauthorizedException(
        'Access denied. Only DRIVER role can suggest matches.',
      );
    }

    return this.matchingService.createMatchSuggestion(
      suggestMatchDto.loadId,
      user.id,
    );
  }
}
