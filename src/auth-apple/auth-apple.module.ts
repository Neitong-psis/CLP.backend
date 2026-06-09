import { Module } from '@nestjs/common';
import { AuthAppleService } from './auth-apple.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [AuthAppleService],
  exports: [AuthAppleService],
})
export class AuthAppleModule {}
