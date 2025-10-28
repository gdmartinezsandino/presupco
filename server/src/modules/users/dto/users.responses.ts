import { ApiProperty } from '@nestjs/swagger';
import { User } from '@users/entities';

export class UserResponse implements Partial<User> {
  @ApiProperty({
    description: 'User ID',
    example: '507f1f77bcf86cd799439011',
  })
  id: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    description: 'User avatar URL',
    example: 'uploads/user/avatar-123.jpg',
    required: false,
  })
  avatar?: string;

  @ApiProperty({
    description: 'User birth date',
    example: '1990-01-01',
    required: false,
  })
  birthday?: number;

  @ApiProperty({
    description: 'User account status',
    example: 'ACTIVE',
    enum: ['PENDING', 'ACTIVE', 'INACTIVE'],
  })
  state: string;

  @ApiProperty({
    description: 'User created date',
    example: '2023-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'User last updated date',
    example: '2023-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}

export class UserListResponse {
  @ApiProperty({
    description: 'List of users',
    type: [UserResponse],
  })
  users: UserResponse[];
}

export class UploadAvatarResponse {
  @ApiProperty({
    description: 'Uploaded avatar filename',
    example: 'avatar-123.jpg',
  })
  avatar: string;
}
