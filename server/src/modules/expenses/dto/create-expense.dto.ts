import { IsString, IsNumber, IsOptional, IsUUID } from 'class-validator';

export class CreateExpenseDto {
  @IsString()
  title: string;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsUUID()
  budgetId: string;

  @IsUUID()
  categoryId: string;
}

export class UpdateExpenseDto {
  @IsString()
  title?: string;

  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsUUID()
  categoryId?: string;
}
