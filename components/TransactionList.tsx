import React, { useState } from 'react';
import { AppState, Transaction } from '../types';
import { Trash2, Search, Filter, Calendar, Tag, User, CalendarClock, ArrowUp, ArrowDown, HandCoins } from 'lucide-react';

interface TransactionListProps {
  state: AppState;
  onDelete: (id: string) => void;
}

const getCategoryStyles = (cat: string, type: string) => {
  if (cat === 'Vault Deduction') return 'bg-indigo-50 text-indigo-700 border-indigo-100';
  
  let hash = 0;
  for (let i = 0; i < cat.length; i++) {
    hash = cat.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash % 6);
  
  if (type === 'income') {
    const variants = [
      'bg-emerald-50 text-emerald-700 border-emerald-100',
      'bg-teal-50 text-teal-700 border-teal-100',
      'bg-cyan-50 text-cyan-700 border-cyan-100',
      'bg-green-50 text-green-700 border-green-100',
      'bg-sky-50 text-sky-700 border-sky-100',
      'bg-emerald-100 text-emerald-800 border-emerald-200',
    ];
    return variants[index];
  } else if (type === 'borrowed') {
    return 'bg-indigo-50 text-indigo-700 border-indigo-100';
  } else {
    const variants = [
      'bg-rose-50 text-rose-700 border-rose-100',
      'bg-orange-50 text-orange-700 border-orange-100',
      'bg-amber-50 text-amber-700 border-amber-100',
      'bg-pink-50 text-pink-700 border-pink-100',
      'bg-purple-50 text-purple-700 border-purple-100',
      'bg-red-50 text-red-700 border-red-100',
    ];
    return variants[index];
  }
};

const TransactionList: React.FC<TransactionListProps> = ({ state, onDelete }) => {
  const { transactions, profile } = state;
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense' | 'borrowed'>('all');

  const filtered = transactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (t.borrowedFrom || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || t.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex flex-col md:flex-row gap-4 bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
          <input
            type="text"
            placeholder="Search transactions, lenders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-slate-50 text-black border-2 border-transparent focus:border-emerald-500 rounded-2xl outline-none transition-all font-bold"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="pl-14 pr-10 py-4 bg-slate-50 text-black border-2 border-transparent focus:border-emerald-500 rounded-2xl outline-none transition-all font-bold appearance-none cursor-pointer"
          >
            <option value="all">Every Entry</option>
            <option value="income">Credits Only</option>
            <option value="borrowed">Debt Only</option>
            <option value="expense">Debits Only</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Flow</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Timestamp</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sector</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Description</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Value</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length > 0 ? filtered.map((t, idx) => {
                const isInward = t.type === 'income' || t.type === 'borrowed' || t.category === 'Vault Deduction';
                return (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-all group animate-in slide-in-from-right-2" style={{ animationDelay: `${idx * 40}ms` }}>
                    <td className="px-10 py-6">
                      <div className={`p-2 rounded-lg w-fit ${isInward ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {isInward ? <ArrowDown className="w-4 h-4" /> : <ArrowUp className="w-4 h-4" />}
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex flex-col">
                        <div className="flex items-center text-slate-500 font-black text-[11px] uppercase tracking-tighter">
                          <Calendar className="w-3.5 h-3.5 mr-2.5 text-slate-400" />
                          {new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        {t.type === 'borrowed' && t.repayDate && (
                          <div className="flex items-center text-indigo-500 font-bold text-[9px] mt-1.5 uppercase tracking-tighter">
                            <CalendarClock className="w-3 h-3 mr-1.5" />
                            Repay: {new Date(t.repayDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <span className={`inline-flex items-center px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm ${getCategoryStyles(t.category, t.type)} transition-transform group-hover:scale-105`}>
                        <Tag className="w-3 h-3 mr-2 opacity-60" />
                        {t.category}
                      </span>
                    </td>
                    <td className="px-10 py-6 overflow-hidden">
                      <div className="flex flex-col truncate max-w-[200px]">
                        <span className="text-slate-900 font-bold text-sm truncate">
                          {t.description || <span className="text-slate-300 font-normal italic">No details</span>}
                        </span>
                        {t.type === 'borrowed' && t.borrowedFrom && (
                          <span className="flex items-center text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-1">
                            <User className="w-2.5 h-2.5 mr-1" /> {t.borrowedFrom}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className={`px-10 py-6 text-right font-black text-xl tracking-tighter ${isInward ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {isInward ? '+' : '-'}{profile.currency}{t.amount.toLocaleString()}
                    </td>
                    <td className="px-10 py-6 text-right">
                      <button 
                        onClick={() => onDelete(t.id)}
                        className="p-3 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={6} className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4 opacity-10">
                      <Search className="w-20 h-20" />
                      <p className="font-black uppercase tracking-[0.3em] text-sm italic">No entries found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TransactionList;