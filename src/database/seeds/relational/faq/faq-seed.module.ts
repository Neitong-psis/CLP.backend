import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FaqEntity } from '../../../../faqs/infrastructure/persistence/relational/entities/faq.entity';
import { FaqSeedService } from './faq-seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([FaqEntity])],
  providers: [FaqSeedService],
  exports: [FaqSeedService],
})
export class FaqSeedModule {}
