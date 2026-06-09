import {
  Controller,
  Get,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { CertificatesService } from './certificates.service';

@ApiTags('Certificates')
@ApiBearerAuth()
@Roles(RoleEnum.admin)
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller({
  path: 'certificates',
  version: '1',
})
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Get('stats')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Retrieve administrative certificates count',
  })
  async getStats() {
    return this.certificatesService.getStats();
  }
}
