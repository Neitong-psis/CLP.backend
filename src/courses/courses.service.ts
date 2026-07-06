import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { CourseRepository } from './infrastructure/persistence/course.repository';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Course } from './domain/course';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { User } from '../users/domain/user';
import { Category } from '../categories/domain/category';
import { DataSource } from 'typeorm';
import { ModuleEntity } from './infrastructure/persistence/relational/entities/module.entity';
import { LessonEntity } from './infrastructure/persistence/relational/entities/lesson.entity';
import { QuizEntity } from './infrastructure/persistence/relational/entities/quiz.entity';
import { AssignmentEntity } from './infrastructure/persistence/relational/entities/assignment.entity';
import { CourseEntity } from './infrastructure/persistence/relational/entities/course.entity';
import {
  ContentSectionDto,
  SyncCurriculumDto,
} from './dto/sync-curriculum.dto';
import { SyncCurriculumResponseDto } from './dto/sync-curriculum-response.dto';
import { CourseStatusEnum } from './course-status.enum';
import { CourseReviewRepository } from './infrastructure/persistence/course-review.repository';
import { RoleEnum } from '../roles/roles.enum';
import {
  CurriculumLessonDto,
  CurriculumModuleDto,
} from './dto/curriculum-response.dto';

@Injectable()
export class CoursesService {
  constructor(
    private readonly courseRepository: CourseRepository,
    private readonly courseReviewRepository: CourseReviewRepository,
    private readonly dataSource: DataSource,
  ) {}

  async getStats() {
    const stats = await this.dataSource.query(
      `SELECT COUNT(*) FILTER (WHERE status = 'published')::int as active, COUNT(*)::int as total FROM courses`,
    );

    const revenueByCategory = await this.dataSource.query(
      `SELECT COALESCE(cc.name, 'Other') as name, COALESCE(SUM(c.price), 0)::float as amount
       FROM enrollments e
       JOIN courses c ON e.course_id = c.course_id
       LEFT JOIN course_categories cc ON cc.category_id = c.category_id
       GROUP BY COALESCE(cc.name, 'Other')
       ORDER BY amount DESC
       LIMIT 6`,
    );

    return {
      active: stats[0]?.active || 0,
      total: stats[0]?.total || 0,
      trend: 0,
      revenueByCategory,
    };
  }

  async getTopPerforming() {
    const dbCourses = await this.dataSource.query(
      `SELECT c.course_id as id, c.title, COUNT(e.enrollment_id)::int as "studentsCount", c.status as "status", c.price,
              u."firstName" as "instructorFirstName", u."lastName" as "instructorLastName", u.email as "instructorEmail"
       FROM courses c
       LEFT JOIN enrollments e ON c.course_id = e.course_id
       LEFT JOIN "user" u ON u.id = c.instructor_id
       GROUP BY c.course_id, c.title, c.status, c.price, u."firstName", u."lastName", u.email
       ORDER BY "studentsCount" DESC
       LIMIT 5`,
    );

    return dbCourses.map((c) => ({
      id: c.id,
      title: c.title,
      studentsCount: c.studentsCount,
      status: c.status,
      price: Number(c.price),
      instructor: {
        firstName: c.instructorFirstName,
        lastName: c.instructorLastName,
        email: c.instructorEmail,
      },
    }));
  }

