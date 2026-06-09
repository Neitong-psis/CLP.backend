import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class RoleDto {
  @ApiProperty()
  @IsString()
  @IsUUID()
  id: string;
}
