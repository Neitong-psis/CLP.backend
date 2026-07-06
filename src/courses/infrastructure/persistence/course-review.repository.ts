import { CourseReview } from '../../domain/course-review';

export abstract class CourseReviewRepository {
  abstract create(
    data: Omit<CourseReview, 'id' | 'createdAt'>,
  ): Promise<CourseReview>;

  abstract findManyByCourseId(courseId: string): Promise<CourseReview[]>;
}
