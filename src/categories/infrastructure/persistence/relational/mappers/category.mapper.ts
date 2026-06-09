import { Category } from '../../../../domain/category';
import { CategoryEntity } from '../entities/category.entity';

export class CategoryMapper {
  static toDomain(raw: CategoryEntity): Category {
    const domainEntity = new Category();
    domainEntity.id = raw.id;
    domainEntity.name = raw.name;
    domainEntity.slug = raw.slug;
    domainEntity.description = raw.description;
    domainEntity.thumbnail = raw.thumbnail;
    domainEntity.parentCategoryId = raw.parentCategoryId;
    domainEntity.path = raw.path;
    domainEntity.sortOrder = raw.sortOrder;
    domainEntity.isActive = raw.isActive;
    domainEntity.createdAt = raw.createdAt;
    return domainEntity;
  }

  static toPersistence(domainEntity: Category): CategoryEntity {
    const persistenceEntity = new CategoryEntity();
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.name = domainEntity.name;
    persistenceEntity.slug = domainEntity.slug;
    persistenceEntity.description = domainEntity.description;
    persistenceEntity.thumbnail = domainEntity.thumbnail;
    persistenceEntity.parentCategoryId = domainEntity.parentCategoryId;
    persistenceEntity.path = domainEntity.path;
    persistenceEntity.sortOrder = domainEntity.sortOrder;
    persistenceEntity.isActive = domainEntity.isActive;
    persistenceEntity.createdAt = domainEntity.createdAt;
    return persistenceEntity;
  }
}
