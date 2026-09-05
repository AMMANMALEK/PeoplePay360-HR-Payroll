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

attendanceSchema.index({ employee: 1, attendanceDate: 1 }, { unique: true });

attendanceSchema.virtual('isException').get(function () {
  return ['late', 'absent', 'exception'].includes(this.status);
});

attendanceSchema.set('toJSON', { virtuals: true });
attendanceSchema.set('toObject', { virtuals: true });

const applyWorkedHours = (doc) => {
  if (doc.checkIn && doc.checkOut) {
    const diffMs = new Date(doc.checkOut) - new Date(doc.checkIn);
    if (diffMs < 0) {
      return 'Check out time must be after check in time';
    }
    doc.workedHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
  }
  return null;
};

attendanceSchema.pre('save', function (next) {
  const hoursError = applyWorkedHours(this);
  if (hoursError) {
    return next(new Error(hoursError));
  }
  next();
});

module.exports = mongoose.model('Attendance', attendanceSchema);
