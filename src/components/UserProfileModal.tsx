import React, { useState } from 'react';
import { 
  X, 
  Coins, 
  ShieldAlert, 
  MessageSquare, 
  Clock, 
  Globe, 
  User, 
  CheckCircle, 
  Save, 
  Trash2,
  Send
} from 'lucide-react';
import { TelegramUser } from '../types';

interface UserProfileModalProps {
  user: TelegramUser | null;
  onClose: () => void;
  onUpdateCredits: (userId: string, credits: number, mode: 'add' | 'subtract' | 'set') => void;
  onToggleBlock: (userId: string, block: boolean) => void;
  onDeleteUser: (userId: string) => void;
  onOpenChat: (user: TelegramUser) => void;
  showToast: (title: string, message?: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  onClose,
  onUpdateCredits,
  onToggleBlock,
  onDeleteUser,
  onOpenChat,
  showToast
}) => {
  if (!user) return null;

  const [notes, setNotes] = useState(user.adminNotes || '');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  const handleSaveNotes = async () => {
    try {
      setIsSavingNotes(true);
      await fetch('/api/admin/users/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, notes })
      });
      showToast('Notes Saved', 'Updated admin internal notes for user', 'success');
    } catch {
      showToast('Error', 'Failed to save notes', 'error');
    } finally {
      setIsSavingNotes(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
        {/* Header Profile Banner */}
        <div className="bg-gradient-to-r from-[#24A1DE] to-[#1c83b8] p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-4">
            <img
              src={user.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.telegramId}`}
              alt={user.firstName}
              className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
            />
            <div>
              <h2 className="text-lg font-bold tracking-tight">
                {user.firstName} {user.lastName || ''}
              </h2>
              <p className="text-xs text-blue-100 font-medium">
                @{user.username || 'no_username'} • ID: {user.telegramId}
              </p>
              <div className="flex items-center space-x-2 mt-2">
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold">
                  {user.languageCode?.toUpperCase() || 'EN'}
                </span>
                {user.isBlocked ? (
                  <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                    Blocked
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold">
                    Active User
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Remaining Credits</span>
              <span className="text-lg font-black text-slate-900 flex items-center space-x-1">
                <Coins className="w-4 h-4 text-amber-500" />
                <span>{user.credits}</span>
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Joined Date</span>
              <span className="text-xs font-bold text-slate-800">
                {new Date(user.joinedAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => { onClose(); onOpenChat(user); }}
              className="flex-1 py-2 px-3 bg-[#24A1DE] hover:bg-[#1f8ec4] text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors shadow-xs"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Open Chat</span>
            </button>

            <button
              onClick={() => onToggleBlock(user.id, !user.isBlocked)}
              className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1 transition-colors ${
                user.isBlocked ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-red-50 text-red-600 hover:bg-red-100'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>{user.isBlocked ? 'Unblock' : 'Block'}</span>
            </button>

            <button
              onClick={() => { onDeleteUser(user.id); onClose(); }}
              className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Delete Record"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Internal Admin Notes */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">Admin Internal Notes</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add internal notes about this user..."
              className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#24A1DE]"
            />
            <div className="flex justify-end">
              <button
                onClick={handleSaveNotes}
                disabled={isSavingNotes}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold flex items-center space-x-1"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Notes</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
