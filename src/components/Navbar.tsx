import React from 'react';
import { 
  Bot, 
  LayoutDashboard, 
  Search, 
  MessageSquare, 
  ScrollText, 
  Settings, 
  Play, 
  Square, 
  RefreshCw,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isPolling: boolean;
  botUsername?: string;
  botFirstName?: string;
  onTogglePolling: (start: boolean) => void;
  onRefreshStatus: () => void;
  isRefreshing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isPolling,
  botUsername,
  botFirstName,
  onTogglePolling,
  onRefreshStatus,
  isRefreshing,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-bold text-lg text-white tracking-wide">TG PANEL</h1>
                <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full font-mono">
                  v2.0
                </span>
              </div>
              <p className="text-xs text-slate-400">Telegram Lookup Bot Manager & API Hub</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/50">
            <button
              id="nav-dashboard"
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              id="nav-tester"
              onClick={() => setActiveTab('tester')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'tester'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Direct Lookup</span>
            </button>

            <button
              id="nav-simulator"
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'simulator'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Bot Simulator</span>
            </button>

            <button
              id="nav-logs"
              onClick={() => setActiveTab('logs')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'logs'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <ScrollText className="w-4 h-4" />
              <span>Live Logs</span>
            </button>

            <button
              id="nav-settings"
              onClick={() => setActiveTab('settings')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'settings'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </nav>

          {/* Bot Status & Controls */}
          <div className="flex items-center space-x-3">
            {botUsername && (
              <a
                href={`https://t.me/${botUsername}`}
                target="_blank"
                rel="noreferrer"
                className="hidden lg:flex items-center space-x-1.5 bg-blue-900/30 hover:bg-blue-900/50 text-blue-300 border border-blue-700/40 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>@{botUsername}</span>
                <ExternalLink className="w-3 h-3 text-blue-400 ml-0.5" />
              </a>
            )}

            {/* Polling Indicator Pill */}
            <div className="flex items-center space-x-2 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg">
              <span className={`w-2.5 h-2.5 rounded-full ${isPolling ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span className="text-xs font-medium text-slate-200">
                {isPolling ? 'Polling Active' : 'Bot Standby'}
              </span>
            </div>

            {/* Quick Toggle Polling Button */}
            <button
              id="toggle-polling-btn"
              onClick={() => onTogglePolling(!isPolling)}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                isPolling 
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30' 
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
              }`}
              title={isPolling ? "Stop Bot Polling" : "Start Bot Polling"}
            >
              {isPolling ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span className="hidden sm:inline">{isPolling ? 'Stop Bot' : 'Start Bot'}</span>
            </button>

            <button
              id="refresh-status-btn"
              onClick={onRefreshStatus}
              disabled={isRefreshing}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-all disabled:opacity-50"
              title="Refresh Bot Status"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

        </div>

        {/* Mobile Navigation Row */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center space-y-1 p-1 ${activeTab === 'dashboard' ? 'text-blue-400 font-bold' : 'text-slate-400'}`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dash</span>
          </button>
          <button
            onClick={() => setActiveTab('tester')}
            className={`flex flex-col items-center space-y-1 p-1 ${activeTab === 'tester' ? 'text-blue-400 font-bold' : 'text-slate-400'}`}
          >
            <Search className="w-4 h-4" />
            <span>Tester</span>
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex flex-col items-center space-y-1 p-1 ${activeTab === 'simulator' ? 'text-blue-400 font-bold' : 'text-slate-400'}`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Simulator</span>
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex flex-col items-center space-y-1 p-1 ${activeTab === 'logs' ? 'text-blue-400 font-bold' : 'text-slate-400'}`}
          >
            <ScrollText className="w-4 h-4" />
            <span>Logs</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center space-y-1 p-1 ${activeTab === 'settings' ? 'text-blue-400 font-bold' : 'text-slate-400'}`}
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>

      </div>
    </header>
  );
};
