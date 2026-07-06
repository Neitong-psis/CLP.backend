import { Course } from '../../../../domain/course';
import { CourseEntity } from '../entities/course.entity';
import { UserMapper } from '../../../../../users/infrastructure/persistence/relational/mappers/user.mapper';
import { CategoryMapper } from '../../../../../categories/infrastructure/persistence/relational/mappers/category.mapper';
import { UserEntity } from '../../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { CategoryEntity } from '../../../../../categories/infrastructure/persistence/relational/entities/category.entity';

export class CourseMapper {
  static toDomain(raw: CourseEntity): Course {
    const domainEntity = new Course();
    domainEntity.id = raw.id;
    if (raw.instructor) {
      domainEntity.instructor = UserMapper.toDomain(raw.instructor);
    }
    if (raw.category) {
      domainEntity.category = CategoryMapper.toDomain(raw.category);
    }
    domainEntity.title = raw.title;
    domainEntity.description = raw.description;
    domainEntity.price = Number(raw.price);
    domainEntity.thumbnail = raw.thumbnail;
    domainEntity.status = raw.status;
    domainEntity.slug = raw.slug;
    domainEntity.subtitle = raw.subtitle;
    domainEntity.level = raw.level;
    domainEntity.duration = raw.duration;
    domainEntity.tags = raw.tags;
    domainEntity.meta = raw.meta;

    if (raw.createdBy) {
      domainEntity.createdBy = UserMapper.toDomain(raw.createdBy);
    } else {
      domainEntity.createdBy = null;
    }

    if (raw.assignedBy) {
      domainEntity.assignedBy = UserMapper.toDomain(raw.assignedBy);
    } else {
      domainEntity.assignedBy = null;
    }
    domainEntity.dueDate = raw.dueDate;
    domainEntity.priority = raw.priority;

    return domainEntity;
  }

  static toPersistence(domainEntity: Course): CourseEntity {
    const persistenceEntity = new CourseEntity();
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }

    if (domainEntity.instructor) {
      const instructorEntity = new UserEntity();
      instructorEntity.id = domainEntity.instructor.id;
      persistenceEntity.instructor = instructorEntity;
    }

    if (domainEntity.category) {
      const categoryEntity = new CategoryEntity();
      categoryEntity.id = domainEntity.category.id;
      persistenceEntity.category = categoryEntity;
    } else if (domainEntity.category === null) {
      persistenceEntity.category = null;
    }

    persistenceEntity.title = domainEntity.title;
    persistenceEntity.description = domainEntity.description;
    persistenceEntity.price = domainEntity.price;
    persistenceEntity.thumbnail = domainEntity.thumbnail;
    persistenceEntity.status = domainEntity.status;
    persistenceEntity.slug = domainEntity.slug;
    persistenceEntity.subtitle = domainEntity.subtitle;
    persistenceEntity.level = domainEntity.level;
    persistenceEntity.duration = domainEntity.duration;
    persistenceEntity.tags = domainEntity.tags;
    persistenceEntity.meta = domainEntity.meta;

    if (domainEntity.createdBy) {
      const creatorEntity = new UserEntity();
      creatorEntity.id = domainEntity.createdBy.id;
      persistenceEntity.createdBy = creatorEntity;
    } else if (domainEntity.createdBy === null) {
      persistenceEntity.createdBy = null;
    }
    if (domainEntity.assignedBy) {
      const assignerEntity = new UserEntity();
      assignerEntity.id = domainEntity.assignedBy.id;
      persistenceEntity.assignedBy = assignerEntity;
    } else if (domainEntity.assignedBy === null) {
      persistenceEntity.assignedBy = null;
    }

    persistenceEntity.dueDate = domainEntity.dueDate;
    persistenceEntity.priority = domainEntity.priority;

    return persistenceEntity;
  }
}
