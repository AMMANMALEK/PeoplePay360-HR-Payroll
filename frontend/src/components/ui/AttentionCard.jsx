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

  // Visual severity indicators according to design guidelines
  const typeStyles = {
    warning: {
      border: 'border-rose-200 bg-rose-50/40 hover:bg-rose-50/80 hover:border-rose-300',
      badge: 'bg-rose-100 text-rose-800 border-rose-200',
      icon: 'bg-rose-100 text-rose-700',
      dot: 'bg-rose-500',
      btn: 'text-rose-900 bg-white hover:bg-rose-50 border border-rose-200 shadow-2xs'
    },
    urgent: {
      border: 'border-amber-200 bg-amber-50/40 hover:bg-amber-50/80 hover:border-amber-300',
      badge: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: 'bg-amber-100 text-amber-700',
      dot: 'bg-amber-500',
      btn: 'text-amber-900 bg-white hover:bg-amber-50 border border-amber-200 shadow-2xs'
    },
    info: {
      border: 'border-sky-200 bg-sky-50/40 hover:bg-sky-50/80 hover:border-sky-300',
      badge: 'bg-sky-100 text-sky-800 border-sky-200',
      icon: 'bg-sky-100 text-sky-700',
      dot: 'bg-sky-500',
      btn: 'text-sky-900 bg-white hover:bg-sky-50 border border-sky-200 shadow-2xs'
    }
  };

  const style = typeStyles[item.type] || typeStyles.warning;

  return (
    <div
      onClick={() => navigate(item.targetRoute)}
      className={`group flex flex-col justify-between rounded-xl border p-4.5 cursor-pointer transition-all duration-200 hover:shadow-hover hover:-translate-y-0.5 sm:flex-row sm:items-center ${style.border}`}
    >
      <div className="flex items-start gap-3.5">
        <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg shadow-2xs ${style.icon}`}>
          <IconComponent className="h-4 w-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${style.dot} animate-pulse`} />
            <h3 className="text-xs font-bold text-slate-900">{item.title}</h3>
            {item.count && (
              <span className={`inline-flex items-center rounded-full border px-2 py-0.2 text-[10px] font-bold ${style.badge}`}>
                {item.count}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-600 leading-relaxed">{item.description}</p>
        </div>
      </div>

      <div className="mt-3 shrink-0 sm:mt-0 sm:pl-4">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            navigate(item.targetRoute);
          }}
          className={`inline-flex w-full items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all duration-150 sm:w-auto ${style.btn}`}
        >
          <span>{item.actionLabel}</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}
