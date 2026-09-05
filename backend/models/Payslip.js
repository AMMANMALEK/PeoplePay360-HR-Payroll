/**
 * Payslip Model
 *
 * Computed salary statement for one employee in a specific payrun.
 * Contains line-by-line earnings, deductions, bank transfer receipt details,
 * and net take-home pay.
 */

const mongoose = require('mongoose');

const payItemSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, default: 0 },
  },
  { _id: false }
);

const payslipLineSchema = new mongoose.Schema(
  {
    ruleName: { type: String, required: true },
    category: { type: String, required: true },
    code: { type: String, required: true },
    amount: { type: Number, required: true },
  },
  { _id: false }
);

const payslipSchema = new mongoose.Schema(
  {
    payrun: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payrun',
      required: [true, 'Payrun reference is required'],
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee reference is required'],
    },
    contract: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contract',
      required: [true, 'Contract reference is required'],
    },
    periodName: {
      type: String,
      trim: true,
      default: '',
    },
    periodStart: {
      type: Date,
      default: null,
    },
    periodEnd: {
      type: Date,
      default: null,
    },
    workedDays: {
      type: Number,
      default: 0,
    },
    totalWorkDays: {
      type: Number,
      default: 0,
    },
    contractWage: {
      type: Number,
      default: 0,
    },
    bankDetails: {
      accountHolder: { type: String, default: '' },
      accountNumber: { type: String, default: '' },
      bankName: { type: String, default: '' },
      routingNumber: { type: String, default: '' },
    },
    earnings: {
      type: [payItemSchema],
      default: [],
    },
    deductions: {
      type: [payItemSchema],
      default: [],
    },
    gross: {
      type: Number,
      default: 0,
    },
    grossSalary: {
      type: Number,
      default: 0,
    },
    totalDeductions: {
      type: Number,
      default: 0,
    },
    net: {
      type: Number,
      default: 0,
    },
    netSalary: {
      type: Number,
      default: 0,
    },
    lines: {
      type: [payslipLineSchema],
      default: [],
    },
    warnings: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['Draft', 'Computed', 'Validated', 'Paid', 'Done'],
      default: 'Computed',
    },
  },
  {
    timestamps: true,
  }
);

// Prevents duplicate payslips: one employee can only have one payslip per payrun
payslipSchema.index({ payrun: 1, employee: 1 }, { unique: true });

// Synchronize gross/grossSalary and net/netSalary before validation
payslipSchema.pre('validate', function (next) {
  if (this.gross && !this.grossSalary) this.grossSalary = this.gross;
  if (this.grossSalary && !this.gross) this.gross = this.grossSalary;

  if (this.net && !this.netSalary) this.netSalary = this.net;
  if (this.netSalary && !this.net) this.net = this.netSalary;

  next();
});

module.exports = mongoose.model('Payslip', payslipSchema);
