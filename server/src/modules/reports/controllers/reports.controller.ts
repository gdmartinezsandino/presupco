import {
  Controller,
  Get,
  Query,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';

import { ReportsService } from '@reports/services';

@Controller('reports')
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @Get('monthly')
  async getMonthlySummary(
    @Query('month', ParseIntPipe) month: number,
    @Query('year', ParseIntPipe) year: number,
    @Query('budgets') budgets?: string,
    @Query('groupBy') groupBy?: 'category' | 'budget',
  ) {
    if (!month || !year) {
      throw new BadRequestException('month and year are required');
    }
    const budgetIds = budgets ? budgets.split(',') : [];
    return this.service.getMonthlySummary(budgetIds, month, year, groupBy);
  }

  @Get('annual')
  async getAnnualSummary(
    @Query('year', ParseIntPipe) year: number,
    @Query('budgets') budgets?: string,
    @Query('groupBy') groupBy?: 'category' | 'budget',
  ) {
    if (!year) {
      throw new BadRequestException('year is required');
    }
    const budgetIds = budgets ? budgets.split(',') : [];
    return this.service.getAnnualSummary(budgetIds, year, groupBy);
  }
}
