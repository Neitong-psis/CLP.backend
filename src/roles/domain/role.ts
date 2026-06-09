import { ApiProperty } from '@nestjs/swagger';
import { Allow } from 'class-validator';

export class Role {
  @Allow()
  @ApiProperty({
    type: String,
    description: 'Unique identifier for the role',
  })
  id: string;

  @Allow()
  @ApiProperty({
    type: String,
    example: 'admin',
  })
  name?: string;

  @Allow()
  @ApiProperty({
    type: String,
    example: 'Administrator role',
  })
  description?: string;
}
