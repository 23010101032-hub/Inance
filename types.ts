
export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string; // ISO string
  description: string;
}

export interface UserProfile {
  name: string;
  currency: string;
}

export interface Categories {
  income: string[];
  expense: string[];
}

export interface AppState {
  transactions: Transaction[];
  categories: Categories;
  profile: UserProfile;
}

export type ViewType = 'dashboard' | 'transactions' | 'charts' | 'categories' | 'settings';
