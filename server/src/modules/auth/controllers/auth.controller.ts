import {
  Controller,
  Req,
  Post,
  Body,
  Patch,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
  UnauthorizedException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { now } from 'moment';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiConflictResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { Public } from '@common/decorators';
import * as fromDtoAuth from '@auth/dto';
import * as fromServicesAuth from '@auth/services';
import * as fromDtoUsers from '@users/dto';
import * as fromServicesUsers from '@users/services';
import * as fromEnumsUsers from '@users/enums';
import * as fromServicesShared from '@shared/services';
import { getPasswordPolicy } from '@shared/password-policy';
import type { AuthRequest } from '@auth/types/auth.types';
import {
  LoginResponse,
  RegisterResponse,
  LogoutResponse,
  ForgotPasswordResponse,
  ResetPasswordResponse,
} from '@auth/dto/auth.responses';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private _serviceAuth: fromServicesAuth.AuthService,
    private _serviceJwt: JwtService,
    private _serviceUsers: fromServicesUsers.UsersService,
    private _serviceConfig: ConfigService,
    private _serviceMailing: fromServicesShared.MailingService,
    private _serviceRedis: fromServicesShared.RedisService,
    private readonly _logger: fromServicesShared.LoggerService,
  ) {}

  @Public()
  @Post('register')
  @ApiOperation({
    summary: 'Register a new user',
    description: 'Creates a new user account and sends a verification email.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User successfully registered',
    type: RegisterResponse,
  })
  @ApiConflictResponse({
    description: 'Email already registered',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data',
  })
  @ApiBody({ type: fromDtoUsers.CreateUserDto })
  async register(
    @Body() createUserDto: fromDtoUsers.CreateUserDto,
    @Req() req: AuthRequest,
  ) {
    const { email } = createUserDto;

    const userByEmail = await this._serviceUsers.findOneByPayload({ email });
    if (userByEmail) {
      throw new ConflictException('User already registered');
    }

    if (createUserDto.password) {
      const hash = await bcrypt.hash(createUserDto.password, 10);
      createUserDto.password = hash;
    }

    const createdUser = await this._serviceUsers.create(createUserDto);
    if (!createdUser) {
      throw new BadRequestException('User was not registered.');
    }

    try {
      // create activation token, persist mapping in redis and send activation email
      const token = await this._serviceJwt.signAsync({
        id: createdUser.id,
        email: createdUser.email,
      });
      await this._serviceRedis.set(
        `activate:${token}`,
        createdUser.id,
        60 * 60 * 24,
      );

      await this._serviceMailing.send({
        to: createdUser.email,
        subject: 'Activate your account',
        template: 'activate-account',
        context: {
          email: createdUser.email,
          activateLink: `${this._serviceConfig.get<string>('WEBAPP_URL')}/activate?token=${token}`,
        },
      });

      return createdUser;
    } catch (error) {
      this._logger.logError(error, req);
      throw new InternalServerErrorException('Error trying to send an email');
    }
  }

  @Public()
  @Patch('activate')
  @ApiOperation({
    summary: 'Activate user account',
    description:
      'Activates a newly registered user account using the token sent via email.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Account successfully activated',
    type: LoginResponse,
  })
  @ApiBadRequestResponse({
    description: 'Invalid token or user already activated',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['token'],
      properties: {
        token: {
          type: 'string',
          description: 'Activation token received via email',
        },
        password: {
          type: 'string',
          description: 'Optional new password',
        },
      },
    },
  })
  async activate(@Body() body: { token: string; password?: string }) {
    const { token, password } = body;
    if (!token) throw new BadRequestException('Token not provided');

    const exists = await this._serviceRedis.exists(`activate:${token}`);
    if (!exists) {
      throw new BadRequestException('Invalid or expired activation token');
    }

    const userId = await this._serviceRedis.get(`activate:${token}`);
    const user = await this._serviceUsers.findById(userId as string);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (
      (user.state as fromEnumsUsers.USER_STATES) ===
      fromEnumsUsers.USER_STATES.ACTIVE
    ) {
      // user already active, clean token and inform
      await this._serviceRedis.del(`activate:${token}`);
      throw new BadRequestException('User already activated');
    }

    if (password) {
      const hash = await bcrypt.hash(password, 10);
      user.password = hash;
    }

    user.state = fromEnumsUsers.USER_STATES.ACTIVE;

    const updated = await this._serviceUsers.findAndUpdate(
      { id: user.id },
      user,
    );
    if (!updated) {
      throw new BadRequestException(
        `User with id ${user.id} could not be activated`,
      );
    }

    // remove token and send confirmation email
    await this._serviceRedis.del(`activate:${token}`);
    await this._serviceMailing.send({
      to: user.email,
      subject: 'Your account is active',
      template: 'activated',
      context: {
        name: user.name,
        loginLink: `${this._serviceConfig.get<string>('WEBAPP_URL')}/login`,
      },
    });

    return updated;
  }

  @Public()
  @Post('password-policy')
  getPasswordPolicy() {
    return getPasswordPolicy();
  }

  @Public()
  @Post('activation-status')
  async activationStatus(@Body() body: { token: string }) {
    const { token } = body;
    if (!token) return { valid: false, activated: false };

    const exists = await this._serviceRedis.exists(`activate:${token}`);
    if (!exists) return { valid: false, activated: false };

    const userId = await this._serviceRedis.get(`activate:${token}`);
    const user = await this._serviceUsers.findById(userId as string);
    if (!user) return { valid: false, activated: false };

    return {
      valid: true,
      activated:
        (user.state as fromEnumsUsers.USER_STATES) ===
        fromEnumsUsers.USER_STATES.ACTIVE,
    };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User login',
    description: 'Authenticate a user and return an access token',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully authenticated',
    type: LoginResponse,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials or inactive user',
  })
  @ApiBody({ type: fromDtoAuth.LoginDto })
  async login(@Body() loginDto: fromDtoAuth.LoginDto) {
    const { email, password } = loginDto;

    const user = await this._serviceUsers.findOneByPayload({ email });
    if (!user) {
      throw new BadRequestException(`User with email ${email} not found`);
    }

    if (
      (user.state as fromEnumsUsers.USER_STATES) !==
      fromEnumsUsers.USER_STATES.ACTIVE
    ) {
      throw new BadRequestException('User has not been activated');
    }

    if (await bcrypt.compare(password, user?.password)) {
      user.lastLogin = now();

      const userUpdated = await this._serviceUsers.findAndUpdate(
        { email: user.email },
        user,
      );
      if (!userUpdated) {
        throw new BadRequestException(
          `User with email ${email} was not logged correctly`,
        );
      } else {
        const sanitizedUser = this._serviceUsers.sanitizeUser(userUpdated);
        const token = await this._serviceJwt.signAsync(sanitizedUser);
        return {
          user: sanitizedUser,
          token: token,
        };
      }
    } else {
      throw new InternalServerErrorException('Invalid credentials');
    }
  }

  @Post('logout')
  @ApiOperation({
    summary: 'User logout',
    description: 'Invalidates the current user session token',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully logged out',
    type: LogoutResponse,
  })
  @ApiUnauthorizedResponse({
    description: 'Token not provided or invalid',
  })
  async logout(@Req() req: AuthRequest) {
    const token = String(req.headers.authorization ?? '').split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Token not provided');
    }

    const isBlacklisted = await this._serviceAuth.isTokenBlacklisted(token);
    if (!isBlacklisted) {
      await this._serviceAuth.addTokenToBlacklist(token);
      return { message: 'Logout successful' };
    } else {
      return { message: 'Token already invalidated' };
    }
  }

  @Public()
  @Post('forgot-password')
  @ApiOperation({
    summary: 'Request password reset',
    description: "Sends a password reset link to the user's email",
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['email'],
      properties: {
        email: {
          type: 'string',
          format: 'email',
          description: "User's registered email",
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password reset email sent',
    type: ForgotPasswordResponse,
  })
  @ApiBadRequestResponse({
    description: 'Invalid email or user not found',
  })
  async forgotPassword(
    @Body() body: { email: string },
    @Req() req: AuthRequest,
  ) {
    const { email } = body;
    const user = await this._serviceUsers.findOneByPayload({ email });
    if (!user) {
      throw new BadRequestException(`User with email ${email} not found`);
    }

    try {
      const token = await this._serviceJwt.signAsync({
        id: user.id,
        email: user.email,
      });
      await this._serviceRedis.set(
        `reset:${token}`,
        user.id,
        60 * 60, // 1 hour expiration
      );

      await this._serviceMailing.send({
        to: user.email,
        subject: 'Reset your password',
        template: 'reset-password',
        context: {
          name: user.name,
          resetLink: `${this._serviceConfig.get<string>('WEBAPP_URL')}/reset-password?token=${token}`,
        },
      });

      return {
        message: 'Password reset instructions sent to your email',
      };
    } catch (error) {
      this._logger.logError(error, req);
      throw new InternalServerErrorException(
        'Error sending password reset email',
      );
    }
  }

  @Public()
  @Post('reset-password')
  @ApiOperation({
    summary: 'Reset password',
    description: 'Resets user password using the token received via email',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['token', 'password'],
      properties: {
        token: {
          type: 'string',
          description: 'Reset token received via email',
        },
        password: {
          type: 'string',
          description: 'New password',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password successfully reset',
    type: ResetPasswordResponse,
  })
  @ApiBadRequestResponse({
    description: 'Invalid or expired token',
  })
  async resetPassword(
    @Body() body: { token: string; password: string },
    @Req() req: AuthRequest,
  ) {
    const { token, password } = body;
    if (!token || !password) {
      throw new BadRequestException('Token and password are required');
    }

    const exists = await this._serviceRedis.exists(`reset:${token}`);
    if (!exists) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const userId = await this._serviceRedis.get(`reset:${token}`);
    const user = await this._serviceUsers.findById(userId as string);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    try {
      const hash = await bcrypt.hash(password, 10);
      const updated = await this._serviceUsers.findAndUpdate(
        { id: user.id },
        { password: hash },
      );

      if (!updated) {
        throw new BadRequestException('Password could not be updated');
      }

      // Invalidate the reset token
      await this._serviceRedis.del(`reset:${token}`);

      return {
        message: 'Password successfully reset',
      };
    } catch (error) {
      this._logger.logError(error, req);
      throw new InternalServerErrorException('Error resetting password');
    }
  }
}
