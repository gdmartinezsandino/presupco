import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsDate,
  IsOptional,
} from 'class-validator';
import { IsStrongPassword } from '@shared/validators/is-strong-password.decorator';

export class CreateUserDto {
  @ApiProperty({ description: 'Name of the new user' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Email of the new user' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Password of the new user' })
  @IsOptional()
  @IsString()
  password?: string;

  // @ApiProperty({ description: 'Birthday of the new user' })
  // @IsDate()
  // birthday: Date;

  // @ApiProperty({ description: 'Roles of the user could be: [ADMIN, EMPLOYEE, CLIENT]' })
  // @IsDate()
  // @IsNotEmpty()
  // roles: Array<string>;

  // @ApiProperty({ description: 'State of the user could be: [ACTIVE, PENDING, INACTIVE]' })
  // @IsDate()
  // @IsNotEmpty()
  // state: string;
}

export class UpdateUserDto {
  @ApiProperty({ description: 'Name of the user to update' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Email of the user to update' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Birthday of the user to update' })
  @IsDate()
  birthday: Date;
}

export class ForgotPasswordDto {
  @ApiProperty({
    description:
      'Provide the email of the user who wants to reset his password',
  })
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Provide the new password to be configured in the user',
  })
  @IsNotEmpty()
  @IsString()
  @IsStrongPassword()
  readonly password: string;
}
