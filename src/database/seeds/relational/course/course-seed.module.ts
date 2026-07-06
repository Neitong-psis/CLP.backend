import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseEntity } from '../../../../courses/infrastructure/persistence/relational/entities/course.entity';
import { UserEntity } from '../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { CategoryEntity } from '../../../../categories/infrastructure/persistence/relational/entities/category.entity';
import { ModuleEntity } from '../../../../courses/infrastructure/persistence/relational/entities/module.entity';
import { LessonEntity } from '../../../../courses/infrastructure/persistence/relational/entities/lesson.entity';
import { QuizEntity } from '../../../../courses/infrastructure/persistence/relational/entities/quiz.entity';
import { AssignmentEntity } from '../../../../courses/infrastructure/persistence/relational/entities/assignment.entity';
import { CourseSeedService } from './course-seed.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CourseEntity,
      UserEntity,
      CategoryEntity,
      ModuleEntity,
      LessonEntity,
      QuizEntity,
      AssignmentEntity,
    ]),
  ],
  providers: [CourseSeedService],
  exports: [CourseSeedService],
})
export class CourseSeedModule {}
