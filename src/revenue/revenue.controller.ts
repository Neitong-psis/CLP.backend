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
import { RevenueService } from './revenue.service';

@ApiTags('Revenue')
@ApiBearerAuth()
@Roles(RoleEnum.admin)
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller({
  path: 'revenue',
  version: '1',
})
export class RevenueController {
  constructor(private readonly revenueService: RevenueService) {}

  @Get('stats')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description:
      'Retrieve annual revenue, this-month revenue, MRR, and AOV with trends',
  })
  async getStats() {
    return this.revenueService.getStats();
  }

  @Get('monthly')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Retrieve 12-month revenue trend',
  })
  async getMonthly() {
    return this.revenueService.getMonthly();
  }
}
