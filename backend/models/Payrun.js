/**
 * Payrun Model
 *
 * Represents one payroll execution batch for a specific monthly cycle.
 * Contains aggregate financial figures (total gross, deductions, net)
 * and tracks the batch lifecycle: Draft ──> Computed ──> Validated ──> Paid.
 */

const mongoose = require('mongoose');

const payrunSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Payrun name is required'],
      trim: true,
    },
    periodName: {
      type: String,
      trim: true,
      default: '',
    },
    periodStart: {
      type: Date,
      required: [true, 'Period start date is required'],
    },
    periodEnd: {
      type: Date,
      required: [true, 'Period end date is required'],
    },
    salaryStructure: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SalaryStructure',
      required: [true, 'Salary Structure is required'],
    },
    status: {
      type: String,
      enum: ['Draft', 'Computed', 'Validated', 'Paid'],
      default: 'Draft',
    },
    employees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
      },
    ],
    employeesCount: {
      type: Number,
      default: 0,
    },
    payslipsCount: {
      type: Number,
      default: 0,
    },
    totalGross: {
      type: Number,
      default: 0,
    },
    totalDeductions: {
      type: Number,
      default: 0,
    },
    totalNet: {
      type: Number,
      default: 0,
    },
    processedDate: {
      type: Date,
      default: null,
    },
    paymentDate: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// When filtering payruns by period date range
payrunSchema.index({ periodStart: 1, periodEnd: 1 });
// When loading dashboard — fetch latest payruns sorted by recency
payrunSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Payrun', payrunSchema);
