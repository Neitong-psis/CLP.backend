import { Exclude, Expose } from 'class-transformer';
import { Role } from '../../roles/domain/role';
import { Status } from '../../statuses/domain/status';
import { FileType } from '../../files/domain/file';
import { ApiProperty } from '@nestjs/swagger';

export class User {
  @ApiProperty({
    type: String,
    description: 'Unique identifier for each user (ID)',
    example: 'd3b07384-d113-4ec5-a58e-0123456789ab',
  })
  @Expose()
  id: string;

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
  @Expose()
  firstName: string | null;

  @ApiProperty({
    type: String,
    example: 'Doe',
  })
  @Expose()
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
