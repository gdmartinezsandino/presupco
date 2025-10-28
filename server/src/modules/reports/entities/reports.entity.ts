export interface BudgetSummary {
  budgetId: string;
  budgetName: string;
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export interface MonthlyReport {
  month: number;
  year: number;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  details: BudgetSummary[];
}

export interface AnnualReport {
  year: number;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  monthlyBreakdown: MonthlyReport[];
}
