import { IsNotEmpty, IsString, IsIn } from 'class-validator';

export class CreateDeviceTokenDto {
  @IsNotEmpty()
  @IsString()
  token: string;

  @IsNotEmpty()
  @IsString()
  @IsIn(['ANDROID', 'IOS', 'WEB'])
  platform: string;
}
