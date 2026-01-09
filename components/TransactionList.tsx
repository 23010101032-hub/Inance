
import React, { useState } from 'react';
import { AppState, Transaction } from '../types';
import { Trash2, Search, Filter, Calendar } from 'lucide-react';

interface TransactionListProps {
  state: AppState;
  onDelete: (id: string) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ state, onDelete }) => {
  const { transactions, profile } = state;
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  const filtered = transactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || t.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by category or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white text-black border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none transition-all font-medium shadow-sm"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-6 py-3 bg-white text-black border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none transition-all font-bold shadow-sm"
          >
            <option value="all">All Transactions</option>
            <option value="income">Income Only</option>
            <option value="expense">Expenses Only</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in duration-1000">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length > 0 ? filtered.map((t, idx) => (
                <tr key={t.id} style={{ animationDelay: `${idx * 50}ms` }} className="hover:bg-slate-50/50 transition-all duration-300 group animate-in slide-in-from-right-2">
                  <td className="px-8 py-5">
                    <div className="flex items-center text-slate-500 font-medium text-sm">
                      <Calendar className="w-3.5 h-3.5 mr-2.5 text-slate-400" />
                      {new Date(t.date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${t.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                      {t.category}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-slate-900 font-bold text-sm">{t.description || '-'}</td>
                  <td className={`px-8 py-5 text-right font-black text-lg tracking-tight ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {t.type === 'income' ? '+' : '-'}{profile.currency}{t.amount.toLocaleString()}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button 
                      onClick={() => onDelete(t.id)}
                      className="p-2.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all duration-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3 opacity-30">
                      <Filter className="w-10 h-10" />
                      <p className="font-black uppercase tracking-widest text-xs">No matching transactions</p>
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
