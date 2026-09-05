import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const typeConfig = {
    success: {
      border: 'border-emerald-200 bg-white text-slate-800',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600'
    },
    error: {
      border: 'border-rose-200 bg-white text-slate-800',
      icon: AlertCircle,
      iconColor: 'text-rose-600'
    },
    info: {
      border: 'border-indigo-200 bg-white text-slate-800',
      icon: Info,
      iconColor: 'text-indigo-600'
    }
  };

  const config = typeConfig[toast.type] || typeConfig.success;
  const Icon = config.icon;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md animate-in slide-in-from-bottom-5 duration-200">
      <div className={`flex items-center gap-3 rounded-xl border p-4 shadow-dropdown ${config.border}`}>
        <Icon className={`h-5 w-5 shrink-0 ${config.iconColor}`} />
        <p className="text-xs font-medium text-slate-800 leading-snug">{toast.message}</p>
        <button
          type="button"
          onClick={onClose}
          className="ml-auto shrink-0 rounded p-1 text-slate-400 hover:text-slate-600"
          aria-label="Dismiss notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
