import React, { useMemo } from 'react';
import { AppState } from '../types';
// Fixed: Added missing 'Lock' import from 'lucide-react'
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, History, ReceiptText, ShieldCheck, Lock } from 'lucide-react';

interface DashboardProps {
  state: AppState;
}

const Dashboard: React.FC<DashboardProps> = ({ state }) => {
  const { transactions, vaultTransactions, profile } = state;

  const stats = useMemo(() => {
    let income = 0;
    let expense = 0;
    transactions.forEach(t => {
      if (t.type === 'income') income += t.amount;
      else if (t.type === 'expense') expense += t.amount;
    });

    let vaultBalance = 0;
    vaultTransactions.forEach(t => {
      if (t.type === 'vault_in') vaultBalance += t.amount;
      else if (t.type === 'vault_out') vaultBalance -= t.amount;
    });

    return { 
      income, 
      expense, 
      usableBalance: income - expense,
      vaultBalance 
    };
  }, [transactions, vaultTransactions]);

  const recentTransactions = useMemo(() => {
    return transactions.slice(0, 5);
  }, [transactions]);

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="animate-in slide-in-from-left-4 duration-500 px-1">
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">Welcome, {profile.name}!</h1>
          <p className="text-slate-500 font-medium text-sm lg:text-base">Managing your financial freedom.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="bg-white p-5 lg:p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-500 group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 bg-indigo-50 rounded-xl group-hover:bg-indigo-600 transition-colors">
              <Wallet className="w-5 h-5 lg:w-6 lg:h-6 text-indigo-600 group-hover:text-white" />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Usable Money</span>
          </div>
          <p className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tighter">{profile.currency}{stats.usableBalance.toLocaleString()}</p>
          <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600 rounded-full transition-all duration-1000" style={{ width: '100%' }}></div>
          </div>
        </div>

        <div className="bg-slate-900 p-5 lg:p-6 rounded-[2rem] shadow-xl border border-slate-800 hover:scale-[1.02] transition-all duration-500 group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 bg-slate-800 rounded-xl group-hover:bg-indigo-500 transition-colors">
              <ShieldCheck className="w-5 h-5 lg:w-6 lg:h-6 text-indigo-400 group-hover:text-white" />
            </div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Unusable Money (Vault)</span>
          </div>
          <p className="text-3xl lg:text-4xl font-black text-white tracking-tighter">{profile.currency}{stats.vaultBalance.toLocaleString()}</p>
          <div className="mt-4 flex items-center text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
            <Lock className="w-3 h-3 mr-1" />
            Locked Assets
          </div>
        </div>

        <div className="bg-white p-5 lg:p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-500 group sm:col-span-2 lg:col-span-1 flex flex-col justify-between">
           <div className="flex justify-between items-start mb-2">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">In/Out Flow</span>
                <div className="flex items-center space-x-4">
                   <div className="flex items-center text-emerald-600 font-bold">
                      <ArrowUpRight className="w-4 h-4 mr-1" />
                      {profile.currency}{stats.income.toLocaleString()}
                   </div>
                   <div className="flex items-center text-rose-600 font-bold">
                      <ArrowDownRight className="w-4 h-4 mr-1" />
                      {profile.currency}{stats.expense.toLocaleString()}
                   </div>
                </div>
              </div>
           </div>
           <div className="bg-slate-50 p-3 rounded-2xl flex items-center justify-between mt-4">
              <span className="text-[10px] font-black text-slate-400 uppercase">Savings Ratio</span>
              <span className="text-xs font-black text-slate-800">
                {stats.income > 0 ? ((stats.vaultBalance / stats.income) * 100).toFixed(1) : 0}%
              </span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <div className="bg-white p-6 lg:p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-lg transition-all">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-slate-100 rounded-xl">
              <History className="w-5 h-5 text-slate-600" />
            </div>
            <h3 className="font-black text-slate-800 uppercase tracking-widest text-[10px]">Recent Activity</h3>
          </div>
          <div className="space-y-4">
            {recentTransactions.length > 0 ? recentTransactions.map((t, idx) => (
              <div key={t.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50/50 transition-all duration-300">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className={`p-2.5 rounded-xl shadow-sm flex-shrink-0 ${t.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {t.type === 'income' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                  </div>
                  <div className="truncate">
                    <p className="font-bold text-slate-800 text-sm truncate">{t.category}</p>
                    <p className="text-[10px] font-medium text-slate-400 truncate">{new Date(t.date).toLocaleDateString()} • {t.description || 'Quick log'}</p>
                  </div>
                </div>
                <p className={`text-base font-black tracking-tight ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {t.type === 'income' ? '+' : '-'}{profile.currency}{t.amount.toLocaleString()}
                </p>
              </div>
            )) : (
              <div className="text-center py-12 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100">
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] italic">No activity recorded</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 lg:p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-lg transition-all">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-slate-100 rounded-xl">
              <ReceiptText className="w-5 h-5 text-slate-600" />
            </div>
            <h3 className="font-black text-slate-800 uppercase tracking-widest text-[10px]">Spending Power</h3>
          </div>
          {stats.expense > 0 ? (
             <div className="space-y-5">
               {Object.entries(
                 transactions
                   .filter(t => t.type === 'expense')
                   .reduce((acc, t) => {
                     acc[t.category] = (acc[t.category] || 0) + t.amount;
                     return acc;
                   }, {} as Record<string, number>)
               )
               .sort((a, b) => b[1] - a[1])
               .slice(0, 5)
               .map(([cat, amount], idx) => (
                 <div key={cat} className="space-y-2">
                   <div className="flex justify-between text-[10px] font-black uppercase tracking-wider">
                     <span className="text-slate-500">{cat}</span>
                     <span className="text-slate-900">{profile.currency}{amount.toLocaleString()}</span>
                   </div>
                   <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                     <div className="bg-indigo-600 h-full rounded-full transition-all duration-1000" style={{ width: `${(amount / stats.expense) * 100}%` }}></div>
                   </div>
                 </div>
               ))}
             </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100 space-y-3">
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Awaiting expense data</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;