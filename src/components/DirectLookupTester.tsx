import React, { useState } from 'react';
import { 
  Smartphone, 
  CreditCard, 
  DollarSign, 
  Building2,
  Instagram,
  Search, 
  Copy, 
  Check, 
  ExternalLink, 
  Terminal, 
  Code2, 
  Eye, 
  MessageSquare,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { LookupType, LookupResponse } from '../types';

interface DirectLookupTesterProps {
  initialType?: LookupType;
  initialTerm?: string;
  apiKey: string;
  apiUrl: string;
}

export const DirectLookupTester: React.FC<DirectLookupTesterProps> = ({
  initialType = 'mobile',
  initialTerm = '',
  apiKey,
  apiUrl,
}) => {
  const [type, setType] = useState<LookupType>(initialType);
  const [term, setTerm] = useState<string>(initialTerm || (initialType === 'mobile' ? '9876543210' : initialType === 'adhar' ? '123456789012' : 'user@upi'));
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<LookupResponse | null>(null);
  const [viewMode, setViewMode] = useState<'summary' | 'json' | 'raw' | 'telegram'>('summary');
  const [copied, setCopied] = useState<boolean>(false);

  const requestUrl = `${apiUrl}?key=${encodeURIComponent(apiKey)}&type=${encodeURIComponent(type)}&term=${encodeURIComponent(term.trim())}`;

  const handleExecuteLookup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!term.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`/api/lookup?type=${encodeURIComponent(type)}&term=${encodeURIComponent(term.trim())}`);
      const data: LookupResponse = await res.json();
      setResult(data);
    } catch (err: any) {
      setResult({
        status: false,
        type,
        term,
        data: { error: err.message || 'Failed to fetch lookup' },
        rawJson: { error: err.message },
        source: 'demo',
        message: 'Network request error',
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyJson = () => {
    if (!result) return;
    const jsonStr = JSON.stringify(result.data, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const setPreset = (presetType: LookupType, presetTerm: string) => {
    setType(presetType);
    setTerm(presetTerm);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <Terminal className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Direct API Query Tester</h2>
            <p className="text-xs text-slate-400">Test live requests for Mobile, Aadhaar, and UPI IDs with formatted JSON results</p>
          </div>
        </div>

        {/* Form Container */}
        <form onSubmit={handleExecuteLookup} className="mt-6 space-y-4">
          
          {/* Lookup Type Selector Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              type="button"
              onClick={() => setPreset('mobile', term || '9876543210')}
              className={`py-3 px-3 rounded-xl border flex items-center justify-center space-x-2 text-xs sm:text-sm font-semibold transition-all ${
                type === 'mobile'
                  ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/30'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>Mobile 📱</span>
            </button>

            <button
              type="button"
              onClick={() => setPreset('adhar', term || '123456789012')}
              className={`py-3 px-3 rounded-xl border flex items-center justify-center space-x-2 text-xs sm:text-sm font-semibold transition-all ${
                type === 'adhar'
                  ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/50 shadow-md ring-1 ring-indigo-500/30'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <CreditCard className="w-4 h-4 text-indigo-400" />
              <span>Aadhaar 🪪</span>
            </button>

            <button
              type="button"
              onClick={() => setPreset('upi', term || 'user@upi')}
              className={`py-3 px-3 rounded-xl border flex items-center justify-center space-x-2 text-xs sm:text-sm font-semibold transition-all ${
                type === 'upi'
                  ? 'bg-amber-600/20 text-amber-300 border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <DollarSign className="w-4 h-4 text-amber-400" />
              <span>UPI 💲</span>
            </button>

            <button
              type="button"
              onClick={() => setPreset('ifsc', 'SBIN0003063')}
              className={`py-3 px-3 rounded-xl border flex items-center justify-center space-x-2 text-xs sm:text-sm font-semibold transition-all ${
                type === 'ifsc'
                  ? 'bg-blue-600/20 text-blue-300 border-blue-500/50 shadow-md ring-1 ring-blue-500/30'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Building2 className="w-4 h-4 text-blue-400" />
              <span>IFSC 🏦</span>
            </button>

            <button
              type="button"
              onClick={() => setPreset('instagram', 'cristiano')}
              className={`py-3 px-3 rounded-xl border flex items-center justify-center space-x-2 text-xs sm:text-sm font-semibold transition-all ${
                type === 'instagram'
                  ? 'bg-pink-600/20 text-pink-300 border-pink-500/50 shadow-md ring-1 ring-pink-500/30'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Instagram className="w-4 h-4 text-pink-400" />
              <span>Instagram 📸</span>
            </button>
          </div>

          {/* Quick Presets row */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Quick Presets:</span>
            <button
              type="button"
              onClick={() => setPreset('mobile', '9876543210')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700"
            >
              📱 9876543210
            </button>
            <button
              type="button"
              onClick={() => setPreset('adhar', '123456789012')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700"
            >
              🪪 123456789012
            </button>
            <button
              type="button"
              onClick={() => setPreset('upi', 'rahul@paytm')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700"
            >
              💲 rahul@paytm
            </button>
            <button
              type="button"
              onClick={() => setPreset('ifsc', 'SBIN0003063')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700"
            >
              🏦 SBIN0003063
            </button>
            <button
              type="button"
              onClick={() => setPreset('instagram', 'cristiano')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700"
            >
              📸 cristiano
            </button>
          </div>

          {/* Input & Search Trigger */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                id="lookup-term-input"
                type="text"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder={
                  type === 'mobile'
                    ? 'Enter 10-digit mobile number (e.g. 9876543210)'
                    : type === 'adhar'
                    ? 'Enter 12-digit Aadhaar number (e.g. 123456789012)'
                    : type === 'ifsc'
                    ? 'Enter 11-character IFSC Code (e.g. SBIN0003063)'
                    : 'Enter UPI VPA ID (e.g. user@upi)'
                }
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono placeholder:text-slate-500"
                required
              />
            </div>

            <button
              id="execute-lookup-btn"
              type="submit"
              disabled={loading || !term.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold px-6 py-3 rounded-xl text-sm flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/20 transition-all shrink-0"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Fetching API...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Execute Search</span>
                </>
              )}
            </button>
          </div>

          {/* Target URL string preview */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center space-x-2 truncate">
              <span className="text-slate-500 uppercase font-bold shrink-0">Request Target:</span>
              <code className="text-blue-300 font-mono truncate">{requestUrl}</code>
            </div>
            <a
              href={requestUrl}
              target="_blank"
              rel="noreferrer"
              className="text-blue-400 hover:text-blue-300 flex items-center space-x-1 shrink-0 ml-2"
            >
              <span>Browser View</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

        </form>
      </div>

      {/* Result Display Section */}
      {result && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
          
          {/* Result Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-white text-base">API Response Output</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-md font-semibold ${
                    result.source === 'api' 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {result.source === 'api' ? '⚡ Live API' : '🔍 System Result'}
                  </span>
                </div>
                <p className="text-xs text-slate-400">Query: <strong className="text-slate-200">{type.toUpperCase()}</strong> → <code className="text-blue-300">{result.term}</code></p>
              </div>
            </div>

            {/* View Mode Tabs */}
            <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setViewMode('summary')}
                className={`px-3 py-1.5 rounded-lg font-medium flex items-center space-x-1 transition-all ${
                  viewMode === 'summary' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Summary</span>
              </button>

              <button
                onClick={() => setViewMode('json')}
                className={`px-3 py-1.5 rounded-lg font-medium flex items-center space-x-1 transition-all ${
                  viewMode === 'json' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Pretty JSON</span>
              </button>

              <button
                onClick={() => setViewMode('telegram')}
                className={`px-3 py-1.5 rounded-lg font-medium flex items-center space-x-1 transition-all ${
                  viewMode === 'telegram' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Telegram View</span>
              </button>

              <button
                onClick={handleCopyJson}
                className="px-3 py-1.5 rounded-lg font-medium text-slate-300 hover:text-white hover:bg-slate-800 flex items-center space-x-1 transition-all border-l border-slate-800 ml-1"
                title="Copy JSON Payload"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {result.message && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs rounded-xl flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{result.message}</span>
            </div>
          )}

          {/* View Mode: Summary Key-Value Grid */}
          {viewMode === 'summary' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {typeof result.data === 'object' && result.data !== null ? (
                  Object.entries(result.data).map(([key, val]) => (
                    <div key={key} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 space-y-1">
                      <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">
                        {key.replace(/_/g, ' ')}
                      </span>
                      <div className="text-sm font-semibold text-white break-words">
                        {typeof val === 'object' ? (
                          <pre className="text-xs text-blue-300 font-mono bg-slate-900 p-2 rounded border border-slate-800 overflow-x-auto">
                            {JSON.stringify(val, null, 2)}
                          </pre>
                        ) : (
                          String(val)
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 bg-slate-950 rounded-xl text-slate-300 text-sm">
                    {String(result.data)}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* View Mode: Pretty JSON Tree Code Block */}
          {viewMode === 'json' && (
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs overflow-x-auto">
              <pre className="text-emerald-400 leading-relaxed">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </div>
          )}

          {/* View Mode: Telegram Message Format Preview */}
          {viewMode === 'telegram' && (
            <div className="bg-slate-950 p-5 rounded-xl border border-blue-900/40 space-y-3 font-sans text-sm max-w-lg mx-auto shadow-inner">
              <div className="flex items-center space-x-2 text-xs text-blue-400 font-semibold border-b border-slate-800 pb-2">
                <MessageSquare className="w-4 h-4" />
                <span>Telegram Bot Message Output Preview</span>
              </div>
              <div className="text-slate-200 whitespace-pre-wrap leading-relaxed font-sans">
                {`✅ *LOOKUP COMPLETED*\n━━━━━━━━━━━━━━━━━━━━━\n📌 *Type:* ${
                  type === 'mobile' ? 'Mobile 📱' : type === 'adhar' ? 'Aadhaar 🪪' : 'UPI 💲'
                }\n🔍 *Query Term:* \`${result.term}\` \n\n📦 *Raw JSON Response:*\n`}
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs font-mono text-blue-300 my-2 overflow-x-auto">
                  {JSON.stringify(result.data, null, 2)}
                </div>
              </div>

              {/* Inline Buttons Preview */}
              <div className="pt-2 space-y-2">
                <div className="bg-blue-600/30 hover:bg-blue-600/40 text-blue-200 text-center text-xs py-2 rounded-lg font-medium border border-blue-500/40 cursor-default">
                  🔄 Search Another {type.toUpperCase()}
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-slate-800 text-slate-200 text-center py-1.5 rounded border border-slate-700">📱 Mobile</div>
                  <div className="bg-slate-800 text-slate-200 text-center py-1.5 rounded border border-slate-700">🪪 Aadhaar</div>
                  <div className="bg-slate-800 text-slate-200 text-center py-1.5 rounded border border-slate-700">💲 UPI</div>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
