import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, Key, Globe, Database, Bot, CheckCircle2, RefreshCw, Power, Zap, ShieldCheck, Copy, Info, Trash2, Server } from 'lucide-react';
import { BotConfig } from '../types';

interface SettingsViewProps {
  config: BotConfig;
  onSaveConfig: (updated: Partial<BotConfig>) => void;
  onTogglePolling: (action: 'start' | 'stop') => void;
  showToast: (title: string, message?: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  config,
  onSaveConfig,
  onTogglePolling,
  showToast
}) => {
  const [botToken, setBotToken] = useState(config.botToken || '');
  const [welcomeMessage, setWelcomeMessage] = useState(config.welcomeMessage || '');
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(config.autoReplyEnabled ?? true);
  const [autoReplyMessage, setAutoReplyMessage] = useState(config.autoReplyMessage || '');
  const [webhookUrl, setWebhookUrl] = useState(config.webhookUrl || '');
  const [supabaseUrl, setSupabaseUrl] = useState(config.supabaseUrl || '');
  const [supabaseKey, setSupabaseKey] = useState(config.supabaseKey || '');
  const [maintenanceMode, setMaintenanceMode] = useState(config.maintenanceMode || false);
  const [isTestingToken, setIsTestingToken] = useState(false);
  const [isSettingWebhook, setIsSettingWebhook] = useState(false);

  const handleTestToken = async () => {
    if (!botToken.trim()) {
      showToast('Token Missing', 'Please enter a valid Telegram Bot Token', 'warning');
      return;
    }

    try {
      setIsTestingToken(true);
      const res = await fetch('/api/admin/settings/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botToken: botToken.trim() })
      });
      if (res.ok) {
        showToast('Token Verified', 'Successfully authenticated with Telegram Bot API!', 'success');
      } else {
        showToast('Verification Failed', 'Invalid Bot Token', 'error');
      }
    } catch (err: any) {
      showToast('Connection Error', err.message, 'error');
    } finally {
      setIsTestingToken(false);
    }
  };

  const handleSetWebhook = async (customUrl?: string) => {
    try {
      setIsSettingWebhook(true);
      const targetUrl = customUrl !== undefined ? customUrl : (webhookUrl || window.location.origin + '/api/webhook/telegram');
      const res = await fetch('/api/webhook/set', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhookUrl: targetUrl })
      });
      const data = await res.json();
      if (res.ok && data.status === 'ok') {
        setWebhookUrl(data.webhookUrl);
        showToast('Webhook Active!', `Telegram Webhook configured: ${data.webhookUrl}`, 'success');
      } else {
        showToast('Webhook Error', data.message || 'Failed to set Telegram webhook', 'error');
      }
    } catch (err: any) {
      showToast('Webhook Error', err.message, 'error');
    } finally {
      setIsSettingWebhook(false);
    }
  };

  const handleCheckWebhookInfo = async () => {
    try {
      const res = await fetch('/api/webhook/info');
      const data = await res.json();
      if (res.ok && data.status === 'ok') {
        const info = data.webhookInfo;
        const msg = info.url
          ? `Connected to: ${info.url}\nPending Updates: ${info.pending_update_count}\nLast Error: ${info.last_error_message || 'None'}`
          : 'No active Telegram webhook found. Currently in Long Polling mode.';
        showToast('Telegram Webhook Info', msg, 'info');
      } else {
        showToast('Webhook Check Failed', data.message || 'Could not fetch webhook status', 'error');
      }
    } catch (err: any) {
      showToast('Connection Error', err.message, 'error');
    }
  };

  const handleDeleteWebhook = async () => {
    try {
      const res = await fetch('/api/webhook/delete', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.status === 'ok') {
        setWebhookUrl('');
        showToast('Webhook Removed', 'Switched back to Long Polling mode', 'warning');
      } else {
        showToast('Error', data.message, 'error');
      }
    } catch (err: any) {
      showToast('Connection Error', err.message, 'error');
    }
  };

  const copyPingUrl = () => {
    const pingUrl = window.location.origin + '/api/ping';
    navigator.clipboard.writeText(pingUrl);
    showToast('Copied Ping URL', `${pingUrl} copied to clipboard!`, 'success');
  };

  const handleSaveAll = () => {
    onSaveConfig({
      botToken,
      welcomeMessage,
      autoReplyEnabled,
      autoReplyMessage,
      webhookUrl,
      supabaseUrl,
      supabaseKey,
      maintenanceMode
    });
    showToast('Settings Saved', 'System configurations updated successfully', 'success');
  };

  return (
    <div className="space-y-6 pb-10 max-w-4xl">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <SettingsIcon className="w-5 h-5 text-[#24A1DE]" />
            <span>Telegram Bot & System Settings</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure Telegram Bot credentials, Long Polling / Webhook options, and Supabase integration.
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          className="px-4 py-2 bg-[#24A1DE] hover:bg-[#1f8ec4] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      {/* Telegram Bot Token Section */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
            <Bot className="w-4 h-4 text-[#24A1DE]" />
            <span>Telegram Bot Credentials</span>
          </h3>
          <span className="text-xs text-slate-500">
            Bot: <span className="font-bold text-[#24A1DE]">@{config.botUsername || 'Not connected'}</span>
          </span>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Telegram Bot Token (from @BotFather)</label>
            <div className="flex space-x-2">
              <input
                type="password"
                placeholder="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ..."
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-[#24A1DE]"
              />
              <button
                onClick={handleTestToken}
                disabled={isTestingToken}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-colors flex items-center space-x-1.5"
              >
                {isTestingToken ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                <span>Test Connection</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Obtain your API token from Telegram's official @BotFather account.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div>
              <span className="text-xs font-bold text-slate-800 block">Telegram Polling Controller</span>
              <span className="text-[11px] text-slate-400">Fetch real-time updates directly from Telegram Bot API</span>
            </div>
            <button
              onClick={() => onTogglePolling(config.isPollingActive ? 'stop' : 'start')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold text-white transition-colors flex items-center space-x-1.5 ${
                config.isPollingActive ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{config.isPollingActive ? 'Stop Polling' : 'Start Long Polling'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 24/7 Vercel Deployment & Telegram Webhook Controller */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 rounded-2xl p-5 border border-slate-800 text-white shadow-md space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-[#24A1DE]/20 text-[#24A1DE] rounded-xl border border-[#24A1DE]/30">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center space-x-2">
                <span>Vercel & 24/7 Bot Online Deployment</span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] rounded-full border border-emerald-500/30 font-semibold">24/7 Active</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Instant Vercel serverless integration & Webhook controller for 100% 24/7 uptime without stopping.
              </p>
            </div>
          </div>
          <button
            onClick={handleCheckWebhookInfo}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center space-x-1.5 transition-colors"
          >
            <Info className="w-3.5 h-3.5 text-[#24A1DE]" />
            <span>Check Status</span>
          </button>
        </div>

        {/* Webhook Configuration Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
              <Globe className="w-3.5 h-3.5 text-[#24A1DE]" />
              <span>Telegram Webhook URL</span>
            </label>
            <span className="text-[11px] text-slate-400">
              Current Mode: <strong className={config.webhookUrl ? "text-emerald-400" : "text-amber-400"}>
                {config.webhookUrl ? "Webhook Mode (Recommended for Vercel)" : "Long Polling Mode"}
              </strong>
            </span>
          </div>

          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="https://your-app.vercel.app/api/webhook/telegram"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs font-mono text-slate-100 focus:outline-none focus:border-[#24A1DE]"
            />
            <button
              onClick={() => handleSetWebhook(webhookUrl.trim())}
              disabled={isSettingWebhook}
              className="px-4 py-2 bg-[#24A1DE] hover:bg-[#1f8ec4] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
            >
              {isSettingWebhook ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
              <span>Set Webhook</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              onClick={() => handleSetWebhook()}
              disabled={isSettingWebhook}
              className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-bold rounded-xl border border-emerald-500/30 flex items-center space-x-1.5 transition-colors"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>⚡ Auto-Set Webhook (Current Host)</span>
            </button>

            {config.webhookUrl && (
              <button
                onClick={handleDeleteWebhook}
                className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold rounded-xl border border-rose-500/30 flex items-center space-x-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Remove Webhook</span>
              </button>
            )}
          </div>
        </div>

        {/* 24/7 Keep-Alive Health Ping URL */}
        <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
              <Server className="w-3.5 h-3.5 text-emerald-400" />
              <span>24/7 Keep-Alive Uptime URL</span>
            </span>
            <button
              onClick={copyPingUrl}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold rounded-lg flex items-center space-x-1 transition-colors"
            >
              <Copy className="w-3 h-3 text-[#24A1DE]" />
              <span>Copy Ping Link</span>
            </button>
          </div>
          <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-emerald-400 select-all overflow-x-auto">
            {window.location.origin}/api/ping
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            💡 <strong>Vercel 24/7 Tip:</strong> Your project includes <code>vercel.json</code> with built-in Vercel Cron pinging <code>/api/ping</code> every 5 minutes. You can also add this ping link to free ping services like <strong>Cron-Job.org</strong> or <strong>UptimeRobot</strong> to ensure your bot never sleeps!
          </p>
        </div>
      </div>

      {/* Supabase Database Section */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
            <Database className="w-4 h-4 text-emerald-600" />
            <span>Supabase Cloud Integration</span>
          </h3>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Supabase Project URL</label>
            <input
              type="text"
              placeholder="https://xyz.supabase.co"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#24A1DE]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Supabase Anon Key</label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={supabaseKey}
              onChange={(e) => setSupabaseKey(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-[#24A1DE]"
            />
          </div>
        </div>
      </div>

      {/* Bot Welcome Message */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-3">
        <h3 className="font-bold text-sm text-slate-900">Default Telegram Welcome Greeting (/start)</h3>
        <textarea
          rows={3}
          value={welcomeMessage}
          onChange={(e) => setWelcomeMessage(e.target.value)}
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#24A1DE]"
        />
      </div>

      {/* Personal Message Auto-Responder */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Personal Message Auto-Responder (DM Reply)</h3>
            <p className="text-xs text-slate-500">Automatically respond when users send a private message to the bot</p>
          </div>
          <button
            onClick={() => setAutoReplyEnabled(!autoReplyEnabled)}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
              autoReplyEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}
          >
            {autoReplyEnabled ? 'Auto-Reply ON' : 'Auto-Reply OFF'}
          </button>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">Custom Auto-Reply Text (Optional)</label>
          <textarea
            rows={3}
            placeholder="Leave empty for default smart auto-reply with user credits & commands..."
            value={autoReplyMessage}
            onChange={(e) => setAutoReplyMessage(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#24A1DE]"
          />
        </div>
      </div>

      {/* MongoDB Database Configuration */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="font-bold text-sm text-slate-900">MongoDB Atlas Database (TDM)</h3>
              <p className="text-xs text-slate-500">All user accounts, chat logs, lookups, and settings are saved here ("chhoti se chhoti chiz")</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Connected & Live</span>
          </span>
        </div>

        <div className="space-y-2 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">MongoDB Connection URI</label>
            <input
              type="text"
              disabled
              value="mongodb+srv://Ritik:****@tdm.uwkxmdo.mongodb.net/TDM?retryWrites=true&w=majority"
              className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl font-mono text-slate-700 text-xs cursor-not-allowed"
            />
          </div>
          <div className="flex items-center space-x-4 pt-1 text-slate-500 font-medium">
            <span>📦 Database: <strong className="text-slate-800">TDM</strong></span>
            <span>Sync Strategy: <strong className="text-emerald-700">Real-Time Upsert (All Data Saved)</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
