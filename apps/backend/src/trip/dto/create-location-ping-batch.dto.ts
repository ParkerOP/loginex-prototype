import { IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateLocationPingDto } from './create-location-ping.dto';

export class CreateLocationPingBatchDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateLocationPingDto)
  pings: CreateLocationPingDto[];
}
