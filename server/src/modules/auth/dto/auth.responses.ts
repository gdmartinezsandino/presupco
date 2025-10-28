import { ApiProperty } from '@nestjs/swagger';

export class AuthTokenResponse {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  token: string;

  @ApiProperty({
    description: 'Time in seconds until the token expires',
    example: 3600,
  })
  expiresIn: number;
}

export class LoginResponse extends AuthTokenResponse {
  @ApiProperty({
    description: 'ID of the logged in user',
    example: '507f1f77bcf86cd799439011',
  })
  id: string;

  @ApiProperty({
    description: 'Email of the logged in user',
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Name of the logged in user',
    example: 'John Doe',
  })
  name: string;
}

export class RegisterResponse extends LoginResponse {
  @ApiProperty({
    description: 'Verification email sent status',
    example: true,
  })
  emailSent: boolean;
}

export class LogoutResponse {
  @ApiProperty({
    description: 'Logout success status',
    example: true,
  })
  success: boolean;
}

export class ForgotPasswordResponse {
  @ApiProperty({
    description: 'Reset token for password reset',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  token: string;

  @ApiProperty({
    description: 'Operation success status',
    example: true,
  })
  success: boolean;
}

export class ResetPasswordResponse {
  @ApiProperty({
    description: 'The updated user object',
    example: {
      id: '507f1f77bcf86cd799439011',
      email: 'john.doe@example.com',
      name: 'John Doe',
    },
  })
  user: Record<string, any>;
}
