import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  Sun, 
  Moon, 
  Plus, 
  RefreshCw, 
  Play, 
  Square, 
  CheckCircle2, 
  AlertCircle, 
  Radio, 
  ChevronDown,
  User,
  Shield,
  LogOut,
  Command
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TopNavbarProps {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  onOpenSearch: () => void;
  isPolling: boolean;
  onTogglePolling: (start: boolean) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onNewBroadcast: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  theme,
  setTheme,
  onOpenSearch,
  isPolling,
  onTogglePolling,
  onRefresh,
  isRefreshing,
  onNewBroadcast
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);

  const notifications = [
    { id: '1', title: 'Broadcast Delivered', desc: '1,242 users received V2.5 update announcement.', time: '2 mins ago', type: 'success' },
    { id: '2', title: 'High Memory Alert', desc: 'Node process reached 38.6 MB (Normal range).', time: '10 mins ago', type: 'info' },
    { id: '3', title: 'New Group Joined', desc: 'Bot added to "OSINT Research Community India".', time: '1 hour ago', type: 'success' }
  ];

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      
      {/* Search Bar Trigger */}
      <div className="flex items-center space-x-4 flex-1 max-w-md">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-400 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-200/60 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition-all text-sm group"
        >
          <div className="flex items-center space-x-2.5">
            <Search className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
            <span className="font-normal text-slate-500 dark:text-slate-400">
              Search users, groups, commands, logs...
            </span>
          </div>
          <div className="flex items-center space-x-1 px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 text-[11px] font-semibold text-slate-400 dark:text-slate-300 border border-slate-200 dark:border-slate-600 shadow-2xs">
            <Command className="w-3 h-3" />
            <span>K</span>
          </div>
        </button>
      </div>

      {/* Right Navbar Controls */}
      <div className="flex items-center space-x-3">

        {/* Quick Action Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowQuickActions(!showQuickActions)}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-xs shadow-sm shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Quick Actions</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-80" />
          </button>

          <AnimatePresence>
            {showQuickActions && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                className="absolute right-0 mt-2 w-56 py-2 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-700 z-50"
              >
                <button
                  onClick={() => {
                    setShowQuickActions(false);
                    onNewBroadcast();
                  }}
                  className="w-full flex items-center space-x-2.5 px-4 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <Plus className="w-4 h-4 text-blue-500" />
                  <span>Create New Broadcast</span>
                </button>

                <button
                  onClick={() => {
                    setShowQuickActions(false);
                    onTogglePolling(!isPolling);
                  }}
                  className="w-full flex items-center space-x-2.5 px-4 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors"
                >
                  {isPolling ? (
                    <>
                      <Square className="w-4 h-4 text-amber-500" />
                      <span>Pause Bot Polling</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 text-emerald-500" />
                      <span>Start Bot Polling</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    setShowQuickActions(false);
                    onRefresh();
                  }}
                  className="w-full flex items-center space-x-2.5 px-4 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 text-indigo-500 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>Sync Telegram Status</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sync Status Button */}
        <button
          onClick={onRefresh}
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Refresh Data"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-500' : ''}`} />
        </button>

        {/* Theme Switcher */}
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
        </button>

        {/* Notification Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-white dark:ring-slate-900" />
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-700 z-50 overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                  <span className="font-semibold text-xs text-slate-900 dark:text-white">Notifications</span>
                  <span className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 font-bold px-2 py-0.5 rounded-full">
                    3 New
                  </span>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-700/60 max-h-72 overflow-y-auto">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors">
                      <div className="flex items-start space-x-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{n.title}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">{n.desc}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Admin Profile */}
        <div className="relative pl-2 border-l border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-2.5 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
                alt="Admin Avatar"
                className="w-8 h-8 rounded-xl object-cover ring-2 ring-blue-500/30"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-none">
                Master Admin
              </span>
              <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400 leading-tight mt-0.5">
                Super Admin
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
          </button>

          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                className="absolute right-0 mt-2 w-60 py-2 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-700 z-50"
              >
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Master Admin</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">rajuk76427@gmail.com</p>
                </div>
                <div className="pt-1">
                  <div className="px-4 py-2 text-xs flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span className="flex items-center space-x-2">
                      <Shield className="w-3.5 h-3.5 text-blue-500" />
                      <span>Role</span>
                    </span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">Super Admin</span>
                  </div>
                  <div className="px-4 py-2 text-xs flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span className="flex items-center space-x-2">
                      <Radio className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Status</span>
                    </span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">Online</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

    </header>
  );
};
