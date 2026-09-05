import React from 'react';

export default function SkeletonLoader({ rows = 6, columns = 5 }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200/90 bg-white p-4 shadow-subtle animate-pulse">
      <div className="mb-4 flex gap-4 border-b border-slate-200 pb-3">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={`header-${i}`} className="h-4 flex-1 rounded bg-slate-200" />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={`row-${r}`} className="flex gap-4 py-2">
            {Array.from({ length: columns }).map((_, c) => (
              <div
                key={`cell-${r}-${c}`}
                className="h-3.5 flex-1 rounded bg-slate-100"
                style={{ opacity: 1 - c * 0.12 }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
