
import * as XLSX from 'xlsx';
import { AppState, Transaction } from '../types';

/**
 * Generates a summary dataset for Excel
 */
function getSummaryData(transactions: Transaction[]) {
  const summary = transactions.reduce((acc, t) => {
    const key = t.category;
    if (!acc[t.type]) acc[t.type] = {};
    acc[t.type][key] = (acc[t.type][key] || 0) + t.amount;
    return acc;
  }, {} as Record<string, Record<string, number>>);

  const flatSummary: any[] = [];
  
  if (summary.income) {
    Object.entries(summary.income).forEach(([cat, total]) => {
      flatSummary.push({ "Type": "INCOME", "Category": cat, "Total": total });
    });
  }
  if (summary.expense) {
    Object.entries(summary.expense).forEach(([cat, total]) => {
      flatSummary.push({ "Type": "EXPENSE", "Category": cat, "Total": total });
    });
  }

  return flatSummary;
}

export function exportToExcel(state: AppState, filteredTransactions?: Transaction[], customLabel?: string) {
  const transactionsToExport = filteredTransactions || state.transactions;
  const { profile } = state;
  const workbook = XLSX.utils.book_new();
  
  // 1. Summary Sheet
  const summaryData = getSummaryData(transactionsToExport);
  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary Report");

  // 2. Transactions Sheet
  const data = transactionsToExport.map(t => ({
    ID: t.id,
    Type: t.type.toUpperCase(),
    Amount: t.amount,
    Category: t.category,
    Date: new Date(t.date).toLocaleDateString(),
    Description: t.description
  }));
  const worksheet = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(workbook, worksheet, "All Transactions");

  // 3. Category Metadata (only for full backups)
  if (!filteredTransactions) {
    const categoriesData = [
      ...state.categories.income.map(c => ({ Type: 'Income', Name: c })),
      ...state.categories.expense.map(c => ({ Type: 'Expense', Name: c }))
    ];
    const catWorksheet = XLSX.utils.json_to_sheet(categoriesData);
    XLSX.utils.book_append_sheet(workbook, catWorksheet, "Category Config");
  }

  const label = customLabel || (filteredTransactions ? 'Report' : 'Backup');
  const fileName = `FinTrack_${label}_${profile.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

/**
 * Creates a Yearly report with a sheet for every month
 */
export function exportYearlyReport(state: AppState, year: number) {
  const { transactions, profile } = state;
  const workbook = XLSX.utils.book_new();
  const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Global Summary
  const yearlyTransactions = transactions.filter(t => new Date(t.date).getFullYear() === year);
  const summaryData = getSummaryData(yearlyTransactions);
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(summaryData), "Yearly Summary");

  // Monthly Sheets
  MONTH_NAMES.forEach((monthName, index) => {
    const monthTransactions = yearlyTransactions.filter(t => new Date(t.date).getMonth() === index);
    if (monthTransactions.length > 0) {
      const data = monthTransactions.map(t => ({
        Date: new Date(t.date).toLocaleDateString(),
        Type: t.type.toUpperCase(),
        Category: t.category,
        Amount: t.amount,
        Description: t.description
      }));
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(data), monthName);
    }
  });

  const fileName = `FinTrack_Full_Year_${year}_${profile.name.replace(/\s+/g, '_')}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

export async function importFromExcel(file: File): Promise<Partial<AppState>> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const transSheet = workbook.Sheets["All Transactions"] || workbook.Sheets["Transactions"];
        if (!transSheet) throw new Error("Invalid format: No transactions found.");
        
        const transRaw: any[] = XLSX.utils.sheet_to_json(transSheet);
        const transactions: Transaction[] = transRaw.map(r => ({
          id: r.ID || Math.random().toString(36).substr(2, 9),
          type: (r.Type || 'expense').toLowerCase() as any,
          amount: Number(r.Amount) || 0,
          category: r.Category || 'Other',
          date: r.Date ? new Date(r.Date).toISOString() : new Date().toISOString(),
          description: r.Description || ''
        }));

        const catSheet = workbook.Sheets["Category Config"];
        let categories = undefined;
        if (catSheet) {
          const catRaw: any[] = XLSX.utils.sheet_to_json(catSheet);
          categories = {
            income: catRaw.filter(r => r.Type === 'Income').map(r => r.Name),
            expense: catRaw.filter(r => r.Type === 'Expense').map(r => r.Name)
          };
        }

        resolve({ transactions, categories: categories as any });
      } catch (err) {
        reject(err);
      }
    };
    reader.readAsArrayBuffer(file);
  });
}
