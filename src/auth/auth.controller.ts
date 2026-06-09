import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Request,
  Post,
  UseGuards,
  Patch,
  Delete,
  SerializeOptions,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGoogleService } from '../auth-google/auth-google.service';
import { AuthFacebookService } from '../auth-facebook/auth-facebook.service';
import { AuthAppleService } from '../auth-apple/auth-apple.service';
import { AuthOAuthLoginDto } from './dto/auth-oauth-login.dto';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthEmailLoginDto } from './dto/auth-email-login.dto';
import { AuthForgotPasswordDto } from './dto/auth-forgot-password.dto';
import { AuthConfirmEmailDto } from './dto/auth-confirm-email.dto';
import { AuthResetPasswordDto } from './dto/auth-reset-password.dto';
import { AuthUpdateDto } from './dto/auth-update.dto';
import { AuthGuard } from '@nestjs/passport';
import { AuthRegisterLoginDto } from './dto/auth-register-login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { NullableType } from '../utils/types/nullable.type';
import { User } from '../users/domain/user';
import { RefreshResponseDto } from './dto/refresh-response.dto';

@ApiTags('Auth')
@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(
    private readonly service: AuthService,
    private readonly googleService: AuthGoogleService,
    private readonly facebookService: AuthFacebookService,
    private readonly appleService: AuthAppleService,
  ) {}

  @SerializeOptions({
    groups: ['me'],
  })
  @Post('email/login')
  @ApiOkResponse({
    type: LoginResponseDto,
  })
  @HttpCode(HttpStatus.OK)
  public login(@Body() loginDto: AuthEmailLoginDto): Promise<LoginResponseDto> {
    return this.service.validateLogin(loginDto);
  }

  @SerializeOptions({
    groups: ['me'],
  })
  @Post('email/register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() createUserDto: AuthRegisterLoginDto): Promise<User> {
    return this.service.register(createUserDto);
  }

  @Post('email/confirm')
  @HttpCode(HttpStatus.OK)
  async confirmEmail(
    @Body() confirmEmailDto: AuthConfirmEmailDto,
  ): Promise<{ message: string }> {
    await this.service.confirmEmail(confirmEmailDto.hash);
    return { message: 'Email confirmed successfully.' };
  }

  @Post('email/change/confirm')
  @HttpCode(HttpStatus.OK)
  async confirmNewEmail(
    @Body() confirmEmailDto: AuthConfirmEmailDto,
  ): Promise<{ message: string }> {
    await this.service.confirmNewEmail(confirmEmailDto.hash);
    return { message: 'Email address updated successfully.' };
  }

  @Post('password/forgot')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(
    @Body() forgotPasswordDto: AuthForgotPasswordDto,
  ): Promise<{ message: string }> {
    await this.service.forgotPassword(forgotPasswordDto.email);
    return {
      message: 'If this email is registered, a reset link has been sent.',
    };
  }

  @Post('password/reset')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() resetPasswordDto: AuthResetPasswordDto,
  ): Promise<{ message: string }> {
    await this.service.resetPassword(
      resetPasswordDto.hash,
      resetPasswordDto.password,
    );
    return { message: 'Password reset successfully.' };
  }

  @ApiBearerAuth()
  @SerializeOptions({
    groups: ['me'],
  })
  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiOkResponse({
    type: User,
  })
  @HttpCode(HttpStatus.OK)
  public me(@Request() request): Promise<NullableType<User>> {
    return this.service.me(request.user);
  }

  @ApiBearerAuth()
  @ApiOkResponse({
    type: RefreshResponseDto,
  })
  @SerializeOptions({
    groups: ['me'],
  })
  @Post('refresh')
  @UseGuards(AuthGuard('jwt-refresh'))
  @HttpCode(HttpStatus.OK)
  public refresh(@Request() request): Promise<RefreshResponseDto> {
    return this.service.refreshToken({
      sessionId: request.user.sessionId,
      hash: request.user.hash,
    });
  }

  @ApiBearerAuth()
  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  public async logout(@Request() request): Promise<void> {
    await this.service.logout({
      sessionId: request.user.sessionId,
    });
  }

  @ApiBearerAuth()
  @SerializeOptions({
    groups: ['me'],
  })
  @Patch('me')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: User,
  })
  public update(
    @Request() request,
    @Body() userDto: AuthUpdateDto,
  ): Promise<NullableType<User>> {
    return this.service.update(request.user, userDto);
  }

  @ApiBearerAuth()
  @Delete('me')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  public async delete(@Request() request): Promise<void> {
    return this.service.softDelete(request.user);
  }

  @SerializeOptions({
    groups: ['me'],
  })
  @Post('oauth/:provider')
  @ApiOkResponse({
    type: LoginResponseDto,
  })
  @HttpCode(HttpStatus.OK)
  async oauthLogin(
    @Param('provider') provider: string,
    @Body() loginDto: AuthOAuthLoginDto,
  ): Promise<LoginResponseDto> {
    let socialData;

    switch (provider.toLowerCase()) {
      case 'google':
        if (!loginDto.idToken) {
          throw new BadRequestException(
            'idToken is required for Google authentication',
          );
        }
        socialData = await this.googleService.getProfileByToken({
          idToken: loginDto.idToken,
        });
        break;

      case 'facebook':
        if (!loginDto.accessToken) {
          throw new BadRequestException(
            'accessToken is required for Facebook authentication',
          );
        }
        socialData = await this.facebookService.getProfileByToken({
          accessToken: loginDto.accessToken,
        });
        break;

      case 'apple':
        if (!loginDto.idToken) {
          throw new BadRequestException(
            'idToken is required for Apple authentication',
          );
        }
        socialData = await this.appleService.getProfileByToken({
          idToken: loginDto.idToken,
          authorizationCode: loginDto.authorizationCode || '',
          firstName: loginDto.firstName,
          lastName: loginDto.lastName,
        });
        break;

      default:
        throw new BadRequestException(
          `Unsupported OAuth provider: ${provider}`,
        );
    }

    return this.service.validateSocialLogin(provider.toLowerCase(), socialData);
  }
}
