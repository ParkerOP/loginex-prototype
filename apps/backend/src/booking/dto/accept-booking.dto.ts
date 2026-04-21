import { IsNotEmpty, IsString } from 'class-validator';

export class AcceptBookingDto {
  @IsNotEmpty()
  @IsString()
  loadId: string;

  @IsNotEmpty()
  @IsString()
  driverId: string;
}
