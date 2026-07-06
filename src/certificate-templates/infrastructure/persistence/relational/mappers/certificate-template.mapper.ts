import { CertificateTemplate } from '../../../../domain/certificate-template';
import { CertificateTemplateEntity } from '../entities/certificate-template.entity';

export class CertificateTemplateMapper {
  static toDomain(raw: CertificateTemplateEntity): CertificateTemplate {
    const domainEntity = new CertificateTemplate();
    domainEntity.id = raw.id;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;

    return domainEntity;
  }

  static toPersistence(
    domainEntity: CertificateTemplate,
  ): CertificateTemplateEntity {
    const persistenceEntity = new CertificateTemplateEntity();
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;

    return persistenceEntity;
  }
}
