import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CertificateTemplateEntity } from '../entities/certificate-template.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { CertificateTemplate } from '../../../../domain/certificate-template';
import { CertificateTemplateRepository } from '../../certificate-template.repository';
import { CertificateTemplateMapper } from '../mappers/certificate-template.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';

@Injectable()
export class CertificateTemplateRelationalRepository implements CertificateTemplateRepository {
  constructor(
    @InjectRepository(CertificateTemplateEntity)
    private readonly certificateTemplateRepository: Repository<CertificateTemplateEntity>,
  ) {}

  async create(data: CertificateTemplate): Promise<CertificateTemplate> {
    const persistenceModel = CertificateTemplateMapper.toPersistence(data);
    const newEntity = await this.certificateTemplateRepository.save(
      this.certificateTemplateRepository.create(persistenceModel),
    );
    return CertificateTemplateMapper.toDomain(newEntity);
  }

  async findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<CertificateTemplate[]> {
    const entities = await this.certificateTemplateRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });

    return entities.map((entity) => CertificateTemplateMapper.toDomain(entity));
  }

  async findById(
    id: CertificateTemplate['id'],
  ): Promise<NullableType<CertificateTemplate>> {
    const entity = await this.certificateTemplateRepository.findOne({
      where: { id },
    });

    return entity ? CertificateTemplateMapper.toDomain(entity) : null;
  }

  async findByIds(
    ids: CertificateTemplate['id'][],
  ): Promise<CertificateTemplate[]> {
    const entities = await this.certificateTemplateRepository.find({
      where: { id: In(ids) },
    });

    return entities.map((entity) => CertificateTemplateMapper.toDomain(entity));
  }

  async update(
    id: CertificateTemplate['id'],
    payload: Partial<CertificateTemplate>,
  ): Promise<CertificateTemplate> {
    const entity = await this.certificateTemplateRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new Error('Record not found');
    }

    const updatedEntity = await this.certificateTemplateRepository.save(
      this.certificateTemplateRepository.create(
        CertificateTemplateMapper.toPersistence({
          ...CertificateTemplateMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return CertificateTemplateMapper.toDomain(updatedEntity);
  }

  async remove(id: CertificateTemplate['id']): Promise<void> {
    await this.certificateTemplateRepository.delete(id);
  }
}