  async create(
    createCourseDto: CreateCourseDto,
    creator: User,
  ): Promise<Course> {
    const isAdmin =
      creator.roles?.some((role) => role.id === RoleEnum.admin) ?? false;

    let instructorId = creator.id;
    if (isAdmin && createCourseDto.instructorId) {
      instructorId = createCourseDto.instructorId;
    }
    const instructor = { id: instructorId } as User;

    const category = createCourseDto.categoryId
      ? ({ id: createCourseDto.categoryId } as Category)
      : null;

    let status = CourseStatusEnum.TODO;
    let assignedBy: User | null = null;

    if (isAdmin) {
      status = createCourseDto.status ?? CourseStatusEnum.TODO;

      if (instructorId !== creator.id) {
        status = CourseStatusEnum.TODO;
        assignedBy = { id: creator.id } as User;
      }
    } else {
      const requestedStatus = createCourseDto.status;
      if (requestedStatus === CourseStatusEnum.PUBLISHED) {
        status = CourseStatusEnum.UNDER_REVIEW;
      } else if (
        requestedStatus === CourseStatusEnum.TODO ||
        requestedStatus === CourseStatusEnum.IN_WRITING ||
        requestedStatus === CourseStatusEnum.ARCHIVED
      ) {
        status = requestedStatus;
      } else {
        status = CourseStatusEnum.TODO;
      }
    }

    const slug =
      createCourseDto.slug ||
      createCourseDto.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') +
        '-' +
        Math.random().toString(36).slice(2, 7);

    return this.courseRepository.create({
      instructor,
      category,
      title: createCourseDto.title,
      description: createCourseDto.description ?? null,
      price: createCourseDto.price ?? 0,
      thumbnail: createCourseDto.thumbnail ?? null,
      status,
      slug,
      subtitle: createCourseDto.subtitle ?? null,
      level: createCourseDto.level ?? null,
      duration: createCourseDto.duration ?? null,
      tags: createCourseDto.tags ?? null,
      meta: createCourseDto.meta ?? null,
      createdBy: { id: creator.id } as User,
      assignedBy,
      dueDate: createCourseDto.dueDate
        ? new Date(createCourseDto.dueDate)
        : null,
      priority: createCourseDto.priority ?? null,
    });
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
    const courses = await this.courseRepository.findManyWithPagination({
      paginationOptions,
      filterOptions,
    });

    if (courses.length === 0) {
      return courses;
    }

    const counts = await this.dataSource.query(
      `SELECT course_id as "courseId", COUNT(*)::int as count
       FROM enrollments
       WHERE course_id = ANY($1)
       GROUP BY course_id`,
      [courses.map((c) => c.id)],
    );
    const countByCourseId = new Map<string, number>(
      counts.map((row) => [row.courseId, row.count]),
    );

    return courses.map((course) => ({
      ...course,
      enrolledCount: countByCourseId.get(course.id) ?? 0,
    }));
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
    user?: User,
  ): Promise<Course> {
    const course = await this.findOne(id);
    const isAdmin =
      user?.roles?.some((role) => role.id === RoleEnum.admin) ?? false;

    if (!isAdmin) {
      if (course.status === CourseStatusEnum.UNDER_REVIEW) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            status: 'Cannot update a course that is under review',
          },
        });
      }
      if (course.status === CourseStatusEnum.PUBLISHED) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            status:
              'Cannot update a published course directly. Please submit for review.',
          },
        });
      }
    }

    const payload: Partial<Course> = {};

    if (updateCourseDto.instructorId) {
      const newInstructorId = updateCourseDto.instructorId;
      if (isAdmin && newInstructorId !== course.instructor.id) {
        payload.status = CourseStatusEnum.TODO;
        payload.assignedBy = { id: user?.id } as User;
      }
      payload.instructor = { id: newInstructorId } as User;
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
    if (updateCourseDto.meta !== undefined) payload.meta = updateCourseDto.meta;

    if (updateCourseDto.dueDate !== undefined) {
      payload.dueDate = updateCourseDto.dueDate
        ? new Date(updateCourseDto.dueDate)
        : null;
    }
    if (updateCourseDto.priority !== undefined) {
      payload.priority = updateCourseDto.priority;
    }

    if (updateCourseDto.status !== undefined) {
      if (isAdmin) {
        payload.status = updateCourseDto.status;
      } else {
        if (updateCourseDto.status === CourseStatusEnum.PUBLISHED) {
          payload.status = CourseStatusEnum.UNDER_REVIEW;
        } else if (
          updateCourseDto.status === CourseStatusEnum.TODO ||
          updateCourseDto.status === CourseStatusEnum.IN_WRITING ||
          updateCourseDto.status === CourseStatusEnum.ARCHIVED
        ) {
          payload.status = updateCourseDto.status;
        } else {
          throw new UnprocessableEntityException({
            status: HttpStatus.UNPROCESSABLE_ENTITY,
            errors: {
              status: 'Invalid status transition for educators',
            },
          });
        }
      }
    }

    const updated = await this.courseRepository.update(id, payload);
    if (!updated) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    return updated;
  }

  async syncCurriculum(
    courseId: Course['id'],
    dto: SyncCurriculumDto,
    user?: User,
  ): Promise<SyncCurriculumResponseDto> {
    return this.dataSource.transaction(async (transactionalEntityManager) => {
      const course = await transactionalEntityManager.findOne(CourseEntity, {
        where: { id: courseId },
      });
      if (!course) {
        throw new NotFoundException(`Course with ID ${courseId} not found`);
      }

      const isAdmin =
        user?.roles?.some((role) => role.id === RoleEnum.admin) ?? false;

      if (!isAdmin) {
        if (course.status === CourseStatusEnum.UNDER_REVIEW) {
          throw new UnprocessableEntityException({
            status: HttpStatus.UNPROCESSABLE_ENTITY,
            errors: {
              status: 'Cannot edit curriculum of a course under review',
            },
          });
        }
        if (course.status === CourseStatusEnum.PUBLISHED) {
          throw new UnprocessableEntityException({
            status: HttpStatus.UNPROCESSABLE_ENTITY,
            errors: {
              status:
                'Cannot edit curriculum of a published course directly. Please submit for review.',
            },
          });
        }
      }

      // Fetch existing modules with lessons
      const existingModules = await transactionalEntityManager.find(
        ModuleEntity,
        {
          where: { courseId },
          relations: ['lessons'],
        },
      );

      // 1. Delete modules not in the request
      const incomingModuleIds = dto.modules
        .map((m) => m.id)
        .filter(Boolean) as string[];
      const modulesToDelete = existingModules.filter(
        (m) => !incomingModuleIds.includes(m.id),
      );
      if (modulesToDelete.length > 0) {
        await transactionalEntityManager.remove(ModuleEntity, modulesToDelete);
      }

      const savedModules: ModuleEntity[] = [];

      // 2. Loop and upsert modules
      for (let mIndex = 0; mIndex < dto.modules.length; mIndex++) {
        const moduleDto = dto.modules[mIndex];
        let moduleEntity = moduleDto.id
          ? existingModules.find((m) => m.id === moduleDto.id)
          : null;

        if (!moduleEntity) {
          moduleEntity = new ModuleEntity();
          moduleEntity.courseId = courseId;
        }

        moduleEntity.title = moduleDto.title;
        moduleEntity.orderIndex = mIndex + 1;
        moduleEntity.isPublished = true;

        moduleEntity = await transactionalEntityManager.save(
          ModuleEntity,
          moduleEntity,
        );

        // Manage lessons inside the module
        const existingLessons =
          moduleDto.id && moduleEntity.lessons ? moduleEntity.lessons : [];
        const incomingLessonIds = moduleDto.lessons
          .map((l) => l.id)
          .filter(Boolean) as string[];

        // Delete lessons not in the request
        const lessonsToDelete = existingLessons.filter(
          (l) => !incomingLessonIds.includes(l.id),
        );
        if (lessonsToDelete.length > 0) {
          await transactionalEntityManager.remove(
            LessonEntity,
            lessonsToDelete,
          );
        }

        const savedLessons: LessonEntity[] = [];

        for (let lIndex = 0; lIndex < moduleDto.lessons.length; lIndex++) {
          const lessonDto = moduleDto.lessons[lIndex];
          let lessonEntity = lessonDto.id
            ? existingLessons.find((l) => l.id === lessonDto.id)
            : null;

          if (!lessonEntity) {
            lessonEntity = new LessonEntity();
            lessonEntity.moduleId = moduleEntity.id;
          }

          lessonEntity.title = lessonDto.title;
          lessonEntity.orderIndex = lIndex + 1;

          const sections = lessonDto.sections || [];
          lessonEntity.contentType = sections[0]?.type || 'text';
          lessonEntity.content = JSON.stringify(sections);

          const videoSection = sections.find((s) => s.type === 'video');
          lessonEntity.videoDurationSeconds = videoSection ? 180 : 0;
          lessonEntity.isFree = false;

          lessonEntity = await transactionalEntityManager.save(
            LessonEntity,
            lessonEntity,
          );

          // Sync QuizEntity if type is 'quiz'
          const quizSection = sections.find((s) => s.type === 'quiz');
          if (quizSection) {
            let quizEntity = await transactionalEntityManager.findOne(
              QuizEntity,
              {
                where: { lessonId: lessonEntity.id },
              },
            );
            if (!quizEntity) {
              quizEntity = new QuizEntity();
              quizEntity.lessonId = lessonEntity.id;
            }
            quizEntity.title = quizSection.question || lessonEntity.title;
            quizEntity.passingScore = 60;
            await transactionalEntityManager.save(QuizEntity, quizEntity);
          } else {
            const quizEntity = await transactionalEntityManager.findOne(
              QuizEntity,
              {
                where: { lessonId: lessonEntity.id },
              },
            );
            if (quizEntity) {
              await transactionalEntityManager.remove(QuizEntity, quizEntity);
            }
          }

          // Sync AssignmentEntity if type is 'assignment'
          const assignmentSection = sections.find(
            (s) => s.type === 'assignment',
          );
          if (assignmentSection) {
            let assignmentEntity = await transactionalEntityManager.findOne(
              AssignmentEntity,
              {
                where: { lessonId: lessonEntity.id },
              },
            );
            if (!assignmentEntity) {
              assignmentEntity = new AssignmentEntity();
              assignmentEntity.lessonId = lessonEntity.id;
            }
            assignmentEntity.title = lessonEntity.title;
            assignmentEntity.description =
              assignmentSection.assignmentDesc || '';
            assignmentEntity.dueDate = assignmentSection.dueDate
              ? new Date(assignmentSection.dueDate)
              : null;
            assignmentEntity.maxScore = 100;
            await transactionalEntityManager.save(
              AssignmentEntity,
              assignmentEntity,
            );
          } else {
            const assignmentEntity = await transactionalEntityManager.findOne(
              AssignmentEntity,
              { where: { lessonId: lessonEntity.id } },
            );
            if (assignmentEntity) {
              await transactionalEntityManager.remove(
                AssignmentEntity,
                assignmentEntity,
              );
            }
          }

          savedLessons.push(lessonEntity);
        }
        moduleEntity.lessons = savedLessons;
        savedModules.push(moduleEntity);
      }

      return {
        success: true,
        modulesCount: savedModules.length,
      };
    });
  }

  async getCurriculum(courseId: Course['id']): Promise<CurriculumModuleDto[]> {
    const modules = await this.dataSource.getRepository(ModuleEntity).find({
      where: { courseId },
      order: { orderIndex: 'ASC' },
      relations: ['lessons'],
    });

    const result: CurriculumModuleDto[] = [];

    for (const moduleEntity of modules) {
      const lessonsData: CurriculumLessonDto[] = [];
      const sortedLessons = (moduleEntity.lessons || []).sort(
        (a, b) => a.orderIndex - b.orderIndex,
      );

      for (const lessonEntity of sortedLessons) {
        let sections: ContentSectionDto[] = [];
        try {
          if (lessonEntity.content) {
            sections = JSON.parse(lessonEntity.content) as ContentSectionDto[];
          }
        } catch {
          sections = [];
        }

        lessonsData.push({
          id: lessonEntity.id,
          title: lessonEntity.title,
          contentType: lessonEntity.contentType,
          videoDurationSeconds: lessonEntity.videoDurationSeconds,
          isFree: lessonEntity.isFree,
          sections,
        });
      }

      result.push({
        id: moduleEntity.id,
        title: moduleEntity.title,
        orderIndex: moduleEntity.orderIndex,
        isPublished: moduleEntity.isPublished,
        lessons: lessonsData,
      });
    }

    return result;
  }

  async getContent(id: Course['id']): Promise<Record<string, any>[]> {
    const course = await this.findOne(id);
    return (course.meta?.sections as Record<string, any>[]) ?? [];
  }

  async remove(id: Course['id'], user?: User): Promise<void> {
    const course = await this.findOne(id);
    const isAdmin =
      user?.roles?.some((role) => role.id === RoleEnum.admin) ?? false;

    if (!isAdmin) {
      if (course.status === CourseStatusEnum.UNDER_REVIEW) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            status: 'Cannot delete a course that is under review',
          },
        });
      }

      if (course.status === CourseStatusEnum.PUBLISHED) {
        throw new ForbiddenException(
          'Educators cannot delete an approved/published course. Please contact an administrator.',
        );
      }
    }

    await this.courseRepository.remove(id);
  }

  async submitForReview(id: Course['id']): Promise<Course> {
    const course = await this.findOne(id);
    if (
      course.status !== CourseStatusEnum.TODO &&
      course.status !== CourseStatusEnum.IN_WRITING
    ) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          status: `Cannot submit course in status ${course.status} for review`,
        },
      });
    }
    return this.courseRepository.update(id, {
      status: CourseStatusEnum.UNDER_REVIEW,
    }) as Promise<Course>;
  }

  async approve(
    id: Course['id'],
    reviewer: User,
    feedback?: string,
  ): Promise<Course> {
    const course = await this.findOne(id);
    if (course.status !== CourseStatusEnum.UNDER_REVIEW) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          status: `Cannot approve course in status ${course.status}`,
        },
      });
    }

    await this.courseReviewRepository.create({
      course,
      reviewer,
      status: 'approved',
      feedback: feedback || null,
    });

    return this.courseRepository.update(id, {
      status: CourseStatusEnum.PUBLISHED,
    }) as Promise<Course>;
  }

  async reject(
    id: Course['id'],
    feedback: string,
    reviewer: User,
  ): Promise<Course> {
    const course = await this.findOne(id);
    if (course.status !== CourseStatusEnum.UNDER_REVIEW) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          status: `Cannot reject course in status ${course.status}`,
        },
      });
    }

    await this.courseReviewRepository.create({
      course,
      reviewer,
      status: 'rejected',
      feedback,
    });

    return this.courseRepository.update(id, {
      status: CourseStatusEnum.TODO,
    }) as Promise<Course>;
  }

  async archive(id: Course['id']): Promise<Course> {
    const course = await this.findOne(id);
    if (course.status === CourseStatusEnum.ARCHIVED) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          status: 'Course is already archived',
        },
      });
    }
    return this.courseRepository.update(id, {
      status: CourseStatusEnum.ARCHIVED,
    }) as Promise<Course>;
  }

  async restore(id: Course['id']): Promise<Course> {
    const course = await this.findOne(id);
    if (course.status !== CourseStatusEnum.ARCHIVED) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          status: 'Course is not archived',
        },
      });
    }
    // Restore back to todo
    return this.courseRepository.update(id, {
      status: CourseStatusEnum.TODO,
    }) as Promise<Course>;
  }
}
