
import React, { useMemo, useState, useEffect } from 'react';
import { AppState, Transaction } from '../types';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList
} from 'recharts';
import { MONTHS } from '../constants';
import { FileSpreadsheet, PieChart as PieChartIcon, CalendarRange, BrainCircuit, TrendingUp, TrendingDown } from 'lucide-react';
import { exportToExcel, exportYearlyReport } from '../services/excelService';
import { analyzeExpensesAndGetTip } from '../services/geminiService';

interface ChartsViewProps {
  state: AppState;
}

const COLORS = [
  '#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6', 
  '#ec4899', '#06b6d4', '#14b8a6', '#f97316', '#3b82f6'
];

const ChartsView: React.FC<ChartsViewProps> = ({ state }) => {
  const { transactions, profile } = state;
  const [filterMonth, setFilterMonth] = useState<number | 'all'>(new Date().getMonth());
  const [filterWeek, setFilterWeek] = useState<number | 'all'>('all');
  const [aiInsight, setAiInsight] = useState<string>('Analyzing current selection...');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const date = new Date(t.date);
      const matchesMonth = filterMonth === 'all' || date.getMonth() === filterMonth;
      const matchesWeek = filterWeek === 'all' || Math.ceil(date.getDate() / 7) === filterWeek;
      return matchesMonth && matchesWeek;
    });
  }, [transactions, filterMonth, filterWeek]);

  const pieData = useMemo(() => {
    const expenses = filteredTransactions.filter(t => t.type === 'expense');
    const grouped = expenses.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  const barData = useMemo(() => {
    const incomeData = filteredTransactions.filter(t => t.type === 'income');
    const expenseData = filteredTransactions.filter(t => t.type === 'expense');
    const allCategories = Array.from(new Set(filteredTransactions.map(t => t.category)));
    
    return allCategories.map(cat => ({
      name: cat,
      income: incomeData.filter(t => t.category === cat).reduce((sum, t) => sum + t.amount, 0),
      expense: expenseData.filter(t => t.category === cat).reduce((sum, t) => sum + t.amount, 0),
    })).filter(d => d.income > 0 || d.expense > 0);
  }, [filteredTransactions]);

  useEffect(() => {
    if (filteredTransactions.length > 0) {
      setIsAnalyzing(true);
      analyzeExpensesAndGetTip(filteredTransactions, profile.currency).then(res => {
        setAiInsight(res);
        setIsAnalyzing(false);
      });
    } else {
      setAiInsight('Add more transactions to unlock AI-powered saving insights.');
    }
  }, [filteredTransactions, profile.currency]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Premium Analysis Header */}
      <div className="bg-emerald-950 rounded-[3rem] p-8 text-white relative overflow-hidden shadow-2xl border border-emerald-900 group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:scale-110 transition-transform duration-1000" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-500/5 rounded-full -ml-20 -mb-20 blur-2xl" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="p-6 bg-emerald-800 rounded-[2.5rem] shadow-2xl shadow-emerald-900/50 relative overflow-hidden group/icon">
            <BrainCircuit className={`w-12 h-12 text-emerald-300 relative z-10 ${isAnalyzing ? 'animate-pulse' : 'group-hover/icon:scale-110 transition-transform'}`} />
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-transparent" />
          </div>
          <div className="flex-1 text-center md:text-left space-y-2">
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-400">Financial Intelligence</h3>
            <p className={`text-xl font-bold leading-snug transition-opacity duration-500 ${isAnalyzing ? 'opacity-40' : 'opacity-100'}`}>
              {aiInsight}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center justify-center p-5 bg-emerald-900/40 rounded-[1.5rem] border border-emerald-800/50 backdrop-blur-sm min-w-[130px]">
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Inflow</span>
              <span className="text-xl font-black text-emerald-400">
                {profile.currency}{barData.reduce((acc, d) => acc + d.income, 0).toLocaleString()}
              </span>
            </div>
            <div className="flex flex-col items-center justify-center p-5 bg-emerald-900/40 rounded-[1.5rem] border border-emerald-800/50 backdrop-blur-sm min-w-[130px]">
              <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">Outflow</span>
              <span className="text-xl font-black text-rose-400">
                {profile.currency}{barData.reduce((acc, d) => acc + d.expense, 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3.5 bg-indigo-50 rounded-2xl">
              <CalendarRange className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Scope Explorer</h2>
              <p className="text-sm text-slate-400 font-medium">Filter by month and week for detailed analysis.</p>
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
             <button onClick={() => exportToExcel(state, filteredTransactions)} className="flex-1 md:flex-none flex items-center justify-center px-6 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-black transition-all shadow-xl shadow-slate-200">
               <FileSpreadsheet className="w-4 h-4 mr-2" />
               Export Selection
             </button>
             <button onClick={() => exportYearlyReport(state, new Date().getFullYear())} className="flex-1 md:flex-none flex items-center justify-center px-6 py-4 bg-white text-slate-900 border-2 border-slate-100 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all">
               Yearly Backup
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Month Selector</label>
            <select 
              value={filterMonth} 
              onChange={e => setFilterMonth(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              className="w-full px-6 py-4 bg-slate-50 text-black border-2 border-slate-100 rounded-[1.5rem] outline-none focus:border-indigo-500 transition-all font-bold appearance-none cursor-pointer"
            >
              <option value="all">Every Month</option>
              {MONTHS.map((m, idx) => <option key={m} value={idx}>{m}</option>)}
            </select>
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Weekly Precision</label>
            <select 
              value={filterWeek} 
              onChange={e => setFilterWeek(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              className="w-full px-6 py-4 bg-slate-50 text-black border-2 border-slate-100 rounded-[1.5rem] outline-none focus:border-indigo-500 transition-all font-bold appearance-none cursor-pointer"
            >
              <option value="all">Full Month Scope</option>
              <option value="1">Week 1 (1-7)</option>
              <option value="2">Week 2 (8-14)</option>
              <option value="3">Week 3 (15-21)</option>
              <option value="4">Week 4 (22-31)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pie Chart Analysis */}
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm min-h-[500px] flex flex-col group hover:shadow-2xl transition-all duration-500">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em] flex items-center">
              <div className="w-3 h-3 bg-rose-500 rounded-full mr-4 group-hover:scale-125 transition-transform" />
              Allocation Strategy
            </h3>
            <PieChartIcon className="w-5 h-5 text-slate-200" />
          </div>
          <div className="flex-1">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={90}
                    outerRadius={140}
                    paddingAngle={6}
                    dataKey="value"
                    animationDuration={1200}
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                    <LabelList 
                      dataKey="name" 
                      position="outside" 
                      offset={15} 
                      className="text-[10px] font-black fill-slate-400 uppercase tracking-tighter"
                    />
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`${profile.currency}${value.toLocaleString()}`, 'Total Cost']}
                    contentStyle={{ borderRadius: '2rem', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '1.5rem', fontWeight: 'bold' }}
                    itemStyle={{ fontSize: '12px' }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle" 
                    iconSize={8}
                    wrapperStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', paddingTop: '20px', opacity: 0.6 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 p-12 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-100 italic space-y-4">
                <PieChartIcon className="w-16 h-16 opacity-20" />
                <p className="font-black uppercase tracking-widest text-[10px]">No expense data for this selection</p>
              </div>
            )}
          </div>
        </div>

        {/* Bar Chart Analysis */}
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm min-h-[500px] flex flex-col group hover:shadow-2xl transition-all duration-500">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em] flex items-center">
              <div className="w-3 h-3 bg-emerald-500 rounded-full mr-4 group-hover:scale-125 transition-transform" />
              Comparative Flow
            </h3>
            <div className="flex gap-2">
              <div className="flex items-center space-x-1.5 px-3 py-1 bg-emerald-50 rounded-full">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                <span className="text-[8px] font-black text-emerald-700 uppercase">In</span>
              </div>
              <div className="flex items-center space-x-1.5 px-3 py-1 bg-rose-50 rounded-full">
                <div className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                <span className="text-[8px] font-black text-rose-700 uppercase">Out</span>
              </div>
            </div>
          </div>
          <div className="flex-1">
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="10 10" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    // Fixed: removed textTransform from SVGProps compliant object
                    tick={{ fontSize: 10, fontWeight: '900', fill: '#cbd5e1' }} 
                    tickFormatter={(value) => String(value).toUpperCase()}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: '900', fill: '#cbd5e1' }} 
                  />
                  <Tooltip 
                     cursor={{ fill: '#f8fafc', radius: 12 }}
                     formatter={(value: number) => [`${profile.currency}${value.toLocaleString()}`, '']}
                     contentStyle={{ borderRadius: '2rem', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '1.5rem', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="income" fill="#10b981" radius={[10, 10, 10, 10]} barSize={24} />
                  <Bar dataKey="expense" fill="#f43f5e" radius={[10, 10, 10, 10]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 p-12 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-100 italic space-y-4">
                <TrendingUp className="w-16 h-16 opacity-20" />
                <p className="font-black uppercase tracking-widest text-[10px]">Awaiting transaction flow</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartsView;
