import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import PayrunListView from '../../components/payroll/PayrunListView';
import PayslipListView from '../../components/payroll/PayslipListView';
import SalaryStructuresView from '../../components/payroll/SalaryStructuresView';
import SalaryRulesView from '../../components/payroll/SalaryRulesView';
import NewPayrunWizardModal from '../../components/payroll/NewPayrunWizardModal';
import PayrunProcessingModal from '../../components/payroll/PayrunProcessingModal';
import PayslipDetailDrawer from '../../components/payroll/PayslipDetailDrawer';
import StatCard from '../../components/ui/StatCard';
import { useHRData } from '../../context/HRDataContext';
import { PAYROLL_TABS } from '../../constants/navigation';
import { CreditCard, FileText, Layers, Sliders, AlertTriangle, Plus, ShieldAlert, Zap } from 'lucide-react';

export default function PayrollPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'payruns';

  const { kpis, payruns, payslips, currentRole, switchRole } = useHRData();

  // Modals & Drawers state
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [activeProcessPayrun, setActiveProcessPayrun] = useState(null);
  const [selectedPayslip, setSelectedPayslip] = useState(null);

  // Check query params to auto-open specific payrun if requested
  useEffect(() => {
    const payrunParam = searchParams.get('payrun');
    if (payrunParam) {
      const found = payruns.find((p) => p.id === payrunParam);
      if (found) setActiveProcessPayrun(found);
    }
  }, [searchParams, payruns]);

  const handleTabChange = (tabId) => {
    setSearchParams({ tab: tabId });
  };

  const handlePayrunCreated = (newPayrun) => {
    setActiveProcessPayrun(newPayrun);
  };

  if (!currentRole?.permissions?.canAccessPayroll) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center max-w-lg mx-auto">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-100 text-amber-800 mb-4 shadow-sm">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Payroll Access Restricted</h2>
        <p className="mt-2 text-xs text-slate-600 leading-relaxed">
          You are currently viewing with the <strong className="text-slate-900">HR Manager</strong> persona.
          Full access to Payruns, Payslips, Salary Structures, and Rules is reserved for the <strong className="text-slate-900">HR Payroll Manager</strong>.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => switchRole('HR_PAYROLL_MANAGER')}
            className="btn-primary"
          >
            <Zap className="h-4 w-4" />
            Switch to HR Payroll Manager
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="btn-secondary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Operational Metrics Bar */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Payroll Status"
          value={kpis.payslipsGenerated}
          secondaryValue={`${payruns.length} batches`}
          subtext="Total payslips in record"
          icon="contract"
          colorScheme="mint"
        />
        <StatCard
          title="Payroll Cost (Current)"
          value={`$${Number(kpis.totalPayrollCost || 0).toLocaleString()}`}
          subtext={`Gross: $${Number(kpis.totalGrossPayroll || 0).toLocaleString()}`}
          icon="users"
          colorScheme="lime"
        />
        <StatCard
          title="Pending Payruns"
          value={kpis.pendingPayruns}
          subtext="Batches requiring review / action"
          icon="calendar"
          colorScheme="peach"
        />
        <StatCard
          title="Payroll Warnings"
          value={kpis.missingBankEmployeesCount}
          secondaryValue={kpis.missingBankEmployeesCount > 0 ? 'Blockers' : 'Clean'}
          subtext="Missing bank account info"
          icon="present"
          colorScheme={kpis.missingBankEmployeesCount > 0 ? 'peach' : 'sky'}
        />
      </section>

      {/* Main Tabbed Container */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6 text-xs font-semibold">
          {PAYROLL_TABS.map((tab) => {
            const count = kpis[tab.countKey];
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 pb-3.5 transition-colors border-b-2 ${
                  isActive
                    ? 'border-brand-500 text-slate-900'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                }`}
              >
                <span>{tab.label}</span>
                {count !== undefined && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      isActive
                        ? 'bg-brand-100 text-slate-900'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Panels */}
      {currentTab === 'payruns' && (
        <PayrunListView
          onOpenWizard={() => setIsWizardOpen(true)}
          onOpenProcess={(payrun) => setActiveProcessPayrun(payrun)}
        />
      )}

      {currentTab === 'payslips' && (
        <PayslipListView
          onSelectPayslip={(payslip) => setSelectedPayslip(payslip)}
        />
      )}

      {currentTab === 'structures' && <SalaryStructuresView />}

      {currentTab === 'rules' && <SalaryRulesView />}

      {/* Two-Step New Payrun Wizard Modal */}
      <NewPayrunWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onCreated={handlePayrunCreated}
      />

      {/* Payrun Command Center Processing Modal */}
      <PayrunProcessingModal
        isOpen={Boolean(activeProcessPayrun)}
        onClose={() => setActiveProcessPayrun(null)}
        payrun={activeProcessPayrun}
        onViewPayslip={(p) => setSelectedPayslip(p)}
      />

      {/* Payslip Slide-Over Drawer */}
      <PayslipDetailDrawer
        isOpen={Boolean(selectedPayslip)}
        onClose={() => setSelectedPayslip(null)}
        payslip={selectedPayslip}
      />
    </div>
  );
}
