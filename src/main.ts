import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import swaggerConfig from './configs/swaggerConfig';
import { ResponseExceptionFilter } from './utils/response-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new ResponseExceptionFilter());

  const document = SwaggerModule.createDocument(app, swaggerConfig());
  SwaggerModule.setup('api-docs', app, document);

  const configService = app.get(ConfigService);
  const port = Number(configService.get('PORT') ?? 4000);
  await app.listen(port);
}
bootstrap();
