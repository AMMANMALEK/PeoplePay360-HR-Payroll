import React, { useState } from 'react';
import { Sliders, Search, Filter, ShieldAlert, ArrowRight, X } from 'lucide-react';
import { useHRData } from '../../context/HRDataContext';
import StatusBadge from '../../components/ui/StatusBadge';

export default function SalaryRuleListPage() {
  const { salaryRules } = useHRData();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedRule, setSelectedRule] = useState(null);

  const filteredRules = salaryRules.filter((rule) => {
    const matchesSearch =
      rule.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.category?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'ALL' ? true : rule.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(salaryRules.map((r) => r.category).filter(Boolean))];

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-900">
              Read-Only Access
            </span>
            <span className="text-xs font-semibold text-slate-400">• Salary Rules Engine</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Salary Computation Rules</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Individual calculation rules specifying base formulas, percentages, allowances, and statutory tax deductions.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-3.5 py-2 text-xs font-semibold text-slate-600">
          <ShieldAlert className="h-4 w-4 text-amber-600" />
          Rules managed by Payroll Administrator
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search rule name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-4 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:border-brand-400 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Rules Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/60 font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3.5">Sequence</th>
                <th className="px-5 py-3.5">Code & Name</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Calculation Method</th>
                <th className="px-5 py-3.5">Formula / Value</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredRules.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                    No salary rules found matching search.
                  </td>
                </tr>
              ) : (
                filteredRules.map((rule) => (
                  <tr
                    key={rule.id}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                    onClick={() => setSelectedRule(rule)}
                  >
                    <td className="px-5 py-4 font-bold text-slate-500">#{rule.sequence}</td>
                    <td className="px-5 py-4 font-bold text-slate-900">
                      <div>
                        <span>{rule.name}</span>
                        <span className="block text-[11px] font-normal text-slate-400">{rule.code}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 uppercase">
                        {rule.category}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-700 capitalize font-medium">
                      {rule.calculationType}
                    </td>
                    <td className="px-5 py-4 font-mono text-xs font-semibold text-brand-800">
                      {rule.calculationType === 'fixed'
                        ? `$${(rule.amount || 0).toLocaleString()}`
                        : rule.calculationType === 'percentage'
                        ? `${rule.percentage}%`
                        : rule.formula}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={rule.status} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRule(rule);
                        }}
                        className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                      >
                        View Formula
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rule Detail Drawer Modal */}
      {selectedRule && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
          <div className="flex h-full w-full max-w-md flex-col bg-white p-6 shadow-2xl space-y-6 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-brand-700 uppercase">{selectedRule.code}</span>
                <h3 className="text-lg font-bold text-slate-900">{selectedRule.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRule(null)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="font-bold text-slate-400 uppercase text-[10px] block">Category</span>
                <span className="font-bold text-slate-900 text-sm">{selectedRule.category}</span>
              </div>

              <div>
                <span className="font-bold text-slate-400 uppercase text-[10px] block">Sequence Order</span>
                <span className="font-bold text-slate-900">Step #{selectedRule.sequence}</span>
              </div>

              <div>
                <span className="font-bold text-slate-400 uppercase text-[10px] block">Description</span>
                <p className="text-slate-600 mt-0.5">{selectedRule.description}</p>
              </div>

              <div className="rounded-2xl bg-slate-900 text-white p-4 space-y-2">
                <span className="font-bold text-slate-400 uppercase text-[10px] block">Calculation Method</span>
                <p className="text-sm font-bold capitalize">{selectedRule.calculationType}</p>

                <div className="pt-2 border-t border-slate-800">
                  <span className="font-bold text-slate-400 uppercase text-[10px] block">Formula / Expression</span>
                  <p className="font-mono text-emerald-400 font-bold mt-1 text-sm">
                    {selectedRule.formula || (selectedRule.percentage ? `${selectedRule.percentage}%` : `$${selectedRule.amount}`)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
