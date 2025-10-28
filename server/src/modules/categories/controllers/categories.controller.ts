import {
  Controller,
  Post,
  Body,
  Param,
  Get,
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

import { Category } from '@categories/entities';
import { CategoriesService } from '@categories/services';
import { CreateCategoryDto, UpdateCategoryDto } from '@categories/dto';
import { BudgetsService } from '@budgets/services';
import { LoggerService } from '@shared/services';
import type { AuthRequest } from '@auth/types/auth.types';
import {
  CategoryResponse,
  CategoryListResponse,
} from '@categories/dto/categories.responses';
import { CategoryStatsResponse } from '@categories/dto/category-stats.response';

@ApiTags('categories')
@ApiBearerAuth('JWT-auth')
@Controller('budgets/:budgetId/categories')
export class CategoriesController {
  constructor(
    private _service: CategoriesService,
    private _serviceBudgets: BudgetsService,
    private readonly _logger: LoggerService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create category',
    description: 'Creates a new expense category in the specified budget.',
  })
  @ApiParam({
    name: 'budgetId',
    description: 'ID of the budget to create the category in',
  })
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Category successfully created',
    type: CategoryResponse,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data',
  })
  @ApiNotFoundResponse({
    description: 'Budget not found',
  })
  async create(
    @Param('budgetId') budgetId: string,
    @Body() dto: CreateCategoryDto,
  ) {
    const budget = await this._serviceBudgets.findOne(budgetId);
    return this._service.create(budget, dto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update category',
    description: 'Updates an existing expense category.',
  })
  @ApiParam({
    name: 'budgetId',
    description: 'ID of the budget containing the category',
  })
  @ApiParam({
    name: 'id',
    description: 'Category ID to update',
  })
  @ApiBody({ type: UpdateCategoryDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Category successfully updated',
    type: CategoryResponse,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input or category not found',
  })
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @Req() req: AuthRequest,
  ) {
    const payload: Partial<Category> = {
      ...updateCategoryDto,
    };

    try {
      const updated = await this._service.findAndUpdate({ id }, payload);
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
    summary: 'Delete category',
    description: 'Deletes a category from a budget.',
  })
  @ApiParam({
    name: 'budgetId',
    description: 'ID of the budget containing the category',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the category to delete',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Category successfully deleted',
  })
  @ApiNotFoundResponse({
    description: 'Category not found',
  })
  async delete(@Param('id') id: string, @Req() req: AuthRequest) {
    try {
      const result = await this._service.delete(id);
      return result;
    } catch (error) {
      this._logger.logError(error, req);
      throw new InternalServerErrorException(
        `Category with id ${id} was not deleted`,
      );
    }
  }

  @Get()
  @ApiOperation({
    summary: 'List categories',
    description: 'Retrieves all categories for the specified budget',
  })
  @ApiParam({
    name: 'budgetId',
    description: 'ID of the budget to get categories from',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of categories successfully retrieved',
    type: CategoryListResponse,
  })
  @ApiNotFoundResponse({
    description: 'Budget not found',
  })
  async list(@Param('budgetId') budgetId: string) {
    return this._service.findByBudget(budgetId);
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Get category statistics',
    description:
      'Retrieves spending statistics for all categories in the budget',
  })
  @ApiParam({
    name: 'budgetId',
    description: 'ID of the budget',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Category statistics successfully retrieved',
    type: CategoryStatsResponse,
  })
  @ApiNotFoundResponse({
    description: 'Budget not found',
  })
  async getStats(@Param('budgetId') budgetId: string, @Req() req: AuthRequest) {
    try {
      const categories = await this._service.findByBudget(budgetId);
      // Calculate total expenses and amount per category
      const categoryStats = categories.map((category) => ({
        categoryId: category.id,
        categoryName: category.name,
        expensesCount: category.expenses?.length || 0,
        totalAmountCents:
          category.expenses?.reduce(
            (sum, exp) => sum + (exp.amountCents || 0),
            0,
          ) || 0,
      }));

      return {
        totalCategories: categories.length,
        categoriesWithExpenses: categoryStats.filter((c) => c.expensesCount > 0)
          .length,
        categoriesWithoutExpenses: categoryStats.filter(
          (c) => c.expensesCount === 0,
        ).length,
        topSpendingCategories: categoryStats
          .sort((a, b) => b.totalAmountCents - a.totalAmountCents)
          .slice(0, 5),
        averageExpensesPerCategory: categories.length
          ? categoryStats.reduce((sum, cat) => sum + cat.expensesCount, 0) /
            categories.length
          : 0,
      };
    } catch (error) {
      this._logger.logError(error, req);
      throw new InternalServerErrorException(
        'Error retrieving category statistics',
      );
    }
  }
}
