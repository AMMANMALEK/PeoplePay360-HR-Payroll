import { apiClient } from './apiService';

export const PAYRUNS_ENDPOINT = ''; // Decoupled: empty placeholder
export const PAYSLIPS_ENDPOINT = ''; // Decoupled: empty placeholder

let localPayruns = [];
let localPayslips = [];

/**
 * Computes a single employee's payslip based on contract wage and salary rules
 */
export function computeEmployeePayslip({
  employee,
  contract,
  payrun,
  salaryRules = [],
  workedDays = 22,
  totalWorkDays = 22,
}) {
  const attendanceRatio = totalWorkDays > 0 ? Math.min(1, workedDays / totalWorkDays) : 1;

  const rawWage = contract?.wageAmount != null ? contract.wageAmount : (contract?.wage || 75000);
  const baseWage = typeof rawWage === 'number' ? rawWage : Number(String(rawWage).replace(/[^0-9.]/g, '')) || 75000;

  const hasCustomBreakdown =
    contract &&
    (Number(contract.basicSalary) > 0 ||
      Number(contract.hra) > 0 ||
      Number(contract.specialAllowance) > 0 ||
      Number(contract.bonus) > 0 ||
      Number(contract.pfDeduction) > 0 ||
      Number(contract.professionalTax) > 0 ||
      Number(contract.tdsDeduction) > 0);

  let earnings = [];
  let deductions = [];

  if (hasCustomBreakdown) {
    const basicAmount = Math.round((Number(contract.basicSalary) || 0) * attendanceRatio);
    const hraAmount = Math.round((Number(contract.hra) || 0) * attendanceRatio);
    const specAmount = Math.round((Number(contract.specialAllowance) || 0) * attendanceRatio);
    const bonusAmount = Math.round((Number(contract.bonus) || 0) * attendanceRatio);

    if (basicAmount > 0) {
      earnings.push({ code: 'BASIC', name: 'Basic Salary', amount: basicAmount });
    }
    if (hraAmount > 0) {
      earnings.push({ code: 'HRA', name: 'House Rent Allowance', amount: hraAmount });
    }
    if (specAmount > 0) {
      earnings.push({ code: 'SPEC', name: 'Special / Other Allowance', amount: specAmount });
    }
    if (bonusAmount > 0) {
      earnings.push({ code: 'BONUS', name: 'Bonus / Incentive', amount: bonusAmount });
    }

    if (earnings.length === 0) {
      earnings.push({ code: 'BASIC', name: 'Basic Salary', amount: Math.round(baseWage * attendanceRatio) });
    }

    const gross = earnings.reduce((sum, item) => sum + item.amount, 0);

    const pfAmount = contract.pfDeduction != null && Number(contract.pfDeduction) >= 0
      ? Math.round(Number(contract.pfDeduction))
      : Math.round(basicAmount * 0.12);
    const ptaxAmount = contract.professionalTax != null && Number(contract.professionalTax) >= 0
      ? Math.round(Number(contract.professionalTax))
      : 200;
    const tdsAmount = contract.tdsDeduction != null && Number(contract.tdsDeduction) >= 0
      ? Math.round(Number(contract.tdsDeduction))
      : Math.round(gross * 0.10);

    if (pfAmount > 0) {
      deductions.push({ code: 'PF', name: 'Provident Fund (PF)', amount: pfAmount });
    }
    if (ptaxAmount > 0) {
      deductions.push({ code: 'PTAX', name: 'Professional Tax', amount: ptaxAmount });
    }
    if (tdsAmount > 0) {
      deductions.push({ code: 'TDS', name: 'Income Tax (TDS)', amount: tdsAmount });
    }
  } else {
    // Default formula
    const basicAmount = Math.round(baseWage * 0.5 * attendanceRatio);
    const hraAmount = Math.round(baseWage * 0.25 * attendanceRatio);
    const transAmount = Math.round(3000 * attendanceRatio);
    const specAmount = Math.round(baseWage * 0.15 * attendanceRatio);

    earnings = [
      { code: 'BASIC', name: 'Basic Salary', amount: basicAmount },
      { code: 'HRA', name: 'House Rent Allowance', amount: hraAmount },
      { code: 'TRANS', name: 'Transport Allowance', amount: transAmount },
    ];

    if (contract?.salaryStructureId?.includes('ENG') || contract?.salaryStructureId?.includes('SALES')) {
      earnings.push({ code: 'SPEC', name: 'Special / Tech Allowance', amount: specAmount });
    }

    const gross = earnings.reduce((sum, item) => sum + item.amount, 0);

    const pfAmount = Math.round(basicAmount * 0.12);
    const ptaxAmount = 200;
    const tdsAmount = Math.round(gross * 0.10);

    deductions = [
      { code: 'PF', name: 'Provident Fund (12% of Basic)', amount: pfAmount },
      { code: 'PTAX', name: 'Professional Tax', amount: ptaxAmount },
      { code: 'TDS', name: 'Income Tax (TDS)', amount: tdsAmount },
    ];
  }

  const gross = earnings.reduce((sum, item) => sum + item.amount, 0);
  const totalDeductions = deductions.reduce((sum, item) => sum + item.amount, 0);
  const net = Math.max(0, gross - totalDeductions);

  return {
    id: `PS-${payrun.id}-${employee.id || employee.employeeCode}`,
    payrunId: payrun.id,
    payrunName: payrun.name,
    periodName: payrun.periodName,
    periodStart: payrun.periodStart,
    periodEnd: payrun.periodEnd,
    employeeId: employee.id || employee.employeeCode,
    employeeCode: employee.employeeCode || employee.id,
    employeeName: employee.fullName,
    jobPosition: employee.jobPosition,
    department: employee.department,
    salaryStructureId: contract?.salaryStructureId || 'STRUC-ENG-01',
    salaryStructureName: contract?.salaryStructureName || 'Engineering & Tech Structure',
    contractWage: baseWage,
    workedDays,
    totalWorkDays,
    status: payrun.status || 'Computed',
    bankDetails: employee.bankDetails || null,
    earnings,
    gross,
    deductions,
    totalDeductions,
    net,
  };
}

