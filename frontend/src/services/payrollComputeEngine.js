// src/services/payrollComputeEngine.js
// Business logic for payroll calculation, contract eligibility checks, and warning detection.

/**
 * Validates employee contract eligibility for a payrun date range.
 * Detects missing contracts, overlapping contracts, or expiring contracts.
 */
export function evaluateEmployeeEligibility(employee, contracts, payrunStart, payrunEnd) {
  const empId = employee.id || employee._id;
  const empContracts = contracts.filter(
    (c) => (c.employeeId === empId || c.employee === empId) && c.status === 'Active'
  );

  const pStart = new Date(payrunStart);
  const pEnd = new Date(payrunEnd);

  // Check overlapping active contracts during this payrun period
  const activeInPeriod = empContracts.filter((c) => {
    const cStart = new Date(c.startDate || c.validFrom);
    const cEnd = c.endDate || c.validTo ? new Date(c.endDate || c.validTo) : new Date('2099-12-31');
    return cStart <= pEnd && cEnd >= pStart;
  });

  const warnings = [];
  let isEligible = true;
  let activeContract = null;

  if (activeInPeriod.length === 0) {
    isEligible = false;
    warnings.push({
      type: 'NO_CONTRACT',
      severity: 'error',
      message: `No active contract found for period ${payrunStart} to ${payrunEnd}`,
    });
  } else if (activeInPeriod.length > 1) {
    isEligible = false;
    warnings.push({
      type: 'OVERLAPPING_CONTRACTS',
      severity: 'error',
      message: `Multiple overlapping active contracts found (${activeInPeriod.map(c => c.contractRef || c.id).join(', ')})`,
    });
  } else {
    activeContract = activeInPeriod[0];
    
    // Check if contract ends mid-period
    if (activeContract.endDate) {
      const cEnd = new Date(activeContract.endDate);
      if (cEnd < pEnd) {
        warnings.push({
          type: 'CONTRACT_EXPIRING',
          severity: 'warning',
          message: `Contract ends on ${activeContract.endDate} before payrun period end (${payrunEnd})`,
        });
      }
    }
  }

  return {
    employee,
    isEligible,
    activeContract,
    warnings,
  };
}

/**
 * Computes a single employee's payslip breakdown based on their active contract,
 * salary structure, and salary rules.
 */
