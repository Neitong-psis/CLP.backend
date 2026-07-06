import {
  // do not remove this comment
  Module,
} from '@nestjs/common';
import { CertificateTemplatesService } from './certificate-templates.service';
import { CertificateTemplatesController } from './certificate-templates.controller';
import { RelationalCertificateTemplatePersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';

@Module({
  imports: [
    // do not remove this comment
    RelationalCertificateTemplatePersistenceModule,
  ],
  controllers: [CertificateTemplatesController],
  providers: [CertificateTemplatesService],
  exports: [
    CertificateTemplatesService,
    RelationalCertificateTemplatePersistenceModule,
  ],
})
export class CertificateTemplatesModule {}
