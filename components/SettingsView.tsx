
import React, { useState } from 'react';
import { AppState, UserProfile } from '../types';
import { CURRENCIES } from '../constants';
import { User, Globe, Save } from 'lucide-react';

interface SettingsViewProps {
  state: AppState;
  onUpdate: (profile: UserProfile) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ state, onUpdate }) => {
  const [name, setName] = useState(state.profile.name);
  const [currency, setCurrency] = useState(state.profile.currency);

  const handleSave = () => {
    onUpdate({ name, currency });
    alert("Profile saved successfully! ✨");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-10 hover:shadow-xl transition-all duration-500">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 rounded-2xl">
            <User className="w-6 h-6 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Account Preferences</h2>
        </div>

        <div className="space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-6 py-4 bg-white text-black border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none transition-all font-bold shadow-sm"
              placeholder="e.g. John Doe"
            />
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Preferred Currency</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {CURRENCIES.map(curr => (
                <button
                  key={curr.symbol}
                  onClick={() => setCurrency(curr.symbol)}
                  className={`flex items-center justify-between px-5 py-4 rounded-2xl border-2 transition-all duration-300 group ${currency === curr.symbol ? 'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-md' : 'border-slate-50 text-slate-500 hover:border-slate-100 hover:bg-slate-50'}`}
                >
                  <span className={`text-xl font-black group-hover:scale-125 transition-transform ${currency === curr.symbol ? 'text-indigo-600' : 'text-slate-400'}`}>{curr.symbol}</span>
                  <span className="text-xs font-black uppercase tracking-widest">{curr.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-6">
            <button
              onClick={handleSave}
              className="w-full flex items-center justify-center py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all duration-300 shadow-xl shadow-indigo-100 transform hover:-translate-y-1"
            >
              <Save className="w-5 h-5 mr-3" />
              Save All Changes
            </button>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white space-y-4 group overflow-hidden relative">
        <div className="relative z-10 flex items-center space-x-3 text-indigo-400">
          <Globe className="w-6 h-6 group-hover:rotate-45 transition-transform duration-500" />
          <h3 className="font-black uppercase tracking-widest">Privacy Guard</h3>
        </div>
        <p className="relative z-10 text-slate-400 text-sm font-medium leading-relaxed">
          FinTrack Pro operates with zero-knowledge architecture. Your financial data is encrypted and remains exclusively on this device.
        </p>
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-indigo-600/10 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
      </div>
    </div>
  );
};

export default SettingsView;
