import { Exclude, Expose } from 'class-transformer';
import { Role } from '../../roles/domain/role';
import { Status } from '../../statuses/domain/status';
import { FileType } from '../../files/domain/file';
import { ApiProperty } from '@nestjs/swagger';

export class User {
  @ApiProperty({
    type: Number,
    description: 'Unique identifier for each user (ID)',
  })
  id: number;

  @ApiProperty({
    type: String,
    example: 'john.doe@example.com',
  })
  @Expose({ groups: ['me', 'admin'] })
  email: string | null;

  @Exclude({ toPlainOnly: true })
  passwordHash: string | null;

  @ApiProperty({
    type: String,
    example: 'John',
  })
  firstName: string | null;

  @ApiProperty({
    type: String,
    example: 'Doe',
  })
  lastName: string | null;

  @ApiProperty({
    type: () => FileType,
  })
  photo?: FileType | null;

  @ApiProperty({
    type: String,
    example: 'google_12345',
  })
  socialId?: string | null;

  @ApiProperty({
    type: String,
    example: 'google',
  })
  provider?: string;

  @ApiProperty({
    type: () => [Role],
  })
  roles: Role[];

  @ApiProperty({
    type: () => Status,
  })
  status?: Status;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  deletedAt?: Date;
}
