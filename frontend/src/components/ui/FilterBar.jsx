import React from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';

export default function FilterBar({
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Search records...',
  filters = [],
  activeFilters = {},
  onFilterChange,
  onClearAll,
  extraActions
}) {
  const activeEntries = Object.entries(activeFilters).filter(
    ([_, value]) => value && value !== 'All'
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative min-w-[240px] flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-8 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Filter Select Dropdowns */}
          {filters.map((filter) => (
            <div key={filter.key} className="shrink-0">
              <select
                value={activeFilters[filter.key] || 'All'}
                onChange={(e) => onFilterChange(filter.key, e.target.value)}
                className="rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs font-medium text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
              >
                <option value="All">{filter.label}: All</option>
                {filter.options.map((opt) => (
                  <option key={opt.value || opt} value={opt.value || opt}>
                    {opt.label || opt}
                  </option>
                ))}
              </select>
            </div>
          ))}

          {activeEntries.length > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors px-1"
            >
              Clear all
            </button>
          )}
        </div>

        {extraActions && (
          <div className="flex items-center gap-2 shrink-0">
            {extraActions}
          </div>
        )}
      </div>

      {/* Active Filter Chips */}
      {activeEntries.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mr-1">
            Active Filters:
          </span>
          {activeEntries.map(([key, val]) => {
            const filterDef = filters.find((f) => f.key === key);
            const label = filterDef ? filterDef.label : key;
            return (
              <span
                key={key}
                className="inline-flex items-center gap-1 rounded-md border border-indigo-200 bg-indigo-50/80 px-2 py-0.5 text-xs font-medium text-indigo-700"
              >
                <span>{label}: {val}</span>
                <button
                  type="button"
                  onClick={() => onFilterChange(key, 'All')}
                  className="rounded p-0.5 hover:bg-indigo-200/60 text-indigo-500 hover:text-indigo-800 transition-colors"
                  aria-label={`Remove filter ${label}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
