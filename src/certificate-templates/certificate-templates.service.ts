import {
  // common
  Injectable,
} from '@nestjs/common';
import { CreateCertificateTemplateDto } from './dto/create-certificate-template.dto';
import { UpdateCertificateTemplateDto } from './dto/update-certificate-template.dto';
import { CertificateTemplateRepository } from './infrastructure/persistence/certificate-template.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { CertificateTemplate } from './domain/certificate-template';

@Injectable()
export class CertificateTemplatesService {
  constructor(
    // Dependencies here
    private readonly certificateTemplateRepository: CertificateTemplateRepository,
  ) {}

  async create(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    createCertificateTemplateDto: CreateCertificateTemplateDto,
  ) {
    // Do not remove comment below.
    // <creating-property />

    return this.certificateTemplateRepository.create({
      // Do not remove comment below.
      // <creating-property-payload />
    });
  }

  findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }) {
    return this.certificateTemplateRepository.findAllWithPagination({
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
    });
  }

  findById(id: CertificateTemplate['id']) {
    return this.certificateTemplateRepository.findById(id);
  }

  findByIds(ids: CertificateTemplate['id'][]) {
    return this.certificateTemplateRepository.findByIds(ids);
  }

  async update(
    id: CertificateTemplate['id'],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    updateCertificateTemplateDto: UpdateCertificateTemplateDto,
  ) {
    // Do not remove comment below.
    // <updating-property />

    return this.certificateTemplateRepository.update(id, {
      // Do not remove comment below.
      // <updating-property-payload />
    });
  }

  remove(id: CertificateTemplate['id']) {
    return this.certificateTemplateRepository.remove(id);
  }
}
