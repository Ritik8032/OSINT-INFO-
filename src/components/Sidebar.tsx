import React from 'react';
import { 
  LayoutDashboard, 
  MessageSquare,
  Send, 
  Users, 
  UserCheck, 
  ShieldCheck, 
  Coins,
  BarChart3, 
  FileText,
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Bot
} from 'lucide-react';
import { motion } from 'motion/react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isPolling: boolean;
  botUsername?: string;
  unreadMessagesCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  isPolling,
  botUsername,
  unreadMessagesCount = 0
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: unreadMessagesCount > 0 ? `${unreadMessagesCount}` : null },
    { id: 'broadcast', label: 'Broadcast', icon: Send, badge: null },
    { id: 'users', label: 'Users', icon: Users, badge: null },
    { id: 'groups', label: 'Groups', icon: UserCheck, badge: null },
    { id: 'permissions', label: 'Permissions', icon: ShieldCheck, badge: null },
    { id: 'credits', label: 'Credits', icon: Coins, badge: null },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, badge: null },
    { id: 'logs', label: 'Logs', icon: FileText, badge: null },
    { id: 'settings', label: 'Settings', icon: Settings, badge: null },
  ];

  return (
    <aside
      className={`relative z-20 flex flex-col h-screen border-r transition-all duration-300 ease-in-out select-none ${
        isCollapsed ? 'w-20' : 'w-64'
      } bg-white border-slate-200/80 text-slate-800 shadow-xs`}
    >
      {/* Top Header Logo - Telegram Style */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-100">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#24A1DE] flex items-center justify-center text-white shadow-sm shadow-[#24A1DE]/30">
            <Bot className="w-5 h-5" />
          </div>
          {!isCollapsed && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col"
            >
              <span className="font-bold text-base tracking-tight text-slate-900 leading-tight">
                Telegram Admin
              </span>
              <span className="text-xs text-[#24A1DE] font-semibold truncate max-w-[130px]">
                @{botUsername || 'Set_Bot_Token'}
              </span>
            </motion.div>
          )}
        </div>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Bot Live Pulse Indicator */}
      <div className="px-3 py-2.5 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center space-x-2.5 min-w-0">
            <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
              {isPolling && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  isPolling ? 'bg-emerald-500' : 'bg-slate-400'
                }`}
              ></span>
            </span>
            {!isCollapsed && (
              <span className="text-xs font-semibold text-slate-700 truncate">
                {isPolling ? 'Polling Active' : 'Polling Inactive'}
              </span>
            )}
          </div>
          {!isCollapsed && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {isPolling ? 'LIVE' : 'OFFLINE'}
            </span>
          )}
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                isActive
                  ? 'bg-[#24A1DE] text-white shadow-sm shadow-[#24A1DE]/25'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center space-x-3 min-w-0">
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                {!isCollapsed && (
                  <span className="truncate tracking-tight font-medium">{item.label}</span>
                )}
              </div>
              {!isCollapsed && item.badge && (
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-white text-[#24A1DE]'
                      : 'bg-[#24A1DE] text-white'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Branding */}
      {!isCollapsed && (
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Server Status:</span>
            <span className="font-semibold text-emerald-600">Online</span>
          </div>
        </div>
      )}
    </aside>
  );
};
