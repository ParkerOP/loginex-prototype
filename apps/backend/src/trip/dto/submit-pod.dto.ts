import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class SubmitPodDto {
  @IsNotEmpty()
  @IsString()
  driverId: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
