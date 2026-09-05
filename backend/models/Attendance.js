/**
 * Attendance Model
 *
 * Records daily shift attendance events for an employee.
 * Tracks check-in/out timestamps and computes worked hours.
 * Supports HR compliance audit corrections with reason and author.
 */

const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee is required'],
    },
    attendanceDate: {
      type: Date,
      required: [true, 'Attendance date is required'],
    },
    checkIn: {
      type: Date,
      default: null,
    },
    checkOut: {
      type: Date,
      default: null,
    },
    workedHours: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['present', 'late', 'absent', 'half_day', 'on_leave', 'overtime', 'exception'],
      default: 'present',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    correction: {
      correctedBy: { type: String, trim: true, default: '' },
      correctedAt: { type: Date, default: null },
      reason: { type: String, trim: true, default: '' },
    },
  },
  {
    timestamps: true,
  }
);

// Prevents duplicate entries: one employee can only have one attendance record per calendar day
attendanceSchema.index({ employee: 1, attendanceDate: 1 }, { unique: true });

// Virtual flag indicating an attendance exception needing HR attention
attendanceSchema.virtual('isException').get(function () {
  return ['late', 'absent', 'exception'].includes(this.status);
});

attendanceSchema.set('toJSON', { virtuals: true });
attendanceSchema.set('toObject', { virtuals: true });

attendanceSchema.pre('save', function (next) {
  if (this.checkIn && this.checkOut) {
    const diffMs = new Date(this.checkOut) - new Date(this.checkIn);
    if (diffMs < 0) {
      return next(new Error('Check out time must be after check in time'));
    }
    this.workedHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
  }
  next();
});

module.exports = mongoose.model('Attendance', attendanceSchema);
