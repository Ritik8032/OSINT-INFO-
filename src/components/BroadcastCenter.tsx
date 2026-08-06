import React, { useState } from 'react';
import { Send, Image, FileText, BarChart2, MapPin, RefreshCw, CheckCircle2, AlertCircle, Clock, Plus, X } from 'lucide-react';
import { BroadcastCampaign } from '../types';

interface BroadcastCenterProps {
  broadcasts: BroadcastCampaign[];
  onCreateBroadcast: (payload: any) => void;
  onRetryBroadcast: (id: string) => void;
  showToast: (title: string, message?: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
}

export const BroadcastCenter: React.FC<BroadcastCenterProps> = ({
  broadcasts,
  onCreateBroadcast,
  onRetryBroadcast,
  showToast
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [targetType, setTargetType] = useState<'dm' | 'groups'>('dm');
  const [mediaType, setMediaType] = useState<'text' | 'photo' | 'document'>('text');
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [parseMode, setParseMode] = useState<'HTML' | 'MarkdownV2' | 'None'>('HTML');

  const handleCreate = () => {
    if (!content.trim() && !mediaUrl) {
      showToast('Validation Error', 'Broadcast content or media URL is required', 'warning');
      return;
    }

    onCreateBroadcast({
      title: title || 'New Broadcast Campaign',
      targetType,
      mediaType,
      content,
      mediaUrl,
      parseMode
    });

    setIsModalOpen(false);
    setTitle('');
    setContent('');
    setMediaUrl('');
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <Send className="w-5 h-5 text-[#24A1DE]" />
            <span>Mass Broadcast Dispatcher</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Send announcements, updates, or rich media messages directly to your Telegram users or groups.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-[#24A1DE] hover:bg-[#1f8ec4] text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>New Broadcast</span>
        </button>
      </div>

      {/* Broadcast History */}
      {broadcasts.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 space-y-3">
          <div className="w-16 h-16 bg-blue-50 text-[#24A1DE] rounded-full flex items-center justify-center mx-auto">
            <Send className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">No Broadcast Campaigns Sent Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Click "New Broadcast" to compose and dispatch a message to all registered Telegram users or group chats using official Telegram Bot API.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-[#24A1DE] text-white text-xs font-semibold rounded-xl shadow-xs hover:bg-[#1f8ec4]"
          >
            Create First Broadcast
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {broadcasts.map((bc) => (
            <div key={bc.id} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-sm text-slate-900">{bc.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      bc.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                      bc.status === 'sending' ? 'bg-blue-100 text-[#24A1DE] animate-pulse' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {bc.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Target: <span className="font-semibold text-slate-700 uppercase">{bc.targetType}</span> • Created: {new Date(bc.createdAt).toLocaleString()}
                  </p>
                </div>

                {bc.stats.failedCount > 0 && (
                  <button
                    onClick={() => onRetryBroadcast(bc.id)}
                    className="px-3 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-semibold hover:bg-amber-100 flex items-center space-x-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Retry Failed ({bc.stats.failedCount})</span>
                  </button>
                )}
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-800 whitespace-pre-wrap font-sans">
                {bc.content}
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                  <span>Progress: {bc.stats.progressPercentage}%</span>
                  <span>{bc.stats.sentCount} delivered / {bc.stats.totalRecipients} recipients</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#24A1DE] h-full transition-all duration-500"
                    style={{ width: `${bc.stats.progressPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Broadcast Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                <Send className="w-4 h-4 text-[#24A1DE]" />
                <span>Create Telegram Broadcast Campaign</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Campaign Title</label>
                <input
                  type="text"
                  placeholder="e.g. Major Server Maintenance Notice"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs focus:outline-none focus:border-[#24A1DE]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Target Audience</label>
                  <select
                    value={targetType}
                    onChange={(e: any) => setTargetType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs focus:outline-none focus:border-[#24A1DE]"
                  >
                    <option value="dm">All Direct Users (DM)</option>
                    <option value="groups">All Telegram Groups</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Parse Mode</label>
                  <select
                    value={parseMode}
                    onChange={(e: any) => setParseMode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs focus:outline-none focus:border-[#24A1DE]"
                  >
                    <option value="HTML">HTML Formatting</option>
                    <option value="MarkdownV2">MarkdownV2</option>
                    <option value="None">Plain Text</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Message Content</label>
                <textarea
                  rows={4}
                  placeholder="Enter message text (supports Telegram HTML bold, italic, links)..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs focus:outline-none focus:border-[#24A1DE]"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button onClick={() => setIsModalOpen(false)} className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100">
                Cancel
              </button>
              <button onClick={handleCreate} className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-[#24A1DE] text-white hover:bg-[#1f8ec4]">
                Send Broadcast Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
