import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ApproveCourseDto {
  @ApiPropertyOptional({
    example: 'Great work! The course content is approved.',
    description: 'Optional feedback comment for course approval',
  })
  @IsOptional()
  @IsString()
  feedback?: string;
}
