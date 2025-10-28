import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Req,
  Delete,
  Patch,
  BadRequestException,
  InternalServerErrorException,
  HttpStatus,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
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

import { BudgetsService } from '@budgets/services';
import { Budget } from '@budgets/entities';
import { CreateBudgetDto, UpdateBudgetDto } from '@budgets/dto';
import { User } from '@users/entities';
import { LoggerService } from '@shared/services';
import type { AuthRequest } from '@auth/types/auth.types';
import {
  BudgetResponse,
  BudgetListResponse,
} from '@budgets/dto/budgets.responses';

@ApiTags('budgets')
@ApiBearerAuth('JWT-auth')
@Controller('budgets')
export class BudgetsController {
  constructor(
    private _service: BudgetsService,
    private readonly _logger: LoggerService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create budget',
    description: 'Creates a new budget for the authenticated user.',
  })
  @ApiBody({ type: CreateBudgetDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Budget successfully created',
    type: BudgetResponse,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input or user not found',
  })
  async create(@Body() dto: CreateBudgetDto, @Req() req: AuthRequest) {
    const user = req.user;
    if (!user || !user.id) throw new BadRequestException('User not found');
    // create a minimal user shape for service; cast via unknown->User to avoid unsafe `any`
    return this._service.createForUser({ id: user.id } as unknown as User, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List user budgets',
    description: 'Retrieves all budgets for the authenticated user.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of budgets successfully retrieved',
    type: BudgetListResponse,
  })
  @ApiBadRequestResponse({
    description: 'User not found',
  })
  async list(@Req() req: AuthRequest) {
    const user = req.user;
    if (!user || !user.id) throw new BadRequestException('User not found');
    return this._service.findByUser(String(user.id));
  }

  @Get('all')
  async findAll(@Req() req: AuthRequest) {
    const user = req.user;
    if (!user || !user.id) throw new BadRequestException('User not found');
    const budgets = await this._service.findByUser(String(user.id));
    return budgets.map((budget) =>
      plainToInstance(Budget, budget, { excludeExtraneousValues: true }),
    );
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this._service.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateBudgetDto: UpdateBudgetDto,
    @Req() req: AuthRequest,
  ) {
    const payload: Partial<Budget> = {
      ...updateBudgetDto,
    };

    try {
      const updated = await this._service.findAndUpdate({ id }, payload);
      if (!updated) {
        throw new BadRequestException(`Budget with id ${id} was not updated`);
      }
      return updated;
    } catch (error) {
      this._logger.logError(error, req);
      throw new InternalServerErrorException(
        `Budget with id ${id} was not updated`,
      );
    }
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete budget',
    description:
      'Deletes a budget and all its associated categories and expenses.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the budget to delete',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Budget successfully deleted',
  })
  @ApiNotFoundResponse({
    description: 'Budget not found',
  })
  async delete(@Param('id') id: string, @Req() req: AuthRequest) {
    try {
      const result = await this._service.delete(id);
      return result;
    } catch (error) {
      this._logger.logError(error, req);
      throw new InternalServerErrorException(
        `Budget with id ${id} was not deleted`,
      );
    }
  }
}
