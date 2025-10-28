import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Income } from '@incomes/entities';
import { CreateIncomeDto } from '@incomes/dto';
import { Budget } from '@budgets/entities';

@Injectable()
export class IncomesService {
  constructor(@InjectRepository(Income) private repo: Repository<Income>) {}

  async create(budget: Budget, dto: CreateIncomeDto): Promise<Income> {
    const amountCents = Math.round(dto.amount * 100);
    const ent = this.repo.create({
      title: dto.title,
      amountCents,
      notes: dto.notes,
      budget,
    });
    return this.repo.save(ent);
  }

  async findByBudget(budgetId: string): Promise<Income[]> {
    return this.repo.find({ where: { budget: { id: budgetId } } });
  }

  async findOne(id: string): Promise<Income> {
    const c = await this.repo.findOne({ where: { id }, relations: ['budget'] });
    if (!c) throw new NotFoundException('Income not found');
    return c;
  }

  async findAndUpdate(
    filter: Partial<Income>,
    payload: Partial<Income>,
  ): Promise<Income | null> {
    const where = Object.assign({}, filter);

    const income = await this.repo.findOne({ where });
    if (!income) return null;

    Object.assign(income, payload);
    return this.repo.save(income);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
