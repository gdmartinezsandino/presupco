import { ApiProperty } from '@nestjs/swagger';
import { Expense } from '@expenses/entities';

export class ExpenseResponse implements Partial<Expense> {
  @ApiProperty({
    description: 'Expense ID',
    example: '507f1f77bcf86cd799439011',
  })
  id: string;

  @ApiProperty({
    description: 'Expense description',
    example: 'Grocery shopping at Walmart',
  })
  description: string;

  @ApiProperty({
    description: 'Expense amount',
    example: 150.75,
  })
  amount: number;

  @ApiProperty({
    description: 'Expense date',
    example: '2025-10-27T10:30:00.000Z',
  })
  date: Date;

  @ApiProperty({
    description: 'Category ID this expense belongs to',
    example: '507f1f77bcf86cd799439012',
  })
  categoryId: string;

  @ApiProperty({
    description: 'Budget ID this expense belongs to',
    example: '507f1f77bcf86cd799439013',
  })
  budgetId: string;

  @ApiProperty({
    description: 'Optional receipt image URL',
    example: 'uploads/expenses/receipt-123.jpg',
    required: false,
  })
  receipt?: string;

  @ApiProperty({
    description: 'Optional notes about the expense',
    example: 'Monthly groceries including household items',
    required: false,
  })
  notes?: string;

  @ApiProperty({
    description: 'Expense creation date',
    example: '2025-10-27T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Expense last update date',
    example: '2025-10-27T10:30:00.000Z',
  })
  updatedAt: Date;
}

export class ExpenseListResponse {
  @ApiProperty({
    description: 'List of expenses',
    type: [ExpenseResponse],
  })
  expenses: ExpenseResponse[];

  @ApiProperty({
    description: 'Total number of expenses',
    example: 25,
  })
  total: number;

  @ApiProperty({
    description: 'Sum of all expenses',
    example: 1234.56,
  })
  totalAmount: number;
}

export class ExpenseStatsResponse {
  @ApiProperty({
    description: 'Daily expense trend',
    example: [
      { date: '2025-10-27', amount: 150.75 },
      { date: '2025-10-26', amount: 45.2 },
    ],
  })
  dailyTrend: Array<{
    date: string;
    amount: number;
  }>;

  @ApiProperty({
    description: 'Category breakdown',
    example: {
      'Food & Dining': 500.0,
      Transportation: 300.0,
    },
  })
  categoryBreakdown: Record<string, number>;
}
