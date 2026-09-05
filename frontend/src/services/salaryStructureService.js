// src/services/salaryStructureService.js
// Mock service for viewing Salary Structures. Read-only for HR Payroll User.

import { INITIAL_SALARY_STRUCTURES } from '../data/payrollMockData';

let salaryStructuresStore = [...INITIAL_SALARY_STRUCTURES];

export async function getSalaryStructures() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...salaryStructuresStore]);
    }, 100);
  });
}

export async function getSalaryStructureById(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const struct = salaryStructuresStore.find((s) => s.id === id || s.code === id);
      if (struct) {
        resolve({ ...struct });
      } else {
        reject(new Error(`Salary structure with ID ${id} not found.`));
      }
    }, 100);
  });
}
