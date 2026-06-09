import { NestFactory } from '@nestjs/core';
import { RoleSeedService } from '../role/role-seed.service';
import { DemoSeedModule } from './demo-seed.module';
import { DemoSeedService } from './demo-seed.service';

const runDemoSeed = async () => {
  const app = await NestFactory.create(DemoSeedModule);

  console.log('\n[demo-seed] seeding roles…');
  await app.get(RoleSeedService).run();

  console.log('[demo-seed] seeding demo users…');
  await app.get(DemoSeedService).run();

  console.log('[demo-seed] done.\n');
  await app.close();
};

void runDemoSeed();
