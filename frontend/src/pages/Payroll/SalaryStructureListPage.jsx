import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useHRData } from '../../context/HRDataContext';
import StatusBadge from '../../components/ui/StatusBadge';

export default function SalaryStructureListPage() {
  const navigate = useNavigate();
  const { salaryStructures, salaryRules } = useHRData();

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-900">
              Read-Only Access
            </span>
            <span className="text-xs font-semibold text-slate-400">• Salary Configuration</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Salary Structures</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pre-defined rule execution hierarchies applied to employee contracts during payroll calculation.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-3.5 py-2 text-xs font-semibold text-slate-600">
          <ShieldAlert className="h-4 w-4 text-amber-600" />
          Structures are managed by HR Admin
        </div>
      </div>

      {/* Grid of Salary Structures */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {salaryStructures.map((struct) => {
          const ruleObjects = (struct.rules || [])
            .map((rId) => salaryRules.find((r) => r.id === rId || r.code === rId))
            .filter(Boolean);

          return (
            <div
              key={struct.id}
              className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {struct.code}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-0.5">{struct.name}</h3>
                  </div>
                  <StatusBadge status={struct.status} />
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{struct.description}</p>

                <div className="space-y-2 pt-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Assigned Execution Rules ({ruleObjects.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {ruleObjects.map((rule) => (
                      <span
                        key={rule.code}
                        className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700"
                      >
                        {rule.code} • {rule.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Type: {struct.type || 'Standard'}</span>
                <button
                  type="button"
                  onClick={() => navigate(`/payroll/salary-structures/${struct.id}`)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 hover:underline"
                >
                  View Rule Sequence
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
