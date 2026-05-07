import { DocumentBuilder } from '@nestjs/swagger';

export default function swaggerConfig() : ReturnType<DocumentBuilder['build']> {
  return new DocumentBuilder()
    .setTitle('EduHub API')
    .setDescription('API documentation for EduHub MOOC learning platform')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
}