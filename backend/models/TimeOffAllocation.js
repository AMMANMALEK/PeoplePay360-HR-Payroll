const mongoose = require('mongoose');
const { normalizeDate } = require('../utils/dateHelper');

const timeOffAllocationSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee is required'],
    },
    timeOffType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TimeOffType',
      required: [true, 'Time off type is required'],
    },
    allocated: {
      type: Number,
      required: [true, 'Allocated balance is required'],
      min: 0,
    },
    taken: {
      type: Number,
      default: 0,
      min: 0,
    },
    remaining: {
      type: Number,
      default: 0,
      min: 0,
    },
    validFrom: {
      type: Date,
      required: [true, 'Valid from date is required'],
    },
    validTo: {
      type: Date,
      required: [true, 'Valid to date is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'expired'],
      default: 'pending',
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

timeOffAllocationSchema.index({ employee: 1, timeOffType: 1, validFrom: 1 });

timeOffAllocationSchema.pre('validate', function (next) {
  if (this.validTo && this.validFrom && normalizeDate(this.validTo) < normalizeDate(this.validFrom)) {
    return next(new Error('Valid to date must be on or after valid from date'));
  }

  this.remaining = Math.max((this.allocated || 0) - (this.taken || 0), 0);
  next();
});

module.exports = mongoose.model('TimeOffAllocation', timeOffAllocationSchema);
