import React from 'react';
import { 
  Users, 
  MessageSquare, 
  Send, 
  UserCheck, 
  ShieldAlert, 
  Activity, 
  Sparkles, 
  Bot, 
  ArrowUpRight, 
  RefreshCw,
  Coins
} from 'lucide-react';
import { DashboardStats, TelegramUser, TelegramGroup, BroadcastCampaign } from '../types';

interface DashboardViewProps {
  stats: DashboardStats;
  recentUsers: TelegramUser[];
  recentGroups: TelegramGroup[];
  recentBroadcasts: BroadcastCampaign[];
  setActiveTab: (tab: string) => void;
  onOpenUserDetail: (user: TelegramUser) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  recentUsers,
  recentGroups,
  recentBroadcasts,
  setActiveTab,
  onOpenUserDetail
}) => {
  return (
    <div className="space-y-6 pb-10">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-[#24A1DE] to-[#1c83b8] rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Bot className="w-6 h-6 text-white" />
            <h1 className="text-xl font-extrabold tracking-tight">Telegram Bot Control Center</h1>
          </div>
          <p className="text-xs text-blue-100 max-w-xl">
            Real-time administration suite for @{stats.botInfo?.username || 'Configured_Bot'}. Manage messages, broadcast updates, and user balances cleanly.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('messages')}
            className="px-4 py-2 bg-white text-[#24A1DE] font-bold text-xs rounded-xl shadow-xs hover:bg-blue-50 transition-colors flex items-center space-x-1.5"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Open Messages</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className="px-4 py-2 bg-white/20 text-white font-semibold text-xs rounded-xl hover:bg-white/30 transition-colors"
          >
            Bot Settings
          </button>
        </div>
      </div>

      {/* Primary KPI Grid (Real DB Metrics Only) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Users */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Bot Users</span>
            <div className="p-2 bg-blue-50 text-[#24A1DE] rounded-xl">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{stats.totalUsers || 0}</span>
            <span className="text-xs text-slate-400 font-medium">{stats.activeUsers24h || 0} active</span>
          </div>
        </div>

        {/* Metric 2: Total Groups */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Groups</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{stats.totalGroups || 0}</span>
            <span className="text-xs text-slate-400 font-medium">Recorded in DB</span>
          </div>
        </div>

        {/* Metric 3: Total Messages */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Messages Processed</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{stats.messagesToday || 0}</span>
            <span className="text-xs text-emerald-600 font-medium">Real-time DB</span>
          </div>
        </div>

        {/* Metric 4: Total Credits */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Credits Pool</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{stats.creditsRemainingTotal || 0}</span>
            <span className="text-xs text-slate-400 font-medium">{stats.blockedUsersCount || 0} blocked users</span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Recent Users & Recent Groups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users List */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
              <Users className="w-4 h-4 text-[#24A1DE]" />
              <span>Recent Bot Users</span>
            </h3>
            <button
              onClick={() => setActiveTab('users')}
              className="text-xs font-semibold text-[#24A1DE] hover:underline flex items-center space-x-1"
            >
              <span>View All Users</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentUsers.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <Users className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500">No users registered in database yet.</p>
              <button
                onClick={() => setActiveTab('messages')}
                className="text-xs font-semibold text-[#24A1DE] hover:underline"
              >
                Go to Messages to add a test user
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {recentUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => onOpenUserDetail(user)}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors cursor-pointer"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <img
                      src={user.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.telegramId}`}
                      alt={user.firstName}
                      className="w-9 h-9 rounded-full object-cover border"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-xs text-slate-900 truncate">
                        {user.firstName} {user.lastName || ''}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        @{user.username || user.telegramId}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-800 block">{user.credits} Credits</span>
                    <span className="text-[10px] text-slate-400">{user.lastActive}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Groups List */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
              <UserCheck className="w-4 h-4 text-indigo-600" />
              <span>Active Telegram Groups</span>
            </h3>
            <button
              onClick={() => setActiveTab('groups')}
              className="text-xs font-semibold text-[#24A1DE] hover:underline flex items-center space-x-1"
            >
              <span>View All Groups</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentGroups.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <UserCheck className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500">No groups registered in database yet.</p>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                When you add your bot to a Telegram group and enable long polling, group details will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentGroups.map((group) => (
                <div
                  key={group.id}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 font-bold text-xs flex items-center justify-center">
                      {group.title.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-xs text-slate-900 truncate">{group.title}</p>
                      <p className="text-[11px] text-slate-400">ID: {group.groupId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-slate-700 block">{group.messagesHandledCount} msgs</span>
                    <span className="text-[10px] text-slate-400">{group.lastActive}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
