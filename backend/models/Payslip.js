const mongoose = require('mongoose');

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
    workedDays: {
      type: Number,
      default: 0,
    },
    lines: {
      type: [payslipLineSchema],
      default: [],
    },
    grossSalary: {
      type: Number,
      default: 0,
    },
    netSalary: {
      type: Number,
      default: 0,
    },
    warnings: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['Draft', 'Done'],
      default: 'Draft',
    },
  },
  {
    timestamps: true,
  }
);

payslipSchema.index({ payrun: 1, employee: 1 }, { unique: true });

module.exports = mongoose.model('Payslip', payslipSchema);
