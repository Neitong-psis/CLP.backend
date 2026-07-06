import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseReviewEntity } from '../entities/course-review.entity';
import { CourseReview } from '../../../../domain/course-review';
import { CourseReviewRepository } from '../../course-review.repository';
import { CourseReviewMapper } from '../mappers/course-review.mapper';

@Injectable()
export class CourseReviewRelationalRepository implements CourseReviewRepository {
  constructor(
    @InjectRepository(CourseReviewEntity)
    private readonly courseReviewRepository: Repository<CourseReviewEntity>,
  ) {}

  async create(
    data: Omit<CourseReview, 'id' | 'createdAt'>,
  ): Promise<CourseReview> {
    const persistenceModel = CourseReviewMapper.toPersistence(
      data as CourseReview,
    );
    const newEntity = await this.courseReviewRepository.save(
      this.courseReviewRepository.create(persistenceModel),
    );

    // Fetch with relations to ensure reviewer user info is populated
    const savedEntity = await this.courseReviewRepository.findOne({
      where: { id: newEntity.id },
      relations: ['reviewer', 'course'],
    });

    return CourseReviewMapper.toDomain(savedEntity!);
  }

  async findManyByCourseId(courseId: string): Promise<CourseReview[]> {
    const entities = await this.courseReviewRepository.find({
      where: { course: { id: courseId } },
      relations: ['reviewer'],
      order: { createdAt: 'DESC' },
    });

    return entities.map((entity) => CourseReviewMapper.toDomain(entity));
  }
}
