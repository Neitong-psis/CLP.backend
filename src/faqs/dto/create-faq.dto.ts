import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
} from 'class-validator';

export class CreateFaqDto {
  @ApiProperty({ example: 'What is this platform about?', type: String })
  @IsNotEmpty()
  @IsString()
  question: string;

  @ApiProperty({
    example: 'It is a content learning platform for business and leadership.',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  answer: string;

  @ApiPropertyOptional({ example: 0, type: Number })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @ApiPropertyOptional({ example: true, type: Boolean })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
