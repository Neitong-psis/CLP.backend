import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsNumber,
  IsBoolean,
} from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Business Leadership', type: String })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'business-leadership', type: String })
  @IsNotEmpty()
  @IsString()
  slug: string;

  @ApiPropertyOptional({
    example: 'Courses teaching core business and strategic leadership skills.',
    type: String,
  })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiPropertyOptional({
    example: 'https://example.com/thumbnails/business.png',
    type: String,
  })
  @IsOptional()
  @IsString()
  thumbnail?: string | null;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsUUID()
  parentCategoryId?: string | null;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  path?: string | null;

  @ApiPropertyOptional({ example: 0, type: Number })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @ApiPropertyOptional({ example: true, type: Boolean })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
