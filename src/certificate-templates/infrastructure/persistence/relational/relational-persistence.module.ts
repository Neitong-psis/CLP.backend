import { Module } from '@nestjs/common';
import { CertificateTemplateRepository } from '../certificate-template.repository';
import { CertificateTemplateRelationalRepository } from './repositories/certificate-template.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CertificateTemplateEntity } from './entities/certificate-template.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CertificateTemplateEntity])],
  providers: [
    {
      provide: CertificateTemplateRepository,
      useClass: CertificateTemplateRelationalRepository,
    },
  ],
  exports: [CertificateTemplateRepository],
})
export class RelationalCertificateTemplatePersistenceModule {}
