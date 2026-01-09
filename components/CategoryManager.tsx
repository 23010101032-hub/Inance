import React, { useState } from 'react';
import { AppState, Categories } from '../types';
import { Plus, Tags, Trash2, Lock, TrendingUp, TrendingDown } from 'lucide-react';

interface CategoryManagerProps {
  state: AppState;
  onUpdate: (cats: Categories) => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ state, onUpdate }) => {
  const [newCat, setNewCat] = useState('');
  const [activeTab, setActiveTab] = useState<'income' | 'expense' | 'vault'>('expense');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCat.trim()) return;
    if (state.categories[activeTab].includes(newCat)) return;

    const updated = {
      ...state.categories,
      [activeTab]: [...state.categories[activeTab], newCat.trim()]
    };
    onUpdate(updated);
    setNewCat('');
  };

  const handleDelete = (cat: string) => {
    // Prevent deleting "Vault Deduction" as it's a system reserved category for the deduction logic
    if (activeTab === 'expense' && cat === 'Vault Deduction') {
      alert("This category is required for Vault operations.");
      return;
    }
    
    const updated = {
      ...state.categories,
      [activeTab]: state.categories[activeTab].filter(c => c !== cat)
    };
    onUpdate(updated);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8 hover:shadow-xl transition-all duration-500">
        <div className="flex items-center space-x-4 mb-2">
          <div className="p-3 bg-indigo-50 rounded-2xl">
            <Tags className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Manage Categories</h2>
            <p className="text-slate-400 font-medium">Create custom labels for all pools.</p>
          </div>
        </div>

        <div className="flex p-1.5 bg-slate-100 rounded-2xl">
          <button
            onClick={() => setActiveTab('expense')}
            className={`flex-1 py-3 text-xs font-black rounded-xl transition-all flex items-center justify-center ${activeTab === 'expense' ? 'bg-white text-rose-600 shadow-md' : 'text-slate-500'}`}
          >
            <TrendingDown className="w-4 h-4 mr-2" />
            Spending
          </button>
          <button
            onClick={() => setActiveTab('income')}
            className={`flex-1 py-3 text-xs font-black rounded-xl transition-all flex items-center justify-center ${activeTab === 'income' ? 'bg-white text-emerald-600 shadow-md' : 'text-slate-500'}`}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Income
          </button>
          <button
            onClick={() => setActiveTab('vault')}
            className={`flex-1 py-3 text-xs font-black rounded-xl transition-all flex items-center justify-center ${activeTab === 'vault' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500'}`}
          >
            <Lock className="w-4 h-4 mr-2" />
            Vault
          </button>
        </div>

        <form onSubmit={handleAdd} className="flex gap-3">
          <input
            type="text"
            value={newCat}
            onChange={(e) => setNewCat(e.target.value)}
            placeholder={`Add to ${activeTab} pool...`}
            className="flex-1 px-6 py-4 bg-white text-black border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none transition-all font-bold shadow-sm"
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white px-6 py-4 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg font-bold"
          >
            <Plus className="w-6 h-6" />
          </button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {state.categories[activeTab].map((cat) => (
            <div 
              key={cat} 
              className="flex items-center justify-between p-4 border border-slate-50 rounded-2xl bg-slate-50/50 group hover:border-indigo-100 hover:bg-white hover:shadow-md transition-all duration-300"
            >
              <span className="text-sm font-black text-slate-700 uppercase tracking-wider">{cat}</span>
              <button 
                onClick={() => handleDelete(cat)}
                className="p-2 text-slate-300 hover:text-rose-500 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryManager;