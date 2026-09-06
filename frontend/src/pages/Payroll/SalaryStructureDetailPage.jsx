import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Layers, Sliders, ShieldAlert, ArrowDown } from 'lucide-react';
import { formatINR } from '../../utils/formatCurrency';
import { useHRData, DEFAULT_SALARY_STRUCTURES, DEFAULT_SALARY_RULES } from '../../context/HRDataContext';
import StatusBadge from '../../components/ui/StatusBadge';

export default function SalaryStructureDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { salaryStructures, salaryRules } = useHRData();

  const structuresList =
    salaryStructures && salaryStructures.length > 0 ? salaryStructures : DEFAULT_SALARY_STRUCTURES;
  const rulesList =
    salaryRules && salaryRules.length > 0 ? salaryRules : DEFAULT_SALARY_RULES;

  const struct = structuresList.find((s) => s.id === id || s.code === id);

  if (!struct) {
    return (
      <div className="p-8 text-center max-w-xl mx-auto">
        <h2 className="text-lg font-bold text-slate-800">Structure Not Found</h2>
        <button
          type="button"
          onClick={() => navigate('/payroll/salary-structures')}
          className="mt-4 rounded-xl bg-brand-400 px-4 py-2 text-xs font-bold text-slate-900"
        >
          Back to Structures
        </button>
      </div>
    );
  }

  const assignedRules = (struct.ruleIds || struct.rules || [])
    .map((rId) => rulesList.find((r) => r.id === rId || r.code === rId))
    .filter(Boolean)
    .sort((a, b) => (a.sequence || 0) - (b.sequence || 0));

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        type="button"
        onClick={() => navigate('/payroll/salary-structures')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Structures
      </button>

      {/* Header Info */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-700">{struct.code}</span>
            <h1 className="text-2xl font-bold text-slate-900 mt-0.5">{struct.name}</h1>
          </div>
          <StatusBadge status={struct.status} />
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">{struct.description}</p>
      </div>

      {/* Rule Sequence List */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Sliders className="h-4 w-4 text-brand-700" />
          Sequential Execution Pipeline ({assignedRules.length} Rules)
        </h3>

        <div className="space-y-3">
          {assignedRules.map((rule, index) => (
            <React.Fragment key={rule.id}>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 font-bold text-xs text-slate-700">
                    #{rule.sequence}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      {rule.name} ({rule.code})
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{rule.description}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-700">
                    {rule.category}
                  </span>
                  <p className="text-[11px] font-semibold text-brand-700 mt-1">
                    {rule.calculationType === 'fixed'
                      ? formatINR(rule.amount)
                      : rule.calculationType === 'percentage'
                      ? `${rule.percentage}% of Base`
                      : rule.formula}
                  </p>
                </div>
              </div>

              {index < assignedRules.length - 1 && (
                <div className="flex justify-center my-1">
                  <ArrowDown className="h-4 w-4 text-slate-300" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
