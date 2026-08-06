import React from 'react';
import { 
  Bot, 
  Smartphone, 
  CreditCard, 
  DollarSign, 
  Activity, 
  Terminal, 
  Send, 
  ShieldCheck, 
  ArrowRight, 
  Zap, 
  Database,
  Sliders,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { BotConfig, DashboardStats } from '../types';

interface DashboardProps {
  config: BotConfig;
  stats: DashboardStats;
  setActiveTab: (tab: string) => void;
  onQuickSearch: (type: 'mobile' | 'adhar' | 'upi', term: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  config,
  stats,
  setActiveTab,
  onQuickSearch,
}) => {
  return (
    <div className="space-y-6">
      
      {/* Welcome & Bot Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
                <Zap className="w-3 h-3" /> Real-time Integration Active
              </span>
              <span className="bg-slate-800 text-slate-300 text-xs px-2.5 py-0.5 rounded-full border border-slate-700">
                Key: <code className="text-emerald-400 font-mono">{config.apiKey}</code>
              </span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Telegram Lookup Bot Manager
            </h2>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Fully automated Telegram Bot panel handling instant lookups for <strong className="text-blue-300">Mobile 📱</strong>, <strong className="text-blue-300">Aadhaar 🪪</strong>, and <strong className="text-blue-300">UPI 💲</strong> records with beautified JSON output responses.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('simulator')}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center space-x-2 shadow-lg shadow-blue-600/20 transition-all hover:scale-102"
            >
              <Send className="w-4 h-4" />
              <span>Open Bot Simulator</span>
            </button>

            <button
              onClick={() => setActiveTab('tester')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center space-x-2 transition-all"
            >
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>Direct Lookup Bench</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Lookups */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Total Lookups</span>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-white">{stats.totalLookups}</span>
            <span className="text-xs text-slate-400 ml-2">queries executed</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3 text-blue-400" /> Live polling & web calls
          </div>
        </div>

        {/* Mobile Lookups */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Mobile Lookups 📱</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <Smartphone className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-white">{stats.mobileCount}</span>
            <span className="text-xs text-slate-400 ml-2">requests</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 font-mono truncate">
            type=mobile
          </div>
        </div>

        {/* Aadhaar Lookups */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Aadhaar Lookups 🪪</span>
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-white">{stats.adharCount}</span>
            <span className="text-xs text-slate-400 ml-2">requests</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 font-mono truncate">
            type=adhar
          </div>
        </div>

        {/* UPI Lookups */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">UPI Lookups 💲</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-white">{stats.upiCount}</span>
            <span className="text-xs text-slate-400 ml-2">requests</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 font-mono truncate">
            type=upi
          </div>
        </div>

      </div>

      {/* Main Grid: Bot Info & Endpoints */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Active API Endpoints Card */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Configured HTTP Endpoints</h3>
                <p className="text-xs text-slate-400">Live request URLs called by the Telegram Bot engine</p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('settings')}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center space-x-1"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Edit Config</span>
            </button>
          </div>

          <div className="space-y-3">
            
            {/* Mobile Endpoint */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded">
                    Mobile 📱
                  </span>
                  <span className="text-xs text-slate-400">Method: GET</span>
                </div>
                <code className="text-xs text-slate-300 font-mono block break-all">
                  {config.apiUrl}?key={config.apiKey}&type=mobile&term=<span className="text-amber-400 font-bold">TERM</span>
                </code>
              </div>
              <button
                onClick={() => {
                  onQuickSearch('mobile', '9876543210');
                  setActiveTab('tester');
                }}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 flex items-center space-x-1 shrink-0"
              >
                <span>Test Request</span>
                <ArrowRight className="w-3 h-3 text-blue-400" />
              </button>
            </div>

            {/* Aadhaar Endpoint */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded">
                    Aadhaar 🪪
                  </span>
                  <span className="text-xs text-slate-400">Method: GET</span>
                </div>
                <code className="text-xs text-slate-300 font-mono block break-all">
                  {config.apiUrl}?key={config.apiKey}&type=adhar&term=<span className="text-amber-400 font-bold">TERM</span>
                </code>
              </div>
              <button
                onClick={() => {
                  onQuickSearch('adhar', '123456789012');
                  setActiveTab('tester');
                }}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 flex items-center space-x-1 shrink-0"
              >
                <span>Test Request</span>
                <ArrowRight className="w-3 h-3 text-blue-400" />
              </button>
            </div>

            {/* UPI Endpoint */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded">
                    UPI 💲
                  </span>
                  <span className="text-xs text-slate-400">Method: GET</span>
                </div>
                <code className="text-xs text-slate-300 font-mono block break-all">
                  {config.apiUrl}?key={config.apiKey}&type=upi&term=<span className="text-amber-400 font-bold">TERM</span>
                </code>
              </div>
              <button
                onClick={() => {
                  onQuickSearch('upi', 'user@upi');
                  setActiveTab('tester');
                }}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 flex items-center space-x-1 shrink-0"
              >
                <span>Test Request</span>
                <ArrowRight className="w-3 h-3 text-blue-400" />
              </button>
            </div>

          </div>
        </div>

        {/* Telegram Bot Details & Keyboard Preview */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Bot className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-white text-base">Bot Identity</h3>
              </div>
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Token Linked
              </span>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Bot Name:</span>
                <span className="text-white font-medium">{config.botFirstName || 'Lookup Bot'}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Username:</span>
                <span className="text-blue-400 font-mono font-medium">@{config.botUsername || 'configured_bot'}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">API Token:</span>
                <span className="text-slate-300 font-mono">
                  {config.botToken ? `${config.botToken.substring(0, 10)}...` : 'Not Set'}
                </span>
              </div>
            </div>

            <div>
              <p className="text-xs text-slate-400 mb-2 font-medium">Telegram Inline Keyboard Layout:</p>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-blue-900/40 border border-blue-600/40 text-blue-200 text-center py-2 rounded-lg font-medium">
                    📱 Mobile
                  </div>
                  <div className="bg-blue-900/40 border border-blue-600/40 text-blue-200 text-center py-2 rounded-lg font-medium">
                    🪪 Aadhaar
                  </div>
                </div>
                <div className="bg-blue-900/40 border border-blue-600/40 text-blue-200 text-center py-2 rounded-lg font-medium">
                  💲 UPI
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <a
              href={`https://t.me/${config.botUsername || ''}`}
              target="_blank"
              rel="noreferrer"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs py-2.5 rounded-xl flex items-center justify-center space-x-2 transition-all shadow-md"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Open in Telegram App</span>
            </a>
          </div>
        </div>

      </div>

    </div>
  );
};
