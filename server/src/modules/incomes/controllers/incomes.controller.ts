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

import { Income } from '@incomes/entities';
import { IncomesService } from '@incomes/services';
import { CreateIncomeDto, UpdateIncomeDto } from '@incomes/dto';
import { BudgetsService } from '@budgets/services';
import { LoggerService } from '@shared/services';
import type { AuthRequest } from '@auth/types/auth.types';
import {
  IncomeResponse,
  IncomeListResponse,
} from '@incomes/dto/incomes.responses';

@ApiTags('incomes')
@ApiBearerAuth('JWT-auth')
@Controller('budgets/:budgetId/incomes')
export class IncomesController {
  constructor(
    private _service: IncomesService,
    private _serviceBudget: BudgetsService,
    private readonly _logger: LoggerService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create income',
    description: 'Creates a new income record in the specified budget.',
  })
  @ApiParam({
    name: 'budgetId',
    description: 'ID of the budget to create the income in',
  })
  @ApiBody({ type: CreateIncomeDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Income successfully created',
    type: IncomeResponse,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data',
  })
  @ApiNotFoundResponse({
    description: 'Budget not found',
  })
  async create(
    @Param('budgetId') budgetId: string,
    @Body() dto: CreateIncomeDto,
  ) {
    const budget = await this._serviceBudget.findOne(budgetId);
    return this._service.create(budget, dto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update income',
    description: 'Updates an existing income record.',
  })
  @ApiParam({
    name: 'budgetId',
    description: 'ID of the budget containing the income',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the income to update',
  })
  @ApiBody({ type: UpdateIncomeDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Income successfully updated',
    type: IncomeResponse,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input or income not found',
  })
  async update(
    @Param('id') id: string,
    @Body() updateIncomeDto: UpdateIncomeDto,
    @Req() req: AuthRequest,
  ) {
    const payload: Partial<Income> = {
      ...updateIncomeDto,
    };

    try {
      const updated = await this._service.findAndUpdate({ id }, payload);
      if (!updated) {
        throw new BadRequestException(`Income with id ${id} was not updated`);
      }
      return updated;
    } catch (error) {
      this._logger.logError(error, req);
      throw new InternalServerErrorException(
        `Income with id ${id} was not updated`,
      );
    }
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete income',
    description: 'Deletes an income record from a budget.',
  })
  @ApiParam({
    name: 'budgetId',
    description: 'ID of the budget',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the income to delete',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Income successfully deleted',
  })
  @ApiNotFoundResponse({
    description: 'Income not found',
  })
  async delete(@Param('id') id: string, @Req() req: AuthRequest) {
    try {
      const result = await this._service.delete(id);
      return result;
    } catch (error) {
      this._logger.logError(error, req);
      throw new InternalServerErrorException(
        `Income with id ${id} was not deleted`,
      );
    }
  }

  @Get()
  @ApiOperation({
    summary: 'List budget incomes',
    description: 'Retrieves all income records for the specified budget.',
  })
  @ApiParam({
    name: 'budgetId',
    description: 'ID of the budget to get incomes from',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of incomes successfully retrieved',
    type: IncomeListResponse,
  })
  @ApiNotFoundResponse({
    description: 'Budget not found',
  })
  async list(@Param('budgetId') budgetId: string) {
    return this._service.findByBudget(budgetId);
  }
}
