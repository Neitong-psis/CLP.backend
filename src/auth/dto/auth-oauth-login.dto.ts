import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class AuthOAuthLoginDto {
  @ApiPropertyOptional({ example: 'eyJhbGciOiJSUzI1NiIs...' })
  @IsOptional()
  @IsString()
  idToken?: string;

  @ApiPropertyOptional({ example: 'EAACEdEose0cBA...' })
  @IsOptional()
  @IsString()
  accessToken?: string;

  @ApiPropertyOptional({ example: 'c8f1a2b3d4...' })
  @IsOptional()
  @IsString()
  authorizationCode?: string;

  @ApiPropertyOptional({ example: 'John' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe' })
  @IsOptional()
  @IsString()
  lastName?: string;
}
