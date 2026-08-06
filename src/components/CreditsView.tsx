import React from 'react';
import { Coins, Check, Zap, Sparkles } from 'lucide-react';
import { PlanConfig } from '../types';

interface CreditsViewProps {
  plans: PlanConfig[];
  totalCreditsRemaining: number;
  totalUsers: number;
}

export const CreditsView: React.FC<CreditsViewProps> = ({
  plans,
  totalCreditsRemaining,
  totalUsers
}) => {
  return (
    <div className="space-y-6 pb-10">
      {/* Header Overview */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <Coins className="w-5 h-5 text-amber-500" />
            <span>Credits & Plan Tiers</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure credit packages and lookup limits for your Telegram bot users.
          </p>
        </div>

        <div className="flex items-center space-x-4 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Active Credits</span>
            <span className="text-base font-black text-slate-900">{totalCreditsRemaining}</span>
          </div>
          <div className="border-l border-slate-200 h-8" />
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Registered Users</span>
            <span className="text-base font-black text-slate-900">{totalUsers}</span>
          </div>
        </div>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`bg-white rounded-2xl p-6 border shadow-2xs space-y-4 relative flex flex-col justify-between ${
              plan.isPopular ? 'border-[#24A1DE] ring-2 ring-[#24A1DE]/20' : 'border-slate-200/80'
            }`}
          >
            {plan.isPopular && (
              <span className="absolute -top-3 right-4 bg-[#24A1DE] text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
                Most Popular
              </span>
            )}

            <div className="space-y-3">
              <h3 className="text-base font-bold text-slate-900">{plan.name}</h3>
              <div className="flex items-baseline space-x-1">
                <span className="text-2xl font-black text-slate-900">₹{plan.priceINR}</span>
                <span className="text-xs text-slate-400 font-medium">/ month</span>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-center space-x-2 text-slate-700 font-medium">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>{plan.dailyCredits} Daily Credits Allocation</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-700 font-medium">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>Up to {plan.maxGroups} Group Chats</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-700 font-medium">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>{plan.allowedLookupTypes.length} Bot Modules Enabled</span>
                </div>
              </div>
            </div>

            <button className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-colors">
              Configure Tier
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
