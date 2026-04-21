import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  Min,
  Max,
} from 'class-validator';

export class SubmitRatingDto {
  @IsNotEmpty()
  @IsString()
  shipperId: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(5)
  score: number;

  @IsOptional()
  @IsString()
  comment?: string;
}
