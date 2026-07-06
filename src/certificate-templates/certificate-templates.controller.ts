import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CertificateTemplatesService } from './certificate-templates.service';
import { CreateCertificateTemplateDto } from './dto/create-certificate-template.dto';
import { UpdateCertificateTemplateDto } from './dto/update-certificate-template.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CertificateTemplate } from './domain/certificate-template';
import { AuthGuard } from '@nestjs/passport';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '../utils/dto/infinity-pagination-response.dto';
import { infinityPagination } from '../utils/infinity-pagination';
import { FindAllCertificateTemplatesDto } from './dto/find-all-certificate-templates.dto';

@ApiTags('Certificatetemplates')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'certificate-templates',
  version: '1',
})
export class CertificateTemplatesController {
  constructor(
    private readonly certificateTemplatesService: CertificateTemplatesService,
  ) {}

  @Post()
  @ApiCreatedResponse({
    type: CertificateTemplate,
  })
  create(@Body() createCertificateTemplateDto: CreateCertificateTemplateDto) {
    return this.certificateTemplatesService.create(
      createCertificateTemplateDto,
    );
  }

  @Get()
  @ApiOkResponse({
    type: InfinityPaginationResponse(CertificateTemplate),
  })
  async findAll(
    @Query() query: FindAllCertificateTemplatesDto,
  ): Promise<InfinityPaginationResponseDto<CertificateTemplate>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    return infinityPagination(
      await this.certificateTemplatesService.findAllWithPagination({
        paginationOptions: {
          page,
          limit,
        },
      }),
      { page, limit },
    );
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: CertificateTemplate,
  })
  findById(@Param('id') id: string) {
    return this.certificateTemplatesService.findById(id);
  }

  @Patch(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: CertificateTemplate,
  })
  update(
    @Param('id') id: string,
    @Body() updateCertificateTemplateDto: UpdateCertificateTemplateDto,
  ) {
    return this.certificateTemplatesService.update(
      id,
      updateCertificateTemplateDto,
    );
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  remove(@Param('id') id: string) {
    return this.certificateTemplatesService.remove(id);
  }
}
