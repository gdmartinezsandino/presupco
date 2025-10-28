import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as fromEntitiesBudgets from '@budgets/entities';
import * as fromDtoBudgets from '@budgets/dto';
import * as fromEntitiesUsers from '@users/entities';

@Injectable()
export class BudgetsService {
  constructor(
    @InjectRepository(fromEntitiesBudgets.Budget)
    private _repoBudgets: Repository<fromEntitiesBudgets.Budget>,
  ) {}

  async createForUser(
    user: fromEntitiesUsers.User,
    dto: fromDtoBudgets.CreateBudgetDto,
  ): Promise<fromEntitiesBudgets.Budget> {
    const budget = this._repoBudgets.create({ ...dto, user });
    return this._repoBudgets.save(budget);
  }

  async findByUser(userId: string): Promise<fromEntitiesBudgets.Budget[]> {
    return this._repoBudgets.find({
      where: { user: { id: userId } },
      relations: ['categories', 'incomes'],
    });
  }

  async findOne(id: string): Promise<fromEntitiesBudgets.Budget> {
    const b = await this._repoBudgets.findOne({
      where: { id },
      relations: ['categories', 'incomes'],
    });
    if (!b) throw new NotFoundException('Budget not found');
    return b;
  }

  async findAndUpdate(
    filter: Partial<fromEntitiesBudgets.Budget>,
    payload: Partial<fromEntitiesBudgets.Budget>,
  ): Promise<fromEntitiesBudgets.Budget | null> {
    const where = Object.assign({}, filter);

    const budget = await this._repoBudgets.findOne({ where });
    if (!budget) return null;

    Object.assign(budget, payload);
    return this._repoBudgets.save(budget);
  }

  async delete(id: string): Promise<void> {
    await this._repoBudgets.delete(id);
  }

  async ensureDefaultBudget(
    user: fromEntitiesUsers.User,
  ): Promise<fromEntitiesBudgets.Budget> {
    const existing = await this._repoBudgets.findOne({
      where: { user: { id: user.id }, name: 'Personal' },
    });
    if (existing) return existing;
    const created = this._repoBudgets.create({ name: 'Personal', user });
    return this._repoBudgets.save(created);
  }

  async getReport(budgetId: string) {
    // use query builder for aggregates
    const totalIncomeRaw = (await this._repoBudgets.manager
      .createQueryBuilder()
      .select('SUM(i.amount)', 'sum')
      .from('incomes', 'i')
      .where('i.budgetId = :budgetId', { budgetId })
      .getRawOne()) as { sum?: string | number } | null;

    const totalExpensesRaw = (await this._repoBudgets.manager
      .createQueryBuilder()
      .select('SUM(e.amount)', 'sum')
      .from('expenses', 'e')
      .where('e.budgetId = :budgetId', { budgetId })
      .getRawOne()) as { sum?: string | number } | null;

    const totalIncome = Number(totalIncomeRaw?.sum ?? 0);
    const totalExpenses = Number(totalExpensesRaw?.sum ?? 0);

    return {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
    };
  }
}
