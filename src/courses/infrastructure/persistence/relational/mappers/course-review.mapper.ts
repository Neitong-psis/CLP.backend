import { CourseReview } from '../../../../domain/course-review';
import { CourseReviewEntity } from '../entities/course-review.entity';
import { CourseMapper } from './course.mapper';
import { UserMapper } from '../../../../../users/infrastructure/persistence/relational/mappers/user.mapper';
import { CourseEntity } from '../entities/course.entity';
import { UserEntity } from '../../../../../users/infrastructure/persistence/relational/entities/user.entity';

export class CourseReviewMapper {
  static toDomain(raw: CourseReviewEntity): CourseReview {
    const domainEntity = new CourseReview();
    domainEntity.id = raw.id;
    if (raw.course) {
      domainEntity.course = CourseMapper.toDomain(raw.course);
    }
    if (raw.reviewer) {
      domainEntity.reviewer = UserMapper.toDomain(raw.reviewer);
    }
    domainEntity.status = raw.status;
    domainEntity.feedback = raw.feedback;
    domainEntity.createdAt = raw.createdAt;
    return domainEntity;
  }

  static toPersistence(domainEntity: CourseReview): CourseReviewEntity {
    const persistenceEntity = new CourseReviewEntity();
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }

    if (domainEntity.course) {
      const courseEntity = new CourseEntity();
      courseEntity.id = domainEntity.course.id;
      persistenceEntity.course = courseEntity;
    }

    if (domainEntity.reviewer) {
      const reviewerEntity = new UserEntity();
      reviewerEntity.id = domainEntity.reviewer.id;
      persistenceEntity.reviewer = reviewerEntity;
    }

    persistenceEntity.status = domainEntity.status;
    persistenceEntity.feedback = domainEntity.feedback;
    persistenceEntity.createdAt = domainEntity.createdAt;
    return persistenceEntity;
  }
}
