import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { CertificateTemplate } from '../../domain/certificate-template';

export abstract class CertificateTemplateRepository {
  abstract create(
    data: Omit<CertificateTemplate, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<CertificateTemplate>;

  abstract findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<CertificateTemplate[]>;

  abstract findById(
    id: CertificateTemplate['id'],
  ): Promise<NullableType<CertificateTemplate>>;

  abstract findByIds(
    ids: CertificateTemplate['id'][],
  ): Promise<CertificateTemplate[]>;

  abstract update(
    id: CertificateTemplate['id'],
    payload: DeepPartial<CertificateTemplate>,
  ): Promise<CertificateTemplate | null>;

  abstract remove(id: CertificateTemplate['id']): Promise<void>;
}
