import {
  Controller,
  Post,
  Body,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateDeviceTokenDto } from './dto/create-device-token.dto';

@Controller('v1/users')
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
}
