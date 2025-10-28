import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  BadRequestException,
  InternalServerErrorException,
  Delete,
  Req,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';

import * as fromEntitiesExpenses from '@expenses/entities';
import * as fromServicesExpenses from '@expenses/services';
import * as fromDtoExpenses from '@expenses/dto';
import * as fromServicesBudgets from '@budgets/services';
import * as fromServicesCategories from '@categories/services';
import * as fromServicesShared from '@shared/services';
import type { AuthRequest } from '@auth/types/auth.types';
import {
  ExpenseResponse,
  ExpenseListResponse,
  ExpenseStatsResponse,
} from '@expenses/dto/expenses.responses';

@ApiTags('expenses')
@ApiBearerAuth('JWT-auth')
@Controller('budgets/:budgetId/categories/:categoryId/expenses')
export class ExpensesController {
  constructor(
    private _serviceExpenses: fromServicesExpenses.ExpensesService,
    private _serviceBudgets: fromServicesBudgets.BudgetsService,
    private _serviceCategories: fromServicesCategories.CategoriesService,
    private readonly _logger: fromServicesShared.LoggerService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create expense',
    description: 'Creates a new expense in the specified budget category.',
  })
  @ApiParam({
    name: 'budgetId',
    description: 'ID of the budget',
  })
  @ApiParam({
    name: 'categoryId',
    description: 'ID of the category to add the expense to',
  })
  @ApiBody({ type: fromDtoExpenses.CreateExpenseDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Expense successfully created',
    type: ExpenseResponse,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data',
  })
  @ApiNotFoundResponse({
    description: 'Budget or category not found',
  })
  async create(
    @Param('budgetId') budgetId: string,
    @Param('categoryId') categoryId: string,
    @Body() dto: fromDtoExpenses.CreateExpenseDto,
  ) {
    const budget = await this._serviceBudgets.findOne(budgetId);
    const category = await this._serviceCategories.findOne(categoryId);
    return this._serviceExpenses.create(budget, category, dto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update expense',
    description: 'Updates an existing expense.',
  })
  @ApiParam({
    name: 'budgetId',
    description: 'ID of the budget',
  })
  @ApiParam({
    name: 'categoryId',
    description: 'ID of the category',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the expense to update',
  })
  @ApiBody({ type: fromDtoExpenses.UpdateExpenseDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Expense successfully updated',
    type: ExpenseResponse,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input or expense not found',
  })
  async update(
    @Param('id') id: string,
    @Body() updateExpenseDto: fromDtoExpenses.UpdateExpenseDto,
    @Req() req: AuthRequest,
  ) {
    const payload: Partial<fromEntitiesExpenses.Expense> = {
      ...updateExpenseDto,
    };

    try {
      const updated = await this._serviceExpenses.findOneAndUpdate(
        { id },
        payload,
      );
      if (!updated) {
        throw new BadRequestException(`Category with id ${id} was not updated`);
      }
      return updated;
    } catch (error) {
      this._logger.logError(error, req);
      throw new InternalServerErrorException(
        `Category with id ${id} was not updated`,
      );
    }
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete expense',
    description: 'Deletes an expense from a budget category.',
  })
  @ApiParam({
    name: 'budgetId',
    description: 'ID of the budget',
  })
  @ApiParam({
    name: 'categoryId',
    description: 'ID of the category',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the expense to delete',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Expense successfully deleted',
  })
  @ApiNotFoundResponse({
    description: 'Expense not found',
  })
  async delete(@Param('id') id: string, @Req() req: AuthRequest) {
    try {
      const result = await this._serviceExpenses.delete(id);
      return result;
    } catch (error) {
      this._logger.logError(error, req);
      throw new InternalServerErrorException(
        `Expense with id ${id} was not deleted`,
      );
    }
  }

  @Get()
  @ApiOperation({
    summary: 'List expenses',
    description: 'Retrieves all expenses for the specified budget and category',
  })
  @ApiParam({
    name: 'budgetId',
    description: 'ID of the budget',
  })
  @ApiParam({
    name: 'categoryId',
    description: 'ID of the category',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of expenses successfully retrieved',
    type: ExpenseListResponse,
  })
  @ApiNotFoundResponse({
    description: 'Budget or category not found',
  })
  async list(@Param('budgetId') budgetId: string) {
    return this._serviceExpenses.findByBudget(budgetId);
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Get expense statistics',
    description:
      'Retrieves statistics for all expenses in the specified budget and category',
  })
  @ApiParam({
    name: 'budgetId',
    description: 'ID of the budget',
  })
  @ApiParam({
    name: 'categoryId',
    description: 'ID of the category',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Expense statistics successfully retrieved',
    type: ExpenseStatsResponse,
  })
  @ApiNotFoundResponse({
    description: 'Budget or category not found',
  })
  async getStats(
    @Param('budgetId') budgetId: string,
    @Param('categoryId') categoryId: string,
    @Req() req: AuthRequest,
  ) {
    try {
      const expenses = await this._serviceExpenses.findByBudget(budgetId);
      const categoryExpenses = expenses.filter(
        (e) => e.category.id === categoryId,
      );

      const amounts = categoryExpenses.map((e) => e.amountCents);
      return {
        totalExpenses: categoryExpenses.length,
        totalAmount: amounts.reduce((acc, curr) => acc + curr, 0),
        averageAmount: amounts.length
          ? amounts.reduce((acc, curr) => acc + curr, 0) / amounts.length
          : 0,
        highestAmount: amounts.length ? Math.max(...amounts) : 0,
        lowestAmount: amounts.length ? Math.min(...amounts) : 0,
      };
    } catch (error) {
      this._logger.logError(error, req);
      throw new InternalServerErrorException(
        'Error retrieving expense statistics',
      );
    }
  }
}
