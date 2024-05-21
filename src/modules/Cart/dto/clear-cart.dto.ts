import { ApiProperty } from '@nestjs/swagger';
import { IsJWT } from 'class-validator';

export class ClearCartDTO {
  @IsJWT()
  @ApiProperty()
  access_token: string;

  @IsJWT()
  @ApiProperty()
  refresh_token: string;
}
