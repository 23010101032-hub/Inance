import React, { useState } from 'react';
import { AppState, UserProfile } from '../types';
import { CURRENCIES } from '../constants';
import { User, Globe, Save, Bell, Clock, BellOff, ShieldCheck } from 'lucide-react';

interface SettingsViewProps {
  state: AppState;
  onUpdate: (profile: UserProfile) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ state, onUpdate }) => {
  const [profile, setProfile] = useState<UserProfile>(state.profile);

  const handleSave = () => {
    onUpdate(profile);
    alert("Profile saved successfully! ✨");
  };

  const toggleNotifications = async () => {
    if (!profile.notificationsEnabled) {
      if ("Notification" in window) {
        const result = await Notification.requestPermission();
        if (result !== 'granted') {
          alert("Please enable notifications in your browser settings to use this feature.");
          return;
        }
      }
    }
    setProfile({ ...profile, notificationsEnabled: !profile.notificationsEnabled });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="bg-white p-8 lg:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-10 hover:shadow-xl transition-all duration-500">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 rounded-2xl">
            <User className="w-6 h-6 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Account Preferences</h2>
        </div>

        <div className="space-y-8">
          {/* Identity Section */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Your Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full px-6 py-4 bg-white text-black border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none transition-all font-bold shadow-sm"
              placeholder="e.g. John Doe"
            />
          </div>

          {/* Notifications Section */}
          <div className="bg-slate-50 p-6 lg:p-8 rounded-[2rem] border border-slate-100 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-2xl transition-colors ${profile.notificationsEnabled ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                  {profile.notificationsEnabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Daily Reminders</h3>
                  <p className="text-xs text-slate-500 font-medium">Log your daily expenses.</p>
                </div>
              </div>
              <button
                onClick={toggleNotifications}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${profile.notificationsEnabled ? 'bg-indigo-600' : 'bg-slate-300'}`}
              >
                <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-300 ${profile.notificationsEnabled ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>

            {profile.notificationsEnabled && (
              <div className="pt-4 border-t border-slate-200 animate-in fade-in slide-in-from-top-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Reminder Time</label>
                <div className="flex items-center space-x-4">
                  <div className="relative flex-1">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="time"
                      value={profile.reminderTime}
                      onChange={(e) => setProfile({ ...profile, reminderTime: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none font-black text-lg transition-all"
                    />
                  </div>
                  <p className="text-xs font-bold text-slate-400 max-w-[120px] leading-tight uppercase tracking-tight">Set your ideal daily check-in time.</p>
                </div>
              </div>
            )}
          </div>

          {/* Currency Section */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Preferred Currency</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {CURRENCIES.map(curr => (
                <button
                  key={curr.symbol}
                  onClick={() => setProfile({ ...profile, currency: curr.symbol })}
                  className={`flex items-center justify-between px-5 py-4 rounded-2xl border-2 transition-all duration-300 group ${profile.currency === curr.symbol ? 'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-md' : 'border-slate-50 text-slate-500 hover:border-slate-100 hover:bg-slate-50'}`}
                >
                  <span className={`text-xl font-black group-hover:scale-125 transition-transform ${profile.currency === curr.symbol ? 'text-indigo-600' : 'text-slate-400'}`}>{curr.symbol}</span>
                  <span className="text-xs font-black uppercase tracking-widest">{curr.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-6">
            <button
              onClick={handleSave}
              className="w-full flex items-center justify-center py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all duration-300 shadow-xl shadow-indigo-100 transform hover:-translate-y-1 active:scale-95"
            >
              <Save className="w-5 h-5 mr-3" />
              Save All Changes
            </button>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white space-y-6 group overflow-hidden relative shadow-xl">
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-indigo-600/10 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
        
        <div className="relative z-10 flex items-center space-x-3 text-indigo-400">
          <Globe className="w-6 h-6 group-hover:rotate-45 transition-transform duration-500" />
          <h3 className="font-black uppercase tracking-widest">Privacy Guard Registry</h3>
        </div>
        
        <p className="relative z-10 text-slate-400 text-sm font-medium leading-relaxed">
          Inance operates with zero-knowledge architecture. Your preferences and notification schedules are managed directly by your browser's local sandbox.
        </p>

        <div className="relative z-10 flex items-center p-4 bg-indigo-950/50 rounded-2xl border border-indigo-900/50 gap-4">
          <ShieldCheck className="w-8 h-8 text-indigo-500 flex-shrink-0" />
          <div>
            <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Hardware Isolation</p>
            <p className="text-[10px] text-slate-500 font-bold">Camera and Microphone access are strictly avoided by design.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;