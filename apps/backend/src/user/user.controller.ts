import {
  Controller,
  Post,
  Body,
  Req,
  HttpException,
  HttpStatus,
  Get,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateDeviceTokenDto } from './dto/create-device-token.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('device-tokens')
  async registerDeviceToken(
    @Req() req: any,
    @Body() createDeviceTokenDto: CreateDeviceTokenDto,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    return this.userService.registerDeviceToken(userId, createDeviceTokenDto);
  }

  @Get('profile')
  async getProfile(@Req() req: any) {
    const userId = req.user?.id;
    if (!userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    return this.userService.getUserProfile(userId);
  }

  @Get('drivers')
  async getDrivers() {
    return this.userService.getDrivers();
  }
}
