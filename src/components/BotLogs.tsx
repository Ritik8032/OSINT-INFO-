import React, { useState } from 'react';
import { FileText, Search, Trash2, RefreshCw, Terminal, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { BotLogEntry } from '../types';

interface BotLogsProps {
  logs: BotLogEntry[];
  onClearLogs: () => void;
  onRefreshLogs: () => void;
}

export const BotLogs: React.FC<BotLogsProps> = ({
  logs,
  onClearLogs,
  onRefreshLogs
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = log.message.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterType !== 'all') return matchesSearch && log.type === filterType;
    return matchesSearch;
  });

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <FileText className="w-5 h-5 text-[#24A1DE]" />
            <span>Server Audit Logs ({logs.length})</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time event stream logging Telegram API requests, user interactions, and admin operations.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onRefreshLogs}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={onClearLogs}
            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-semibold flex items-center space-x-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Logs</span>
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search log output..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#24A1DE]"
          />
        </div>

        <div className="flex items-center space-x-1 w-full sm:w-auto overflow-x-auto">
          {['all', 'info', 'bot_event', 'lookup', 'broadcast', 'admin', 'error'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize transition-all ${
                filterType === t ? 'bg-[#24A1DE] text-white' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {t.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Terminal Log Output Window */}
      <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 shadow-lg font-mono text-xs overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3 text-slate-400 text-[11px]">
          <span className="flex items-center space-x-2">
            <Terminal className="w-3.5 h-3.5 text-[#24A1DE]" />
            <span>console.log stream</span>
          </span>
          <span>{filteredLogs.length} entries</span>
        </div>

        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
          {filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-1">
              <p>No log records match criteria.</p>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="flex items-start space-x-3 text-slate-300 py-1 hover:bg-slate-800/50 rounded px-1">
                <span className="text-slate-500 flex-shrink-0 text-[10px]">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase flex-shrink-0 ${
                  log.type === 'error' ? 'bg-red-500/20 text-red-400' :
                  log.type === 'bot_event' ? 'bg-blue-500/20 text-blue-300' :
                  log.type === 'broadcast' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'
                }`}>
                  {log.type}
                </span>
                <span className="flex-1 break-words leading-relaxed text-slate-200">{log.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
