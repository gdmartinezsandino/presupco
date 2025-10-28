import { ApiProperty } from '@nestjs/swagger';

class CategorySpendingSummary {
  @ApiProperty({
    description: 'Category ID',
    example: '507f1f77bcf86cd799439011',
  })
  categoryId: string;

  @ApiProperty({
    description: 'Category name',
    example: 'Food & Dining',
  })
  categoryName: string;

  @ApiProperty({
    description: 'Number of expenses in this category',
    example: 15,
  })
  expensesCount: number;

  @ApiProperty({
    description: 'Total amount spent in this category (in cents)',
    example: 125000, // $1,250.00
  })
  totalAmountCents: number;
}

export class CategoryStatsResponse {
  @ApiProperty({
    description: 'Total number of categories',
    example: 8,
  })
  totalCategories: number;

  @ApiProperty({
    description: 'Number of categories that have expenses',
    example: 6,
  })
  categoriesWithExpenses: number;

  @ApiProperty({
    description: 'Number of categories without any expenses',
    example: 2,
  })
  categoriesWithoutExpenses: number;

  @ApiProperty({
    description: 'Average number of expenses per category',
    example: 7.5,
  })
  averageExpensesPerCategory: number;

  @ApiProperty({
    description: 'Top 5 categories by total spending',
    type: [CategorySpendingSummary],
  })
  topSpendingCategories: CategorySpendingSummary[];
}
