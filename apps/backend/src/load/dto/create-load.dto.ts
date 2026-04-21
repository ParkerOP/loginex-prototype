import { IsNotEmpty, IsString, IsOptional, IsNumber, IsDateString } from 'class-validator';

export class CreateLoadDto {
  @IsNotEmpty()
  @IsString()
  shipperId: string;

  @IsNotEmpty()
  @IsString()
  originAddress: string;

  @IsNotEmpty()
  @IsString()
  originCity: string;

  @IsNotEmpty()
  @IsString()
  destinationAddress: string;

  @IsNotEmpty()
  @IsString()
  destinationCity: string;

  @IsNotEmpty()
  @IsString()
  cargoDescription: string;

  @IsNotEmpty()
  @IsString()
  requiredVehicleType: string;

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsNotEmpty()
  @IsDateString()
  scheduledTime: string;

  @IsOptional()
  @IsString()
  specialInstructions?: string;
}
