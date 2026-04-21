import { IsNotEmpty, IsString, IsIn } from 'class-validator';

export class UpdateTripStatusDto {
  @IsNotEmpty()
  @IsString()
  @IsIn(['STARTED', 'IN_TRANSIT', 'ARRIVED', 'DELIVERED'])
  status: string;

  @IsNotEmpty()
  @IsString()
  driverId: string;
}
