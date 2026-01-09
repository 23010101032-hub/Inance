import React, { useState, useEffect, useMemo } from 'react';
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
  Lock,
  TrendingUp,
  TrendingDown,
  Eye,
  EyeOff,
  ShieldAlert,
  Sparkles,
  CalendarDays,
  HandCoins,
  AlertTriangle,
  CalendarClock,
  Heart
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
import { getFinancialTip, analyzeExpensesAndGetTip } from './services/geminiService.ts';

const InanceLogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} fill="currentColor">
    <rect x="20" y="60" width="15" height="20" rx="4" />
    <rect x="42" y="45" width="15" height="35" rx="4" />
    <rect x="65" y="30" width="15" height="50" rx="4" />
    <path 
      d="M20 50 L42 35 L65 40 L85 20 M85 20 L75 20 M85 20 L85 30" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="8" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
  </svg>
);

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('inance_state_v1');
    if (saved) return JSON.parse(saved);
    return {
      transactions: [],
      vaultTransactions: [],
      categories: INITIAL_CATEGORIES,
      profile: INITIAL_PROFILE
    };
  });

  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(() => {
    return localStorage.getItem('inance_onboarding_done') === 'true';
  });

  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [dailyTip, setDailyTip] = useState<string>('Analyzing your habits...');
  const [showAddModal, setShowAddModal] = useState<TransactionType | null>(null);

  useEffect(() => {
    localStorage.setItem('inance_state_v1', JSON.stringify(state));
  }, [state]);

  const financialSummary = useMemo(() => {
    let income = 0;
    let expense = 0;
    let borrowed = 0;
    let vaultWithdrawalsAsIncome = 0;
    
    state.transactions.forEach(t => {
      if (t.type === 'income') income += t.amount;
      else if (t.type === 'borrowed') borrowed += t.amount;
      else if (t.type === 'expense') {
        if (t.category === 'Vault Deduction') {
          vaultWithdrawalsAsIncome += t.amount;
        } else {
          expense += t.amount;
        }
      }
    });

    let vaultBalance = 0;
    let vaultDeposits = 0;

    state.vaultTransactions.forEach(t => {
      if (t.type === 'vault_in') {
        vaultBalance += t.amount;
        vaultDeposits += t.amount;
      } else if (t.type === 'vault_out') {
        vaultBalance -= t.amount;
      }
    });

    return {
      income,
      expense,
      borrowed,
      usableBalance: (income + borrowed + vaultWithdrawalsAsIncome) - (expense + vaultDeposits),
      vaultBalance
    };
  }, [state.transactions, state.vaultTransactions]);

  useEffect(() => {
    if (!hasCompletedOnboarding) return;
    const runDailyAnalysis = async () => {
      const today = new Date().toDateString();
      const lastAnalysis = localStorage.getItem('inance_last_analysis_date');
      if (lastAnalysis !== today) {
        const analysisTip = await analyzeExpensesAndGetTip(state.transactions, state.profile.currency);
        setDailyTip(analysisTip);
        if (state.profile.notificationsEnabled && "Notification" in window && Notification.permission === "granted") {
          new Notification("Inance Daily Analysis", {
            body: analysisTip,
            icon: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>📈</text></svg>"
          });
        }
        localStorage.setItem('inance_last_analysis_date', today);
      } else {
        getFinancialTip().then(setDailyTip);
      }
    };
    runDailyAnalysis();
  }, [hasCompletedOnboarding, state.transactions, state.profile.notificationsEnabled, state.profile.currency]);

  useEffect(() => {
    if (!hasCompletedOnboarding || !state.profile.notificationsEnabled) return;
    const [targetHour, targetMinute] = state.profile.reminderTime.split(':').map(Number);
    let lastNotifiedDate = '';
    const reminderInterval = setInterval(() => {
      const now = new Date();
      if (now.getHours() === targetHour && now.getMinutes() === targetMinute && lastNotifiedDate !== now.toDateString()) {
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Inance Reminder", {
            body: `Hi ${state.profile.name}, time to log your transactions for today!`,
            icon: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>💰</text></svg>"
          });
          lastNotifiedDate = now.toDateString();
        }
      }
    }, 30000);
    return () => clearInterval(reminderInterval);
  }, [hasCompletedOnboarding, state.profile.notificationsEnabled, state.profile.reminderTime, state.profile.name]);

  const addTransaction = (t: Omit<Transaction, 'id'>) => {
    if (t.type === 'expense' && t.category !== 'Vault Deduction') {
      if (t.amount > financialSummary.usableBalance) {
        alert(`Insufficient Wallet Funds! Your usable balance is ${state.profile.currency}${financialSummary.usableBalance.toLocaleString()}.`);
        return;
      }
    }
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
    if (t.type === 'vault_in') {
      if (t.amount > financialSummary.usableBalance) {
        alert(`Insufficient Wallet Funds! You need ${state.profile.currency}${t.amount.toLocaleString()} in your wallet to deposit to the vault.`);
        return;
      }
    }
    if (t.type === 'vault_out' && t.amount > financialSummary.vaultBalance) {
      alert(`Vault Withdrawal Failed! Insufficient vault balance.`);
      return;
    }
    const newVaultTransaction: Transaction = {
      ...t,
      id: Math.random().toString(36).substr(2, 9)
    };
    setState(prev => {
      const updatedVault = [newVaultTransaction, ...prev.vaultTransactions];
      let updatedMain = prev.transactions;
      if (t.type === 'vault_out') {
        const mainLedgerEntry: Transaction = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'expense',
          amount: t.amount,
          category: 'Vault Deduction',
          date: t.date,
          description: `Withdrawal from Vault: ${t.description || t.category}`
        };
        updatedMain = [mainLedgerEntry, ...prev.transactions];
      }
      return { ...prev, vaultTransactions: updatedVault, transactions: updatedMain };
    });
  };

  const deleteTransaction = (id: string) => {
    setState(prev => ({ ...prev, transactions: prev.transactions.filter(t => t.id !== id) }));
  };

  const deleteVaultTransaction = (id: string) => {
    setState(prev => ({ ...prev, vaultTransactions: prev.vaultTransactions.filter(t => t.id !== id) }));
  };

  const updateProfile = (profile: UserProfile) => setState(prev => ({ ...prev, profile }));
  const updateCategories = (categories: Categories) => setState(prev => ({ ...prev, categories }));

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const imported = await importFromExcel(file);
        setState(prev => ({ ...prev, ...imported }));
        alert("Data imported successfully!");
      } catch (err) { alert("Failed to import Excel file."); }
    }
  };

  const finishOnboarding = (profile: UserProfile) => {
    setState(prev => ({ ...prev, profile }));
    setHasCompletedOnboarding(true);
    localStorage.setItem('inance_onboarding_done', 'true');
  };

  if (!hasCompletedOnboarding) return <Onboarding onComplete={finishOnboarding} />;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 md:w-72 bg-emerald-950 text-white transition-all duration-500 ease-in-out transform lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full safe-top safe-bottom">
          <div className="p-4 md:p-6">
            <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => setActiveView('dashboard')}>
              <div className="p-2 bg-emerald-500 rounded-lg group-hover:rotate-12 transition-transform duration-300">
                <InanceLogo className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <h1 className="text-lg md:text-xl font-bold tracking-tight uppercase">Inance</h1>
            </div>
          </div>
          <nav className="flex-1 px-3 md:px-4 space-y-1.5 md:space-y-2 overflow-y-auto">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'transactions', label: 'Transactions', icon: ReceiptText },
              { id: 'charts', label: 'Analytics', icon: PieChartIcon },
              { id: 'vault', label: 'Secure Vault', icon: ShieldAlert },
              { id: 'categories', label: 'Categories', icon: Tags },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveView(item.id as ViewType); setSidebarOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className={`flex items-center w-full px-4 py-2.5 md:py-3 text-xs md:text-sm font-medium transition-all duration-300 rounded-lg group ${activeView === item.id ? 'bg-emerald-600 text-white shadow-lg' : 'text-emerald-100/50 hover:bg-emerald-900/50 hover:text-white'}`}
              >
                <item.icon className={`w-4 h-4 md:w-5 md:h-5 mr-3 transition-transform duration-300 group-hover:scale-110 ${activeView === item.id ? 'text-white' : 'text-emerald-100/50 group-hover:text-white'}`} />
                {item.label}
              </button>
            ))}
          </nav>
          <div className="p-4 border-t border-emerald-900/50 space-y-2">
            <div className="flex items-center space-x-3 mb-4 px-2">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-emerald-900 flex items-center justify-center border-2 border-emerald-800 overflow-hidden">
                <User className="w-4 h-4 md:w-6 md:h-6 text-emerald-100/50" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs md:text-sm font-bold truncate">{state.profile.name}</p>
                <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-tighter">Verified User</p>
              </div>
            </div>
            <button onClick={() => exportToExcel(state)} className="flex items-center w-full px-4 py-2 text-[10px] md:text-sm font-medium text-emerald-100/40 hover:text-white hover:bg-emerald-900/50 rounded-lg transition-all duration-300">
              <Download className="w-3.5 h-3.5 md:w-4 md:h-4 mr-2" />
              Backup Data
            </button>
            <label className="flex items-center w-full px-4 py-2 text-[10px] md:text-sm font-medium text-emerald-100/40 hover:text-white hover:bg-emerald-900/50 rounded-lg transition-all duration-300 cursor-pointer">
              <Upload className="w-3.5 h-3.5 md:w-4 md:h-4 mr-2" />
              Restore
              <input type="file" onChange={handleImport} className="hidden" accept=".xlsx" />
            </label>
            
            {/* Signature Block */}
            <div className="mt-4 pt-4 border-t border-emerald-900/30 text-center group">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-900/20 rounded-full">
                <Heart className="w-2 h-2 text-emerald-500 fill-emerald-500 group-hover:scale-125 transition-transform" />
                <span className="text-[9px] font-black uppercase tracking-[0.25em] text-emerald-500/60 group-hover:text-emerald-400 transition-colors">
                  Made By Asif
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {isSidebarOpen && <div className="fixed inset-0 bg-emerald-950/50 z-40 lg:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />}

      <main className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-3 md:px-6 pt-3 lg:px-8 shadow-sm safe-top">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4 pb-3">
            <div className="flex items-center">
              <button onClick={() => setSidebarOpen(true)} className="p-2 mr-3 text-slate-600 lg:hidden hover:bg-slate-100 rounded-xl transition-colors">
                <Menu className="w-5 h-5 md:w-6 md:h-6" />
              </button>
              <h2 className="text-lg md:text-xl font-bold text-slate-800 capitalize tracking-tight">{activeView === 'vault' ? 'Private Ledger' : activeView}</h2>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-4 w-full md:w-auto">
              <div className="flex items-center bg-emerald-50 px-3 md:px-4 py-1.5 md:py-2 rounded-xl border border-emerald-100 max-w-full sm:max-w-[300px] lg:max-w-[400px]">
                <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-emerald-600 mr-2 md:mr-3 flex-shrink-0 animate-pulse" />
                <div className="overflow-hidden">
                  <span className="text-[8px] md:text-[10px] font-black text-emerald-700 uppercase tracking-widest block leading-none mb-0.5 md:mb-1">AI Insights</span>
                  <p className="text-[10px] md:text-xs font-bold text-emerald-900 italic truncate">{dailyTip}</p>
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar pb-1 sm:pb-0">
                <button onClick={() => setShowAddModal('income')} className="flex-shrink-0 flex items-center justify-center px-4 md:px-5 py-2.5 md:py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all font-bold text-[10px] md:text-xs shadow-lg shadow-emerald-100">
                  <ArrowDown className="w-3 h-3 md:w-3.5 md:h-3.5 mr-1 md:mr-1.5" />
                  Income
                </button>
                <button onClick={() => setShowAddModal('borrowed')} className="flex-shrink-0 flex items-center justify-center px-4 md:px-5 py-2.5 md:py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-bold text-[10px] md:text-xs shadow-lg shadow-indigo-100">
                  <HandCoins className="w-3 h-3 md:w-3.5 md:h-3.5 mr-1 md:mr-1.5" />
                  Borrow
                </button>
                <button onClick={() => setShowAddModal('expense')} className="flex-shrink-0 flex items-center justify-center px-4 md:px-5 py-2.5 md:py-3 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-all font-bold text-[10px] md:text-xs shadow-lg shadow-rose-100">
                  <ArrowUp className="w-3 h-3 md:w-3.5 md:h-3.5 mr-1 md:mr-1.5" />
                  Expense
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="p-3 md:p-6 lg:p-8 safe-bottom">
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
          profile={state.profile}
          financialSummary={financialSummary}
        />
      )}
    </div>
  );
};

const Onboarding: React.FC<{ onComplete: (profile: UserProfile) => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [permissions, setPermissions] = useState({ storage: false, notifications: false, timedate: false });

  const requestStoragePersistence = async () => {
    if (navigator.storage && navigator.storage.persist) {
      const isPersisted = await navigator.storage.persist();
      setPermissions(p => ({ ...p, storage: isPersisted }));
    } else {
      setPermissions(p => ({ ...p, storage: !p.storage }));
    }
  };

  const requestNotifs = async () => {
    if (!permissions.notifications && "Notification" in window) {
      const result = await Notification.requestPermission();
      if (result === 'granted') {
        setPermissions(p => ({ ...p, notifications: true }));
        setProfile(prev => ({ ...prev, notificationsEnabled: true }));
      }
    } else {
      setPermissions(p => ({ ...p, notifications: !p.notifications }));
      setProfile(prev => ({ ...prev, notificationsEnabled: !prev.notificationsEnabled }));
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-50 flex items-center justify-center p-3 md:p-4 z-[100] overflow-y-auto">
      <div className="max-w-xl w-full bg-white rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden relative my-auto">
        <div className="h-1.5 md:h-2 bg-slate-100 w-full absolute top-0">
          <div className="h-full bg-emerald-600 transition-all duration-700 ease-out" style={{ width: `${(step / 3) * 100}%` }} />
        </div>
        {step === 1 && (
          <div className="p-6 md:p-10 text-center space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-10">
            <div className="w-16 h-16 md:w-24 md:h-24 bg-emerald-600 rounded-3xl mx-auto flex items-center justify-center p-3 md:p-4 rotate-12">
              <InanceLogo className="w-full h-full text-white" />
            </div>
            <div className="space-y-2 md:space-y-3">
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight uppercase">Inance</h2>
              <p className="text-xs md:text-sm text-slate-500 font-medium">Experience the growth in your finance.</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center bg-white p-3 md:p-4 rounded-xl border-2 border-slate-100 focus-within:border-emerald-500 shadow-sm">
                <User className="w-4 h-4 md:w-5 md:h-5 text-emerald-600 mr-3 md:mr-4" />
                <div className="flex-1 text-left">
                  <label className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest block">Display Name</label>
                  <input type="text" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} placeholder="Enter your name" className="w-full bg-white text-black font-bold outline-none text-sm md:text-base" />
                </div>
              </div>
              <button onClick={() => setStep(2)} disabled={!profile.name.trim()} className="w-full py-4 md:py-5 bg-emerald-950 text-white rounded-xl font-black uppercase tracking-widest text-[10px] md:text-xs shadow-xl flex items-center justify-center disabled:opacity-50">
                Continue Setup <ChevronRight className="w-4 h-4 md:w-5 md:h-5 ml-2" />
              </button>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="p-6 md:p-10 space-y-6 md:space-y-8 animate-in fade-in slide-in-from-right-10">
            <div className="space-y-1 md:space-y-2">
              <h3 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">System Access</h3>
              <p className="text-slate-500 text-xs md:text-sm font-medium">Inance requires local device integration for optimal performance.</p>
            </div>
            <div className="space-y-2.5 md:space-y-3">
              <PermissionRow icon={Database} title="Secure Storage" desc="Persistently store and backup your data locally." active={permissions.storage} onToggle={requestStoragePersistence} />
              <div className="space-y-2">
                <PermissionRow icon={Bell} title="Smart Alerts" desc="Enable browser-led reminders for logging data." active={permissions.notifications} onToggle={requestNotifs} />
                {permissions.notifications && (
                  <div className="mx-1 md:mx-2 p-4 md:p-5 bg-emerald-50 rounded-xl border border-emerald-100 space-y-3 shadow-inner">
                    <div className="flex items-center justify-between">
                      <div className="text-[8px] md:text-[10px] font-black text-emerald-700 uppercase tracking-widest block">Reminder Window</div>
                      <Clock className="w-4 h-4 md:w-5 md:h-5 text-emerald-600" />
                    </div>
                    <input type="time" value={profile.reminderTime} onChange={e => setProfile({...profile, reminderTime: e.target.value})} className="w-full bg-white border-2 border-emerald-200 rounded-xl px-4 py-2 md:py-3 font-black text-emerald-900 outline-none focus:border-emerald-500 text-sm md:text-lg" />
                  </div>
                )}
              </div>
              <PermissionRow icon={CalendarDays} title="Temporal Accuracy" desc="Enable real-time data sync with local clock." active={permissions.timedate} onToggle={() => setPermissions(p => ({ ...p, timedate: !p.timedate }))} />
            </div>

            <div className="p-4 md:p-5 bg-emerald-50 rounded-2xl md:rounded-[2rem] border-2 border-emerald-100 flex items-start gap-4 shadow-sm">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm border border-emerald-100">
                <ShieldCheck className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" />
              </div>
              <div className="space-y-1">
                <h4 className="text-[10px] md:text-xs font-black text-emerald-900 uppercase tracking-widest">Hardware Privacy Protocol</h4>
                <p className="text-[9px] md:text-[10px] font-bold text-emerald-700/70 leading-relaxed">
                  Inance strictly avoids media access (Camera/Mic). No hardware sensors are engaged. All financial calculations remain 100% local.
                </p>
              </div>
            </div>

            <button onClick={() => setStep(3)} className="w-full py-4 md:py-5 bg-emerald-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] md:text-xs shadow-xl flex items-center justify-center">
              Confirm Configuration <ChevronRight className="w-4 h-4 md:w-5 md:h-5 ml-2" />
            </button>
          </div>
        )}
        {step === 3 && (
          <div className="p-6 md:p-10 text-center space-y-6 md:space-y-8 animate-in fade-in slide-in-from-right-10">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-emerald-50 rounded-full mx-auto flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-10 h-10 md:w-12 md:h-12 text-emerald-600 animate-bounce" />
            </div>
            <div className="space-y-2 md:space-y-3">
              <h3 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Financial Unit</h3>
              <p className="text-slate-500 text-xs md:text-sm font-medium">Select your primary trading currency.</p>
            </div>
            <div className="grid grid-cols-3 gap-2 md:gap-3">
              {CURRENCIES.map(c => (
                <button key={c.symbol} onClick={() => setProfile({...profile, currency: c.symbol})} className={`p-4 md:p-5 rounded-xl border-2 transition-all font-black text-lg ${profile.currency === c.symbol ? 'bg-emerald-600 text-white border-emerald-600 shadow-xl' : 'bg-white text-slate-400 border-slate-100 hover:border-emerald-200'}`}>{c.symbol}</button>
              ))}
            </div>
            <button onClick={() => onComplete(profile)} className="w-full py-4 md:py-5 bg-emerald-950 text-white rounded-xl font-black uppercase tracking-widest text-[10px] md:text-xs hover:bg-black transition-all shadow-xl">Launch Inance</button>
          </div>
        )}
      </div>
    </div>
  );
};

