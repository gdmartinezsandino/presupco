import { Injectable, signal, computed } from '@angular/core';

import * as fromInterfaces from '@budgets/interfaces';
import * as fromServicesCore from '@core/services';

@Injectable({ providedIn: 'root' })
export class BudgetsService {
  private _budgets = signal<fromInterfaces.Budget[]>([]);
  budgets = this._budgets.asReadonly();

  totalBalance = computed(() =>
    this._budgets().reduce((s, b) => s + (b.balance ?? this.getBudgetBalance(b)), 0)
  );

  constructor(private _api: fromServicesCore.ApiService) {}

  async loadAll(): Promise<void> {
    const data = await this._api.get<fromInterfaces.Budget[]>('budgets').toPromise();
    const withBalance = (data || []).map((b) => ({
      ...b,
      balance: this.getBudgetBalance(b),
    }));
    this._budgets.set(withBalance);
  }

  async create(payload: Partial<fromInterfaces.Budget>): Promise<fromInterfaces.Budget> {
    const created = await this._api
      .post<fromInterfaces.Budget>('budgets', payload)
      .toPromise();

    if (!created) {
      throw new Error('No se pudo crear el presupuesto');
    }

    created.balance = this.getBudgetBalance(created);
    this._budgets.update((list) => [created, ...list]);
    return created;
  }

  /** Helper to calculate budget balance */
  private getBudgetBalance(budget: fromInterfaces.Budget): number {
    const totalIncome = budget.incomes?.reduce((s, i) => s + i.amountCents, 0) ?? 0;
    const totalExpense =
      budget.categories?.reduce(
        (sum, cat) => sum + (cat.expenses?.reduce((x, e) => x + e.amountCents, 0) ?? 0),
        0,
      ) ?? 0;
    return totalIncome - totalExpense;
  }
}
