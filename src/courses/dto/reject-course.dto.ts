import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RejectCourseDto {
  @ApiProperty({
    example:
      'Please improve the course description and add more details to Module 1.',
    description:
      'Rejection feedback for the course creator, describing what needs improvement',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(10, { message: 'Feedback must be at least 10 characters long' })
  feedback: string;
}
