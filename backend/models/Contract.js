/**
 * Contract Model
 *
 * Represents an employment contract between the company and an employee.
 * Essential for Payroll Engine calculation: provides base wage, wage type,
 * and references the applicable SalaryStructure and WorkingSchedule.
 */

const mongoose = require('mongoose');
const { normalizeDate } = require('../utils/dateHelper');

const contractSchema = new mongoose.Schema(
  {
    contractCode: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      uppercase: true,
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee is required'],
    },
    startDate: {
      type: Date,
      required: [true, 'Contract start date is required'],
    },
    endDate: {
      type: Date,
      default: null,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    jobPosition: {
      type: String,
      required: [true, 'Job position is required'],
      trim: true,
    },
    wageType: {
      type: String,
      enum: ['monthly', 'hourly', 'daily'],
      default: 'monthly',
    },
    wageAmount: {
      type: Number,
      required: [true, 'Wage amount is required'],
      min: 0,
    },
    basicSalary: {
      type: Number,
      default: 0,
      min: 0,
    },
    hra: {
      type: Number,
      default: 0,
      min: 0,
    },
    specialAllowance: {
      type: Number,
      default: 0,
      min: 0,
    },
    bonus: {
      type: Number,
      default: 0,
      min: 0,
    },
    pfDeduction: {
      type: Number,
      default: 0,
      min: 0,
    },
    professionalTax: {
      type: Number,
      default: 0,
      min: 0,
    },
    tdsDeduction: {
      type: Number,
      default: 0,
      min: 0,
    },
    salaryStructure: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SalaryStructure',
      default: null,
    },
    workingSchedule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WorkingSchedule',
      default: null,
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'expired', 'terminated'],
      default: 'active',
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

// Virtual: determine if contract is currently active based on status and dates
contractSchema.virtual('isCurrent').get(function () {
  if (this.status !== 'active') return false;
  if (!this.endDate) return true;
  return new Date(this.endDate) >= new Date();
});

contractSchema.set('toJSON', { virtuals: true });
contractSchema.set('toObject', { virtuals: true });

// Speeds up fetching contract history for one employee, newest first
contractSchema.index({ employee: 1, startDate: -1 });
// Speeds up filtering active contracts
contractSchema.index({ employee: 1, status: 1 });

// Reject if endDate comes before startDate
contractSchema.pre('validate', function (next) {
  if (this.endDate && this.startDate && normalizeDate(this.endDate) < normalizeDate(this.startDate)) {
    return next(new Error('Contract end date must be on or after start date'));
  }
  next();
});

module.exports = mongoose.model('Contract', contractSchema);
