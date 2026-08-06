import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  RotateCcw, 
  Smartphone, 
  CreditCard, 
  DollarSign, 
  Sparkles,
  Copy,
  Check,
  ShieldCheck,
  LayoutGrid,
  ChevronDown,
  ChevronUp,
  Smile,
  Paperclip
} from 'lucide-react';
import { SimulatedMessage, LookupType } from '../types';

interface BotSimulatorProps {
  botUsername?: string;
  botFirstName?: string;
}

export const BotSimulator: React.FC<BotSimulatorProps> = ({
  botUsername = 'configured_bot',
  botFirstName = 'Lookup Bot',
}) => {
  const [messages, setMessages] = useState<SimulatedMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [currentPendingType, setCurrentPendingType] = useState<LookupType | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showKeyboardMenu, setShowKeyboardMenu] = useState<boolean>(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize start conversation
  useEffect(() => {
    initSimulation();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const initSimulation = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/bot/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start' }),
      });
      const data = await res.json();
      setMessages([
        {
          id: Math.random().toString(),
          sender: 'bot',
          text: data.text,
          buttons: data.buttons,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setCurrentPendingType(null);
    } catch {
      setMessages([
        {
          id: Math.random().toString(),
          sender: 'bot',
          text: '👋 Welcome to the *OSINT & Info Lookup Bot*!\n\nPlease select an option below to perform a lookup:',
          buttons: [
            [
              { text: '📱 Mobile Lookup', callbackData: 'type_mobile' },
              { text: '🪪 Aadhaar Lookup', callbackData: 'type_adhar' },
            ],
            [{ text: '💲 UPI Lookup', callbackData: 'type_upi' }],
          ],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleButtonClick = async (callbackData: string, btnText: string) => {
    // Append user click message
    const userMsg: SimulatedMessage = {
      id: Math.random().toString(),
      sender: 'user',
      text: btnText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    let targetType: LookupType = 'mobile';
    if (callbackData === 'type_mobile') targetType = 'mobile';
    if (callbackData === 'type_adhar') targetType = 'adhar';
    if (callbackData === 'type_upi') targetType = 'upi';
    if (callbackData === 'type_ifsc') targetType = 'ifsc';
    if (callbackData === 'type_instagram') targetType = 'instagram';

    setCurrentPendingType(targetType);

    try {
      const res = await fetch('/api/bot/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'click_type', type: targetType }),
      });
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: 'bot',
          text: data.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch {
      const promptText =
        targetType === 'mobile'
          ? '📱 *MOBILE LOOKUP*\n\nPlease enter the *10-digit Mobile Number* to search:'
          : targetType === 'adhar'
          ? '🪪 *AADHAAR LOOKUP*\n\nPlease enter the *12-digit Aadhaar Number* to search:'
          : targetType === 'ifsc'
          ? '🏦 *IFSC CODE LOOKUP*\n\nPlease enter the *11-character Bank IFSC Code* to search:'
          : '💲 *UPI ID LOOKUP*\n\nPlease enter the *UPI ID / VPA* to search:';

      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: 'bot',
          text: promptText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const term = inputText.trim();
    setInputText('');

    const userMsg: SimulatedMessage = {
      id: Math.random().toString(),
      sender: 'user',
      text: term,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    let lookupType = currentPendingType;
    if (!lookupType) {
      if (/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/.test(term)) {
        lookupType = 'ifsc';
      } else if (term.includes('@')) {
        lookupType = 'upi';
      } else if (/^\d{12}$/.test(term)) {
        lookupType = 'adhar';
      } else {
        lookupType = 'mobile';
      }
    }

    try {
      const res = await fetch('/api/bot/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit_term',
          term,
          type: lookupType,
        }),
      });
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: 'bot',
          text: data.text,
          buttons: data.buttons,
          jsonResult: data.jsonResult,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setCurrentPendingType(null);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: 'bot',
          text: `❌ Failed to execute simulator lookup for ${term}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const copyJsonMessage = (msgId: string, json: any) => {
    navigator.clipboard.writeText(JSON.stringify(json, null, 2));
    setCopiedId(msgId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Telegram Bot Interactive Simulator</h2>
            <p className="text-xs text-slate-400">Test the exact Telegram user experience right in your browser</p>
          </div>
        </div>

        <button
          onClick={initSimulation}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5 text-blue-400" />
          <span>Reset Simulation Chat</span>
        </button>
      </div>

      {/* Telegram App Container Simulation */}
      <div className="max-w-2xl mx-auto bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col h-[650px]">
        
        {/* Telegram Chat Header */}
        <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-base shadow">
                {botFirstName.charAt(0)}
              </div>
              <span className="w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900 absolute bottom-0 right-0" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h3 className="font-bold text-white text-sm">{botFirstName}</h3>
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <p className="text-xs text-slate-400">@{botUsername} • bot</p>
            </div>
          </div>

          <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full font-mono font-medium">
            bot active
          </span>
        </div>

        {/* Chat History Area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-950/90 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
          
          {messages.map((msg, idx) => (
            <div
              key={`${msg.id || 'sim'}-${idx}`}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-1.5`}
            >
              {/* Message Bubble */}
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-md ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-bl-none'
                }`}
              >
                {/* Text Content */}
                <div className="whitespace-pre-wrap font-sans">
                  {msg.text}
                </div>

                {/* Optional JSON Block inside bot result message */}
                {msg.jsonResult && (
                  <div className="mt-3 bg-slate-950 p-3 rounded-xl border border-slate-800 relative group">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-800 pb-1.5 mb-1.5">
                      <span className="font-mono text-emerald-400 font-bold">JSON RESULT PAYLOAD</span>
                      <button
                        onClick={() => copyJsonMessage(msg.id, msg.jsonResult)}
                        className="hover:text-white flex items-center space-x-1 bg-slate-800 px-2 py-0.5 rounded border border-slate-700"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy JSON</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="text-xs text-blue-300 font-mono overflow-x-auto max-h-48">
                      {JSON.stringify(msg.jsonResult, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Message Timestamp */}
                <div
                  className={`text-[10px] mt-1.5 text-right ${
                    msg.sender === 'user' ? 'text-blue-200' : 'text-slate-500'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {/* Inline Keyboard Buttons Rendered under Bot Message */}
              {msg.buttons && msg.buttons.length > 0 && (
                <div className="w-[85%] space-y-1.5 pt-1">
                  {msg.buttons.map((row, rIdx) => (
                    <div key={rIdx} className="grid grid-cols-2 gap-1.5">
                      {row.map((btn, bIdx) => (
                        <button
                          key={bIdx}
                          onClick={() => handleButtonClick(btn.callbackData, btn.text)}
                          disabled={loading}
                          className="bg-blue-900/40 hover:bg-blue-800/60 text-blue-200 border border-blue-600/40 hover:border-blue-500 rounded-xl py-2 px-3 text-xs font-semibold text-center transition-all shadow-sm active:scale-95 disabled:opacity-50"
                        >
                          {btn.text}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              )}

            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-2 text-slate-400 text-xs bg-slate-900 p-3 rounded-2xl border border-slate-800 w-max">
              <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              <span>Bot is typing / fetching data...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="bg-slate-900 border-t border-slate-800 p-2.5 sm:p-3 flex items-center space-x-2 shrink-0">
          <div className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-3 py-1.5 flex items-center space-x-2 focus-within:border-blue-500/80 transition-all">
            <button
              type="button"
              className="text-slate-400 hover:text-slate-200 transition-colors p-1"
              title="Emoji"
            >
              <Smile className="w-5 h-5" />
            </button>

            <input
              id="bot-simulator-chat-input"
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                currentPendingType === 'ifsc'
                  ? 'Type 11-character IFSC code (e.g. SBIN0003063)...'
                  : currentPendingType === 'instagram'
                  ? 'Type Instagram Username (e.g. cristiano)...'
                  : currentPendingType === 'mobile'
                  ? 'Type 10-digit mobile number...'
                  : currentPendingType === 'adhar'
                  ? 'Type 12-digit Aadhaar number...'
                  : currentPendingType === 'upi'
                  ? 'Type UPI VPA ID (e.g. user@upi)...'
                  : 'Message or send lookup term...'
              }
              className="flex-1 bg-transparent border-none text-white text-xs sm:text-sm focus:outline-none placeholder:text-slate-500 py-1"
            />

            {/* Telegram Grid Keyboard Toggle Button (toggles bottom navigation keyboard ON/OFF) */}
            <button
              type="button"
              onClick={() => setShowKeyboardMenu((prev) => !prev)}
              className={`p-1.5 rounded-lg transition-all ${
                showKeyboardMenu 
                  ? 'text-blue-400 bg-blue-500/20 ring-1 ring-blue-500/40' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title={showKeyboardMenu ? 'Turn Navigation OFF (Hide Keyboard)' : 'Turn Navigation ON (Show Keyboard)'}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>

            <button
              type="button"
              className="text-slate-400 hover:text-slate-200 transition-colors p-1"
              title="Attach File"
            >
              <Paperclip className="w-5 h-5 rotate-45" />
            </button>
          </div>

          <button
            id="bot-simulator-send-btn"
            type="submit"
            disabled={loading || !inputText.trim()}
            className="p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full disabled:opacity-50 transition-all shrink-0 shadow-md active:scale-95"
            title="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* Persistent Telegram Bottom Reply Keyboard Panel (Below Input Bar) */}
        {showKeyboardMenu && (
          <div className="bg-slate-900/95 border-t border-slate-800 p-2.5 space-y-2 shrink-0 transition-all">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleButtonClick('type_mobile', '📱 MOBILE')}
                disabled={loading}
                className="bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700/80 active:bg-slate-600 rounded-2xl py-2.5 px-3 text-xs sm:text-sm font-medium text-center transition-all shadow-sm active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-1.5"
              >
                <span>📱 MOBILE</span>
              </button>
              <button
                type="button"
                onClick={() => handleButtonClick('type_adhar', '🪪 AADHAAR')}
                disabled={loading}
                className="bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700/80 active:bg-slate-600 rounded-2xl py-2.5 px-3 text-xs sm:text-sm font-medium text-center transition-all shadow-sm active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-1.5"
              >
                <span>🪪 AADHAAR</span>
              </button>
              <button
                type="button"
                onClick={() => handleButtonClick('type_upi', '💲 UPI')}
                disabled={loading}
                className="bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700/80 active:bg-slate-600 rounded-2xl py-2.5 px-3 text-xs sm:text-sm font-medium text-center transition-all shadow-sm active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-1.5"
              >
                <span>💲 UPI</span>
              </button>
              <button
                type="button"
                onClick={() => handleButtonClick('type_ifsc', '🏦 IFSC')}
                disabled={loading}
                className="bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700/80 active:bg-slate-600 rounded-2xl py-2.5 px-3 text-xs sm:text-sm font-medium text-center transition-all shadow-sm active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-1.5"
              >
                <span>🏦 IFSC</span>
              </button>
              <button
                type="button"
                onClick={() => handleButtonClick('type_instagram', '📸 INSTAGRAM')}
                disabled={loading}
                className="col-span-2 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700/80 active:bg-slate-600 rounded-2xl py-2.5 px-3 text-xs sm:text-sm font-medium text-center transition-all shadow-sm active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-1.5"
              >
                <span>📸 INSTAGRAM</span>
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
