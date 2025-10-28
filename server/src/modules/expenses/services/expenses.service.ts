import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as fromEntitiesExpenses from '@expenses/entities';
import * as fromDtoExpenses from '@expenses/dto';
import * as fromEntitiesCategories from '@categories/entities';
import * as fromEntitiesBudgets from '@budgets/entities';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(fromEntitiesExpenses.Expense)
    private _repoExpenses: Repository<fromEntitiesExpenses.Expense>,
  ) {}

  async create(
    budget: fromEntitiesBudgets.Budget,
    category: fromEntitiesCategories.Category,
    dto: fromDtoExpenses.CreateExpenseDto,
  ): Promise<fromEntitiesExpenses.Expense> {
    const amountCents = Math.round(dto.amount * 100);
    const ent = this._repoExpenses.create({
      title: dto.title,
      amountCents,
      notes: dto.notes,
      budget,
      category,
    });
    return this._repoExpenses.save(ent);
  }

  async findByBudget(
    budgetId: string,
  ): Promise<fromEntitiesExpenses.Expense[]> {
    return this._repoExpenses.find({
      where: { budget: { id: budgetId } },
    });
  }

  async findOneAndUpdate(
    filter: Partial<fromEntitiesExpenses.Expense>,
    payload: Partial<fromEntitiesExpenses.Expense>,
  ): Promise<fromEntitiesExpenses.Expense | null> {
    const ent = await this._repoExpenses.findOne({ where: filter });
    if (!ent) return null;
    return Object.assign(ent, payload);
  }

  async delete(id: string): Promise<void> {
    await this._repoExpenses.delete(id);
  }
}
