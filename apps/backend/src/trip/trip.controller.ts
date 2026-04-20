import {
  Controller,
  Post,
  Body,
  Param,
  Put,
  Get,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { TripService } from './trip.service';

@Controller('v1/trips')
export class TripController {
  constructor(private readonly tripService: TripService) {}

  @Put(':id/status')
  async updateTripStatus(
    @Param('id') id: string,
    @Body() body: { status: string; driverId: string },
  ) {
    return this.tripService.updateTripStatus({
      tripId: id,
      driverId: body.driverId,
      status: body.status,
    });
  }

  @Post(':id/pings')
  async addLocationPing(
    @Param('id') id: string,
    @Body() body: { latitude: number; longitude: number; accuracy?: number },
  ) {
    return this.tripService.addLocationPing({
      tripId: id,
      latitude: body.latitude,
      longitude: body.longitude,
      accuracy: body.accuracy,
    });
  }

  @Post(':id/pod')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  async submitPOD(
    @Param('id') id: string,
    @Body() body: { notes?: string; driverId: string },
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    const imageUrl = `/uploads/${file.filename}`;

    return this.tripService.submitPOD({
      tripId: id,
      driverId: body.driverId,
      imageUrl,
      notes: body.notes,
    });
  }

  @Post(':id/rating')
  async submitRating(
    @Param('id') id: string,
    @Body() body: { score: number; comment?: string; shipperId: string },
  ) {
    return this.tripService.submitRating({
      tripId: id,
      shipperId: body.shipperId,
      score: body.score,
      comment: body.comment,
    });
  }

  @Get('driver/:driverId')
  async getTripsByDriver(@Param('driverId') driverId: string) {
    return this.tripService.getTripsByDriver(driverId);
  }

  @Get(':id/return-loads')
  async getReturnLoads(@Param('id') id: string) {
    return this.tripService.getReturnLoadSuggestions(id);
  }
}
