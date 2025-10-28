import {
  Controller,
  Body,
  Param,
  Get,
  Post,
  Patch,
  Delete,
  UseInterceptors,
  UploadedFile,
  Res,
  Req,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { FileInterceptor } from '@nestjs/platform-express';
import { existsSync, unlinkSync } from 'fs';
import type { Express, Response } from 'express';
import { diskStorage } from 'multer';
import * as bcrypt from 'bcrypt';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiConsumes,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';

import { Public } from '@common/decorators';
import { UsersService } from '@users/services';
import { User } from '@users/entities';
import { USER_STATES } from '@users/enums';
import {
  LoggerService,
  MailingService,
  RedisService,
  UtilsService,
} from '@shared/services';
import type { AuthRequest } from '@auth/types/auth.types';
import {
  CreateUserDto,
  UpdateUserDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from '@users/dto/users.dto';
import {
  UserResponse,
  UserListResponse,
  UploadAvatarResponse,
} from '@users/dto/users.responses';

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UsersController {
  constructor(
    private _service: UsersService,
    private _mailingService: MailingService,
    private _serviceRedis: RedisService,
    private _serviceJwt: JwtService,
    private _serviceConfig: ConfigService,
    private readonly _logger: LoggerService,
  ) {}

  @Public()
  @Post()
  @ApiOperation({
    summary: 'Create new user',
    description: 'Creates a new user account with the provided details.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User successfully created',
    type: UserResponse,
  })
  @ApiConflictResponse({
    description: 'User with this email already exists',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data',
  })
  @ApiBody({ type: CreateUserDto })
  async create(@Body() createUserDto: CreateUserDto, @Req() req: AuthRequest) {
    const { email } = createUserDto;
    const userByEmail = await this._service.findOneByPayload({ email });
    if (userByEmail) {
      throw new ConflictException('User already registered');
    }

    try {
      if (createUserDto.password) {
        const hash = await bcrypt.hash(createUserDto.password, 10);
        createUserDto.password = hash;
      }

      const createdUser = await this._service.create(createUserDto);
      if (!createdUser) {
        throw new BadRequestException('User was not registered');
      }

      return createdUser;
    } catch (error) {
      this._logger.logError(error, req);
      throw new InternalServerErrorException('User was not registered');
    }
  }

  @Get()
  @ApiOperation({
    summary: 'Get all users',
    description: 'Retrieves a list of all users in the system.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of users successfully retrieved',
    type: UserListResponse,
  })
  async findAll(@Req() req: AuthRequest): Promise<User[]> {
    try {
      const users = await this._service.findAll();
      if (!users) {
        throw new NotFoundException('Users not found');
      }

      return users;
    } catch (error) {
      this._logger.logError(error as unknown, req);
      throw new InternalServerErrorException('Users not found');
    }
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Retrieves user details by their ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User details successfully retrieved',
    type: UserResponse,
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  async findOne(
    @Param('id') id: string,
    @Req() req: AuthRequest,
  ): Promise<User> {
    try {
      const user = await this._service.findById(id);
      if (!user) {
        throw new NotFoundException(`User with id ${id} not found`);
      }
      return user;
    } catch (error) {
      this._logger.logError(error as unknown, req);
      throw new InternalServerErrorException(`User with id ${id} not found`);
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: AuthRequest,
  ) {
    const payload: Partial<User> = {
      ...updateUserDto,
      birthday: updateUserDto.birthday
        ? new Date(updateUserDto.birthday).getTime()
        : undefined,
    };

    try {
      const updated = await this._service.findAndUpdate({ id }, payload);
      if (!updated) {
        throw new BadRequestException(`User with id ${id} was not updated`);
      }
      return updated;
    } catch (err: unknown) {
      this._logger.logError(err, req);
      throw new InternalServerErrorException(
        `User with id ${id} was not updated`,
      );
    }
  }

  @Patch(':id/state')
  async updateState(
    @Param('id') id: string,
    @Body() newState: { state: USER_STATES },
    @Req() req: AuthRequest,
  ) {
    try {
      const updated = await this._service.findAndUpdate({ id: id }, newState);
      if (!updated) {
        throw new InternalServerErrorException(
          `State of the user with ID: ${id} was not updated`,
        );
      }
      return updated;
    } catch (err: unknown) {
      this._logger.logError(err, req);
      throw new InternalServerErrorException(
        `State of the user with ID: ${id} was not updated`,
      );
    }
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete user',
    description: 'Deletes a user account and all associated data.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the user to delete',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User successfully deleted',
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  async delete(@Param('id') id: string, @Req() req: AuthRequest) {
    try {
      const result = await this._service.delete(id);
      return result;
    } catch (error) {
      this._logger.logError(error as unknown, req);
      throw new InternalServerErrorException(
        `User with id ${id} was not deleted`,
      );
    }
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
    @Req() req: AuthRequest,
  ) {
    const { email } = forgotPasswordDto;

    const user = await this._service.findOneByPayload({ email });
    if (!user) {
      throw new BadRequestException('User does not exist');
    }

    try {
      const token = await this._serviceJwt.signAsync(
        this._service.sanitizeUser(user) as Record<string, unknown>,
      );
      await this._serviceRedis.set(
        `reset:${token}`,
        String(user.email),
        60 * 15,
      );
      await this._mailingService.send({
        to: user.email,
        subject: 'Reset your password',
        template: 'forgot-password',
        context: {
          name: user.name,
          link: `${this._serviceConfig.get<string>('WEBAPP_URL')}/reset-password?token=${token}`,
        },
      });

      return { token, success: true };
    } catch (error) {
      this._logger.logError(error as unknown, req);
      throw new InternalServerErrorException('Error trying to send an email');
    }
  }

  @Public()
  @Post('reset-password/:token')
  async resetPassword(
    @Param('token') token: string,
    @Body() resetPasswordDto: ResetPasswordDto,
    @Req() req: AuthRequest,
  ) {
    const decoded: unknown = this._serviceJwt.decode(token);
    const decodedObj = decoded as Record<string, unknown> | null;
    const idVal = decodedObj && decodedObj['id'];
    if (
      !decodedObj ||
      idVal === undefined ||
      idVal === null ||
      (typeof idVal !== 'string' && typeof idVal !== 'number')
    ) {
      throw new BadRequestException('Invalid token');
    }
    const userId = String(idVal);

    try {
      const hash = await bcrypt.hash(resetPasswordDto.password, 10);
      const updatedPayload: Partial<User> = { password: hash };

      const userUpdated = await this._service.findAndUpdate(
        { id: userId },
        updatedPayload,
      );
      if (!userUpdated) {
        throw new BadRequestException(
          `Password of the user with ID: ${userId} has not changed`,
        );
      }

      await this._serviceRedis.del(`reset:${token}`);
      return { user: userUpdated };
    } catch (error) {
      this._logger.logError(error as unknown, req);
      throw new InternalServerErrorException(
        `Error trying to reset password of the user with ID: ${userId}`,
      );
    }
  }

  @Post(':id/avatar')
  @ApiOperation({
    summary: 'Upload user avatar',
    description: "Uploads or updates a user's profile picture.",
  })
  @ApiConsumes('multipart/form-data')
  @ApiParam({
    name: 'id',
    description: 'User ID',
    required: true,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: 'Image file (jpeg, png)',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Avatar successfully uploaded',
    type: UploadAvatarResponse,
  })
  @ApiBadRequestResponse({
    description: 'Invalid image file or user not found',
  })
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/user',
        filename: UtilsService.editFileName,
      }),
      fileFilter: UtilsService.imageFileFilter,
    }),
  )
  async uploadProfilePicture(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: AuthRequest,
  ) {
    const user = await this._service.findById(id);
    if (!user) {
      throw new BadRequestException(`User with id ${id} not found`);
    }

    try {
      if (user.avatar) {
        const currentAvatarPath = `${process.cwd()}/uploads/user/${user.avatar}`;
        if (existsSync(currentAvatarPath)) {
          unlinkSync(currentAvatarPath);
        }
      }

      const userUpdated = await this._service.findAndUpdate(
        { id: id },
        { avatar: file.filename },
      );
      if (!userUpdated) {
        throw new BadRequestException(
          `Avatar of the User with ID: ${id} was not updated`,
        );
      }

      return { avatar: userUpdated.avatar };
    } catch (error) {
      this._logger.logError(error, req);
      throw new InternalServerErrorException(
        `Avatar of the User with ID: ${id} was not updated`,
      );
    }
  }

  @Get(':id/avatar')
  async getProfilePicture(
    @Param('id') id: string,
    @Res() res: Response,
    @Req() req: AuthRequest,
  ) {
    const user = await this._service.findById(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    try {
      if (!user.avatar) {
        throw new BadRequestException('User does not have a profile picture');
      }

      return res.sendFile(user.avatar, {
        root: `${process.cwd()}/uploads/user`,
      });
    } catch (error) {
      this._logger.logError(error, req);
      throw new InternalServerErrorException(
        `Error trying to get the avatar of the user with ID: ${id}`,
      );
    }
  }
}
