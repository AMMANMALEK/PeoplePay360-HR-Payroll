/**
 * WorkingSchedule Model
 *
 * Defines the planned work shifts and weekly working hours for an employee or department.
 * Used during attendance auditing and payroll calculations to determine expected vs worked hours.
 */

const mongoose = require('mongoose');
const { calculateWeeklyHours } = require('../services/workingScheduleService');

const weeklyPatternSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      required: true,
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
      trim: true,
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
      trim: true,
    },
    breakMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: false }
);

const workingScheduleSchema = new mongoose.Schema(
  {
    scheduleCode: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, 'Schedule name is required'],
      trim: true,
    },
    scheduleType: {
      type: String,
      enum: ['fixed', 'flexible', 'shift'],
      default: 'fixed',
    },
    weeklyPattern: {
      type: [weeklyPatternSchema],
      default: [],
      validate: {
        validator(value) {
          return value.length > 0;
        },
        message: 'Weekly pattern must contain at least one day',
      },
    },
    weeklyHours: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

workingScheduleSchema.pre('validate', function (next) {
  try {
    this.weeklyHours = calculateWeeklyHours(this.weeklyPattern);
    next();
  } catch (error) {
    if (error.message === 'INVALID_TIME_FORMAT') {
      return next(new Error('Weekly pattern times must use HH:mm format'));
    }

    if (error.message === 'INVALID_DAY_HOURS') {
      return next(new Error('End time must be after start time for each day'));
    }

    if (error.message === 'INVALID_BREAK_MINUTES') {
      return next(new Error('Break minutes cannot exceed working time for a day'));
    }

    next(error);
  }
});

module.exports = mongoose.model('WorkingSchedule', workingScheduleSchema);
