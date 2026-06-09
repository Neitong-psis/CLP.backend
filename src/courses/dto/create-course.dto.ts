import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsNumber,
  IsBoolean,
  IsObject,
} from 'class-validator';

export class CreateCourseDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  instructorId?: number | null;

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

  @ApiPropertyOptional({ example: false, type: Boolean })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  meta?: Record<string, any> | null;
}
