import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { Course } from '../../domain/course';
import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { CourseStatusEnum } from '../../course-status.enum';

export abstract class CourseRepository {
  abstract create(data: Omit<Course, 'id'>): Promise<Course>;

  abstract findManyWithPagination({
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
  }): Promise<Course[]>;

  abstract findById(id: Course['id']): Promise<NullableType<Course>>;

  abstract update(
    id: Course['id'],
    payload: DeepPartial<Course>,
  ): Promise<Course | null>;

  abstract remove(id: Course['id']): Promise<void>;
}
