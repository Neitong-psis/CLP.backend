import { Faq } from '../../../../domain/faq';
import { FaqEntity } from '../entities/faq.entity';

export class FaqMapper {
  static toDomain(raw: FaqEntity): Faq {
    const domainEntity = new Faq();
    domainEntity.id = raw.id;
    domainEntity.question = raw.question;
    domainEntity.answer = raw.answer;
    domainEntity.sortOrder = raw.sortOrder;
    domainEntity.isActive = raw.isActive;
    domainEntity.createdAt = raw.createdAt;
    return domainEntity;
  }

  static toPersistence(domainEntity: Faq): FaqEntity {
    const persistenceEntity = new FaqEntity();
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.question = domainEntity.question;
    persistenceEntity.answer = domainEntity.answer;
    persistenceEntity.sortOrder = domainEntity.sortOrder;
    persistenceEntity.isActive = domainEntity.isActive;
    persistenceEntity.createdAt = domainEntity.createdAt;
    return persistenceEntity;
  }
}