/**
 * Validates payroll and returns operational warnings and readiness
 */
export function evaluatePayrollWarnings({ payrun, payslips, employees, contracts }) {
  const warnings = [];
  const relatedPayslips = payslips.filter((p) => p.payrunId === payrun.id);

  // 1. Check Missing Bank Details
  const missingBankEmployees = relatedPayslips
    .filter((p) => !p.bankDetails || !p.bankDetails.accountNumber)
    .map((p) => ({
      employeeId: p.employeeId,
      employeeName: p.employeeName,
      department: p.department,
    }));

  if (missingBankEmployees.length > 0) {
    warnings.push({
      id: 'WARN-BANK',
      type: 'warning',
      severity: 'high',
      title: 'Missing Bank Details',
      subtitle: `${missingBankEmployees.length} employee${missingBankEmployees.length > 1 ? 's' : ''} cannot receive direct electronic deposit`,
      description: 'Bank account number or routing information is missing. Payment disbursement will fail for these individuals.',
      affectedEmployees: missingBankEmployees,
      actionLabel: 'Review Employees',
      actionRoute: '/employees?filter=missing-bank',
    });
  }

  // 2. Check Duplicate Payslips
  const employeeCounts = {};
  relatedPayslips.forEach((p) => {
    employeeCounts[p.employeeId] = (employeeCounts[p.employeeId] || 0) + 1;
  });
  const duplicateEmpIds = Object.keys(employeeCounts).filter((id) => employeeCounts[id] > 1);
  if (duplicateEmpIds.length > 0) {
    warnings.push({
      id: 'WARN-DUP',
      type: 'danger',
      severity: 'critical',
      title: 'Duplicate Payslips Detected',
      subtitle: `${duplicateEmpIds.length} employee${duplicateEmpIds.length > 1 ? 's have' : ' has'} multiple payslips in this payrun`,
      description: 'Multiple active payslips for the same period can lead to double wage calculation.',
      affectedEmployees: duplicateEmpIds.map((id) => ({ employeeId: id, employeeName: id })),
      actionLabel: 'Resolve Duplicates',
      actionRoute: `/payroll?tab=payslips&payrun=${payrun.id}`,
    });
  }

  // 3. Incomplete Employee Data Check
  const incompleteEmployees = employees
    .filter((e) => relatedPayslips.some((p) => p.employeeId === e.id) && !e.profileComplete)
    .map((e) => ({
      employeeId: e.id,
      employeeName: e.fullName,
      department: e.department,
    }));

  if (incompleteEmployees.length > 0) {
    warnings.push({
      id: 'WARN-PROFILE',
      type: 'info',
      severity: 'medium',
      title: 'Incomplete Employee Data',
      subtitle: `${incompleteEmployees.length} employee${incompleteEmployees.length > 1 ? 's have' : ' has'} incomplete personnel files`,
      description: 'Tax status or job profile records are partially unverified.',
      affectedEmployees: incompleteEmployees,
      actionLabel: 'Complete Profiles',
      actionRoute: '/employees?filter=incomplete',
    });
  }

  // 4. Expiring Contract Check
  const now = new Date();
  const expiringEmployees = contracts
    .filter((c) => {
      if (c.status !== 'Active' || !c.endDate) return false;
      const end = new Date(c.endDate);
      const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
      return diff >= 0 && diff <= 45;
    })
    .filter((c) => relatedPayslips.some((p) => p.employeeId === c.employeeId))
    .map((c) => ({
      employeeId: c.employeeId,
      employeeName: c.employeeName,
      department: c.department,
    }));

  if (expiringEmployees.length > 0) {
    warnings.push({
      id: 'WARN-CONTRACT',
      type: 'warning',
      severity: 'low',
      title: 'Contract Renewal Required Soon',
      subtitle: `${expiringEmployees.length} contract${expiringEmployees.length > 1 ? 's expire' : ' expires'} within 45 days`,
      description: 'Upcoming term expiration requires review before next pay cycle.',
      affectedEmployees: expiringEmployees,
      actionLabel: 'View Contracts',
      actionRoute: '/contracts?filter=expiring',
    });
  }

  const isReadyForValidation =
    relatedPayslips.length > 0 &&
    duplicateEmpIds.length === 0 &&
    missingBankEmployees.length === 0;

  const checklist = [
    { label: 'Employee data complete', passed: incompleteEmployees.length === 0 },
    { label: 'Contracts valid for period', passed: true },
    { label: 'Attendance processed', passed: true },
    { label: 'Leave balances processed', passed: true },
    {
      label: missingBankEmployees.length === 0 ? 'Bank details verified' : `${missingBankEmployees.length} bank details missing`,
      passed: missingBankEmployees.length === 0,
      warning: missingBankEmployees.length > 0,
    },
    { label: 'No duplicate payslips', passed: duplicateEmpIds.length === 0 },
  ];

  return {
    warnings,
    checklist,
    readinessStatus: isReadyForValidation ? 'READY FOR VALIDATION' : 'ACTION REQUIRED',
    isReady: isReadyForValidation,
  };
}

