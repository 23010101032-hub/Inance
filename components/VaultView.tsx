import React, { useState, useMemo } from 'react';
import { AppState, Transaction, TransactionType } from '../types';
// Fixed: Added missing 'X' import from 'lucide-react'
import { 
  ShieldCheck, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  History, 
  Trash2, 
  Calendar,
  Lock,
  Plus,
  Minus,
  X
} from 'lucide-react';

interface VaultViewProps {
  state: AppState;
  onAdd: (t: Omit<Transaction, 'id'>) => void;
  onDelete: (id: string) => void;
}

const VaultView: React.FC<VaultViewProps> = ({ state, onAdd, onDelete }) => {
  const { vaultTransactions, profile, categories } = state;
  const [showAdd, setShowAdd] = useState<TransactionType | null>(null);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(categories.vault[0]);
  const [description, setDescription] = useState('');

  const vaultBalance = useMemo(() => {
    return vaultTransactions.reduce((acc, t) => {
      return t.type === 'vault_in' ? acc + t.amount : acc - t.amount;
    }, 0);
  }, [vaultTransactions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || !showAdd) return;
    
    onAdd({
      type: showAdd,
      amount: Number(amount),
      category,
      date: new Date().toISOString(),
      description
    });
    
    setAmount('');
    setDescription('');
    setShowAdd(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Vault Header Card */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 lg:p-12 text-white relative overflow-hidden shadow-2xl border border-slate-800">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full -mr-20 -mt-20 blur-3xl" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/50">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-black tracking-tight">Financial Vault</h2>
                <p className="text-indigo-400 font-bold uppercase tracking-widest text-[10px]">Unusable Assets Pool</p>
              </div>
            </div>
            <div className="pt-2">
              <p className="text-5xl lg:text-6xl font-black text-white tracking-tighter">
                {profile.currency}{vaultBalance.toLocaleString()}
              </p>
              <p className="text-slate-500 font-medium mt-2 text-sm">Stored securely on your device.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => setShowAdd('vault_in')}
              className="flex-1 lg:flex-none flex items-center justify-center px-8 py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-900/50 active:scale-95"
            >
              <Plus className="w-5 h-5 mr-3" />
              Deposit
            </button>
            <button 
              onClick={() => setShowAdd('vault_out')}
              className="flex-1 lg:flex-none flex items-center justify-center px-8 py-5 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-100 transition-all shadow-xl active:scale-95"
            >
              <Minus className="w-5 h-5 mr-3" />
              Withdraw
            </button>
          </div>
        </div>
      </div>

      {showAdd && (
        <div className="bg-white p-8 rounded-[2rem] border-2 border-slate-100 shadow-sm animate-in zoom-in-95">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-800">
              {showAdd === 'vault_in' ? 'Deposit to Vault' : 'Withdraw from Vault'}
            </h3>
            <button onClick={() => setShowAdd(null)} className="p-2 text-slate-400 hover:text-slate-600"><X /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-1">
              <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Amount ({profile.currency})</label>
              <input 
                type="number" 
                required 
                value={amount} 
                onChange={e => setAmount(e.target.value)}
                className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-500 font-black text-lg"
                placeholder="0.00"
              />
            </div>
            <div className="md:col-span-1">
              <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Vault Sector</label>
              <select 
                value={category} 
                onChange={e => setCategory(e.target.value)}
                className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-500 font-bold"
              >
                {categories.vault.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="md:col-span-1">
              <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Purpose/Note</label>
              <input 
                type="text" 
                value={description} 
                onChange={e => setDescription(e.target.value)}
                className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-500 font-bold"
                placeholder="Reference"
              />
            </div>
            <div className="md:col-span-1">
              <button 
                type="submit"
                className={`w-full py-4 rounded-2xl font-black uppercase text-white shadow-lg transition-all ${showAdd === 'vault_in' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-rose-600 hover:bg-rose-700'}`}
              >
                Confirm {showAdd === 'vault_in' ? 'In' : 'Out'}
              </button>
            </div>
          </form>
          {showAdd === 'vault_out' && (
            <p className="mt-4 text-xs font-bold text-rose-500 flex items-center bg-rose-50 p-3 rounded-xl border border-rose-100">
              <Lock className="w-4 h-4 mr-2" />
              Deducting money from Vault will automatically create a corresponding Expense entry in your main ledger.
            </p>
          )}
        </div>
      )}

      {/* History Table */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
           <div className="flex items-center space-x-3">
              <div className="p-2 bg-slate-100 rounded-xl">
                <History className="w-5 h-5 text-slate-600" />
              </div>
              <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs">Vault Ledger</h3>
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sector</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {vaultTransactions.length > 0 ? vaultTransactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/50 transition-all group">
                  <td className="px-8 py-4 text-slate-500 font-medium text-sm">
                    <div className="flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-2" />
                      {new Date(t.date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${t.type === 'vault_in' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-600'}`}>
                      {t.category}
                    </span>
                  </td>
                  <td className={`px-8 py-4 text-right font-black text-lg ${t.type === 'vault_in' ? 'text-indigo-600' : 'text-slate-900'}`}>
                    {t.type === 'vault_in' ? '+' : '-'}{profile.currency}{t.amount.toLocaleString()}
                  </td>
                  <td className="px-8 py-4 text-right">
                    <button onClick={() => onDelete(t.id)} className="p-2 text-slate-300 hover:text-rose-600 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs italic">
                    The vault is currently empty.
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

export default VaultView;