
import React, { useState } from 'react';
import { AppState, Categories } from '../types';
import { Plus, Tags, Trash2, LayoutGrid } from 'lucide-react';

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
    if (activeTab === 'expense' && cat === 'Vault Deduction') {
      alert("System Category: This label is required for Vault operations.");
      return;
    }
    
    const updated = {
      ...state.categories,
      [activeTab]: state.categories[activeTab].filter(c => c !== cat)
    };
    onUpdate(updated);
  };

  const getTabStyles = () => {
    switch (activeTab) {
      case 'income': return { 
        bg: 'bg-emerald-50', 
        border: 'border-emerald-100', 
        text: 'text-emerald-700', 
        accent: 'bg-emerald-600',
        itemBg: 'bg-gradient-to-br from-emerald-50 to-white',
        pattern: 'radial-gradient(circle, #10b98111 1px, transparent 1px)'
      };
      case 'vault': return { 
        bg: 'bg-indigo-50', 
        border: 'border-indigo-100', 
        text: 'text-indigo-700', 
        accent: 'bg-indigo-600',
        itemBg: 'bg-gradient-to-br from-indigo-50 to-white',
        pattern: 'radial-gradient(circle, #4f46e511 1px, transparent 1px)'
      };
      default: return { 
        bg: 'bg-rose-50', 
        border: 'border-rose-100', 
        text: 'text-rose-700', 
        accent: 'bg-rose-600',
        itemBg: 'bg-gradient-to-br from-rose-50 to-white',
        pattern: 'radial-gradient(circle, #f43f5e11 1px, transparent 1px)'
      };
    }
  };

  const styles = getTabStyles();

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="bg-white p-6 md:p-10 lg:p-14 rounded-[2.5rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm space-y-8 md:space-y-12 relative overflow-hidden">
        {/* Artistic Background Layer */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: styles.pattern, backgroundSize: '24px 24px' }} />
        <div className={`absolute top-0 right-0 w-[300px] h-[300px] md:w-[400px] md:h-[400px] ${styles.bg} rounded-full -mr-40 -mt-40 blur-[100px] opacity-30`} />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4 md:space-x-6">
            <div className={`p-4 md:p-5 ${styles.bg} rounded-[1.5rem] md:rounded-[2rem] shadow-sm`}>
              <LayoutGrid className={`w-6 h-6 md:w-8 md:h-8 ${styles.text}`} />
            </div>
            <div>
              <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">Label Architect</h2>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-[8px] md:text-[10px]">Customize your data sectors</p>
            </div>
          </div>
          
          <div className="flex p-1 bg-slate-100 rounded-2xl md:rounded-[2rem] border border-slate-200">
            <button
              onClick={() => setActiveTab('expense')}
              className={`px-4 md:px-8 py-2 md:py-3.5 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] rounded-xl md:rounded-2xl transition-all flex items-center ${activeTab === 'expense' ? 'bg-white text-rose-600 shadow-lg border border-rose-50' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Spending
            </button>
            <button
              onClick={() => setActiveTab('income')}
              className={`px-4 md:px-8 py-2 md:py-3.5 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] rounded-xl md:rounded-2xl transition-all flex items-center ${activeTab === 'income' ? 'bg-white text-emerald-600 shadow-lg border border-emerald-50' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Income
            </button>
            <button
              onClick={() => setActiveTab('vault')}
              className={`px-4 md:px-8 py-2 md:py-3.5 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] rounded-xl md:rounded-2xl transition-all flex items-center ${activeTab === 'vault' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Vault
            </button>
          </div>
        </div>

        {/* Input Form with High Visibility Fix */}
        <form onSubmit={handleAdd} className="relative z-20 flex flex-col sm:flex-row gap-3 md:gap-4 bg-slate-50 p-2 md:p-3 rounded-3xl md:rounded-[2.5rem] border border-slate-100 shadow-inner">
          <div className="relative flex-1 group">
            <Tags className={`absolute left-5 md:left-6 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 ${styles.text} opacity-40 group-focus-within:opacity-100 transition-opacity z-30`} />
            <input
              type="text"
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
              placeholder={`Name of ${activeTab} category...`}
              className="w-full pl-12 md:pl-16 pr-6 py-4 md:py-5 bg-white text-slate-950 font-black text-base md:text-xl outline-none placeholder:text-slate-300 rounded-2xl md:rounded-[2rem] border-2 border-transparent focus:border-slate-200 transition-all shadow-sm"
            />
          </div>
          <button
            type="submit"
            disabled={!newCat.trim()}
            className={`px-6 md:px-10 py-4 md:py-5 rounded-2xl md:rounded-[2rem] text-white font-black uppercase tracking-widest text-[9px] md:text-[10px] transition-all shadow-xl disabled:opacity-30 flex items-center justify-center ${styles.accent} hover:shadow-lg active:scale-95`}
          >
            <Plus className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3" strokeWidth={4} />
            Add Sector
          </button>
        </form>

        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {state.categories[activeTab].map((cat) => (
            <div 
              key={cat} 
              className={`flex items-center justify-between p-6 md:p-8 border ${styles.border} rounded-3xl md:rounded-[2.5rem] ${styles.itemBg} shadow-sm group hover:shadow-xl hover:-translate-y-1 transition-all duration-500 animate-in zoom-in`}
            >
              <div className="flex items-center space-x-3 md:space-x-4 overflow-hidden">
                <div className={`p-2 md:p-3 ${styles.bg} rounded-xl md:rounded-2xl`}>
                  <Tags className={`w-3 h-3 md:w-4 md:h-4 ${styles.text}`} />
                </div>
                <span className="text-[10px] md:text-xs font-black text-slate-800 uppercase tracking-widest truncate">{cat}</span>
              </div>
              <button 
                onClick={() => handleDelete(cat)}
                className="p-2.5 md:p-3 bg-white text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-xl md:rounded-2xl transition-all shadow-sm opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <div className="border-2 border-dashed border-slate-100 rounded-3xl md:rounded-[2.5rem] p-6 md:p-8 flex items-center justify-center opacity-30">
             <span className="text-[9px] md:text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Available Slot</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryManager;