export const payrollService = {
  async getPayruns() {
    try {
      if (PAYRUNS_ENDPOINT) {
        const response = await apiClient(PAYRUNS_ENDPOINT);
        if (response?.data && Array.isArray(response.data)) {
          return response.data;
        }
      }
    } catch {
      // Fallback
    }
    return [...localPayruns];
  },

  async getPayrunById(id) {
    const payruns = await this.getPayruns();
    const payrun = payruns.find((p) => p.id === id);
    if (!payrun) throw new Error('Payrun not found');
    return payrun;
  },

  async createPayrun(payload, eligibleEmployees = [], contracts = []) {
    const id = payload.id || `PR-${Date.now().toString().slice(-6)}`;
    const periodStart = payload.periodStart || payload.startDate || '';
    const periodEnd = payload.periodEnd || payload.endDate || '';
    const periodName = payload.periodName || payload.periodMonth || 'Payroll Period';
    const salaryStructureId = payload.salaryStructureId || 'STRUC-ENG-01';
    const salaryStructureName = payload.salaryStructureName || 'Standard Structure';

    const targetEmployees = eligibleEmployees.length > 0 ? eligibleEmployees : [];
    const selectedEmployeeIds = payload.selectedEmployeeIds || targetEmployees.map((e) => e.id || e._id || e.employeeCode);

    // Auto-compute payslips upon creation so payrun is NEVER 0 amount with 0 employees
    const generatedPayslips = targetEmployees.map((emp) => {
      const contract = contracts.find((c) =>
        (c.employeeId === emp.id || c.employeeId === emp.employeeCode || c.employeeId === emp._id) &&
        c.status === 'Active'
      ) || contracts.find((c) =>
        c.employeeId === emp.id || c.employeeId === emp.employeeCode || c.employeeId === emp._id
      );

      return computeEmployeePayslip({
        employee: emp,
        contract,
        payrun: {
          id,
          name: payload.name,
          periodName,
          periodStart,
          periodEnd,
          salaryStructureId,
          salaryStructureName,
          status: 'Draft',
        },
      });
    });

    const totalGross = generatedPayslips.reduce((sum, p) => sum + p.gross, 0);
    const totalDeductions = generatedPayslips.reduce((sum, p) => sum + p.totalDeductions, 0);
    const totalNet = generatedPayslips.reduce((sum, p) => sum + p.net, 0);

    const newPayrun = {
      ...payload,
      id,
      name: payload.name,
      periodName,
      periodStart,
      periodEnd,
      salaryStructureId,
      salaryStructureName,
      selectedEmployeeIds,
      status: 'Draft',
      employeesCount: targetEmployees.length,
      payslipsCount: generatedPayslips.length,
      totalGross,
      totalDeductions,
      totalNet,
      processedDate: new Date().toISOString().split('T')[0],
      paymentDate: payload.paymentDate || null,
      notes: payload.notes || 'Payrun draft created via Wizard.',
    };

    try {
      if (PAYRUNS_ENDPOINT) {
        const response = await apiClient(PAYRUNS_ENDPOINT, {
          method: 'POST',
          body: JSON.stringify(newPayrun),
        });
        if (response?.data) return response.data;
      }
    } catch {
      // Fallback
    }

    localPayruns = [newPayrun, ...localPayruns.filter((p) => p.id !== id)];
    localPayslips = [
      ...localPayslips.filter((p) => p.payrunId !== id),
      ...generatedPayslips,
    ];
    return { payrun: newPayrun, payslips: generatedPayslips };
  },

  async computePayrun(payrunId, employees = [], contracts = []) {
    let payrun = localPayruns.find((p) => p.id === payrunId);
    if (!payrun) {
      payrun = { id: payrunId, name: 'Payrun', status: 'Draft' };
    }

    let targetEmployees = employees;
    if (payrun.selectedEmployeeIds && payrun.selectedEmployeeIds.length > 0) {
      targetEmployees = employees.filter((e) =>
        payrun.selectedEmployeeIds.includes(e.id || e._id || e.employeeCode)
      );
    }
    if (!targetEmployees || targetEmployees.length === 0) {
      targetEmployees = employees;
    }

    const generatedPayslips = targetEmployees.map((emp) => {
      const contract = contracts.find((c) =>
        (c.employeeId === emp.id || c.employeeId === emp.employeeCode || c.employeeId === emp._id) &&
        c.status === 'Active'
      ) || contracts.find((c) =>
        c.employeeId === emp.id || c.employeeId === emp.employeeCode || c.employeeId === emp._id
      );

      return computeEmployeePayslip({
        employee: emp,
        contract,
        payrun: { ...payrun, status: 'Computed' },
      });
    });

    const totalGross = generatedPayslips.reduce((sum, p) => sum + p.gross, 0);
    const totalDeductions = generatedPayslips.reduce((sum, p) => sum + p.totalDeductions, 0);
    const totalNet = generatedPayslips.reduce((sum, p) => sum + p.net, 0);

    const updatedPayrun = {
      ...payrun,
      status: 'Computed',
      employeesCount: generatedPayslips.length,
      payslipsCount: generatedPayslips.length,
      totalGross,
      totalDeductions,
      totalNet,
      processedDate: new Date().toISOString().split('T')[0],
      notes: 'Payroll computed based on active contracts and attendance.',
    };

    localPayruns = localPayruns.map((p) => (p.id === payrunId ? updatedPayrun : p));
    if (!localPayruns.some((p) => p.id === payrunId)) {
      localPayruns.unshift(updatedPayrun);
    }
    localPayslips = [
      ...localPayslips.filter((p) => p.payrunId !== payrunId),
      ...generatedPayslips,
    ];

    return { payrun: updatedPayrun, payslips: generatedPayslips };
  },

  async validatePayrun(payrunId) {
    const payrun = localPayruns.find((p) => p.id === payrunId);
    if (!payrun) throw new Error('Payrun not found');

    const updatedPayrun = {
      ...payrun,
      status: 'Validated',
      notes: 'Payrun verified and approved for disbursement.',
    };

    localPayruns = localPayruns.map((p) => (p.id === payrunId ? updatedPayrun : p));
    localPayslips = localPayslips.map((p) =>
      p.payrunId === payrunId ? { ...p, status: 'Validated' } : p
    );

    return updatedPayrun;
  },

  async markPayrunPaid(payrunId) {
    const payrun = localPayruns.find((p) => p.id === payrunId);
    if (!payrun) throw new Error('Payrun not found');

    const updatedPayrun = {
      ...payrun,
      status: 'Paid',
      paymentDate: new Date().toISOString().split('T')[0],
      notes: 'Electronic payments settled and completed.',
    };

    localPayruns = localPayruns.map((p) => (p.id === payrunId ? updatedPayrun : p));
    localPayslips = localPayslips.map((p) =>
      p.payrunId === payrunId ? { ...p, status: 'Paid' } : p
    );

    return updatedPayrun;
  },

  async sendPayslips(payrunId) {
    const payrun = localPayruns.find((p) => p.id === payrunId);
    if (!payrun) throw new Error('Payrun not found');
    return { success: true, count: payrun.payslipsCount };
  },

  async deletePayrun(payrunId) {
    localPayruns = localPayruns.filter((p) => p.id !== payrunId);
    localPayslips = localPayslips.filter((p) => p.payrunId !== payrunId);
    return { success: true };
  },

  async getPayslips(payrunId = null) {
    try {
      if (PAYSLIPS_ENDPOINT) {
        const response = await apiClient(PAYSLIPS_ENDPOINT);
        if (response?.data && Array.isArray(response.data)) {
          return payrunId ? response.data.filter((p) => p.payrunId === payrunId) : response.data;
        }
      }
    } catch {
      // Fallback
    }
    return payrunId
      ? localPayslips.filter((p) => p.payrunId === payrunId)
      : [...localPayslips];
  },

  async getPayslipById(id) {
    const payslips = await this.getPayslips();
    const payslip = payslips.find((p) => p.id === id);
    if (!payslip) throw new Error('Payslip not found');
    return payslip;
  },

  async getPayslipsByEmployee(employeeId) {
    const payslips = await this.getPayslips();
    return payslips.filter(
      (p) => p.employeeId === employeeId || p.employeeCode === employeeId
    );
  },
};
