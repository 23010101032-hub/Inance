export type TransactionType = 'income' | 'expense' | 'vault_in' | 'vault_out';

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
  vault: string[];
}

export interface AppState {
  transactions: Transaction[];
  vaultTransactions: Transaction[];
  categories: Categories;
  profile: UserProfile;
}

export type ViewType = 'dashboard' | 'transactions' | 'charts' | 'vault' | 'categories' | 'settings';