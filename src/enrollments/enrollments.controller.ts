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
import { EnrollmentsService } from './enrollments.service';

@ApiTags('Enrollments')
@ApiBearerAuth()
@Roles(RoleEnum.admin)
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller({
  path: 'enrollments',
  version: '1',
})
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Get('stats')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Retrieve administrative enrollment stats and revenue',
  })
  async getStats() {
    return this.enrollmentsService.getStats();
  }

  @Get('analytics')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Retrieve 12-month enrollment growth analytics',
  })
  async getAnalytics() {
    return this.enrollmentsService.getAnalytics();
  }
}
