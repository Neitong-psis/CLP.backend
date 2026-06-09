import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleEntity } from '../../../../roles/infrastructure/persistence/relational/entities/role.entity';
import { RoleEnum } from '../../../../roles/roles.enum';

@Injectable()
export class RoleSeedService {
  constructor(
    @InjectRepository(RoleEntity)
    private readonly repository: Repository<RoleEntity>,
  ) {}

  async run() {
    await this.repository.save(
      this.repository.create({
        id: RoleEnum.learner,
        name: 'Learner',
      }),
    );

    await this.repository.save(
      this.repository.create({
        id: RoleEnum.educator,
        name: 'Educator',
      }),
    );

    await this.repository.save(
      this.repository.create({
        id: RoleEnum.admin,
        name: 'Admin',
      }),
    );
  }
}
