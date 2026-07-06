import { ApiProperty } from '@nestjs/swagger';
import { Course } from './course';
import { User } from '../../users/domain/user';

export class CourseReview {
  @ApiProperty({
    type: String,
    description: 'Unique UUID identifier for the course review record',
  })
  id: string;

  @ApiProperty({
    type: () => Course,
  })
  course: Course;

  @ApiProperty({
    type: () => User,
  })
  reviewer: User;

  @ApiProperty({
    type: String,
    example: 'approved',
    description: 'Review status: approved or rejected',
  })
  status: 'approved' | 'rejected';

  @ApiProperty({
    type: String,
    example: 'The course curriculum looks complete and well-structured.',
    required: false,
    nullable: true,
  })
  feedback?: string | null;

  @ApiProperty({
    type: Date,
    example: '2026-06-11T12:00:00.000Z',
  })
  createdAt: Date;
}
