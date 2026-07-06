import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CertificateTemplateDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;
}
