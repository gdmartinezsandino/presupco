import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: 'Email of the user to logIn' })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Password of the user to logIn' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
