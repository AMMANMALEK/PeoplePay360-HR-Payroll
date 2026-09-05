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
      enum: ['Basic', 'Allowance', 'Gross', 'Deduction', 'Net'],
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
  },
  {
    timestamps: true,
  }
);

// Ensure a rule code is unique within a specific structure to prevent collisions
salaryRuleSchema.index({ salaryStructure: 1, code: 1 }, { unique: true });

module.exports = mongoose.model('SalaryRule', salaryRuleSchema);
