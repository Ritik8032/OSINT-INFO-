import React, { useState } from 'react';
import { Users, Search, Volume2, VolumeX, Trash2, Send, ShieldCheck, CheckCircle2, XCircle, Bot } from 'lucide-react';
import { TelegramGroup } from '../types';

interface GroupManagerProps {
  groups: TelegramGroup[];
  onGroupAction: (groupId: string, action: 'mute' | 'remove') => void;
  onBroadcastToGroup: (group: TelegramGroup) => void;
  showToast: (title: string, message?: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
}

export const GroupManager: React.FC<GroupManagerProps> = ({
  groups,
  onGroupAction,
  onBroadcastToGroup,
  showToast
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGroups = groups.filter(g =>
    g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.groupId.toString().includes(searchQuery) ||
    (g.username && g.username.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <Users className="w-5 h-5 text-[#24A1DE]" />
            <span>Telegram Groups ({groups.length})</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real groups where your bot is an active member or admin.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search group name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#24A1DE]"
          />
        </div>
      </div>

      {/* Group List Grid */}
      {filteredGroups.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 space-y-3">
          <div className="w-16 h-16 bg-blue-50 text-[#24A1DE] rounded-full flex items-center justify-center mx-auto">
            <Bot className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">No Telegram Groups Recorded</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Your bot is not in any group yet. Add your bot (@bot_username) to a Telegram group and enable polling in Settings. When messages or events occur, groups will automatically appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGroups.map((group) => (
            <div
              key={group.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-4 hover:border-[#24A1DE]/40 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#24A1DE] to-indigo-500 text-white font-bold text-sm flex items-center justify-center shadow-xs flex-shrink-0">
                      {group.title.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-slate-900 truncate">{group.title}</h3>
                      <p className="text-xs text-slate-400">ID: {group.groupId}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Processed Msgs</span>
                    <span className="font-bold text-slate-800">{group.messagesHandledCount}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Last Active</span>
                    <span className="font-bold text-slate-800">{group.lastActive}</span>
                  </div>
                </div>

                {/* Bot Permissions */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Bot Permissions
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(group.botPermissions || {}).map(([key, val]) => (
                      <span
                        key={key}
                        className={`text-[10px] px-2 py-0.5 rounded-md font-medium flex items-center space-x-1 ${
                          val ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {val ? <CheckCircle2 className="w-2.5 h-2.5" /> : <XCircle className="w-2.5 h-2.5" />}
                        <span>{key.replace('can', '')}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => onBroadcastToGroup(group)}
                  className="px-3 py-1.5 bg-[#24A1DE] hover:bg-[#1f8ec4] text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Broadcast</span>
                </button>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => onGroupAction(group.id, 'mute')}
                    className={`p-1.5 rounded-xl border text-xs font-medium transition-colors ${
                      group.isMuted
                        ? 'bg-amber-50 text-amber-600 border-amber-200'
                        : 'text-slate-500 border-slate-200 hover:bg-slate-100'
                    }`}
                    title={group.isMuted ? 'Unmute Group' : 'Mute Group'}
                  >
                    {group.isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => onGroupAction(group.id, 'remove')}
                    className="p-1.5 rounded-xl text-red-500 hover:bg-red-50 border border-slate-200 transition-colors"
                    title="Remove Group Record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
