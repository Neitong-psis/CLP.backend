import { Injectable, NotFoundException } from '@nestjs/common';
import { CourseRepository } from './infrastructure/persistence/course.repository';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Course } from './domain/course';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { User } from '../users/domain/user';
import { Category } from '../categories/domain/category';
import { DataSource } from 'typeorm';

@Injectable()
export class CoursesService {
  constructor(
    private readonly courseRepository: CourseRepository,
    private readonly dataSource: DataSource,
  ) {}

  async getStats() {
    const stats = await this.dataSource.query(
      `SELECT COUNT(*) FILTER (WHERE is_published = true)::int as active, COUNT(*)::int as total FROM courses`,
    );
    return {
      active: stats[0]?.active || 0,
      total: stats[0]?.total || 0,
      trend: 0,
    };
  }

  async getTopPerforming() {
    const dbCourses = await this.dataSource.query(
      `SELECT c.course_id as id, c.title, COUNT(e.enrollment_id)::int as "studentsCount", c.is_published as "isPublished", c.price 
       FROM courses c 
       LEFT JOIN enrollments e ON c.course_id = e.course_id
       GROUP BY c.course_id, c.title, c.is_published, c.price
       ORDER BY "studentsCount" DESC 
       LIMIT 5`,
    );

    return dbCourses.map((c) => ({
      id: c.id,
      title: c.title,
      studentsCount: c.studentsCount,
      isPublished: c.isPublished,
      price: Number(c.price),
      status: c.isPublished ? 'Public' : 'Pending',
    }));
  }

  async create(createCourseDto: CreateCourseDto): Promise<Course> {
    const instructor = { id: createCourseDto.instructorId } as User;
    const category = createCourseDto.categoryId
      ? ({ id: createCourseDto.categoryId } as Category)
      : null;

    return this.courseRepository.create({
      instructor,
      category,
      title: createCourseDto.title,
      description: createCourseDto.description ?? null,
      price: createCourseDto.price ?? 0,
      thumbnail: createCourseDto.thumbnail ?? null,
      isPublished: createCourseDto.isPublished ?? false,
      meta: createCourseDto.meta ?? null,
    });
  }

  async findManyWithPagination(
    paginationOptions: IPaginationOptions,
  ): Promise<Course[]> {
    return this.courseRepository.findManyWithPagination({
      paginationOptions,
    });
  }

  async findOne(id: Course['id']): Promise<Course> {
    const course = await this.courseRepository.findById(id);
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    return course;
  }

  async update(
    id: Course['id'],
    updateCourseDto: UpdateCourseDto,
  ): Promise<Course> {
    const payload: Partial<Course> = {};

    if (updateCourseDto.instructorId) {
      payload.instructor = { id: updateCourseDto.instructorId } as User;
    }
    if (updateCourseDto.categoryId) {
      payload.category = { id: updateCourseDto.categoryId } as Category;
    } else if (updateCourseDto.categoryId === null) {
      payload.category = null;
    }

    if (updateCourseDto.title !== undefined)
      payload.title = updateCourseDto.title;
    if (updateCourseDto.description !== undefined)
      payload.description = updateCourseDto.description;
    if (updateCourseDto.price !== undefined)
      payload.price = updateCourseDto.price;
    if (updateCourseDto.thumbnail !== undefined)
      payload.thumbnail = updateCourseDto.thumbnail;
    if (updateCourseDto.isPublished !== undefined)
      payload.isPublished = updateCourseDto.isPublished;
    if (updateCourseDto.meta !== undefined) payload.meta = updateCourseDto.meta;

    const updated = await this.courseRepository.update(id, payload);
    if (!updated) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    return updated;
  }

  async getContent(id: Course['id']): Promise<Record<string, any>[]> {
    const course = await this.findOne(id);
    return (course.meta?.sections as Record<string, any>[]) ?? [];
  }

  async remove(id: Course['id']): Promise<void> {
    await this.courseRepository.remove(id);
  }
}
