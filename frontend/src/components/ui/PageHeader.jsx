import React from 'react';

export default function PageHeader({ title, subtitle, actions, count }) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-[28px]">
          {title}
          {typeof count === 'number' && (
            <span className="ml-2 align-middle text-base font-medium text-slate-400">
              {count}
            </span>
          )}
        </h1>
        {subtitle && (
          <p className="mt-1.5 max-w-2xl text-sm text-slate-500">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