export function computeEmployeePayslip({
  employee,
  contract,
  salaryStructure,
  salaryRules,
  payrunId,
  payrunName,
  payrunPeriod,
  totalWorkingDays = 22,
  unpaidDays = 0,
}) {
  const empId = employee.id || employee._id;
  const wageAmount = contract?.wageAmount || contract?.wage || 0;
  
  // Proration factor based on attendance / unpaid leave
  const workedDays = Math.max(0, totalWorkingDays - unpaidDays);
  const prorationFactor = totalWorkingDays > 0 ? workedDays / totalWorkingDays : 1;

  // Sort rules by sequence
  const sortedRules = [...salaryRules].sort((a, b) => a.sequence - b.sequence);

  const lineItemsMap = {};
  const lineItems = [];

  let grossSalary = 0;
  let totalDeductions = 0;
  let basicSalary = wageAmount * prorationFactor;

  for (const rule of sortedRules) {
    if (rule.status !== 'Active') continue;

    let computedAmount = 0;
    let calculationSummary = '';

    switch (rule.code) {
      case 'BASIC':
        computedAmount = Math.round(wageAmount * prorationFactor);
        calculationSummary = `Base Contract Wage ($${wageAmount.toLocaleString()}) * Proration (${workedDays}/${totalWorkingDays} days)`;
        basicSalary = computedAmount;
        break;

      case 'HRA':
        if (rule.calculationType === 'percentage') {
          computedAmount = Math.round(basicSalary * (rule.percentage / 100));
          calculationSummary = `${rule.percentage}% of Basic ($${basicSalary.toLocaleString()})`;
        } else {
          computedAmount = Math.round((rule.amount || 0) * prorationFactor);
          calculationSummary = `Fixed amount $${rule.amount} prorated`;
        }
        break;

      case 'TA':
        computedAmount = Math.round((rule.amount || 2000) * prorationFactor);
        calculationSummary = `Fixed Transport Allowance $${rule.amount || 2000} prorated`;
        break;

      case 'MA':
        computedAmount = Math.round((rule.amount || 1250) * prorationFactor);
        calculationSummary = `Fixed Medical Allowance $${rule.amount || 1250} prorated`;
        break;

      case 'GROSS':
        const allowancesSum = (lineItemsMap['HRA']?.amount || 0) + (lineItemsMap['TA']?.amount || 0) + (lineItemsMap['MA']?.amount || 0);
        computedAmount = lineItemsMap['BASIC']?.amount + allowancesSum;
        calculationSummary = `Basic ($${lineItemsMap['BASIC']?.amount}) + Allowances ($${allowancesSum})`;
        grossSalary = computedAmount;
        break;

      case 'PF':
        if (rule.calculationType === 'percentage') {
          computedAmount = Math.round(basicSalary * (rule.percentage / 100));
          calculationSummary = `${rule.percentage}% of Basic ($${basicSalary.toLocaleString()})`;
        } else {
          computedAmount = rule.amount || 0;
          calculationSummary = `Fixed PF $${rule.amount}`;
        }
        totalDeductions += computedAmount;
        break;

      case 'PT':
        computedAmount = rule.amount || 200;
        calculationSummary = `Fixed Statutory Professional Tax`;
        totalDeductions += computedAmount;
        break;

      case 'TAX':
      case 'TDS':
        // Simplified monthly income tax estimation
        const annualGross = (grossSalary || basicSalary * 1.25) * 12;
        let annualTax = 0;
        if (annualGross > 100000) {
          annualTax = (annualGross - 100000) * 0.15;
        } else if (annualGross > 50000) {
          annualTax = (annualGross - 50000) * 0.10;
        }
        computedAmount = Math.round(annualTax / 12);
        calculationSummary = `Estimated income tax based on annual projection ($${Math.round(annualGross).toLocaleString()})`;
        totalDeductions += computedAmount;
        break;

      case 'NET':
        computedAmount = Math.max(0, grossSalary - totalDeductions);
        calculationSummary = `Gross ($${grossSalary.toLocaleString()}) - Total Deductions ($${totalDeductions.toLocaleString()})`;
        break;

      default:
        // Generic rule computation fallback
        if (rule.calculationType === 'percentage') {
          computedAmount = Math.round(basicSalary * ((rule.percentage || 0) / 100));
          calculationSummary = `${rule.percentage}% of Basic`;
        } else if (rule.calculationType === 'fixed') {
          computedAmount = Math.round((rule.amount || 0) * prorationFactor);
          calculationSummary = `Fixed amount $${rule.amount}`;
        } else {
          computedAmount = rule.amount || 0;
          calculationSummary = `Custom formula rule`;
        }
        if (rule.category === 'Deductions') {
          totalDeductions += computedAmount;
        }
        break;
    }

    const item = {
      ruleId: rule.id,
      ruleCode: rule.code,
      ruleName: rule.name,
      category: rule.category,
      calculationType: rule.calculationType,
      amount: computedAmount,
      calculationSummary,
    };

    lineItemsMap[rule.code] = item;
    lineItems.push(item);
  }

  const netSalary = Math.max(0, grossSalary - totalDeductions);

  return {
    id: `SLIP-${payrunId}-${empId}`,
    payrunId,
    payrunName,
    payrunPeriod,
    employeeId: empId,
    employeeName: employee.name || `${employee.firstName} ${employee.lastName}`,
    employeeCode: employee.employeeCode || `EMP-${empId}`,
    department: employee.department || contract?.department || 'General',
    designation: employee.jobTitle || employee.designation || contract?.jobRole || 'Staff',
    contractRef: contract?.contractRef || contract?.id || 'CONTRACT-DEFAULT',
    wageAmount,
    totalWorkingDays,
    workedDays,
    unpaidDays,
    prorationFactor: Math.round(prorationFactor * 100) / 100,
    grossSalary,
    totalDeductions,
    netSalary,
    lineItems,
    status: 'Draft',
    generatedAt: new Date().toISOString(),
  };
}
