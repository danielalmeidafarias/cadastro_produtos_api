import { IsJWT } from "class-validator";

export class ClearCartDTO {
  @IsJWT()
  access_token: string;

  @IsJWT()
  refresh_token: string;
}