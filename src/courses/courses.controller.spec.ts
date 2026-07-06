jest.mock('../database/config/database.config', () => ({
  __esModule: true,
  default: jest.fn().mockReturnValue({ isDocumentDatabase: false }),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { RoleEnum } from '../roles/roles.enum';
import { Course } from './domain/course';
import { User } from '../users/domain/user';
import { CourseStatusEnum } from './course-status.enum';

const makeUser = (id: number, roleId: string): any => ({
  id: String(id),
  roles: [{ id: roleId }],
});

const makeCourse = (instructorId: number): Course => {
  const instructor = new User();
  instructor.id = String(instructorId);

  const course = new Course();
  course.id = 'course-uuid-1';
  course.instructor = instructor;
  course.title = 'Test Course';
  course.price = 0;
  course.status = CourseStatusEnum.TODO;

  return course;
};

describe('CoursesController — syncCurriculum', () => {
  let controller: CoursesController;
  let coursesService: jest.Mocked<CoursesService>;

  const syncDto = { modules: [] };
  const validCourseId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoursesController],
      providers: [
        {
          provide: CoursesService,
          useValue: {
            findOne: jest.fn(),
            syncCurriculum: jest
              .fn()
              .mockResolvedValue({ success: true, modulesCount: 0 }),
            create: jest.fn(),
            findManyWithPagination: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            getStats: jest.fn(),
            getTopPerforming: jest.fn(),
            getCurriculum: jest.fn(),
            getContent: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(CoursesController);
    coursesService = module.get(CoursesService);
  });

  it('should allow an admin to sync any course without an ownership check', async () => {
    const req = { user: makeUser(99, RoleEnum.admin) };

    await expect(
      controller.syncCurriculum(req, validCourseId, syncDto as any),
    ).resolves.toEqual({ success: true, modulesCount: 0 });

    expect(coursesService.findOne).not.toHaveBeenCalled();
  });

  it('should allow the owning educator to sync their own course', async () => {
    const educatorId = 42;
    const req = { user: makeUser(educatorId, RoleEnum.educator) };
    coursesService.findOne.mockResolvedValue(makeCourse(educatorId));

    await expect(
      controller.syncCurriculum(req, validCourseId, syncDto as any),
    ).resolves.toEqual({ success: true, modulesCount: 0 });
  });

  it('should throw ForbiddenException when an educator tries to sync another instructor course', async () => {
    const req = { user: makeUser(1, RoleEnum.educator) };
    coursesService.findOne.mockResolvedValue(makeCourse(2));

    await expect(
      controller.syncCurriculum(req, validCourseId, syncDto as any),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should throw NotFoundException for an invalid (non-UUID) course id', async () => {
    const req = { user: makeUser(1, RoleEnum.educator) };

    await expect(
      controller.syncCurriculum(req, 'not-a-uuid', syncDto as any),
    ).rejects.toThrow(NotFoundException);
  });
});
