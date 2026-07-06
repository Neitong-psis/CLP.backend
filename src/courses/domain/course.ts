import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/domain/user';
import { Category } from '../../categories/domain/category';
import { CourseStatusEnum } from '../course-status.enum';

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
    enum: CourseStatusEnum,
    example: CourseStatusEnum.TODO,
  })
  status: CourseStatusEnum;

  @ApiProperty({ type: String, required: false, example: 'intro-to-react' })
  slug?: string | null;

  @ApiProperty({ type: String, required: false, example: 'A beginner course' })
  subtitle?: string | null;

  @ApiProperty({
    type: String,
    required: false,
    enum: ['beginner', 'intermediate', 'advanced'],
  })
  level?: string | null;

  @ApiProperty({ type: String, required: false, example: '12 hours' })
  duration?: string | null;

  @ApiProperty({ type: [String], required: false })
  tags?: string[] | null;

  @ApiProperty({
    type: Object,
    required: false,
    description:
      'Dynamic JSON meta fields (tags, level, benefits, key points etc.)',
  })
  meta?: Record<string, any> | null;

  @ApiProperty({
    type: () => User,
    required: false,
    description: 'The user who created the course',
  })
  createdBy?: User | null;

  @ApiProperty({
    type: () => User,
    required: false,
    description: 'The admin who assigned the course',
  })
  assignedBy?: User | null;

  @ApiProperty({
    type: Date,
    required: false,
    description: 'Deadline date for the course content',
  })
  dueDate?: Date | null;

  @ApiProperty({
    type: String,
    required: false,
    example: 'medium',
    description: 'Priority level of the course',
  })
  priority?: string | null;

  @ApiProperty({
    type: Number,
    required: false,
    description: 'Number of active enrollments for this course',
  })
  enrolledCount?: number;
}
