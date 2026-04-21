import { IsNotEmpty, IsString } from 'class-validator';

export class SuggestMatchDto {
  @IsNotEmpty()
  @IsString()
  loadId: string;
}
