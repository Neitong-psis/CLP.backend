import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import bcrypt from 'bcryptjs';
import { RoleEnum } from '../../../../roles/roles.enum';
import { StatusEnum } from '../../../../statuses/statuses.enum';
import { UserEntity } from '../../../../users/infrastructure/persistence/relational/entities/user.entity';

@Injectable()
export class UserSeedService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
  ) {}

  async run() {
    const countAdmin = await this.repository.count({
      where: { email: 'admin@example.com' },
      withDeleted: true,
    });

    if (!countAdmin) {
      const salt = await bcrypt.genSalt();
      const password = await bcrypt.hash('secret', salt);

      await this.repository.save(
        this.repository.create({
          firstName: 'Super',
          lastName: 'Admin',
          email: 'admin@example.com',
          passwordHash: password,
          roles: [
            {
              id: String(RoleEnum.admin),
            },
          ],
          status: { id: StatusEnum.active },
        }),
      );
    }

    const countLearner = await this.repository.count({
      where: { email: 'john.doe@example.com' },
      withDeleted: true,
    });

    if (!countLearner) {
      const salt = await bcrypt.genSalt();
      const password = await bcrypt.hash('secret', salt);

      await this.repository.save(
        this.repository.create({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          passwordHash: password,
          roles: [
            {
              id: String(RoleEnum.learner),
            },
          ],
          status: { id: StatusEnum.active },
        }),
      );
    }

    const countEducator = await this.repository.count({
      where: { email: 'jane.smith@example.com' },
      withDeleted: true,
    });

    if (!countEducator) {
      const salt = await bcrypt.genSalt();
      const password = await bcrypt.hash('secret', salt);

      await this.repository.save(
        this.repository.create({
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
          passwordHash: password,
          roles: [
            {
              id: String(RoleEnum.educator),
            },
          ],
          status: { id: StatusEnum.active },
        }),
      );
    }
  }
}
