import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Clock, FileWarning, UserX, ArrowRight } from 'lucide-react';

const ICON_COMPONENTS = {
  AlertTriangle,
  Clock,
  FileWarning,
  UserX
};

export default function AttentionCard({ item }) {
  const navigate = useNavigate();
  const IconComponent = ICON_COMPONENTS[item.icon] || AlertTriangle;

  // Refined semantic tokens: crisp white card with purposeful colored accents
  const typeConfig = {
    danger: {
      topBorder: 'border-t-rose-500',
      iconBox: 'bg-rose-50 text-rose-600 border border-rose-100/80',
      badge: 'bg-rose-50 text-rose-700 border-rose-200/80',
      badgeDot: 'bg-rose-500',
      defaultBadge: 'Action Required',
      hoverBtn: 'group-hover:bg-rose-600 group-hover:text-white',
      hoverText: 'group-hover:text-rose-700'
    },
    warning: {
      topBorder: 'border-t-rose-500',
      iconBox: 'bg-rose-50 text-rose-600 border border-rose-100/80',
      badge: 'bg-rose-50 text-rose-700 border-rose-200/80',
      badgeDot: 'bg-rose-500',
      defaultBadge: 'Action Required',
      hoverBtn: 'group-hover:bg-rose-600 group-hover:text-white',
      hoverText: 'group-hover:text-rose-700'
    },
    urgent: {
      topBorder: 'border-t-amber-500',
      iconBox: 'bg-amber-50 text-amber-600 border border-amber-100/80',
      badge: 'bg-amber-50 text-amber-700 border-amber-200/80',
      badgeDot: 'bg-amber-500',
      defaultBadge: 'Pending Approval',
      hoverBtn: 'group-hover:bg-amber-600 group-hover:text-white',
      hoverText: 'group-hover:text-amber-700'
    },
    contract: {
      topBorder: 'border-t-brand-400',
      iconBox: 'bg-brand-50 text-brand-700 border border-brand-100',
      badge: 'bg-brand-50 text-slate-700 border-brand-200',
      badgeDot: 'bg-brand-500',
      defaultBadge: 'Expiring Soon',
      hoverBtn: 'group-hover:bg-brand-400 group-hover:text-slate-900',
      hoverText: 'group-hover:text-brand-700'
    },
    info: {
      topBorder: 'border-t-sky-500',
      iconBox: 'bg-sky-50 text-sky-600 border border-sky-100/80',
      badge: 'bg-sky-50 text-sky-700 border-sky-200/80',
      badgeDot: 'bg-sky-500',
      defaultBadge: 'Profile Data',
      hoverBtn: 'group-hover:bg-sky-600 group-hover:text-white',
      hoverText: 'group-hover:text-sky-700'
    }
  };

  const config = typeConfig[item.type] || typeConfig.warning;
  const badgeLabel = item.badgeText || config.defaultBadge;

  return (
    <div
      onClick={() => navigate(item.targetRoute)}
      className={`group relative flex h-full flex-col justify-between rounded-xl border border-slate-200/80 border-t-4 ${config.topBorder} bg-white p-5 shadow-xs hover:border-slate-300 hover:shadow-md transition-all duration-200 cursor-pointer`}
    >
      <div>
        {/* Header: Semantic Icon & Status Pill */}
        <div className="flex items-center justify-between">
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg shadow-2xs ${config.iconBox}`}>
            <IconComponent className="h-4 w-4" />
          </div>
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${config.badge}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${config.badgeDot} ${item.type === 'danger' || item.type === 'warning' ? 'animate-pulse' : ''}`} />
            {badgeLabel}
          </span>
        </div>

        {/* Content: Title & Operational Context */}
        <div className="mt-3.5">
          <h3 className={`text-sm font-bold text-slate-900 leading-snug ${config.hoverText} transition-colors`}>
            {item.title}
          </h3>
          <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
            {item.description}
          </p>
        </div>
      </div>

      {/* Footer: Action Button */}
      <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
        <span className={`text-xs font-semibold text-slate-700 ${config.hoverText} transition-colors`}>
          {item.actionLabel}
        </span>
        <div className={`flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-slate-500 ${config.hoverBtn} transition-all transform group-hover:translate-x-0.5`}>
          <ArrowRight className="h-3.5 w-3.5" />
        </div>
      </div>
    </div>
  );
}
