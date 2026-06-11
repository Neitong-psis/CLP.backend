import {
  HttpStatus,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { NullableType } from '../utils/types/nullable.type';
import { FilterUserDto, SortUserDto } from './dto/query-user.dto';
import { UserRepository } from './infrastructure/persistence/user.repository';
import { User } from './domain/user';
import bcrypt from 'bcryptjs';
import { AuthProvidersEnum } from '../auth/auth-providers.enum';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { Role } from '../roles/domain/role';
import { UpdateUserDto } from './dto/update-user.dto';
import { StatusEnum } from '../statuses/statuses.enum';
import { Status } from '../statuses/domain/status';
import { FileType } from '../files/domain/file';
import { DataSource } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UserRepository,
    private readonly dataSource: DataSource,
  ) {}

  async getStats() {
    const totalUsers = await this.dataSource.query(
      `SELECT COUNT(*)::int as count FROM "user" WHERE "deletedAt" IS NULL`,
    );

    const rolesData = await this.dataSource.query(
      `SELECT r.role_name as role, COUNT(ura.user_id)::int as count 
       FROM user_roles r 
       LEFT JOIN user_role_assignments ura ON r.role_id = ura.role_id 
       GROUP BY r.role_name`,
    );

    const trendData = await this.dataSource.query(
      `SELECT 
         COUNT(CASE WHEN "createdAt" >= DATE_TRUNC('month', CURRENT_DATE) THEN 1 END)::int as current_month,
         COUNT(CASE WHEN "createdAt" >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month') AND "createdAt" < DATE_TRUNC('month', CURRENT_DATE) THEN 1 END)::int as prev_month
       FROM "user"
       WHERE "deletedAt" IS NULL`,
    );

    const distribution = {
      admins: 0,
      educators: 0,
      learners: 0,
    };

    rolesData.forEach((row) => {
      const roleName = row.role.toLowerCase();
      if (roleName.includes('admin')) {
        distribution.admins += row.count;
      } else if (roleName.includes('educator')) {
        distribution.educators += row.count;
      } else if (roleName.includes('learner') || roleName.includes('user')) {
        distribution.learners += row.count;
      }
    });

    const current = trendData[0]?.current_month || 0;
    const prev = trendData[0]?.prev_month || 0;
    const trend =
      prev === 0
        ? current > 0
          ? 100
          : 0
        : Math.round(((current - prev) / prev) * 100);

    return {
      total: totalUsers[0]?.count || 0,
      trend,
      distribution,
    };
  }

  async getAnalytics() {
    const analyticsData = await this.dataSource.query(
      `WITH months AS (
         SELECT DATE_TRUNC('month', m)::date as month_start
         FROM generate_series(
           CURRENT_DATE - INTERVAL '11 months',
           CURRENT_DATE,
           '1 month'::interval
         ) m
       )
       SELECT 
         TO_CHAR(m.month_start, 'Mon') as month_name,
         (SELECT COUNT(*)::int FROM "user" u WHERE u."createdAt" <= m.month_start + INTERVAL '1 month' - INTERVAL '1 second' AND u."deletedAt" IS NULL) as users_count
       FROM months m
       ORDER BY m.month_start ASC`,
    );

    return {
      months: analyticsData.map((row) => row.month_name),
      growth: analyticsData.map((row) => row.users_count),
    };
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Do not remove comment below.
    // <creating-property />

    let password: string | undefined = undefined;

    if (createUserDto.password) {
      const salt = await bcrypt.genSalt();
      password = await bcrypt.hash(createUserDto.password, salt);
    }

    let email: string | null = null;

    if (createUserDto.email) {
      const userObject = await this.usersRepository.findByEmail(
        createUserDto.email,
      );
      if (userObject) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            email: 'emailAlreadyExists',
          },
        });
      }
      email = createUserDto.email;
    }

    let roles: Role[] = [];

    if (createUserDto.roles && createUserDto.roles.length > 0) {
      roles = createUserDto.roles.map((r) => ({ id: r.id }));
    }

    const status = createUserDto.status
      ? { id: Number(createUserDto.status.id) }
      : { id: StatusEnum.active };

    const photo = createUserDto.photo?.id
      ? ({ id: createUserDto.photo.id } as FileType)
      : null;

    return this.usersRepository.create({
      // Do not remove comment below.
      // <creating-property-payload />
      firstName: createUserDto.firstName ?? '',
      lastName: createUserDto.lastName ?? '',
      email: email ?? '',
      passwordHash: password ?? '',
      photo: photo,
      roles: roles,
      status: status,
      provider: createUserDto.provider ?? AuthProvidersEnum.email,
      socialId: createUserDto.socialId,
    });
  }

  findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterUserDto | null;
    sortOptions?: SortUserDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<User[]> {
    return this.usersRepository.findManyWithPagination({
      filterOptions,
      sortOptions,
      paginationOptions,
    });
  }

  findById(id: User['id']): Promise<NullableType<User>> {
    return this.usersRepository.findById(id);
  }

  findByIds(ids: User['id'][]): Promise<User[]> {
    return this.usersRepository.findByIds(ids);
  }

  findByEmail(email: User['email']): Promise<NullableType<User>> {
    return this.usersRepository.findByEmail(email);
  }

  findBySocialIdAndProvider({
    socialId,
    provider,
  }: {
    socialId: User['socialId'];
    provider: User['provider'];
  }): Promise<NullableType<User>> {
    return this.usersRepository.findBySocialIdAndProvider({
      socialId,
      provider,
    });
  }

  async update(
    id: User['id'],
    updateUserDto: UpdateUserDto,
  ): Promise<User | null> {
    // Do not remove comment below.
    // <updating-property />

    let password: string | undefined = undefined;

    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt();
      password = await bcrypt.hash(updateUserDto.password, salt);
    }

    let email: string | null | undefined = undefined;

    if (updateUserDto.email) {
      const userObject = await this.usersRepository.findByEmail(
        updateUserDto.email,
      );

      if (userObject && userObject.id !== id) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            email: 'emailAlreadyExists',
          },
        });
      }

      email = updateUserDto.email;
    } else if (updateUserDto.email === null) {
      email = null;
    }

    let roles: Role[] | undefined = undefined;

    if (updateUserDto.roles && updateUserDto.roles.length > 0) {
      roles = updateUserDto.roles.map((r) => ({ id: r.id }));
    }

    let photo: FileType | null | undefined = undefined;
    if (updateUserDto.photo) {
      photo = { id: updateUserDto.photo.id } as FileType;
    } else if (updateUserDto.photo === null) {
      photo = null;
    }

    let status: Status | undefined = undefined;
    if (updateUserDto.status) {
      status = { id: Number(updateUserDto.status.id) };
    }

    return this.usersRepository.update(id, {
      // Do not remove comment below.
      // <updating-property-payload />
      firstName: updateUserDto.firstName ?? undefined,
      lastName: updateUserDto.lastName ?? undefined,
      email: email,
      passwordHash: password,
      photo,
      roles,
      status,
      provider: updateUserDto.provider,
      socialId: updateUserDto.socialId,
    });
  }

  async remove(id: User['id']): Promise<void> {
    await this.usersRepository.remove(id);
  }
}
