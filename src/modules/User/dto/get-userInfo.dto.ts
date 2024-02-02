import { IsUUID } from 'class-validator';
import { UUID } from 'crypto';

export class GetUserInfoDTO {
  @IsUUID()
  id: UUID;
}
