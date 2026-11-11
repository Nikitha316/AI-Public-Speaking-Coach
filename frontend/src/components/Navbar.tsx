import React, { useState } from 'react';
import { 
  Mic, 
  LayoutDashboard, 
  PlayCircle, 
  History, 
  LineChart, 
  GitCompare, 
  CalendarCheck, 
  Bot, 
  Settings,
  Sparkles,
  User as UserIcon,
  LogIn,
  LogOut
} from 'lucide-react';
import { User } from '../types';
import { removeToken } from '../services/api';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onStartDemo: () => void;
  currentUser: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onStartDemo,
  currentUser,
  onOpenAuth,
  onLogout,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'practice', label: 'Practice', icon: PlayCircle },
    { id: 'history', label: 'History', icon: History },
    { id: 'progress', label: 'Progress', icon: LineChart },
    { id: 'compare', label: 'Compare', icon: GitCompare },
    { id: 'plan', label: 'Practice Plan', icon: CalendarCheck },
    { id: 'chat', label: 'AI Coach Assistant', icon: Bot },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 glass-card border-b border-slate-800 bg-dark-900/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('dashboard')} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-brand-cyan flex items-center justify-center text-white shadow-lg glow-indigo group-hover:scale-105 transition-transform">
            <Mic className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-brand-cyan bg-clip-text text-transparent">
              SPEAKER<span className="text-brand-500">.AI</span>
            </div>
            <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 -mt-1">
              Public Speaking Coach
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden xl:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-500/15 text-brand-500 border border-brand-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-brand-500' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Auth & Demo Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onStartDemo}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-brand-accent to-emerald-600 text-dark-900 font-semibold text-xs shadow-md glow-emerald hover:opacity-95 transition-all hover:scale-105"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Instant Demo
          </button>

          {currentUser && currentUser.email !== 'demo@speaker.ai' ? (
            <div className="flex items-center gap-2 bg-dark-800 border border-slate-700 px-3 py-1 rounded-xl text-xs">
              <UserIcon className="w-3.5 h-3.5 text-brand-400" />
              <span className="font-bold text-white hidden sm:inline">{currentUser.full_name || currentUser.email}</span>
              <button
                onClick={onLogout}
                title="Log Out"
                className="text-slate-400 hover:text-rose-400 ml-1 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-all"
            >
              <LogIn className="w-3.5 h-3.5 text-brand-cyan" />
              Sign In / Register
            </button>
          )}

          <button
            onClick={() => setActiveTab('practice')}
            className="hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium text-xs shadow-lg transition-all"
          >
            <PlayCircle className="w-4 h-4" />
            Start Practice
          </button>
        </div>
      </div>

      {/* Responsive Secondary Mobile Bar */}
      <div className="xl:hidden flex items-center gap-1 px-4 py-2 overflow-x-auto border-t border-slate-800/60 bg-dark-800/80">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
                isActive ? 'bg-brand-500/20 text-brand-500' : 'text-slate-400'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
