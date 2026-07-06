import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ContentSectionDto } from './sync-curriculum.dto';

export class CurriculumLessonDto {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  title: string;

  @ApiProperty({ type: String })
  contentType: string;

  @ApiProperty({ type: Number })
  videoDurationSeconds: number;

  @ApiProperty({ type: Boolean })
  isFree: boolean;

  @ApiProperty({ type: [ContentSectionDto] })
  sections: ContentSectionDto[];
}

export class CurriculumModuleDto {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  title: string;

  @ApiProperty({ type: Number })
  orderIndex: number;

  @ApiProperty({ type: Boolean })
  isPublished: boolean;

  @ApiProperty({ type: [CurriculumLessonDto] })
  lessons: CurriculumLessonDto[];
}

export class CurriculumResponseDto {
  @ApiPropertyOptional({ type: [CurriculumModuleDto] })
  modules: CurriculumModuleDto[];
}
