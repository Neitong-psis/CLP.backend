import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsNumber,
  IsObject,
  IsArray,
  IsIn,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { CourseStatusEnum } from '../course-status.enum';

export class CreateCourseDto {
  @ApiPropertyOptional({
    type: String,
    example: 'd3b07384-d113-4ec5-a58e-0123456789ab',
  })
  @IsOptional()
  @IsUUID()
  instructorId?: string | null;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsUUID()
  categoryId?: string | null;

  @ApiProperty({ example: 'Introduction to Leadership', type: String })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiPropertyOptional({
    example:
      'Learn core leadership concepts, communication strategies, and personal growth.',
    type: String,
  })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiPropertyOptional({ example: 29.99, type: Number })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiPropertyOptional({
    example: 'https://example.com/images/course-thumbnail.png',
    type: String,
  })
  @IsOptional()
  @IsString()
  thumbnail?: string | null;

  @ApiPropertyOptional({ example: 'intro-to-react', type: String })
  @IsOptional()
  @IsString()
  slug?: string | null;

  @ApiPropertyOptional({
    example: 'A beginner-friendly React course',
    type: String,
  })
  @IsOptional()
  @IsString()
  subtitle?: string | null;

  @ApiPropertyOptional({
    example: 'beginner',
    enum: ['beginner', 'intermediate', 'advanced'],
  })
  @IsOptional()
  @IsIn(['beginner', 'intermediate', 'advanced'])
  level?: string | null;

  @ApiPropertyOptional({ example: '12 hours', type: String })
  @IsOptional()
  @IsString()
  duration?: string | null;

  @ApiPropertyOptional({ example: ['react', 'typescript'], type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[] | null;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  meta?: Record<string, any> | null;

  @ApiPropertyOptional({
    enum: CourseStatusEnum,
    example: CourseStatusEnum.TODO,
  })
  @IsOptional()
  @IsEnum(CourseStatusEnum)
  status?: CourseStatusEnum;
  @ApiPropertyOptional({
    type: String,
    example: '2026-12-31',
    description: 'ISO Date string for course due date',
  })
  @IsOptional()
  @IsDateString()
  dueDate?: string;
  @ApiPropertyOptional({
    type: String,
    example: 'medium',
    description: 'Priority of the course: low, medium, high, urgent',
  })
  @IsOptional()
  @IsIn(['low', 'medium', 'high', 'urgent'])
  priority?: string;
}
