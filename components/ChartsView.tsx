
import React, { useMemo, useState } from 'react';
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
  CartesianGrid
} from 'recharts';
import { MONTHS } from '../constants';
import { Download, Filter, FileSpreadsheet, PieChart as PieChartIcon, CalendarRange, ListChecks } from 'lucide-react';
import { exportToExcel, exportYearlyReport } from '../services/excelService';

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

    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
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

  const handleExportFiltered = () => {
    const monthName = filterMonth === 'all' ? 'All_Time' : MONTHS[filterMonth as number];
    const weekLabel = filterWeek === 'all' ? '' : `_Week_${filterWeek}`;
    const customLabel = `${monthName}${weekLabel}_Report`;
    exportToExcel(state, filteredTransactions, customLabel);
  };

  const handleExportYearly = () => {
    const currentYear = new Date().getFullYear();
    exportYearlyReport(state, currentYear);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Reports Center */}
      <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-8 hover:shadow-lg transition-all duration-500">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-indigo-50 rounded-2xl">
            <CalendarRange className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">Report Center</h2>
            <p className="text-sm text-slate-400 font-medium">Export monthly or weekly statements to Excel.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3 p-6 bg-slate-50 rounded-3xl border border-slate-100 group hover:border-indigo-100 transition-all duration-300">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">1. Select Month</label>
            <select 
              value={filterMonth} 
              onChange={e => setFilterMonth(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              className="w-full px-5 py-3 bg-white text-black border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-500 transition-all font-bold"
            >
              <option value="all">Every Month</option>
              {MONTHS.map((m, idx) => <option key={m} value={idx}>{m}</option>)}
            </select>
          </div>

          <div className="space-y-3 p-6 bg-slate-50 rounded-3xl border border-slate-100 group hover:border-indigo-100 transition-all duration-300">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">2. Select Week</label>
            <select 
              value={filterWeek} 
              onChange={e => setFilterWeek(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              className="w-full px-5 py-3 bg-white text-black border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-500 transition-all font-bold"
            >
              <option value="all">Full Month</option>
              <option value="1">Week 1 (1-7)</option>
              <option value="2">Week 2 (8-14)</option>
              <option value="3">Week 3 (15-21)</option>
              <option value="4">Week 4 (22-31)</option>
            </select>
          </div>

          <div className="flex flex-col gap-3 justify-end">
            <button 
              onClick={handleExportFiltered}
              disabled={filteredTransactions.length === 0}
              className="flex items-center justify-center px-6 py-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-100 font-bold group disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1"
            >
              <FileSpreadsheet className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" />
              Get Current Report
            </button>
            <button 
              onClick={handleExportYearly}
              className="flex items-center justify-center px-6 py-4 bg-slate-900 text-white rounded-2xl hover:bg-black transition-all duration-300 shadow-lg shadow-slate-200 font-bold group transform hover:-translate-y-1"
            >
              <ListChecks className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
              Full Yearly Report
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pie Chart */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm min-h-[450px] transition-all duration-500 hover:shadow-xl group">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-8 flex items-center">
            <div className="w-2 h-2 bg-rose-500 rounded-full mr-3 group-hover:scale-150 transition-transform"></div>
            Spending Distribution
          </h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={8}
                  dataKey="value"
                  animationDuration={1500}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => `${profile.currency}${value.toLocaleString()}`}
                  contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '1rem', fontWeight: 'bold' }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-10 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100 italic font-medium">
              <PieChartIcon className="w-12 h-12 mb-3 text-slate-200" />
              No data for this selection.
            </div>
          )}
        </div>

        {/* Bar Chart */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm min-h-[450px] transition-all duration-500 hover:shadow-xl group">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-8 flex items-center">
             <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3 group-hover:scale-150 transition-transform"></div>
             Category Overview
          </h3>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 'bold', fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 'bold', fill: '#94a3b8' }} />
                <Tooltip 
                   cursor={{ fill: '#f8fafc', radius: 12 }}
                   formatter={(value: number) => `${profile.currency}${value.toLocaleString()}`}
                   contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '1rem', fontWeight: 'bold' }}
                />
                <Legend iconType="circle" />
                <Bar dataKey="income" name="Earnings" fill="#10b981" radius={[8, 8, 8, 8]} barSize={20} />
                <Bar dataKey="expense" name="Spending" fill="#f43f5e" radius={[8, 8, 8, 8]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-10 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100 italic font-medium">
              <FileSpreadsheet className="w-12 h-12 mb-3 text-slate-200" />
              Insufficient data to compare.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChartsView;
