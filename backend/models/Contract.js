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
    salaryStructure: {
      type: String,
      trim: true,
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

contractSchema.index({ employee: 1, startDate: -1 });
contractSchema.index({ employee: 1, status: 1 });

contractSchema.pre('validate', function (next) {
  if (this.endDate && normalizeDate(this.endDate) < normalizeDate(this.startDate)) {
    return next(new Error('Contract end date must be on or after start date'));
  }

  next();
});

module.exports = mongoose.model('Contract', contractSchema);
