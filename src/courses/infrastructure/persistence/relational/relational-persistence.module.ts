import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseEntity } from './entities/course.entity';
import { ModuleEntity } from './entities/module.entity';
import { LessonEntity } from './entities/lesson.entity';
import { QuizEntity } from './entities/quiz.entity';
import { AssignmentEntity } from './entities/assignment.entity';
import { CourseReviewEntity } from './entities/course-review.entity';
import { CourseRepository } from '../course.repository';
import { CourseRelationalRepository } from './repositories/course.repository';
import { CourseReviewRepository } from '../course-review.repository';
import { CourseReviewRelationalRepository } from './repositories/course-review.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CourseEntity,
      ModuleEntity,
      LessonEntity,
      QuizEntity,
      AssignmentEntity,
      CourseReviewEntity,
    ]),
  ],
  providers: [
    {
      provide: CourseRepository,
      useClass: CourseRelationalRepository,
    },
    {
      provide: CourseReviewRepository,
      useClass: CourseReviewRelationalRepository,
    },
  ],
  exports: [CourseRepository, CourseReviewRepository],
})
export class RelationalCoursePersistenceModule {}
