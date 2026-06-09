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
    domainEntity.isPublished = raw.isPublished;
    domainEntity.meta = raw.meta;
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
    persistenceEntity.isPublished = domainEntity.isPublished;
    persistenceEntity.meta = domainEntity.meta;
    return persistenceEntity;
  }
}
