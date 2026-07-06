jest.mock('../../../../../database/config/database.config', () => ({
  __esModule: true,
  default: jest.fn().mockReturnValue({ isDocumentDatabase: false }),
}));

import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { CourseRelationalRepository } from './course.repository';
import { CourseEntity } from '../entities/course.entity';
import { UserEntity } from '../../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { CourseStatusEnum } from '../../../../course-status.enum';

const mockInstructor = Object.assign(new UserEntity(), {
  id: 'user-uuid-1',
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane@example.com',
});

const mockCourseEntity = Object.assign(new CourseEntity(), {
  id: 'course-uuid-1',
  title: 'Test Course',
  description: 'A test course',
  price: 0,
  thumbnail: null,
  status: CourseStatusEnum.TODO,
  meta: null,
  instructor: mockInstructor,
  category: null,
});

describe('CourseRelationalRepository', () => {
  let repo: CourseRelationalRepository;
  let ormRepo: jest.Mocked<Repository<CourseEntity>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseRelationalRepository,
        {
          provide: getRepositoryToken(CourseEntity),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    repo = module.get(CourseRelationalRepository);
    ormRepo = module.get(getRepositoryToken(CourseEntity));
  });

  describe('findById', () => {
    it('should pass relations: instructor to the TypeORM query', async () => {
      ormRepo.findOne.mockResolvedValue(mockCourseEntity);

      await repo.findById('course-uuid-1');

      expect(ormRepo.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'course-uuid-1' },
          relations: ['instructor'],
        }),
      );
    });

    it('should return a domain Course with instructor populated', async () => {
      ormRepo.findOne.mockResolvedValue(mockCourseEntity);

      const result = await repo.findById('course-uuid-1');

      expect(result).not.toBeNull();
      expect(result!.id).toBe('course-uuid-1');
      expect(result!.instructor).toBeDefined();
      expect(result!.instructor.id).toBe('user-uuid-1');
    });

    it('should return null when the course does not exist', async () => {
      ormRepo.findOne.mockResolvedValue(null);

      const result = await repo.findById('non-existent-id');

      expect(result).toBeNull();
    });
  });
});
