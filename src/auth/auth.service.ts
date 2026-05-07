import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import type { StringValue } from 'ms';

const DEFAULT_EMAIL = 'admin@eduhub.local';
const DEFAULT_PASSWORD = 'password123';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(email: string, password: string) {
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL') ?? DEFAULT_EMAIL;
    const adminPassword =
      this.configService.get<string>('ADMIN_PASSWORD') ?? DEFAULT_PASSWORD;

    const isMatch = await this.comparePassword(password, adminPassword);
    if (email !== adminEmail || !isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: 'admin', email, role: 'admin' };
    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN') ?? '1d';
    const jwtExpiresIn = normalizeExpiresIn(expiresIn);

    return {
      access_token: await this.jwtService.signAsync(payload, {
        expiresIn: jwtExpiresIn,
      }),
      token_type: 'Bearer',
      expires_in: expiresIn,
    };
  }

  private async comparePassword(plain: string, stored: string) {
    if (stored.startsWith('$2a$') || stored.startsWith('$2b$') || stored.startsWith('$2y$')) {
      return bcrypt.compare(plain, stored);
    }

    return plain === stored;
  }
}

function normalizeExpiresIn(value: string) {
  const asNumber = Number(value);
  if (Number.isFinite(asNumber)) {
    return asNumber;
  }

  return value as StringValue;
}
