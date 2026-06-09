import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import bcrypt from 'bcryptjs';
import { RoleEnum } from '../../../../roles/roles.enum';
import { StatusEnum } from '../../../../statuses/statuses.enum';
import { UserEntity } from '../../../../users/infrastructure/persistence/relational/entities/user.entity';

// All demo accounts use this password
export const DEMO_PASSWORD = 'Demo@1234';

const DEMO_USERS = [
  // ── Admin ─────────────────────────────────────────────────────────────────
  // Matches ADMIN_USER in frontend/src/constants/admin/index.ts
  {
    firstName: 'Sarah',
    lastName: 'Wilson',
    email: 'admin@clp.com',
    role: RoleEnum.admin,
    status: StatusEnum.active,
  },

  // ── Educators ─────────────────────────────────────────────────────────────
  // Matches EDUCATOR_USER in frontend/src/constants/educator/index.ts
  {
    firstName: 'Angela',
    lastName: 'Yu',
    email: 'angela@clp.com',
    role: RoleEnum.educator,
    status: StatusEnum.active,
  },
  {
    firstName: 'Kirill',
    lastName: 'Eremenko',
    email: 'kirill@clp.com',
    role: RoleEnum.educator,
    status: StatusEnum.active,
  },
  {
    firstName: 'Sarah',
    lastName: 'Chen',
    email: 'sarah.chen@clp.com',
    role: RoleEnum.educator,
    status: StatusEnum.active,
  },
  {
    firstName: 'James',
    lastName: 'Wright',
    email: 'james.wright@clp.com',
    role: RoleEnum.educator,
    status: StatusEnum.active,
  },

  // ── Learners ──────────────────────────────────────────────────────────────
  // Matches MOCK_USER in frontend/src/constants/learner/index.ts
  {
    firstName: 'Sopheaktra',
    lastName: 'Meng',
    email: 'sopheaktra@ayla.edu.kh',
    role: RoleEnum.learner,
    status: StatusEnum.active,
  },
  // Matches ADMIN_USERS rows in frontend/src/constants/admin/index.ts
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@clp.com',
    role: RoleEnum.learner,
    status: StatusEnum.active,
  },
  {
    firstName: 'Mike',
    lastName: 'Johnson',
    email: 'mike@clp.com',
    role: RoleEnum.learner,
    status: StatusEnum.active,
  },
  {
    firstName: 'Priya',
    lastName: 'Sharma',
    email: 'priya@clp.com',
    role: RoleEnum.learner,
    status: StatusEnum.inactive,
  },
  {
    firstName: 'Tom',
    lastName: 'Chen',
    email: 'tom@clp.com',
    role: RoleEnum.learner,
    status: StatusEnum.active,
  },
] as const;

@Injectable()
export class DemoSeedService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
  ) {}

  async run() {
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, salt);

    for (const user of DEMO_USERS) {
      const exists = await this.repository.count({
        where: { email: user.email },
      });

      if (!exists) {
        await this.repository.save(
          this.repository.create({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            passwordHash,
            roles: [{ id: String(user.role) }],
            status: { id: user.status },
          }),
        );
        console.log(
          `  ✔ seeded ${user.email} [${user.role.split('-')[3] ?? user.role}]`,
        );
      } else {
        console.log(`  – skipped ${user.email} (already exists)`);
      }
    }
  }
}
