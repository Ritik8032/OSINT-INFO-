import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  ShieldAlert, 
  Coins, 
  Trash2, 
  MessageSquare, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  Plus, 
  Minus, 
  X, 
  User,
  ExternalLink,
  Bot
} from 'lucide-react';
import { TelegramUser } from '../types';

interface UserManagerProps {
  users: TelegramUser[];
  onOpenUserDetail: (user: TelegramUser) => void;
  onUpdateCredits: (userId: string, credits: number, mode: 'add' | 'subtract' | 'set') => void;
  onToggleBlock: (userId: string, block: boolean) => void;
  onDeleteUser: (userId: string) => void;
  showToast: (title: string, message?: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  onSendMessageToUser?: (user: TelegramUser) => void;
}

export const UserManager: React.FC<UserManagerProps> = ({
  users,
  onOpenUserDetail,
  onUpdateCredits,
  onToggleBlock,
  onDeleteUser,
  showToast,
  onSendMessageToUser
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'blocked'>('all');

  // Credit Edit Modal State
  const [selectedUserForCredit, setSelectedUserForCredit] = useState<TelegramUser | null>(null);
  const [creditAmount, setCreditAmount] = useState('100');
  const [creditMode, setCreditMode] = useState<'add' | 'subtract' | 'set'>('add');

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.username && u.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
      u.telegramId.toString().includes(searchQuery);

    if (statusFilter === 'blocked') return matchesSearch && u.isBlocked;
    if (statusFilter === 'active') return matchesSearch && !u.isBlocked;
    return matchesSearch;
  });

  const handleApplyCredits = () => {
    if (!selectedUserForCredit) return;
    const amount = Number(creditAmount) || 0;
    onUpdateCredits(selectedUserForCredit.id, amount, creditMode);
    showToast('Credits Updated', `Updated credit balance for ${selectedUserForCredit.firstName}`, 'success');
    setSelectedUserForCredit(null);
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <Users className="w-5 h-5 text-[#24A1DE]" />
            <span>Telegram Users ({users.length})</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Registered Telegram users saved in database.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search name, username, Telegram ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#24A1DE]"
            />
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                statusFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('blocked')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                statusFilter === 'blocked' ? 'bg-red-500 text-white shadow-2xs' : 'text-slate-500'
              }`}
            >
              Blocked
            </button>
          </div>
        </div>
      </div>

      {/* User Table / List */}
      {filteredUsers.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 space-y-3">
          <div className="w-16 h-16 bg-blue-50 text-[#24A1DE] rounded-full flex items-center justify-center mx-auto">
            <User className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">No Registered Telegram Users Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            There are currently no users in your database. When users send a message to your Telegram bot or click "Test Message" in Messages, user accounts will be automatically created here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">User</th>
                  <th className="p-3.5">Telegram ID</th>
                  <th className="p-3.5">Language</th>
                  <th className="p-3.5">Credits</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Joined Date</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center space-x-3">
                        <img
                          src={u.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.telegramId}`}
                          alt={u.firstName}
                          className="w-10 h-10 rounded-full object-cover border"
                        />
                        <div>
                          <p className="font-bold text-slate-900 hover:text-[#24A1DE] cursor-pointer" onClick={() => onOpenUserDetail(u)}>
                            {u.firstName} {u.lastName || ''}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            @{u.username || 'no_username'}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 font-mono text-slate-700 font-medium">
                      {u.telegramId}
                    </td>

                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold uppercase text-[10px]">
                        {u.languageCode || 'EN'}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900">{u.credits}</span>
                        <button
                          onClick={() => setSelectedUserForCredit(u)}
                          className="p-1 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 font-semibold text-[10px]"
                          title="Modify Credits Balance"
                        >
                          <Coins className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    <td className="p-3.5">
                      {u.isBlocked ? (
                        <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold text-[10px]">
                          Blocked
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px]">
                          Active
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 text-slate-500 font-medium">
                      {new Date(u.joinedAt).toLocaleDateString()}
                    </td>

                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => onOpenUserDetail(u)}
                          className="px-2.5 py-1.5 rounded-lg bg-[#24A1DE]/10 text-[#24A1DE] hover:bg-[#24A1DE]/20 font-semibold text-xs transition-colors"
                        >
                          Profile
                        </button>

                        {onSendMessageToUser && (
                          <button
                            onClick={() => onSendMessageToUser(u)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#24A1DE] hover:bg-slate-100"
                            title="Open Chat in Messages"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => onToggleBlock(u.id, !u.isBlocked)}
                          className={`p-1.5 rounded-lg text-xs font-semibold ${
                            u.isBlocked
                              ? 'text-emerald-600 hover:bg-emerald-50'
                              : 'text-red-500 hover:bg-red-50'
                          }`}
                          title={u.isBlocked ? 'Unblock User' : 'Block User'}
                        >
                          <ShieldAlert className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onDeleteUser(u.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                          title="Delete User Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Credits Modal */}
      {selectedUserForCredit && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                <Coins className="w-4 h-4 text-amber-500" />
                <span>Modify Credits for {selectedUserForCredit.firstName}</span>
              </h3>
              <button onClick={() => setSelectedUserForCredit(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setCreditMode('add')}
                  className={`flex-1 py-1 text-xs font-bold rounded-lg ${creditMode === 'add' ? 'bg-emerald-600 text-white' : 'text-slate-600'}`}
                >
                  + Add
                </button>
                <button
                  onClick={() => setCreditMode('subtract')}
                  className={`flex-1 py-1 text-xs font-bold rounded-lg ${creditMode === 'subtract' ? 'bg-red-600 text-white' : 'text-slate-600'}`}
                >
                  - Subtract
                </button>
                <button
                  onClick={() => setCreditMode('set')}
                  className={`flex-1 py-1 text-xs font-bold rounded-lg ${creditMode === 'set' ? 'bg-blue-600 text-white' : 'text-slate-600'}`}
                >
                  Set Exact
                </button>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Credit Amount</label>
                <input
                  type="number"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-mono focus:outline-none focus:border-[#24A1DE]"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button onClick={() => setSelectedUserForCredit(null)} className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100">
                Cancel
              </button>
              <button onClick={handleApplyCredits} className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-[#24A1DE] text-white hover:bg-[#1f8ec4]">
                Apply Credits
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
