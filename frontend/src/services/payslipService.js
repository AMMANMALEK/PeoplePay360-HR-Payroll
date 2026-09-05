// src/services/payslipService.js
// Mock service for managing Payslips.

let payslipsStore = [];

export async function getPayslips() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...payslipsStore]);
    }, 100);
  });
}

export async function getPayslipById(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const payslip = payslipsStore.find((p) => p.id === id);
      if (payslip) {
        resolve({ ...payslip });
      } else {
        reject(new Error(`Payslip with ID ${id} not found.`));
      }
    }, 100);
  });
}

export async function getPayslipsByPayrunId(payrunId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const slips = payslipsStore.filter((p) => p.payrunId === payrunId);
      resolve(slips);
    }, 100);
  });
}

export async function getPayslipsByEmployeeId(employeeId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const empIdStr = String(employeeId);
      const slips = payslipsStore.filter(
        (p) => String(p.employeeId) === empIdStr || p.employeeCode === empIdStr
      );
      resolve(slips);
    }, 100);
  });
}

export async function updatePayslip(id, updates) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = payslipsStore.findIndex((p) => p.id === id);
      if (index !== -1) {
        payslipsStore[index] = { ...payslipsStore[index], ...updates };
        resolve({ ...payslipsStore[index] });
      } else {
        reject(new Error(`Payslip with ID ${id} not found.`));
      }
    }, 100);
  });
}

export async function setPayslipsForPayrun(payrunId, newPayslips) {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Remove existing slips for this payrun
      payslipsStore = payslipsStore.filter((p) => p.payrunId !== payrunId);
      // Append new ones
      payslipsStore.push(...newPayslips);
      resolve([...newPayslips]);
    }, 100);
  });
}
