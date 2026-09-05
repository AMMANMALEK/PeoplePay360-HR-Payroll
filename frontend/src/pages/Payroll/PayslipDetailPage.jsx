import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Download, CheckCircle, AlertTriangle, Building, Calendar, User, FileText } from 'lucide-react';
import { useHRData } from '../../context/HRDataContext';
import StatusBadge from '../../components/ui/StatusBadge';

export default function PayslipDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { payslips } = useHRData();

  const payslip = payslips.find((p) => p.id === id);

  if (!payslip) {
    return (
      <div className="p-8 text-center max-w-xl mx-auto">
        <h2 className="text-lg font-bold text-slate-800">Payslip Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">
          No payslip record with ID <span className="font-semibold">{id}</span> could be located.
        </p>
        <button
          type="button"
          onClick={() => navigate('/payroll/payslips')}
          className="mt-4 rounded-xl bg-brand-400 px-4 py-2 text-xs font-bold text-slate-900"
        >
          Back to Payslips
        </button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const earningsItems = (payslip.lineItems || []).filter(
    (item) => item.category === 'Basic' || item.category === 'Allowances'
  );

  const deductionsItems = (payslip.lineItems || []).filter(
    (item) => item.category === 'Deductions'
  );

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-4xl mx-auto">
      {/* Top Header Controls (Hidden on Print) */}
      <div className="flex items-center justify-between gap-4 print:hidden">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-slate-800"
          >
            <Printer className="h-4 w-4" />
            Print Payslip
          </button>
        </div>
      </div>

      {/* Main Printable Document Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm print:border-none print:p-0 print:shadow-none space-y-8">
        {/* Company & Document Header */}
        <div className="flex items-start justify-between border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-400 text-slate-900 font-extrabold text-sm">
                P
              </div>
              <span className="text-xl font-bold text-slate-900">PeoplePay360</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Enterprise HR & Payroll Management</p>
          </div>

          <div className="text-right">
            <h2 className="text-xl font-black uppercase tracking-wider text-slate-900">Payslip Statement</h2>
            <p className="text-xs font-bold text-brand-700 mt-0.5">{payslip.payrunPeriod}</p>
            <p className="text-[11px] text-slate-400 mt-1">Ref ID: {payslip.id}</p>
            <div className="mt-1">
              <StatusBadge status={payslip.status} size="sm" />
            </div>
          </div>
        </div>

        {/* Employee & Payrun Information Grid */}
        <div className="grid grid-cols-2 gap-6 rounded-2xl bg-slate-50/70 p-5 border border-slate-100">
          <div className="space-y-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Employee Name</span>
              <p className="text-sm font-bold text-slate-900">{payslip.employeeName}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Employee Code</span>
              <p className="text-xs font-semibold text-slate-700">{payslip.employeeCode}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Department</span>
              <p className="text-xs font-semibold text-slate-700">{payslip.department}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Designation / Role</span>
              <p className="text-sm font-bold text-slate-900">{payslip.designation}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Contract Reference</span>
              <p className="text-xs font-semibold text-slate-700">{payslip.contractRef}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Contract Monthly Wage</span>
              <p className="text-xs font-bold text-slate-900">${(payslip.wageAmount || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Attendance & Proration Summary */}
        <div className="rounded-xl border border-slate-200/80 p-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
            Attendance & Proration Input Summary
          </h4>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="border-r border-slate-100 pr-2">
              <span className="text-[10px] font-medium text-slate-400 block">Total Working Days</span>
              <span className="text-sm font-bold text-slate-900">{payslip.totalWorkingDays} Days</span>
            </div>
            <div className="border-r border-slate-100 pr-2">
              <span className="text-[10px] font-medium text-slate-400 block">Days Worked</span>
              <span className="text-sm font-bold text-emerald-700">{payslip.workedDays} Days</span>
            </div>
            <div className="border-r border-slate-100 pr-2">
              <span className="text-[10px] font-medium text-slate-400 block">Unpaid Absence</span>
              <span className="text-sm font-bold text-rose-600">{payslip.unpaidDays} Days</span>
            </div>
            <div>
              <span className="text-[10px] font-medium text-slate-400 block">Proration Factor</span>
              <span className="text-sm font-bold text-slate-900">{(payslip.prorationFactor * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>

        {/* Earnings & Deductions Breakdown Tables */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Earnings */}
          <div className="rounded-2xl border border-slate-200 overflow-hidden">
            <div className="bg-emerald-50/70 border-b border-emerald-100 px-4 py-2.5 flex justify-between items-center">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900">Earnings</h4>
              <span className="text-xs font-bold text-emerald-900">${(payslip.grossSalary || 0).toLocaleString()}</span>
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-3.5 py-2">Component</th>
                  <th className="px-3.5 py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {earningsItems.map((item) => (
                  <tr key={item.ruleCode}>
                    <td className="px-3.5 py-2.5">
                      <p className="font-bold text-slate-900">{item.ruleName} ({item.ruleCode})</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{item.calculationSummary}</p>
                    </td>
                    <td className="px-3.5 py-2.5 text-right font-bold text-slate-900">
                      ${(item.amount || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Deductions */}
          <div className="rounded-2xl border border-slate-200 overflow-hidden">
            <div className="bg-rose-50/70 border-b border-rose-100 px-4 py-2.5 flex justify-between items-center">
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-900">Deductions</h4>
              <span className="text-xs font-bold text-rose-900">-${(payslip.totalDeductions || 0).toLocaleString()}</span>
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-3.5 py-2">Component</th>
                  <th className="px-3.5 py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {deductionsItems.map((item) => (
                  <tr key={item.ruleCode}>
                    <td className="px-3.5 py-2.5">
                      <p className="font-bold text-slate-900">{item.ruleName} ({item.ruleCode})</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{item.calculationSummary}</p>
                    </td>
                    <td className="px-3.5 py-2.5 text-right font-bold text-rose-700">
                      -${(item.amount || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Net Salary Summary Box */}
        <div className="rounded-2xl bg-slate-900 text-white p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Total Take-Home Pay</span>
            <h3 className="text-3xl font-black text-emerald-400 mt-1">
              ${(payslip.netSalary || 0).toLocaleString()}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Gross Earnings (${(payslip.grossSalary || 0).toLocaleString()}) - Deductions (${(payslip.totalDeductions || 0).toLocaleString()})
            </p>
          </div>

          <div className="text-right text-xs text-slate-300">
            <p className="font-bold text-white">Direct Bank Transfer</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Disbursement Ref: DISB-{payslip.id}</p>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center text-[10px] text-slate-400 pt-4 border-t border-slate-100">
          This payslip is an electronically generated statement by PeoplePay360. No signature required.
        </div>
      </div>
    </div>
  );
}
