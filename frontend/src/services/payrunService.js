// src/services/payrunService.js
// Service for Payrun lifecycle management and status state transitions.

import { INITIAL_PAYRUNS } from '../data/payrollMockData';
import { computeEmployeePayslip, evaluateEmployeeEligibility } from './payrollComputeEngine';
import { setPayslipsForPayrun } from './payslipService';

let payrunsStore = [...INITIAL_PAYRUNS];

export async function getPayruns() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...payrunsStore]);
    }, 100);
  });
}

export async function getPayrunById(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const payrun = payrunsStore.find((p) => p.id === id);
      if (payrun) {
        resolve({ ...payrun });
      } else {
        reject(new Error(`Payrun with ID ${id} not found.`));
      }
    }, 100);
  });
}

export async function createPayrun(payrunData) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const id = `PR-2026-${String(payrunsStore.length + 1).padStart(3, '0')}`;
      const newPayrun = {
        id,
        name: payrunData.name || `Payrun ${payrunData.periodMonth || 'Period'}`,
        periodMonth: payrunData.periodMonth || 'September 2026',
        startDate: payrunData.startDate || '2026-09-01',
        endDate: payrunData.endDate || '2026-09-30',
        paymentDate: payrunData.paymentDate || '2026-10-01',
        employeeCount: payrunData.selectedEmployeeIds ? payrunData.selectedEmployeeIds.length : 0,
        selectedEmployeeIds: payrunData.selectedEmployeeIds || [],
        totalGross: 0,
        totalDeductions: 0,
        totalNetSalary: 0,
        status: 'Draft', // Draft -> Computed -> Validation Required -> Validated -> Paid
        warnings: payrunData.warnings || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      payrunsStore.unshift(newPayrun);
      resolve(newPayrun);
    }, 150);
  });
}

export async function computePayrun(payrunId, employees, contracts, salaryStructure, salaryRules) {
  return new Promise(async (resolve, reject) => {
    const payrun = payrunsStore.find((p) => p.id === payrunId);
    if (!payrun) {
      return reject(new Error(`Payrun ${payrunId} not found`));
    }

    // Filter target employees
    const targetEmployees = employees.filter((e) =>
      payrun.selectedEmployeeIds?.length > 0
        ? payrun.selectedEmployeeIds.includes(e.id || e._id || e.employeeCode)
        : true
    );

    const generatedPayslips = [];
    const runWarnings = [];
    let sumGross = 0;
    let sumDeductions = 0;
    let sumNet = 0;

    for (const emp of targetEmployees) {
      const eligibility = evaluateEmployeeEligibility(emp, contracts, payrun.startDate, payrun.endDate);
      
      if (eligibility.warnings.length > 0) {
        runWarnings.push(...eligibility.warnings.map(w => ({ ...w, employeeName: emp.name || `${emp.firstName} ${emp.lastName}` })));
      }

      // Compute payslip if eligible or fallback contract available
      if (eligibility.activeContract) {
        const payslip = computeEmployeePayslip({
          employee: emp,
          contract: eligibility.activeContract,
          salaryStructure,
          salaryRules,
          payrunId: payrun.id,
          payrunName: payrun.name,
          payrunPeriod: payrun.periodMonth,
        });

        sumGross += payslip.grossSalary;
        sumDeductions += payslip.totalDeductions;
        sumNet += payslip.netSalary;
        generatedPayslips.push(payslip);
      }
    }

    // Save payslips
    await setPayslipsForPayrun(payrunId, generatedPayslips);

    // Update payrun record status
    payrun.totalGross = sumGross;
    payrun.totalDeductions = sumDeductions;
    payrun.totalNetSalary = sumNet;
    payrun.employeeCount = generatedPayslips.length;
    payrun.warnings = runWarnings;
    
    // Status logic: if warnings exist, set status to 'Validation Required', else 'Computed'
    payrun.status = runWarnings.some(w => w.severity === 'error') ? 'Validation Required' : 'Computed';
    payrun.updatedAt = new Date().toISOString();

    resolve({ payrun, payslips: generatedPayslips });
  });
}

export async function validatePayrun(payrunId) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const payrun = payrunsStore.find((p) => p.id === payrunId);
      if (!payrun) return reject(new Error(`Payrun ${payrunId} not found`));
      
      payrun.status = 'Validated';
      payrun.updatedAt = new Date().toISOString();
      resolve(payrun);
    }, 150);
  });
}

export async function markPayrunPaid(payrunId) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const payrun = payrunsStore.find((p) => p.id === payrunId);
      if (!payrun) return reject(new Error(`Payrun ${payrunId} not found`));

      payrun.status = 'Paid';
      payrun.paidAt = new Date().toISOString();
      payrun.updatedAt = new Date().toISOString();
      resolve(payrun);
    }, 150);
  });
}

export async function sendPayrunPayslips(payrunId) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const payrun = payrunsStore.find((p) => p.id === payrunId);
      if (!payrun) return reject(new Error(`Payrun ${payrunId} not found`));

      payrun.isSent = true;
      payrun.sentAt = new Date().toISOString();
      resolve(payrun);
    }, 150);
  });
}
