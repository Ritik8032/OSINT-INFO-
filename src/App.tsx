import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopNavbar } from './components/TopNavbar';
import { DashboardView } from './components/DashboardView';
import { MessagesView } from './components/MessagesView';
import { BroadcastCenter } from './components/BroadcastCenter';
import { GroupManager } from './components/GroupManager';
import { UserManager } from './components/UserManager';
import { UserProfileModal } from './components/UserProfileModal';
import { PermissionManager } from './components/PermissionManager';
import { CreditsView } from './components/CreditsView';
import { AnalyticsView } from './components/AnalyticsView';
import { BotLogs } from './components/BotLogs';
import { SettingsView } from './components/SettingsView';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { ToastContainer, ToastMessage } from './components/ToastContainer';
import { 
  TelegramUser, 
  TelegramGroup, 
  BroadcastCampaign, 
  ModulePermission, 
  ApiKeyConfig, 
  PlanConfig, 
  DashboardStats, 
  AnalyticsData, 
  BotConfig,
  BotLogEntry 
} from './types';

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Selected user for modal
  const [selectedUser, setSelectedUser] = useState<TelegramUser | null>(null);

  // App Data States
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers24h: 0,
    blockedUsersCount: 0,
    totalGroups: 0,
    messagesToday: 0,
    totalApiRequests: 0,
    creditsUsedToday: 0,
    creditsRemainingTotal: 0,
    totalLookups: 0,
    mobileCount: 0,
    adharCount: 0,
    upiCount: 0,
    ifscCount: 0,
    instagramCount: 0,
    totalLogs: 0,
    isPolling: false,
    botInfo: null
  });

  const [usersList, setUsersList] = useState<TelegramUser[]>([]);
  const [groupsList, setGroupsList] = useState<TelegramGroup[]>([]);
  const [broadcastsList, setBroadcastsList] = useState<BroadcastCampaign[]>([]);
  const [permissionsList, setPermissionsList] = useState<ModulePermission[]>([]);
  const [apiKeysList, setApiKeysList] = useState<ApiKeyConfig[]>([]);
  const [plansList, setPlansList] = useState<PlanConfig[]>([]);
  const [logsList, setLogsList] = useState<BotLogEntry[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);

  const [botConfig, setBotConfig] = useState<BotConfig>({
    botToken: '',
    apiKey: '',
    apiUrl: '',
    autoStartPolling: false,
    welcomeMessage: '👋 Welcome to our Telegram Bot!',
    isPollingActive: false
  });

  const showToast = (title: string, message?: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch All Admin Data from Server
  const fetchAdminData = async () => {
    setIsRefreshing(true);
    try {
      const [dashRes, usersRes, groupsRes, broadcastRes, permRes, analyticsRes, settingsRes, logsRes] = await Promise.all([
        fetch('/api/admin/dashboard').catch(() => null),
        fetch('/api/admin/users').catch(() => null),
        fetch('/api/admin/groups').catch(() => null),
        fetch('/api/admin/broadcasts').catch(() => null),
        fetch('/api/admin/permissions').catch(() => null),
        fetch('/api/admin/analytics').catch(() => null),
        fetch('/api/admin/settings').catch(() => null),
        fetch('/api/logs').catch(() => null)
      ]);

      if (dashRes && dashRes.ok) {
        const d = await dashRes.json();
        if (d.stats) setDashboardStats(d.stats);
      }
      if (usersRes && usersRes.ok) {
        const u = await usersRes.json();
        setUsersList(u.users || []);
      }
      if (groupsRes && groupsRes.ok) {
        const g = await groupsRes.json();
        setGroupsList(g.groups || []);
      }
      if (broadcastRes && broadcastRes.ok) {
        const b = await broadcastRes.json();
        setBroadcastsList(b.broadcasts || []);
      }
      if (permRes && permRes.ok) {
        const p = await permRes.json();
        setPermissionsList(p.permissions || []);
        setApiKeysList(p.apiKeys || []);
        setPlansList(p.plans || []);
      }
      if (analyticsRes && analyticsRes.ok) {
        const a = await analyticsRes.json();
        setAnalyticsData(a);
      }
      if (settingsRes && settingsRes.ok) {
        const s = await settingsRes.json();
        if (s.config) setBotConfig(s.config);
      }
      if (logsRes && logsRes.ok) {
        const l = await logsRes.json();
        setLogsList(l.logs || []);
      }
    } catch {
      // transient catch
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 10000); // 10s auto refresh
    return () => clearInterval(interval);
  }, []);

  // Handlers for User Management
  const handleUpdateCredits = async (userId: string, credits: number, mode: 'add' | 'subtract' | 'set') => {
    try {
      const res = await fetch('/api/admin/users/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, credits, mode })
      });
      if (res.ok) {
        fetchAdminData();
      }
    } catch {
      showToast('Error', 'Failed to update credits', 'error');
    }
  };

  const handleToggleBlockUser = async (userId: string, block: boolean) => {
    try {
      const res = await fetch('/api/admin/users/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, block })
      });
      if (res.ok) {
        showToast(block ? 'User Blocked' : 'User Unblocked', '', 'info');
        fetchAdminData();
      }
    } catch {
      showToast('Error', 'Failed to toggle block status', 'error');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('User Record Deleted', '', 'info');
        fetchAdminData();
      }
    } catch {
      showToast('Error', 'Failed to delete user', 'error');
    }
  };

  // Handlers for Group Management
  const handleGroupAction = async (groupId: string, action: 'mute' | 'remove') => {
    try {
      const res = await fetch('/api/admin/groups/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId, action })
      });
      if (res.ok) {
        showToast('Group Updated', '', 'info');
        fetchAdminData();
      }
    } catch {
      showToast('Error', 'Failed to update group', 'error');
    }
  };

  // Handlers for Broadcast
  const handleCreateBroadcast = async (payload: any) => {
    try {
      const res = await fetch('/api/admin/broadcasts/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showToast('Broadcast Dispatched', 'Message sent to target recipients', 'success');
        fetchAdminData();
      }
    } catch {
      showToast('Error', 'Failed to create broadcast', 'error');
    }
  };

  const handleRetryBroadcast = async (broadcastId: string) => {
    try {
      const res = await fetch('/api/admin/broadcasts/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ broadcastId })
      });
      if (res.ok) {
        showToast('Broadcast Retried', '', 'success');
        fetchAdminData();
      }
    } catch {
      showToast('Error', 'Failed to retry broadcast', 'error');
    }
  };

  // Handlers for Permissions
  const handleTogglePermission = async (permissionId: string, enabled: boolean) => {
    try {
      const res = await fetch('/api/admin/permissions/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissionId, enabled })
      });
      if (res.ok) {
        fetchAdminData();
      }
    } catch {
      showToast('Error', 'Failed to toggle permission', 'error');
    }
  };

  // Handlers for Settings
  const handleSaveConfig = async (updated: Partial<BotConfig>) => {
    try {
      const res = await fetch('/api/admin/settings/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      if (res.ok) {
        fetchAdminData();
      }
    } catch {
      showToast('Error', 'Failed to save settings', 'error');
    }
  };

  const handleTogglePolling = async (action: 'start' | 'stop') => {
    try {
      const res = await fetch('/api/bot/toggle-polling', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        const data = await res.json();
        showToast(action === 'start' ? 'Long Polling Started' : 'Polling Suspended', '', 'info');
        fetchAdminData();
      }
    } catch {
      showToast('Error', 'Failed to toggle polling', 'error');
    }
  };

  const handleClearLogs = async () => {
    try {
      await fetch('/api/logs', { method: 'DELETE' });
      showToast('Logs Cleared', '', 'info');
      fetchAdminData();
    } catch {
      showToast('Error', 'Failed to clear logs', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex font-sans antialiased selection:bg-[#24A1DE] selection:text-white">
      {/* Toast Notification Layer */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />

      {/* Telegram Style Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isPolling={botConfig.isPollingActive}
        botUsername={botConfig.botUsername}
      />

      {/* Main Workspace Container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header Navbar */}
        <TopNavbar
          theme={theme}
          setTheme={setTheme}
          activeTab={activeTab}
          onOpenSearch={() => setIsSearchOpen(true)}
          onRefreshData={fetchAdminData}
          isRefreshing={isRefreshing}
          botUsername={botConfig.botUsername}
          isPolling={botConfig.isPollingActive}
        />

        {/* View Router Body */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-100">
          {activeTab === 'dashboard' && (
            <DashboardView
              stats={dashboardStats}
              recentUsers={usersList.slice(0, 5)}
              recentGroups={groupsList.slice(0, 5)}
              recentBroadcasts={broadcastsList.slice(0, 3)}
              setActiveTab={setActiveTab}
              onOpenUserDetail={(u) => setSelectedUser(u)}
            />
          )}

          {activeTab === 'messages' && (
            <MessagesView
              showToast={showToast}
              botUsername={botConfig.botUsername}
              onOpenUserDetail={(usrId) => {
                const found = usersList.find(u => u.id === usrId || u.telegramId === Number(usrId));
                if (found) setSelectedUser(found);
              }}
            />
          )}

          {activeTab === 'broadcast' && (
            <BroadcastCenter
              broadcasts={broadcastsList}
              onCreateBroadcast={handleCreateBroadcast}
              onRetryBroadcast={handleRetryBroadcast}
              showToast={showToast}
            />
          )}

          {activeTab === 'users' && (
            <UserManager
              users={usersList}
              onOpenUserDetail={(u) => setSelectedUser(u)}
              onUpdateCredits={handleUpdateCredits}
              onToggleBlock={handleToggleBlockUser}
              onDeleteUser={handleDeleteUser}
              showToast={showToast}
              onSendMessageToUser={(u) => {
                setActiveTab('messages');
              }}
            />
          )}

          {activeTab === 'groups' && (
            <GroupManager
              groups={groupsList}
              onGroupAction={handleGroupAction}
              onBroadcastToGroup={(grp) => {
                setActiveTab('broadcast');
              }}
              showToast={showToast}
            />
          )}

          {activeTab === 'permissions' && (
            <PermissionManager
              permissions={permissionsList}
              apiKeys={apiKeysList}
              onTogglePermission={handleTogglePermission}
              showToast={showToast}
            />
          )}

          {activeTab === 'credits' && (
            <CreditsView
              plans={plansList}
              totalCreditsRemaining={dashboardStats.creditsRemainingTotal}
              totalUsers={usersList.length}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView
              analytics={analyticsData}
              totalLogs={logsList.length}
              totalUsers={usersList.length}
            />
          )}

          {activeTab === 'logs' && (
            <BotLogs
              logs={logsList}
              onClearLogs={handleClearLogs}
              onRefreshLogs={fetchAdminData}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              config={botConfig}
              onSaveConfig={handleSaveConfig}
              onTogglePolling={handleTogglePolling}
              showToast={showToast}
            />
          )}
        </main>
      </div>

      {/* User Profile Modal */}
      {selectedUser && (
        <UserProfileModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onUpdateCredits={handleUpdateCredits}
          onToggleBlock={handleToggleBlockUser}
          onDeleteUser={handleDeleteUser}
          onOpenChat={(u) => {
            setSelectedUser(null);
            setActiveTab('messages');
          }}
          showToast={showToast}
        />
      )}

      {/* Global Command Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        users={usersList}
        groups={groupsList}
        setActiveTab={setActiveTab}
        onOpenUserDetail={(u) => setSelectedUser(u)}
      />
    </div>
  );
}
