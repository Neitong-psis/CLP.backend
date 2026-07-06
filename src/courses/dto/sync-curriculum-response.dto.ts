import { ApiProperty } from '@nestjs/swagger';

export class SyncCurriculumResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 5 })
  modulesCount: number;
}
