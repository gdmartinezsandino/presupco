import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateBudgetDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsNumber()
  targetAmount?: number;
}

export class UpdateBudgetDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsNumber()
  targetAmount?: number;
}
