import { ApiProperty } from '@nestjs/swagger';
import { Category } from '@categories/entities';

export class CategoryResponse implements Partial<Category> {
  @ApiProperty({
    description: 'Category ID',
    example: '507f1f77bcf86cd799439011',
  })
  id: string;

  @ApiProperty({
    description: 'Category name',
    example: 'Food & Dining',
  })
  name: string;

  @ApiProperty({
    description: 'Category description',
    example: 'All food-related expenses including groceries and dining out',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Category icon identifier',
    example: 'food',
    required: false,
  })
  icon?: string;

  @ApiProperty({
    description: 'Category color code',
    example: '#FF5733',
    required: false,
  })
  color?: string;

  @ApiProperty({
    description: 'Budget ID this category belongs to',
    example: '507f1f77bcf86cd799439012',
  })
  budgetId: string;

  @ApiProperty({
    description: 'Category creation date',
    example: '2025-10-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Category last update date',
    example: '2025-10-27T00:00:00.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Total expenses in this category',
    example: 500.0,
  })
  totalExpenses: number;

  @ApiProperty({
    description: 'Percentage of budget expenses this category represents',
    example: 14.28,
  })
  percentageOfBudget: number;
}

export class CategoryListResponse {
  @ApiProperty({
    description: 'List of categories',
    type: [CategoryResponse],
  })
  categories: CategoryResponse[];
}

export class CategoryStatsResponse {
  @ApiProperty({
    description: 'Category monthly expense trend',
    example: [
      { month: '2025-10', amount: 500.0 },
      { month: '2025-09', amount: 480.0 },
    ],
  })
  monthlyTrend: Array<{
    month: string;
    amount: number;
  }>;

  @ApiProperty({
    description: 'Category percentage trend',
    example: [
      { month: '2025-10', percentage: 14.28 },
      { month: '2025-09', percentage: 15.0 },
    ],
  })
  percentageTrend: Array<{
    month: string;
    percentage: number;
  }>;
}
