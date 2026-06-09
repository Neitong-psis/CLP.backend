import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseEntity } from '../../../../courses/infrastructure/persistence/relational/entities/course.entity';
import { UserEntity } from '../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { CategoryEntity } from '../../../../categories/infrastructure/persistence/relational/entities/category.entity';
import { CourseSeedService } from './course-seed.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CourseEntity, UserEntity, CategoryEntity]),
  ],
  providers: [CourseSeedService],
  exports: [CourseSeedService],
})
export class CourseSeedModule {}
