import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateLocationPingDto {
  @IsNotEmpty()
  @IsNumber()
  latitude: number;

  @IsNotEmpty()
  @IsNumber()
  longitude: number;

  @IsOptional()
  @IsNumber()
  accuracy?: number;
}
