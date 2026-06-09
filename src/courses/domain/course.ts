import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/domain/user';
import { Category } from '../../categories/domain/category';

export class Course {
  @ApiProperty({
    type: String,
    description: 'Unique UUID identifier for the course',
  })
  id: string;

  @ApiProperty({
    type: () => User,
  })
  instructor: User;

  @ApiProperty({
    type: () => Category,
    required: false,
  })
  category?: Category | null;

  @ApiProperty({
    type: String,
    example: 'Introduction to Leadership',
  })
  title: string;

  @ApiProperty({
    type: String,
    example:
      'Learn core leadership concepts, communication strategies, and personal growth.',
    required: false,
  })
  description?: string | null;

  @ApiProperty({
    type: Number,
    example: 29.99,
  })
  price: number;

  @ApiProperty({
    type: String,
    example: 'https://example.com/images/course-thumbnail.png',
    required: false,
  })
  thumbnail?: string | null;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  isPublished: boolean;

  @ApiProperty({
    type: Object,
    required: false,
    description:
      'Dynamic JSON meta fields (tags, level, benefits, key points etc.)',
  })
  meta?: Record<string, any> | null;
}
