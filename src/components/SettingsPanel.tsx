import React, { useState } from 'react';
import { 
  Settings, 
  Key, 
  Globe, 
  Bot, 
  Save, 
  Check, 
  AlertCircle, 
  HelpCircle,
  Play,
  Square,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { BotConfig } from '../types';

interface SettingsPanelProps {
  config: BotConfig;
  onSaveConfig: (updated: Partial<BotConfig>) => Promise<void>;
  isPolling: boolean;
  onTogglePolling: (start: boolean) => void;
  onRefreshStatus: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  config,
  onSaveConfig,
  isPolling,
  onTogglePolling,
  onRefreshStatus,
}) => {
  const [botToken, setBotToken] = useState<string>(config.botToken);
  const [apiKey, setApiKey] = useState<string>(config.apiKey);
  const [apiUrl, setApiUrl] = useState<string>(config.apiUrl);
  const [welcomeMessage, setWelcomeMessage] = useState<string>(config.welcomeMessage);
  const [saving, setSaving] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);

    try {
      await onSaveConfig({
        botToken: botToken.trim(),
        apiKey: apiKey.trim(),
        apiUrl: apiUrl.trim(),
        welcomeMessage,
      });
      setSuccessMsg('Settings updated and verified with Telegram Bot API successfully!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch {
      setSuccessMsg('Failed to update settings. Please check network connection.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Bot & API Configuration</h2>
            <p className="text-xs text-slate-400">Configure Telegram Bot Token, uersxinfo API Keys, and Telegram messages</p>
          </div>
        </div>

        <button
          onClick={onRefreshStatus}
          className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-all"
        >
          <RefreshCw className="w-4 h-4 text-blue-400" />
          <span className="hidden sm:inline">Test Connection</span>
        </button>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-6">
        
        {successMsg && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm rounded-xl flex items-center space-x-2">
            <Check className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Telegram Bot Token Input */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
            <Bot className="w-4 h-4 text-blue-400" />
            <span>Telegram Bot API Token</span>
          </label>
          <input
            id="settings-bot-token-input"
            type="text"
            value={botToken}
            onChange={(e) => setBotToken(e.target.value)}
            placeholder="e.g. 8964110250:AAG3yf-jWsiLsL45NXWFmZaPFqRqfjmtEC4"
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            required
          />
          <p className="text-[11px] text-slate-400">
            Provided by <strong className="text-slate-200">@BotFather</strong> on Telegram. Controls all Bot interactions.
          </p>
        </div>

        {/* API Credentials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* API Key */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
              <Key className="w-4 h-4 text-emerald-400" />
              <span>Lookup API Key</span>
            </label>
            <input
              id="settings-api-key-input"
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="e.g. ksidkf"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              required
            />
            <p className="text-[11px] text-slate-400">
              Query parameter <code className="text-emerald-400">key=ksidkf</code> appended to HTTP requests.
            </p>
          </div>

          {/* API Base URL */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
              <Globe className="w-4 h-4 text-purple-400" />
              <span>API Base URL</span>
            </label>
            <input
              id="settings-api-url-input"
              type="url"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="e.g. http://uersxinfo.in/api"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              required
            />
            <p className="text-[11px] text-slate-400">
              Target endpoint domain for Mobile, Aadhaar, and UPI searches.
            </p>
          </div>

        </div>

        {/* Welcome Message Text Area */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
            <Bot className="w-4 h-4 text-amber-400" />
            <span>Bot Welcome Message (Telegram Markdown Enabled)</span>
          </label>
          <textarea
            id="settings-welcome-msg-textarea"
            rows={4}
            value={welcomeMessage}
            onChange={(e) => setWelcomeMessage(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
          />
          <p className="text-[11px] text-slate-400">
            Displayed whenever a user sends <code className="text-blue-300">/start</code> to the Telegram Bot.
          </p>
        </div>

        {/* Form Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800 pt-6">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => onTogglePolling(!isPolling)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
                isPolling
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
              }`}
            >
              {isPolling ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isPolling ? 'Stop Telegram Polling' : 'Start Telegram Polling'}</span>
            </button>

            <span className="text-xs text-slate-400">
              Polling Status: <strong className={isPolling ? 'text-emerald-400' : 'text-amber-400'}>{isPolling ? 'Active' : 'Stopped'}</strong>
            </span>
          </div>

          <button
            id="settings-save-btn"
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-xl text-sm flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/20 transition-all"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Saving Config...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Configuration</span>
              </>
            )}
          </button>
        </div>

      </form>

      {/* Documentation Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-3">
        <div className="flex items-center space-x-2 text-white font-bold text-sm">
          <HelpCircle className="w-4 h-4 text-blue-400" />
          <span>Telegram Bot Setup Guide</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          1. Message <strong className="text-blue-300">@BotFather</strong> on Telegram and create a new bot.<br />
          2. Copy the HTTP API token provided (e.g. <code className="text-emerald-400">8964110250:AAG3yf-jWsiLsL45NXWFmZaPFqRqfjmtEC4</code>).<br />
          3. Paste the token into the field above and click <strong>Save Configuration</strong>.<br />
          4. Ensure <strong>Start Telegram Polling</strong> is green. Your bot will automatically receive and reply to user messages for Mobile 📱, Aadhaar 🪪, and UPI 💲!
        </p>
      </div>

    </div>
  );
};
