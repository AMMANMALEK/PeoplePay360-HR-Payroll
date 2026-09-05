const mongoose = require('mongoose');

const timeOffRequestSchema = new mongoose.Schema(
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
    allocation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TimeOffAllocation',
      default: null,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
      min: 0,
    },
    unit: {
      type: String,
      enum: ['days', 'hours'],
      default: 'days',
    },
    reason: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'refused', 'cancelled'],
      default: 'pending',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
    },
    reviewNotes: {
      type: String,
      trim: true,
      default: '',
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

timeOffRequestSchema.index({ employee: 1, startDate: -1 });
timeOffRequestSchema.index({ status: 1, createdAt: -1 });

timeOffRequestSchema.pre('validate', function (next) {
  if (this.endDate && this.startDate && normalizeDate(this.endDate) < normalizeDate(this.startDate)) {
    return next(new Error('End date must be on or after start date'));
  }

  next();
});

const normalizeDate = (value) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

module.exports = mongoose.model('TimeOffRequest', timeOffRequestSchema);
