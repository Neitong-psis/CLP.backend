import { Module } from '@nestjs/common';
import { AuthGoogleService } from './auth-google.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [AuthGoogleService],
  exports: [AuthGoogleService],
})
export class AuthGoogleModule {}
