import { ApiProperty } from '@nestjs/swagger';
import { Budget } from '@budgets/entities';

export class BudgetResponse implements Partial<Budget> {
  @ApiProperty({
    description: 'Budget ID',
    example: '507f1f77bcf86cd799439011',
  })
  id: string;

  @ApiProperty({
    description: 'Budget name',
    example: 'Monthly Budget October 2025',
  })
  name: string;

  @ApiProperty({
    description: 'Budget description',
    example: 'Personal monthly budget tracking',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Budget currency',
    example: 'USD',
  })
  currency: string;

  @ApiProperty({
    description: 'Budget owner ID',
    example: '507f1f77bcf86cd799439011',
  })
  userId: string;

  @ApiProperty({
    description: 'Budget creation date',
    example: '2025-10-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Budget last update date',
    example: '2025-10-27T00:00:00.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Total budget income',
    example: 5000.0,
  })
  totalIncome: number;

  @ApiProperty({
    description: 'Total budget expenses',
    example: 3500.0,
  })
  totalExpenses: number;

  @ApiProperty({
    description: 'Budget balance (income - expenses)',
    example: 1500.0,
  })
  balance: number;
}

export class BudgetListResponse {
  @ApiProperty({
    description: 'List of budgets',
    type: [BudgetResponse],
  })
  budgets: BudgetResponse[];
}

export class BudgetStatsResponse {
  @ApiProperty({
    description: 'Budget statistics by category',
    example: {
      'Food & Dining': { total: 500.0, percentage: 14.28 },
      Transportation: { total: 300.0, percentage: 8.57 },
      Housing: { total: 1200.0, percentage: 34.29 },
    },
  })
  categoryStats: Record<string, { total: number; percentage: number }>;

  @ApiProperty({
    description: 'Budget monthly trend',
    example: [
      { month: '2025-10', income: 5000, expenses: 3500 },
      { month: '2025-09', income: 4800, expenses: 3200 },
    ],
  })
  monthlyTrend: Array<{
    month: string;
    income: number;
    expenses: number;
  }>;
}
