import { IsString, IsNumber, IsOptional, IsUUID } from 'class-validator';

export class CreateIncomeDto {
  @IsString()
  title: string;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsUUID()
  budgetId: string;
}

export class UpdateIncomeDto {
  @IsString()
  title: string;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsUUID()
  incomeId: string;
}
