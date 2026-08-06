import React, { useState, useEffect } from 'react';
import { Search, Command, Users, UsersRound, Send, Settings, ArrowRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TelegramUser, TelegramGroup } from '../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: TelegramUser[];
  groups: TelegramGroup[];
  setActiveTab: (tab: string) => void;
  onOpenUserDetail: (user: TelegramUser) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  users,
  groups,
  setActiveTab,
  onOpenUserDetail
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open handled by parent listener
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const matchedUsers = users.filter(u =>
    u.firstName.toLowerCase().includes(query.toLowerCase()) ||
    (u.username && u.username.toLowerCase().includes(query.toLowerCase())) ||
    u.telegramId.toString().includes(query)
  ).slice(0, 4);

  const matchedGroups = groups.filter(g =>
    g.title.toLowerCase().includes(query.toLowerCase()) ||
    (g.username && g.username.toLowerCase().includes(query.toLowerCase()))
  ).slice(0, 3);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.98 }}
          className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        >
          {/* Top Search Input */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center space-x-3">
            <Search className="w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type to search users, groups, commands or navigate..."
              autoFocus
              className="w-full bg-transparent text-sm font-medium text-slate-900 dark:text-white outline-none placeholder:text-slate-400"
            />
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Results Container */}
          <div className="p-4 max-h-96 overflow-y-auto space-y-4">

            {/* Quick Navigation Shortcuts */}
            {!query && (
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Quick Navigation
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => { setActiveTab('broadcast'); onClose(); }}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-left transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <Send className="w-4 h-4 text-blue-500" />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">New Broadcast</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  <button
                    onClick={() => { setActiveTab('users'); onClose(); }}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-left transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-emerald-500" />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">User List</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>
              </div>
            )}

            {/* Matched Users */}
            {matchedUsers.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Telegram Users ({matchedUsers.length})
                </span>
                <div className="space-y-1">
                  {matchedUsers.map((u) => (
                    <div
                      key={u.id}
                      onClick={() => { onOpenUserDetail(u); onClose(); }}
                      className="p-2.5 rounded-2xl hover:bg-blue-50 dark:hover:bg-blue-950/50 cursor-pointer flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <img src={u.avatarUrl} alt={u.firstName} className="w-8 h-8 rounded-xl object-cover" />
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{u.firstName} {u.lastName || ''}</p>
                          <p className="text-[10px] text-slate-400">@{u.username || `id_${u.telegramId}`}</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-amber-500">{u.credits} Credits</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Matched Groups */}
            {matchedGroups.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Telegram Groups ({matchedGroups.length})
                </span>
                <div className="space-y-1">
                  {matchedGroups.map((g) => (
                    <div
                      key={g.id}
                      onClick={() => { setActiveTab('groups'); onClose(); }}
                      className="p-2.5 rounded-2xl hover:bg-violet-50 dark:hover:bg-violet-950/50 cursor-pointer flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-xs">
                          {g.title.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{g.title}</p>
                          <p className="text-[10px] text-slate-400">@{g.username || 'private'}</p>
                        </div>
                      </div>
                      <span className="text-xs text-slate-500">{g.membersCount} Members</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-[10px] text-slate-600 dark:text-slate-300">Esc</kbd> to exit</span>
            <span className="flex items-center space-x-1">
              <Command className="w-3 h-3" />
              <span>Global Search</span>
            </span>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
