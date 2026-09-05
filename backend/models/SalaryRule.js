/**
 * SalaryRule Model
 *
 * A single mathematical computation step inside a SalaryStructure.
 * Executed in ascending `sequence` order by the Payroll Engine.
 *
 * Computation Methods:
 *   - Fixed: Flat monetary amount (e.g. Transport Allowance = 3000)
 *   - Percentage: Percentage of base wage or component (e.g. 12% of Basic for PF)
 *   - Formula: Evaluated mathematical expression (e.g. GROSS - (PF + PTAX + TDS))
 */

const mongoose = require('mongoose');

const salaryRuleSchema = new mongoose.Schema(
  {
    salaryStructure: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SalaryStructure',
      required: [true, 'Salary Structure reference is required'],
    },
    name: {
      type: String,
      required: [true, 'Rule name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Rule code is required'],
      trim: true,
      uppercase: true,
    },
    category: {
      type: String,
      enum: ['Basic', 'Allowance', 'Allowances', 'Gross', 'Deduction', 'Deductions', 'Net'],
      required: [true, 'Category is required'],
    },
    sequence: {
      type: Number,
      required: [true, 'Sequence is required'],
    },
    computationMethod: {
      type: String,
      enum: ['Fixed', 'Percentage', 'Formula'],
      required: [true, 'Computation method is required'],
    },
    fixedAmount: {
      type: Number,
      default: null,
    },
    percentageValue: {
      type: Number,
      default: null,
    },
    percentageBase: {
      type: String,
      enum: ['ContractWage', 'Basic', 'Gross'],
      default: null,
    },
    formula: {
      type: String,
      trim: true,
      default: null,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevents two rules in the same structure from having the same code
salaryRuleSchema.index({ salaryStructure: 1, code: 1 }, { unique: true });
// Speeds up payroll engine fetching rules ordered by execution sequence
salaryRuleSchema.index({ salaryStructure: 1, sequence: 1 });

salaryRuleSchema.pre('validate', function (next) {
  if (this.computationMethod === 'Fixed') {
    if (this.fixedAmount === null || this.fixedAmount === undefined || Number.isNaN(this.fixedAmount)) {
      return next(new Error('fixedAmount is required and must be a valid number when computationMethod is Fixed'));
    }
  } else if (this.computationMethod === 'Percentage') {
    if (this.percentageValue === null || this.percentageValue === undefined || Number.isNaN(this.percentageValue)) {
      return next(new Error('percentageValue is required and must be a valid number when computationMethod is Percentage'));
    }
    if (!this.percentageBase) {
      return next(new Error('percentageBase is required when computationMethod is Percentage'));
    }
  } else if (this.computationMethod === 'Formula') {
    if (!this.formula || typeof this.formula !== 'string' || this.formula.trim() === '') {
      return next(new Error('formula is required and must be a non-empty string when computationMethod is Formula'));
    }
  }
  next();
});

module.exports = mongoose.model('SalaryRule', salaryRuleSchema);
