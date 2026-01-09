import React, { useMemo } from 'react';
import { AppState } from '../types';
import { Wallet, ArrowUp, ArrowDown, History, ReceiptText, TrendingUp, TrendingDown, Target, Zap, HandCoins } from 'lucide-react';

interface DashboardProps {
  state: AppState;
}

const Dashboard: React.FC<DashboardProps> = ({ state }) => {
  const { transactions, vaultTransactions, profile } = state;

  const stats = useMemo(() => {
    let income = 0;
    let expense = 0;
    let borrowed = 0;
    let vaultWithdrawalsAsIncome = 0;
    
    // Main ledger items
    transactions.forEach(t => {
      if (t.type === 'income') income += t.amount;
      else if (t.type === 'expense') {
        // Vault Deduction is money COMING from Vault to Wallet, increasing usable balance
        if (t.category === 'Vault Deduction') {
          vaultWithdrawalsAsIncome += t.amount;
        } else {
          expense += t.amount;
        }
      }
      else if (t.type === 'borrowed') borrowed += t.amount;
    });
    
    let vaultBalance = 0;
    let vaultDeposits = 0;

    // Vault vs Wallet balance adjustments
    vaultTransactions.forEach(t => {
      if (t.type === 'vault_in') {
        vaultBalance += t.amount;
        vaultDeposits += t.amount; // Wallet to Vault (Outflow)
      } else if (t.type === 'vault_out') {
        vaultBalance -= t.amount;
        // vault_out is handled via 'Vault Deduction' in main transactions list
      }
    });

    return { 
      income: income + vaultWithdrawalsAsIncome, 
      expense: expense + vaultDeposits, 
      borrowed,
      usableBalance: (income + borrowed + vaultWithdrawalsAsIncome) - (expense + vaultDeposits), 
      vaultBalance 
    };
  }, [transactions, vaultTransactions]);

  const recentTransactions = useMemo(() => {
    return transactions.slice(0, 5);
  }, [transactions]);

  const spendingPowerData = useMemo(() => {
    const expenseData = transactions
      .filter(t => t.type === 'expense' && t.category !== 'Vault Deduction')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);
    return Object.entries(expenseData)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [transactions]);

  return (
    <div className="space-y-4 md:space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 md:gap-4">
        <div className="animate-in slide-in-from-left-4 duration-500 px-1">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight uppercase">Inance Ledger</h1>
          <p className="text-slate-500 font-medium text-xs md:text-sm lg:text-base">Status: <span className="text-emerald-600 font-bold">OPTIMIZED</span> for {profile.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
        {/* Usable Balance */}
        <div className="bg-white p-5 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-500 group relative overflow-hidden">
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-emerald-50 rounded-full group-hover:scale-150 transition-transform duration-1000" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 bg-emerald-50 rounded-xl group-hover:bg-emerald-600 transition-colors">
                <Wallet className="w-5 h-5 text-emerald-600 group-hover:text-white" />
              </div>
              <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Net Value</span>
            </div>
            <p className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 tracking-tighter mb-1 truncate">
              {profile.currency}{stats.usableBalance.toLocaleString()}
            </p>
            <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-tight">Usable Wallet Capital</p>
          </div>
        </div>

        {/* Income Stat - Down Arrow for Inward Flow */}
        <div className="bg-white p-5 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-500 group relative overflow-hidden">
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-emerald-50 rounded-full group-hover:scale-150 transition-transform duration-1000" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 bg-emerald-50 rounded-xl group-hover:bg-emerald-600 transition-colors">
                <ArrowDown className="w-5 h-5 text-emerald-600 group-hover:text-white" />
              </div>
              <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Inward</span>
            </div>
            <p className="text-2xl md:text-3xl lg:text-4xl font-black text-emerald-600 tracking-tighter mb-1 truncate">
              {profile.currency}{stats.income.toLocaleString()}
            </p>
            <div className="flex items-center text-[8px] md:text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
              <TrendingDown className="w-2.5 h-2.5 mr-1" /> Total Credits
            </div>
          </div>
        </div>

        {/* Borrowed Money Stat - Down Arrow for Inward Flow */}
        <div className="bg-white p-5 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-500 group relative overflow-hidden">
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-indigo-50 rounded-full group-hover:scale-150 transition-transform duration-1000" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 bg-indigo-50 rounded-xl group-hover:bg-indigo-600 transition-colors">
                <HandCoins className="w-5 h-5 text-indigo-600 group-hover:text-white" />
              </div>
              <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Debt</span>
            </div>
            <p className="text-2xl md:text-3xl lg:text-4xl font-black text-indigo-600 tracking-tighter mb-1 truncate">
              {profile.currency}{stats.borrowed.toLocaleString()}
            </p>
            <div className="flex items-center text-[8px] md:text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
              <Target className="w-2.5 h-2.5 mr-1" /> Active Loans
            </div>
          </div>
        </div>

        {/* Expense Stat - Up Arrow for Outward Flow */}
        <div className="bg-white p-5 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-500 group relative overflow-hidden">
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-rose-50 rounded-full group-hover:scale-150 transition-transform duration-1000" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 bg-rose-50 rounded-xl group-hover:bg-rose-600 transition-colors">
                <ArrowUp className="w-5 h-5 text-rose-600 group-hover:text-white" />
              </div>
              <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Outward</span>
            </div>
            <p className="text-2xl md:text-3xl lg:text-4xl font-black text-rose-600 tracking-tighter mb-1 truncate">
              {profile.currency}{stats.expense.toLocaleString()}
            </p>
            <div className="flex items-center text-[8px] md:text-[10px] font-bold text-rose-400 uppercase tracking-widest">
              <TrendingUp className="w-2.5 h-2.5 mr-1" /> Total Debits
            </div>
          </div>
        </div>
      </div>

      <div className="bg-emerald-950 rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-white shadow-2xl border border-emerald-900 overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
        <div className="flex items-center space-x-3 md:space-x-4 relative z-10 w-full sm:w-auto">
          <div className="p-2.5 md:p-3 bg-emerald-500 rounded-xl md:rounded-2xl shadow-lg flex-shrink-0">
            <Zap className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </div>
          <div>
            <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Wealth Index</p>
            <p className="text-[10px] md:text-sm font-bold opacity-80">Retained capital vs Total Liquidity.</p>
          </div>
        </div>
        <div className="flex items-center justify-between sm:justify-end space-x-4 md:space-x-8 relative z-10 w-full sm:w-auto">
          <div className="text-right">
            <p className="text-2xl md:text-3xl font-black tracking-tighter">
              {(stats.income + stats.borrowed) > 0 ? ((stats.usableBalance / (stats.income + stats.borrowed)) * 100).toFixed(1) : 0}%
            </p>
          </div>
          <div className="px-4 md:px-6 py-1.5 md:py-2 bg-emerald-900 rounded-xl md:rounded-2xl border border-emerald-800 flex-shrink-0">
             <span className="text-[9px] md:text-xs font-black uppercase tracking-widest text-emerald-300">
               {stats.usableBalance >= 0 ? 'Surplus' : 'Deficit'}
             </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
        <div className="bg-white p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <div className="flex items-center space-x-3">
              <div className="p-2 md:p-2.5 bg-slate-100 rounded-xl md:rounded-2xl">
                <History className="w-4 h-4 md:w-5 md:h-5 text-slate-600" />
              </div>
              <h3 className="font-black text-slate-800 uppercase tracking-[0.1em] text-[8px] md:text-[10px]">Recent Operations</h3>
            </div>
          </div>
          <div className="space-y-3 md:space-y-4">
            {recentTransactions.length > 0 ? recentTransactions.map((t) => {
              const isInward = t.type === 'income' || t.type === 'borrowed' || t.category === 'Vault Deduction';
              return (
                <div key={t.id} className="flex items-center justify-between p-3 md:p-4 rounded-2xl md:rounded-3xl bg-slate-50/50 hover:bg-slate-100 transition-all duration-300 border border-transparent hover:border-slate-200">
                  <div className="flex items-center space-x-3 md:space-x-4 overflow-hidden">
                    <div className={`p-2.5 md:p-3 rounded-xl md:rounded-2xl shadow-sm flex-shrink-0 ${isInward ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                      {isInward ? <ArrowDown className="w-4 h-4 md:w-5 md:h-5" /> : <ArrowUp className="w-4 h-4 md:w-5 md:h-5" />}
                    </div>
                    <div className="truncate">
                      <p className="font-black text-slate-900 text-[10px] md:text-xs uppercase tracking-wider truncate">{t.category}</p>
                      <p className="text-[8px] md:text-[10px] font-bold text-slate-400 truncate">{new Date(t.date).toLocaleDateString()} • {t.description || 'Verified'}</p>
                    </div>
                  </div>
                  <p className={`text-base md:text-lg font-black tracking-tight whitespace-nowrap ml-2 ${isInward ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {isInward ? '+' : '-'}{profile.currency}{t.amount.toLocaleString()}
                  </p>
                </div>
              );
            }) : (
              <div className="text-center py-16 md:py-20 bg-slate-50/50 rounded-[1.5rem] md:rounded-[2rem] border-2 border-dashed border-slate-100">
                <p className="text-slate-300 font-black uppercase tracking-widest text-[8px] md:text-[10px]">No recent data</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all">
          <div className="flex items-center space-x-3 mb-6 md:mb-8">
            <div className="p-2 md:p-2.5 bg-slate-100 rounded-xl md:rounded-2xl">
              <ReceiptText className="w-4 h-4 md:w-5 md:h-5 text-slate-600" />
            </div>
            <h3 className="font-black text-slate-800 uppercase tracking-[0.1em] text-[8px] md:text-[10px]">Sector Intensity</h3>
          </div>
          {stats.expense > 0 ? (
             <div className="space-y-4 md:space-y-6">
               {spendingPowerData.map(([cat, amount]) => (
                 <div key={cat} className="space-y-2 md:space-y-3 p-4 md:p-5 rounded-2xl md:rounded-3xl bg-gradient-to-br from-slate-50/50 to-white border border-slate-100">
                   <div className="flex justify-between items-center text-[8px] md:text-[10px] font-black uppercase tracking-[0.1em]">
                     <span className="text-slate-500 flex items-center truncate">
                       <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-rose-500 mr-2 flex-shrink-0" />
                       <span className="truncate">{cat}</span>
                     </span>
                     <span className="text-slate-900 text-xs md:text-sm ml-2">{profile.currency}{amount.toLocaleString()}</span>
                   </div>
                   <div className="w-full bg-slate-100 rounded-full h-1.5 md:h-2.5 overflow-hidden">
                     <div className="bg-rose-500 h-full rounded-full transition-all duration-1000" style={{ width: `${(amount / stats.expense) * 100}%` }}></div>
                   </div>
                   <div className="flex justify-end">
                     <span className="text-[8px] md:text-[10px] font-bold text-slate-400">{((amount / stats.expense) * 100).toFixed(0)}% contribution</span>
                   </div>
                 </div>
               ))}
             </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 md:py-20 bg-slate-50/50 rounded-[1.5rem] md:rounded-[2rem] border-2 border-dashed border-slate-100 space-y-3">
              <p className="text-slate-300 font-black uppercase tracking-widest text-[8px] md:text-[10px]">Awaiting spending analysis</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;