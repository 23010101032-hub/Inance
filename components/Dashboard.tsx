
import React, { useMemo } from 'react';
import { AppState } from '../types';
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, History, ReceiptText } from 'lucide-react';

interface DashboardProps {
  state: AppState;
}

const Dashboard: React.FC<DashboardProps> = ({ state }) => {
  const { transactions, profile } = state;

  const stats = useMemo(() => {
    let income = 0;
    let expense = 0;
    transactions.forEach(t => {
      if (t.type === 'income') income += t.amount;
      else expense += t.amount;
    });
    return { income, expense, balance: income - expense };
  }, [transactions]);

  const recentTransactions = useMemo(() => {
    return transactions.slice(0, 5);
  }, [transactions]);

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="animate-in slide-in-from-left-4 duration-500 px-1">
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">Welcome, {profile.name}!</h1>
          <p className="text-slate-500 font-medium text-sm lg:text-base">Your financial overview is looking sharp today.</p>
        </div>
      </div>

      {/* Stats Grid - Fluid sizing for all mobile types */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="bg-white p-5 lg:p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl hover:scale-[1.01] transition-all duration-500 group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 bg-indigo-50 rounded-xl group-hover:bg-indigo-600 transition-colors duration-500">
              <Wallet className="w-5 h-5 lg:w-6 lg:h-6 text-indigo-600 group-hover:text-white transition-colors duration-500" />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Available Balance</span>
          </div>
          <p className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tighter">{profile.currency}{stats.balance.toLocaleString()}</p>
          <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600 rounded-full transition-all duration-1000" style={{ width: '100%' }}></div>
          </div>
        </div>

        <div className="bg-white p-5 lg:p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl hover:scale-[1.01] transition-all duration-500 group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 bg-emerald-50 rounded-xl group-hover:bg-emerald-600 transition-colors duration-500">
              <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6 text-emerald-600 group-hover:text-white transition-colors duration-500" />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Earnings</span>
          </div>
          <p className="text-3xl lg:text-4xl font-black text-emerald-600 tracking-tighter">{profile.currency}{stats.income.toLocaleString()}</p>
          <div className="mt-3 flex items-center text-[10px] font-bold text-emerald-500 uppercase tracking-[0.2em]">
            <ArrowUpRight className="w-3.5 h-3.5 mr-1.5 animate-bounce" />
            Income stream active
          </div>
        </div>

        <div className="bg-white p-5 lg:p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl hover:scale-[1.01] transition-all duration-500 group sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 bg-rose-50 rounded-xl group-hover:bg-rose-600 transition-colors duration-500">
              <TrendingDown className="w-5 h-5 lg:w-6 lg:h-6 text-rose-600 group-hover:text-white transition-colors duration-500" />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Spending</span>
          </div>
          <p className="text-3xl lg:text-4xl font-black text-rose-600 tracking-tighter">{profile.currency}{stats.expense.toLocaleString()}</p>
          <div className="mt-3 flex items-center text-[10px] font-bold text-rose-500 uppercase tracking-[0.2em]">
            <ArrowDownRight className="w-3.5 h-3.5 mr-1.5 animate-pulse" />
            Monitoring outflows
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Recent Transactions - Scrollable on very small screens */}
        <div className="bg-white p-6 lg:p-8 rounded-[2rem] shadow-sm border border-slate-100 transition-all duration-500 hover:shadow-lg">
          <div className="flex items-center justify-between mb-6 lg:mb-8">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-slate-100 rounded-xl">
                <History className="w-5 h-5 text-slate-600" />
              </div>
              <h3 className="font-black text-slate-800 uppercase tracking-widest text-[10px] lg:text-xs">Recent Activity</h3>
            </div>
          </div>
          <div className="space-y-4">
            {recentTransactions.length > 0 ? recentTransactions.map((t, idx) => (
              <div key={t.id} style={{ animationDelay: `${idx * 150}ms` }} className="flex items-center justify-between p-3 lg:p-4 rounded-2xl border border-transparent hover:border-slate-100 hover:bg-slate-50/50 transition-all duration-300 animate-in slide-in-from-right-4">
                <div className="flex items-center space-x-3 lg:space-x-4 overflow-hidden">
                  <div className={`p-2.5 rounded-xl shadow-sm flex-shrink-0 ${t.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {t.type === 'income' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                  </div>
                  <div className="truncate">
                    <p className="font-bold text-slate-800 text-sm lg:text-base truncate">{t.category}</p>
                    <p className="text-[10px] lg:text-xs font-medium text-slate-400 truncate">{new Date(t.date).toLocaleDateString()} • {t.description || 'Quick log'}</p>
                  </div>
                </div>
                <p className={`text-base lg:text-lg font-black tracking-tight flex-shrink-0 ml-3 ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {t.type === 'income' ? '+' : '-'}{profile.currency}{t.amount.toLocaleString()}
                </p>
              </div>
            )) : (
              <div className="text-center py-12 lg:py-16 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100">
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] italic">No activity recorded</p>
              </div>
            )}
          </div>
        </div>

        {/* Financial Health Summary */}
        <div className="bg-white p-6 lg:p-8 rounded-[2rem] shadow-sm border border-slate-100 transition-all duration-500 hover:shadow-lg">
          <div className="flex items-center space-x-3 mb-6 lg:mb-8">
            <div className="p-2 bg-slate-100 rounded-xl">
              <ReceiptText className="w-5 h-5 text-slate-600" />
            </div>
            <h3 className="font-black text-slate-800 uppercase tracking-widest text-[10px] lg:text-xs">Category Performance</h3>
          </div>
          {stats.expense > 0 ? (
             <div className="space-y-5 lg:space-y-6">
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
                 <div key={cat} style={{ animationDelay: `${idx * 150}ms` }} className="space-y-2 animate-in slide-in-from-left-4">
                   <div className="flex justify-between text-[10px] lg:text-xs font-black uppercase tracking-wider">
                     <span className="text-slate-500 truncate mr-2">{cat}</span>
                     <span className="text-slate-900 flex-shrink-0">{profile.currency}{amount.toLocaleString()}</span>
                   </div>
                   <div className="w-full bg-slate-100 rounded-full h-2.5 lg:h-3 overflow-hidden">
                     <div 
                        className="bg-indigo-600 h-full rounded-full transition-all duration-1000 ease-out" 
                        style={{ width: `${(amount / stats.expense) * 100}%` }}
                      ></div>
                   </div>
                 </div>
               ))}
             </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 lg:py-16 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100 space-y-3">
              <ReceiptText className="w-8 h-8 lg:w-10 lg:h-10 text-slate-200" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Awaiting expense data</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
