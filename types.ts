export type TransactionType = 'income' | 'expense' | 'vault_in' | 'vault_out' | 'borrowed';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string; // ISO string
  description: string;
  borrowedFrom?: string;
  repayDate?: string;
}

export interface UserProfile {
  name: string;
  currency: string;
  reminderTime: string; // "HH:MM" format
  notificationsEnabled: boolean;
}

export interface Categories {
  income: string[];
  expense: string[];
  vault: string[];
}

export interface AppState {
  transactions: Transaction[];
  vaultTransactions: Transaction[];
  categories: Categories;
  profile: UserProfile;
}

export type ViewType = 'dashboard' | 'transactions' | 'charts' | 'vault' | 'categories' | 'settings';