const PermissionRow: React.FC<{ icon: any, title: string, desc: string, active: boolean, onToggle: () => void }> = ({ icon: Icon, title, desc, active, onToggle }) => (
  <button onClick={onToggle} className={`w-full flex items-center p-4 md:p-5 rounded-xl border-2 transition-all text-left ${active ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-100'}`}>
    <div className={`w-10 h-10 md:w-14 md:h-14 rounded-xl flex items-center justify-center mr-3 md:mr-5 flex-shrink-0 ${active ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`}>
      <Icon className="w-5 h-5 md:w-7 md:h-7" />
    </div>
    <div className="flex-1 min-w-0">
      <p className={`text-[10px] md:text-sm font-black uppercase tracking-wider truncate ${active ? 'text-emerald-900' : 'text-slate-700'}`}>{title}</p>
      <p className="text-[8px] md:text-[10px] font-medium text-slate-400 leading-tight pr-2 line-clamp-2">{desc}</p>
    </div>
    <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${active ? 'bg-emerald-600 border-emerald-600' : 'border-slate-200'}`}>
      {active && <CheckCircle2 className="w-3.5 h-3.5 md:w-5 md:h-5 text-white" strokeWidth={3} />}
    </div>
  </button>
);

interface TransactionModalProps {
  initialType: TransactionType;
  onClose: () => void;
  onAdd: (t: Omit<Transaction, 'id'>) => void;
  categories: Categories;
  profile: UserProfile;
  financialSummary: { usableBalance: number; vaultBalance: number };
}

const TransactionModal: React.FC<TransactionModalProps> = ({ initialType, onClose, onAdd, categories, profile, financialSummary }) => {
  const [type, setType] = useState<TransactionType>(initialType);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [borrowedFrom, setBorrowedFrom] = useState('');
  const [repayDate, setRepayDate] = useState('');

  useEffect(() => {
    if (type === 'income') setCategory(categories.income[0]);
    else if (type === 'borrowed') setCategory('Loan/Debt');
    else setCategory(categories.expense[0]);
  }, [type, categories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(amount);
    if (!amount || isNaN(val)) return;

    if (type === 'expense') {
      if (category === 'Vault Deduction') {
      } else {
        if (val > financialSummary.usableBalance) {
          alert(`Insufficient Funds! Your current usable balance is ${profile.currency}${financialSummary.usableBalance.toLocaleString()}.`);
          return;
        }
      }
    }

    onAdd({ 
      type, 
      amount: val, 
      category, 
      date: new Date(date).toISOString(), 
      description,
      borrowedFrom: type === 'borrowed' ? borrowedFrom : undefined,
      repayDate: type === 'borrowed' ? (repayDate ? new Date(repayDate).toISOString() : undefined) : undefined
    });
    onClose();
  };

  const isExpense = type === 'expense';
  const valNum = Number(amount) || 0;
  const showVaultWarning = isExpense && category === 'Vault Deduction' && valNum > financialSummary.vaultBalance;
  const showBalanceWarning = isExpense && category !== 'Vault Deduction' && valNum > financialSummary.usableBalance;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 md:p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto">
      <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-300 my-auto">
        <div className={`p-5 md:p-6 border-b border-slate-100 flex justify-between items-center ${type === 'income' ? 'bg-emerald-50/50' : type === 'borrowed' ? 'bg-indigo-50/50' : 'bg-rose-50/50'}`}>
          <h3 className="text-lg md:text-xl font-bold text-slate-800">New {type.charAt(0).toUpperCase() + type.slice(1)}</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-4 md:space-y-6">
          <div className="flex p-1 bg-slate-100 rounded-xl md:rounded-2xl">
            <button type="button" onClick={() => setType('expense')} className={`flex-1 py-2.5 md:py-3 text-[10px] md:text-xs font-black rounded-lg md:rounded-xl transition-all ${type === 'expense' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500'}`}>EXPENSE</button>
            <button type="button" onClick={() => setType('income')} className={`flex-1 py-2.5 md:py-3 text-[10px] md:text-xs font-black rounded-lg md:rounded-xl transition-all ${type === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}>INCOME</button>
            <button type="button" onClick={() => setType('borrowed')} className={`flex-1 py-2.5 md:py-3 text-[10px] md:text-xs font-black rounded-lg md:rounded-xl transition-all ${type === 'borrowed' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>DEBT</button>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1 md:mb-2">
              <label className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest block">Value ({profile.currency})</label>
              <div className="flex gap-3">
                {isExpense && category === 'Vault Deduction' && <span className="text-[8px] md:text-[10px] font-bold text-indigo-400 uppercase">Vault: {profile.currency}{financialSummary.vaultBalance.toLocaleString()}</span>}
                {isExpense && category !== 'Vault Deduction' && <span className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase">Usable: {profile.currency}{financialSummary.usableBalance.toLocaleString()}</span>}
              </div>
            </div>
            <input 
              type="number" 
              required 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)} 
              className={`w-full px-5 md:px-6 py-3 md:py-4 bg-white border-2 rounded-xl outline-none text-lg md:text-xl font-black transition-all ${showBalanceWarning || showVaultWarning ? 'border-rose-400 bg-rose-50/20' : 'border-slate-100 focus:border-emerald-500'}`} 
              placeholder="0.00" 
              step="0.01" 
            />
            {(showBalanceWarning || showVaultWarning) && (
              <p className="text-[9px] md:text-[10px] text-rose-600 font-bold mt-2 flex items-center animate-pulse"><AlertTriangle className="w-3 h-3 mr-1" /> Insufficient funds!</p>
            )}
          </div>

          {type === 'borrowed' && (
            <div className="space-y-4 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 animate-in slide-in-from-top-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[8px] md:text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1 md:mb-2 block">Borrowed From</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-indigo-300" />
                    <input 
                      type="text" 
                      required
                      value={borrowedFrom} 
                      onChange={e => setBorrowedFrom(e.target.value)} 
                      className="w-full pl-9 pr-4 py-2.5 bg-white border border-indigo-100 rounded-xl outline-none text-xs font-bold focus:border-indigo-500" 
                      placeholder="Lender's Name" 
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[8px] md:text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1 md:mb-2 block">Repay By</label>
                  <div className="relative">
                    <CalendarClock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-indigo-300" />
                    <input 
                      type="date" 
                      value={repayDate} 
                      onChange={e => setRepayDate(e.target.value)} 
                      className="w-full pl-9 pr-4 py-2.5 bg-white border border-indigo-100 rounded-xl outline-none text-xs font-bold focus:border-indigo-500" 
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 md:mb-2 block">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 md:px-5 py-2.5 md:py-3.5 bg-white border-2 border-slate-100 rounded-xl focus:border-emerald-500 outline-none font-bold text-xs md:text-sm">
                {type === 'income' ? categories.income.map(cat => <option key={cat} value={cat}>{cat}</option>) :
                 type === 'borrowed' ? <option value="Loan/Debt">Loan / Debt</option> :
                 categories.expense.map(cat => (
                    <option key={cat} value={cat} disabled={cat === 'Vault Deduction' && financialSummary.vaultBalance < valNum}>
                      {cat} {cat === 'Vault Deduction' ? `(Vault Funds)` : ''}
                    </option>
                 ))}
              </select>
            </div>
            <div>
              <label className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 md:mb-2 block">Entry Date</label>
              <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-4 md:px-5 py-2.5 md:py-3.5 bg-white border-2 border-slate-100 rounded-xl focus:border-emerald-500 outline-none font-bold text-xs md:text-sm" />
            </div>
          </div>
          <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-5 md:px-6 py-3 md:py-4 bg-white border-2 border-slate-100 rounded-xl outline-none text-[11px] md:text-sm font-bold" placeholder="Quick note" />
          <button type="submit" disabled={showBalanceWarning || showVaultWarning || valNum <= 0} className={`w-full py-4 md:py-5 rounded-xl font-black uppercase text-[10px] md:text-xs text-white shadow-xl disabled:opacity-50 transition-all ${type === 'income' ? 'bg-emerald-600 hover:bg-emerald-700' : type === 'borrowed' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-rose-600 hover:bg-rose-700'}`}>Confirm Entry</button>
        </form>
      </div>
    </div>
  );
};

export default App;