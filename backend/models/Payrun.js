const mongoose = require('mongoose');

const payrunSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Payrun name is required'],
      trim: true,
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
  },
  {
    timestamps: true,
  }
);

// Prevent overlapping payruns for the same period structure? Left out to keep it simple, but could be added.
module.exports = mongoose.model('Payrun', payrunSchema);
