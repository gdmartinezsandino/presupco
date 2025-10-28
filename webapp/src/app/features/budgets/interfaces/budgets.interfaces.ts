import * as fromInterfacesUser from '@user/interfaces';

export interface Category {
  id: string;
  name: string;
  description?: string;
  budget: Budget;
  expenses: Expense[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Income {
  id: string;
  title: string;
  amountCents: number;
  notes?: string;
  category: Category;
  budget: Budget;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Expense {
  id: string;
  title: string;
  amountCents: number;
  notes?: string;
  budget: Budget;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Budget {
  id: string;
  name: string;
  user: fromInterfacesUser.User;
  categories: Category[];
  incomes: Income[];
  targetAmountCents: number;
  createdAt: Date;
  updatedAt: Date;
  balance?: number;
}
