import React from 'react';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';

export default function PayrollWarning({ warning, className = '' }) {
  if (!warning) return null;

  const isError = warning.severity === 'error';
  const Icon = isError ? AlertCircle : warning.severity === 'warning' ? AlertTriangle : Info;

  const bgClass = isError
    ? 'bg-rose-50 border-rose-200 text-rose-800'
    : warning.severity === 'warning'
    ? 'bg-amber-50 border-amber-200 text-amber-800'
    : 'bg-blue-50 border-blue-200 text-blue-800';

  const iconColor = isError
    ? 'text-rose-500'
    : warning.severity === 'warning'
    ? 'text-amber-500'
    : 'text-blue-500';

  return (
    <div className={`flex items-start gap-2.5 rounded-xl border p-3 text-xs ${bgClass} ${className}`}>
      <Icon className={`h-4 w-4 shrink-0 mt-0.5 ${iconColor}`} />
      <div className="flex-1">
        {warning.employeeName && (
          <span className="font-bold mr-1.5">{warning.employeeName}:</span>
        )}
        <span>{warning.message}</span>
      </div>
    </div>
  );
}
