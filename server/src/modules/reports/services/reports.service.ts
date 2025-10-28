import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Between } from 'typeorm';
import { Budget } from '@budgets/entities';
import { Income } from '@incomes/entities';
import { Expense } from '@expenses/entities';
import { Category } from '@categories/entities';

type ByCategory = { category: string; total: number };
type ByBudget = {
  budget: string;
  income: number;
  expense: number;
  balance: number;
};
type ReportSummary = {
  type: 'monthly' | 'annual';
  period: string;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  byCategory?: ByCategory[];
  byBudget?: ByBudget[];
};

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Budget)
    private readonly budgetRepo: Repository<Budget>,
    @InjectRepository(Income)
    private readonly incomeRepo: Repository<Income>,
    @InjectRepository(Expense)
    private readonly expenseRepo: Repository<Expense>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  async getMonthlySummary(
    budgetIds: string[],
    month: number,
    year: number,
    groupBy?: 'category' | 'budget',
  ): Promise<ReportSummary> {
    if (!month || !year)
      throw new BadRequestException('Month and year are required');

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const incomes = await this.incomeRepo.find({
      where: {
        budget: budgetIds.length ? { id: In(budgetIds) } : undefined,
        date: Between(startDate, endDate),
      },
      relations: ['budget'],
    });

    const expenses = await this.expenseRepo.find({
      where: {
        category: budgetIds.length
          ? { budget: { id: In(budgetIds) } }
          : undefined,
        date: Between(startDate, endDate),
      },
      relations: ['category', 'category.budget'],
    });

    const totalIncome = incomes.reduce((sum, i) => sum + i.amountCents, 0);
    const totalExpense = expenses.reduce((sum, e) => sum + e.amountCents, 0);

    const response: ReportSummary = {
      type: 'monthly',
      period: `${year}-${String(month).padStart(2, '0')}`,
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
    };

    if (groupBy === 'category') {
      response.byCategory = this.groupExpensesByCategory(expenses);
    } else if (groupBy === 'budget') {
      response.byBudget = this.groupByBudget(incomes, expenses);
    }

    return response;
  }

  async getAnnualSummary(
    budgetIds: string[],
    year: number,
    groupBy?: 'category' | 'budget',
  ): Promise<ReportSummary> {
    if (!year) throw new BadRequestException('Year is required');

    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);

    const incomes = await this.incomeRepo.find({
      where: {
        budget: budgetIds.length ? { id: In(budgetIds) } : undefined,
        date: Between(startDate, endDate),
      },
      relations: ['budget'],
    });

    const expenses = await this.expenseRepo.find({
      where: {
        category: budgetIds.length
          ? { budget: { id: In(budgetIds) } }
          : undefined,
        date: Between(startDate, endDate),
      },
      relations: ['category', 'category.budget'],
    });

    const totalIncome = incomes.reduce((sum, i) => sum + i.amountCents, 0);
    const totalExpense = expenses.reduce((sum, e) => sum + e.amountCents, 0);

    const response: ReportSummary = {
      type: 'annual',
      period: `${year}`,
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
    };

    if (groupBy === 'category') {
      response.byCategory = this.groupExpensesByCategory(expenses);
    } else if (groupBy === 'budget') {
      response.byBudget = this.groupByBudget(incomes, expenses);
    }

    return response;
  }

  private groupExpensesByCategory(expenses: Expense[]) {
    const grouped: Record<string, number> = {};
    for (const expense of expenses) {
      const name = expense.category?.name ?? 'Sin categoría';
      grouped[name] = (grouped[name] || 0) + expense.amountCents;
    }
    return Object.entries(grouped).map(([category, total]) => ({
      category,
      total,
    }));
  }

  private groupByBudget(incomes: Income[], expenses: Expense[]) {
    const grouped: Record<
      string,
      { income: number; expense: number; balance: number }
    > = {};

    for (const i of incomes) {
      const name = i.budget?.name ?? 'Sin presupuesto';
      if (!grouped[name]) grouped[name] = { income: 0, expense: 0, balance: 0 };
      grouped[name].income += i.amountCents;
    }

    for (const e of expenses) {
      const name = e.category?.budget?.name ?? 'Sin presupuesto';
      if (!grouped[name]) grouped[name] = { income: 0, expense: 0, balance: 0 };
      grouped[name].expense += e.amountCents;
    }

    return Object.entries(grouped).map(([budget, data]) => ({
      budget,
      ...data,
      balance: data.income - data.expense,
    }));
  }
}
