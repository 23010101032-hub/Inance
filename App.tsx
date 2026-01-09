import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ReceiptText, 
  PieChart as PieChartIcon, 
  Settings, 
  PlusCircle, 
  Download, 
  Upload, 
  Bell, 
  User,
  Tags,
  Menu,
  X,
  Wallet,
  ArrowUp,
  ArrowDown,
  ShieldCheck,
  Clock,
  Database,
  CheckCircle2,
  ChevronRight,
  Lock
} from 'lucide-react';
import { AppState, Transaction, TransactionType, ViewType, UserProfile, Categories } from './types.ts';
import { INITIAL_CATEGORIES, INITIAL_PROFILE, CURRENCIES } from './constants.ts';
import Dashboard from './components/Dashboard.tsx';
import TransactionList from './components/TransactionList.tsx';
import ChartsView from './components/ChartsView.tsx';
import CategoryManager from './components/CategoryManager.tsx';
import SettingsView from './components/SettingsView.tsx';
import VaultView from './components/VaultView.tsx';
import { exportToExcel, importFromExcel } from './services/excelService.ts';
import { getFinancialTip } from './services/geminiService.ts';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('fin_track_state_v2');
    if (saved) return JSON.parse(saved);
    return {
      transactions: [],
      vaultTransactions: [],
      categories: INITIAL_CATEGORIES,
      profile: INITIAL_PROFILE
    };
  });

  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(() => {
    return localStorage.getItem('fin_track_onboarding_done') === 'true';
  });

  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(() => {
    return localStorage.getItem('fin_track_notifs_enabled') === 'true';
  });

  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [dailyTip, setDailyTip] = useState<string>('Loading financial wisdom...');
  const [showAddModal, setShowAddModal] = useState<TransactionType | null>(null);

  useEffect(() => {
    localStorage.setItem('fin_track_state_v2', JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (hasCompletedOnboarding) {
      getFinancialTip().then(setDailyTip);
    }
  }, [hasCompletedOnboarding]);

  const addTransaction = (t: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...t,
      id: Math.random().toString(36).substr(2, 9)
    };
    setState(prev => ({
      ...prev,
      transactions: [newTransaction, ...prev.transactions]
    }));
  };

  const addVaultTransaction = (t: Omit<Transaction, 'id'>) => {
    const newVaultTransaction: Transaction = {
      ...t,
      id: Math.random().toString(36).substr(2, 9)
    };

    setState(prev => {
      const updatedVault = [newVaultTransaction, ...prev.vaultTransactions];
      let updatedMain = prev.transactions;

      // If it's a deduction from vault, automatically add as an expense to main system
      if (t.type === 'vault_out') {
        const mainExpense: Transaction = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'expense',
          amount: t.amount,
          category: 'Vault Deduction',
          date: t.date,
          description: `Withdrawal from Vault: ${t.description || t.category}`
        };
        updatedMain = [mainExpense, ...prev.transactions];
      }

      return {
        ...prev,
        vaultTransactions: updatedVault,
        transactions: updatedMain
      };
    });
  };

  const deleteTransaction = (id: string) => {
    setState(prev => ({
      ...prev,
      transactions: prev.transactions.filter(t => t.id !== id)
    }));
  };

  const deleteVaultTransaction = (id: string) => {
    setState(prev => ({
      ...prev,
      vaultTransactions: prev.vaultTransactions.filter(t => t.id !== id)
    }));
  };

  const updateProfile = (profile: UserProfile) => {
    setState(prev => ({ ...prev, profile }));
  };

  const updateCategories = (categories: Categories) => {
    setState(prev => ({ ...prev, categories }));
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const imported = await importFromExcel(file);
        setState(prev => ({
          ...prev,
          ...imported
        }));
        alert("Data imported successfully!");
      } catch (err) {
        alert("Failed to import Excel file.");
      }
    }
  };

  const finishOnboarding = (profile: UserProfile, notifsOn: boolean) => {
    updateProfile(profile);
    setNotificationsEnabled(notifsOn);
    setHasCompletedOnboarding(true);
    localStorage.setItem('fin_track_onboarding_done', 'true');
    localStorage.setItem('fin_track_notifs_enabled', notifsOn ? 'true' : 'false');
  };

  if (!hasCompletedOnboarding) {
    return <Onboarding onComplete={finishOnboarding} />;
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: ReceiptText },
    { id: 'charts', label: 'Analytics', icon: PieChartIcon },
    { id: 'vault', label: 'Vault (Unusable)', icon: Lock },
    { id: 'categories', label: 'Categories', icon: Tags },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transition-all duration-500 ease-in-out transform lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full safe-top safe-bottom">
          <div className="p-6">
            <div className="flex items-center space-x-3 group cursor-pointer">
              <div className="p-2 bg-indigo-600 rounded-lg group-hover:rotate-12 transition-transform duration-300">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold tracking-tight">FinTrack Pro</h1>
            </div>
          </div>

          <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
            {navItems.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => { setActiveView(item.id as ViewType); setSidebarOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className={`flex items-center w-full px-4 py-3 text-sm font-medium transition-all duration-300 rounded-lg group animate-in fade-in slide-in-from-left-4 ${activeView === item.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
              >
                <item.icon className={`w-5 h-5 mr-3 transition-transform duration-300 group-hover:scale-110 ${activeView === item.id ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center space-x-3 mb-4 px-2">
              <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center border-2 border-slate-600 overflow-hidden transition-transform hover:scale-110">
                <User className="w-6 h-6 text-slate-300" />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold truncate">{state.profile.name}</p>
                <p className="text-xs text-slate-500">Member</p>
              </div>
            </div>
            <button onClick={() => exportToExcel(state)} className="flex items-center w-full px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all duration-300">
              <Download className="w-4 h-4 mr-2" />
              Backup Data
            </button>
            <label className="flex items-center w-full px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all duration-300 cursor-pointer">
              <Upload className="w-4 h-4 mr-2" />
              Restore
              <input type="file" onChange={handleImport} className="hidden" accept=".xlsx" />
            </label>
          </div>
        </div>
      </aside>

      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />}

      <main className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 pt-3 lg:px-8 shadow-sm safe-top">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3">
            <div className="flex items-center">
              <button onClick={() => setSidebarOpen(true)} className="p-2.5 mr-4 text-slate-600 lg:hidden hover:bg-slate-100 rounded-xl transition-colors">
                <Menu className="w-6 h-6" />
              </button>
              <h2 className="text-xl font-bold text-slate-800 capitalize tracking-tight">{activeView === 'vault' ? 'Financial Vault' : activeView}</h2>
            </div>

            <div className="flex flex-wrap items-center gap-2 md:gap-4">
              <div className="hidden sm:flex flex-col items-end mr-2 max-w-[200px]">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Daily Wisdom</span>
                <p className="text-xs font-medium text-indigo-600 italic truncate w-full text-right">{dailyTip}</p>
              </div>
              
              <div className="flex gap-2 w-full sm:w-auto">
                <button onClick={() => setShowAddModal('income')} className="flex-1 sm:flex-none flex items-center justify-center px-5 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all font-bold text-xs shadow-lg shadow-emerald-100">
                  <ArrowUp className="w-3.5 h-3.5 mr-1.5" />
                  Add Income
                </button>
                <button onClick={() => setShowAddModal('expense')} className="flex-1 sm:flex-none flex items-center justify-center px-5 py-3 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-all font-bold text-xs shadow-lg shadow-rose-100">
                  <ArrowDown className="w-3.5 h-3.5 mr-1.5" />
                  Add Expense
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-8 safe-bottom">
          <div className="max-w-7xl mx-auto pb-24 lg:pb-8">
            {activeView === 'dashboard' && <Dashboard state={state} />}
            {activeView === 'transactions' && <TransactionList state={state} onDelete={deleteTransaction} />}
            {activeView === 'charts' && <ChartsView state={state} />}
            {activeView === 'vault' && <VaultView state={state} onAdd={addVaultTransaction} onDelete={deleteVaultTransaction} />}
            {activeView === 'categories' && <CategoryManager state={state} onUpdate={updateCategories} />}
            {activeView === 'settings' && <SettingsView state={state} onUpdate={updateProfile} />}
          </div>
        </div>
      </main>

      {showAddModal && (
        <TransactionModal 
          initialType={showAddModal}
          onClose={() => setShowAddModal(null)} 
          onAdd={addTransaction}
          categories={state.categories}
          currency={state.profile.currency}
        />
      )}
    </div>
  );
};

const Onboarding: React.FC<{ onComplete: (profile: UserProfile, notifsOn: boolean) => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [permissions, setPermissions] = useState({
    storage: false,
    notifications: false,
    timedate: false
  });

  const requestStoragePersistence = async () => {
    if (navigator.storage && navigator.storage.persist) {
      const isPersisted = await navigator.storage.persist();
      setPermissions(p => ({ ...p, storage: isPersisted }));
    } else {
      setPermissions(p => ({ ...p, storage: !p.storage }));
    }
  };

  const requestNotifs = async () => {
    if ("Notification" in window) {
      const result = await Notification.requestPermission();
      setPermissions(p => ({ ...p, notifications: result === 'granted' }));
    } else {
      setPermissions(p => ({ ...p, notifications: !p.notifications }));
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-50 flex items-center justify-center p-4 z-[100] overflow-y-auto">
      <div className="max-w-xl w-full bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden relative my-auto">
        <div className="h-2 bg-slate-100 w-full absolute top-0">
          <div className="h-full bg-indigo-600 transition-all duration-700 ease-out" style={{ width: `${(step / 3) * 100}%` }} />
        </div>

        {step === 1 && (
          <div className="p-10 text-center space-y-8 animate-in fade-in slide-in-from-bottom-10">
            <div className="w-20 h-20 bg-indigo-600 rounded-3xl mx-auto flex items-center justify-center transform rotate-12 shadow-xl shadow-indigo-100">
              <Wallet className="w-10 h-10 text-white" />
            </div>
            <div className="space-y-3">
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">FinTrack Pro</h2>
              <p className="text-slate-500 font-medium">Professional-grade local finance management.</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center bg-white p-4 rounded-2xl border-2 border-slate-100 transition-all hover:border-indigo-100 shadow-sm focus-within:border-indigo-500">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center mr-4">
                  <User className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex-1 text-left">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Display Name</label>
                  <input type="text" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} placeholder="Enter your name" className="w-full bg-white text-black font-bold outline-none border-b-2 border-transparent focus:border-indigo-500 transition-all py-1" />
                </div>
              </div>
              <button onClick={() => setStep(2)} disabled={!profile.name.trim()} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-200 flex items-center justify-center disabled:opacity-50">
                Continue Setup <ChevronRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="p-10 space-y-8 animate-in fade-in slide-in-from-right-10">
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">System Access</h3>
              <p className="text-slate-500 text-sm font-medium">Optimize your experience on this device.</p>
            </div>
            <div className="space-y-3">
              <PermissionRow icon={Database} title="Storage Persistence" desc="Prevent browser from auto-clearing data." active={permissions.storage} onToggle={requestStoragePersistence} />
              <PermissionRow icon={Clock} title="Time & Date" desc="Sync for accurate transaction dating." active={permissions.timedate} onToggle={() => setPermissions(p => ({ ...p, timedate: !p.timedate }))} />
              <PermissionRow icon={Bell} title="10 PM Reminders" desc="Receive a notification before day ends." active={permissions.notifications} onToggle={requestNotifs} />
            </div>
            <button onClick={() => setStep(3)} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center">
              Verify Permissions <ChevronRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="p-10 text-center space-y-8 animate-in fade-in slide-in-from-right-10">
            <div className="w-20 h-20 bg-emerald-50 rounded-full mx-auto flex items-center justify-center shadow-inner shadow-emerald-100">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 animate-bounce" />
            </div>
            <div className="space-y-3">
              <h3 className="text-3xl font-black text-slate-800 tracking-tight">Main Currency</h3>
              <p className="text-slate-500 text-sm font-medium">Select your primary financial unit.</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {CURRENCIES.map(c => (
                <button key={c.symbol} onClick={() => setProfile({...profile, currency: c.symbol})} className={`p-5 rounded-2xl border-2 transition-all font-black text-xl ${profile.currency === c.symbol ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl' : 'bg-white text-slate-400 border-slate-100 hover:border-indigo-200'}`}>
                  {c.symbol}
                </button>
              ))}
            </div>
            <button onClick={() => onComplete(profile, permissions.notifications)} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-200">
              Launch Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const PermissionRow: React.FC<{ icon: any, title: string, desc: string, active: boolean, onToggle: () => void }> = ({ icon: Icon, title, desc, active, onToggle }) => (
  <button onClick={onToggle} className={`w-full flex items-center p-4 rounded-2xl border-2 transition-all text-left ${active ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-200'}`}>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${active ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400'}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div className="flex-1">
      <p className={`text-sm font-black uppercase tracking-wider ${active ? 'text-indigo-900' : 'text-slate-700'}`}>{title}</p>
      <p className="text-[10px] font-medium text-slate-400 leading-tight">{desc}</p>
    </div>
    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${active ? 'bg-indigo-600 border-indigo-600' : 'border-slate-200'}`}>
      {active && <CheckCircle2 className="w-4 h-4 text-white" />}
    </div>
  </button>
);

interface TransactionModalProps {
  initialType: TransactionType;
  onClose: () => void;
  onAdd: (t: Omit<Transaction, 'id'>) => void;
  categories: Categories;
  currency: string;
}

const TransactionModal: React.FC<TransactionModalProps> = ({ initialType, onClose, onAdd, categories, currency }) => {
  const [type, setType] = useState<TransactionType>(initialType);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(type === 'income' ? categories.income[0] : categories.expense[0]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');

  useEffect(() => {
    setCategory(type === 'income' ? categories.income[0] : categories.expense[0]);
  }, [type, categories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;
    onAdd({ type, amount: Number(amount), category, date: new Date(date).toISOString(), description });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-300 my-auto">
        <div className={`p-6 border-b border-slate-100 flex justify-between items-center ${type === 'income' ? 'bg-emerald-50/50' : 'bg-rose-50/50'}`}>
          <h3 className="text-xl font-bold text-slate-800">New {type === 'income' ? 'Income' : 'Expense'} Entry</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600"><X /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="flex p-1 bg-slate-100 rounded-2xl">
            <button type="button" onClick={() => setType('expense')} className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${type === 'expense' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500'}`}>Expense</button>
            <button type="button" onClick={() => setType('income')} className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${type === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}>Income</button>
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Value ({currency})</label>
            <input type="number" required value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none text-xl font-black" placeholder="0.00" step="0.01" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-5 py-3.5 bg-white border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none font-bold">
                {(type === 'income' ? categories.income : categories.expense).map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Entry Date</label>
              <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-5 py-3.5 bg-white border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none font-bold" />
            </div>
          </div>
          <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none text-sm font-bold" placeholder="Quick note" />
          <button type="submit" className={`w-full py-5 rounded-2xl font-black uppercase text-white shadow-xl ${type === 'income' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-100'}`}>Confirm Entry</button>
        </form>
      </div>
    </div>
  );
};

export default App;