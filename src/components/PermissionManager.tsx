import React, { useState } from 'react';
import { ShieldCheck, ToggleLeft, ToggleRight, Lock, Key } from 'lucide-react';
import { ModulePermission, ApiKeyConfig } from '../types';

interface PermissionManagerProps {
  permissions: ModulePermission[];
  apiKeys: ApiKeyConfig[];
  onTogglePermission: (id: string, enabled: boolean) => void;
  showToast: (title: string, message?: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
}

export const PermissionManager: React.FC<PermissionManagerProps> = ({
  permissions,
  apiKeys,
  onTogglePermission,
  showToast
}) => {
  return (
    <div className="space-y-6 pb-10">
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-[#24A1DE]" />
          <span>Permissions & Feature Modules</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Enable or disable specific bot modules, lookup engines, and command capabilities in real-time.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {permissions.map((perm) => (
          <div
            key={perm.id}
            className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex items-center justify-between"
          >
            <div className="space-y-1 max-w-sm">
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-sm text-slate-900">{perm.name}</h3>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                  {perm.key}
                </span>
              </div>
              <p className="text-xs text-slate-500">{perm.description}</p>
            </div>

            <button
              onClick={() => {
                onTogglePermission(perm.id, !perm.enabled);
                showToast('Permission Updated', `Toggled ${perm.name}`, 'info');
              }}
              className="p-1 transition-colors"
            >
              {perm.enabled ? (
                <ToggleRight className="w-10 h-10 text-[#24A1DE]" />
              ) : (
                <ToggleLeft className="w-10 h-10 text-slate-300" />
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
