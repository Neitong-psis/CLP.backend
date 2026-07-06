import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsArray,
  ValidateNested,
  IsOptional,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class QuizOptionDto {
  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ type: String })
  @IsString()
  text: string;

  @ApiProperty({ type: Boolean })
  @IsBoolean()
  correct: boolean;
}

export class ContentSectionDto {
  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ enum: ['text', 'image', 'video', 'quiz', 'assignment'] })
  @IsEnum(['text', 'image', 'video', 'quiz', 'assignment'])
  type: 'text' | 'image' | 'video' | 'quiz' | 'assignment';

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  text?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  videoTitle?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  videoUrl?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  question?: string;

  @ApiPropertyOptional({ enum: ['single', 'multiple'] })
  @IsOptional()
  @IsEnum(['single', 'multiple'])
  answerFormat?: 'single' | 'multiple';

  @ApiPropertyOptional({ type: [QuizOptionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuizOptionDto)
  options?: QuizOptionDto[];

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  assignmentDesc?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  dueDate?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  submissionType?: string;
}

export class SyncLessonDto {
  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ type: String })
  @IsString()
  title: string;

  @ApiPropertyOptional({ type: [ContentSectionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContentSectionDto)
  sections?: ContentSectionDto[];
}

export class SyncModuleDto {
  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ type: String })
  @IsString()
  title: string;

  @ApiProperty({ type: [SyncLessonDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncLessonDto)
  lessons: SyncLessonDto[];
}

export class SyncCurriculumDto {
  @ApiProperty({ type: [SyncModuleDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncModuleDto)
  modules: SyncModuleDto[];
}
