import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, In } from 'typeorm';
import { CourseEntity } from '../entities/course.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';
import { Course } from '../../../../domain/course';
import { CourseRepository } from '../../course.repository';
import { CourseMapper } from '../mappers/course.mapper';
import { CourseStatusEnum } from '../../../../course-status.enum';

@Injectable()
export class CourseRelationalRepository implements CourseRepository {
  constructor(
    @InjectRepository(CourseEntity)
    private readonly courseRepository: Repository<CourseEntity>,
  ) {}

  async create(data: Course): Promise<Course> {
    const persistenceModel = CourseMapper.toPersistence(data);
    const newEntity = await this.courseRepository.save(
      this.courseRepository.create(persistenceModel),
    );
    return CourseMapper.toDomain(newEntity);
  }

  async findManyWithPagination({
    paginationOptions,
    filterOptions,
  }: {
    paginationOptions: IPaginationOptions;
    filterOptions?: {
      search?: string;
      instructorId?: string;
      categoryId?: string;
      status?: CourseStatusEnum[] | null;
    } | null;
  }): Promise<Course[]> {
    const where: any = {};
    if (filterOptions?.instructorId) {
      where.instructor = { id: filterOptions.instructorId };
    }
    if (filterOptions?.categoryId) {
      where.category = { id: filterOptions.categoryId };
    }
    if (filterOptions?.status && filterOptions.status.length > 0) {
      where.status = In(filterOptions.status);
    }

    let entities: CourseEntity[];

    if (filterOptions?.search) {
      const searchPattern = `%${filterOptions.search}%`;
      entities = await this.courseRepository.find({
        skip: (paginationOptions.page - 1) * paginationOptions.limit,
        take: paginationOptions.limit,
        relations: ['instructor', 'category'],
        where: [
          { ...where, title: ILike(searchPattern) },
          { ...where, description: ILike(searchPattern) },
        ],
      });
    } else {
      entities = await this.courseRepository.find({
        skip: (paginationOptions.page - 1) * paginationOptions.limit,
        take: paginationOptions.limit,
        relations: ['instructor', 'category'],
        where,
      });
    }

    return entities.map((entity) => CourseMapper.toDomain(entity));
  }

  async findById(id: Course['id']): Promise<NullableType<Course>> {
    const entity = await this.courseRepository.findOne({
      where: { id },
      relations: ['instructor'],
    });

    return entity ? CourseMapper.toDomain(entity) : null;
  }

  async update(
    id: Course['id'],
    payload: Partial<Course>,
  ): Promise<Course | null> {
    const entity = await this.courseRepository.findOne({
      where: { id },
    });

    if (!entity) {
      return null;
    }

    const updatedEntity = await this.courseRepository.save(
      this.courseRepository.create(
        CourseMapper.toPersistence({
          ...CourseMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return CourseMapper.toDomain(updatedEntity);
  }

  async remove(id: Course['id']): Promise<void> {
    await this.courseRepository.delete(id);
  }
}
