const computePayslip = (contract, rules) => {
  // 3. Validate for duplicate rule codes
  const ruleCodes = rules.map(r => r.code);
  const uniqueCodes = new Set(ruleCodes);
  if (ruleCodes.length !== uniqueCodes.size) {
    const error = new Error('DUPLICATE_RULE_CODE');
    error.statusCode = 400;
    error.message = 'Duplicate rule codes detected in Salary Structure';
    throw error;
  }

  const computedValues = {};
  const computedByCategory = {};
  const lines = [];
  let grossSalary = 0;
  let netSalary = 0;

  // Initialize category totals
  const categories = ['Basic', 'Allowance', 'Gross', 'Deduction', 'Net'];
  categories.forEach(cat => {
    computedByCategory[cat] = 0;
  });

  for (const rule of rules) {
    let amount = 0;

    if (rule.computationMethod === 'Fixed') {
      amount = rule.fixedAmount || 0;
    } else if (rule.computationMethod === 'Percentage') {
      let base = 0;
      
      // Resolve base value
      if (rule.percentageBase === 'ContractWage') {
        base = contract.wageAmount || 0;
      } else if (rule.percentageBase === 'Basic') {
        base = computedByCategory['Basic'];
      } else if (rule.percentageBase === 'Gross') {
        base = computedByCategory['Gross'];
      }
      
      if (base === undefined || isNaN(base)) {
        const error = new Error(`COMPUTATION_ORDER_ERROR: Base ${rule.percentageBase} not yet computed for rule ${rule.code}`);
        error.statusCode = 400;
        throw error;
      }
      
      amount = base * ((rule.percentageValue || 0) / 100);
    } else if (rule.computationMethod === 'Formula') {
      if (!rule.formula) {
        amount = 0;
      } else {
        // Substitute known codes with their numeric values
        let evaluatedFormula = rule.formula;
        // Sort codes by length descending to prevent partial replacements (e.g., matching 'BAS' inside 'BASIC')
        const sortedCodes = Object.keys(computedValues).sort((a, b) => b.length - a.length);
        
        for (const code of sortedCodes) {
          // Replace all occurrences of the code as a distinct word
          const regex = new RegExp(`\\b${code}\\b`, 'g');
          evaluatedFormula = evaluatedFormula.replace(regex, computedValues[code]);
        }
        
        // 4. Validate formula against strict whitelist
        // Only allow digits, decimal points, math operators, parentheses, and whitespace
        if (!/^[\d\.\+\-\*\/\(\)\s]+$/.test(evaluatedFormula)) {
          const error = new Error(`INVALID_FORMULA: Formula for rule ${rule.code} contains unresolved variables or invalid characters: ${evaluatedFormula}`);
          error.statusCode = 400;
          throw error;
        }

        try {
          // Safely evaluate using Function constructor restricted to expression evaluation
          amount = new Function(`return ${evaluatedFormula}`)();
        } catch (err) {
          const error = new Error(`FORMULA_EVAL_ERROR: Failed to evaluate formula for rule ${rule.code}`);
          error.statusCode = 400;
          throw error;
        }
      }
    }

    // 2. Round every computed line amount to 2 decimal places
    amount = Math.round(amount * 100) / 100;

    // Track computed values
    computedValues[rule.code] = amount;
    // 1. Track computed values by CATEGORY
    computedByCategory[rule.category] += amount;

    // Save final top-level totals if matched
    if (rule.category === 'Gross') {
      grossSalary = amount;
    } else if (rule.category === 'Net') {
      netSalary = amount;
    }

    lines.push({
      ruleName: rule.name,
      category: rule.category,
      code: rule.code,
      amount: amount
    });
  }

  return {
    lines,
    grossSalary,
    netSalary
  };
};

module.exports = {
  computePayslip
};
