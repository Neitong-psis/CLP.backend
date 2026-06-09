import { Module } from '@nestjs/common';
import { AuthFacebookService } from './auth-facebook.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [AuthFacebookService],
  exports: [AuthFacebookService],
})
export class AuthFacebookModule {}
