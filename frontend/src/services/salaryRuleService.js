// src/services/salaryRuleService.js
// Mock service for viewing Salary Rules. Read-only for HR Payroll User.

let salaryRulesStore = [];

export async function getSalaryRules() {
  // Simulate network delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...salaryRulesStore]);
    }, 100);
  });
}

export async function getSalaryRuleById(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const rule = salaryRulesStore.find((r) => r.id === id || r.code === id);
      if (rule) {
        resolve({ ...rule });
      } else {
        reject(new Error(`Salary rule with ID ${id} not found.`));
      }
    }, 100);
  });
}
