import { ApiProperty } from '@nestjs/swagger';
import { Income } from '@incomes/entities';

export class IncomeResponse implements Partial<Income> {
  @ApiProperty({
    description: 'Income ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Income amount',
    example: 5000.0,
  })
  amount: number;

  @ApiProperty({
    description: 'Income description',
    example: 'Monthly salary',
  })
  description: string;

  @ApiProperty({
    description: 'Income date',
    example: '2025-10-28',
  })
  date: Date;

  @ApiProperty({
    description: 'Budget ID this income belongs to',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  budgetId: string;

  @ApiProperty({
    description: 'Creation date',
    example: '2025-10-28T12:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2025-10-28T12:00:00.000Z',
  })
  updatedAt: Date;
}

export class IncomeListResponse {
  @ApiProperty({
    description: 'List of incomes',
    type: [IncomeResponse],
  })
  items: IncomeResponse[];
}

export class IncomeStatsResponse {
  @ApiProperty({
    description: 'Total income amount',
    example: 15000.0,
  })
  total: number;

  @ApiProperty({
    description: 'Average income amount',
    example: 5000.0,
  })
  average: number;

  @ApiProperty({
    description: 'Highest income amount',
    example: 7000.0,
  })
  highest: number;

  @ApiProperty({
    description: 'Lowest income amount',
    example: 3000.0,
  })
  lowest: number;
}
