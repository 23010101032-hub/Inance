import { Categories, UserProfile } from './types';

export const INITIAL_CATEGORIES: Categories = {
  income: ['Salary', 'Freelance', 'Investments', 'Gift', 'Other'],
  expense: ['Food', 'Rent', 'Utilities', 'Transport', 'Entertainment', 'Shopping', 'Health', 'Vault Deduction', 'Other'],
  vault: ['Emergency Fund', 'Savings Goal', 'Retirement', 'Investment Capital', 'Other']
};

export const INITIAL_PROFILE: UserProfile = {
  name: 'Guest User',
  currency: '$',
  reminderTime: '22:00',
  notificationsEnabled: false
};

export const CURRENCIES = [
  { symbol: '$', name: 'USD' },
  { symbol: '€', name: 'EUR' },
  { symbol: '£', name: 'GBP' },
  { symbol: '৳', name: 'BDT' },
  { symbol: '₹', name: 'INR' },
  { symbol: '¥', name: 'JPY' }
];

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];