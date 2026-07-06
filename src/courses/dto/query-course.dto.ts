import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsUUID,
  IsEnum,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { CourseStatusEnum } from '../course-status.enum';

export class QueryCourseDto {
  @ApiPropertyOptional({ example: 1 })
  @Transform(({ value }) => (value ? Number(value) : 1))
  @IsNumber()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ example: 10 })
  @Transform(({ value }) => (value ? Number(value) : 10))
  @IsNumber()
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'd3b07384-d113-4ec5-a58e-0123456789ab',
  })
  @IsUUID()
  @IsOptional()
  instructorId?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ enum: CourseStatusEnum, isArray: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',');
    }
    return value;
  })
  @IsEnum(CourseStatusEnum, { each: true })
  @IsOptional()
  status?: CourseStatusEnum[] | null;
}
