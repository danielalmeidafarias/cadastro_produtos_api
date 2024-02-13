import { IsUUID } from 'class-validator';
import { UUID } from 'crypto';

export class FindByUserDTO {
  @IsUUID()
  userId: UUID;
}
