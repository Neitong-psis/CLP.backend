import { Module } from '@nestjs/common';
import { FaqsController } from './faqs.controller';
import { FaqsService } from './faqs.service';
import { RelationalFaqPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';

@Module({
  imports: [RelationalFaqPersistenceModule],
  controllers: [FaqsController],
  providers: [FaqsService],
  exports: [FaqsService, RelationalFaqPersistenceModule],
})
export class FaqsModule {}
