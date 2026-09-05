/**
 * TimeOffType Model
 *
 * Defines categories of leave (Annual Leave, Sick Leave, Parental Leave, etc.).
 * Configures allocation enforcement, approval workflow requirements, and UI theme color.
 */

const mongoose = require('mongoose');

const timeOffTypeSchema = new mongoose.Schema(
  {
    typeCode: {
      type: String,
      unique: true,
      required: [true, 'Time off type code is required'],
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, 'Time off type name is required'],
      trim: true,
    },
    unit: {
      type: String,
      enum: ['days', 'hours'],
      default: 'days',
    },
    color: {
      type: String,
      trim: true,
      default: '#10b981',
    },
    requiresAllocation: {
      type: Boolean,
      default: true,
    },
    requiresApproval: {
      type: Boolean,
      default: true,
    },
    isPaid: {
      type: Boolean,
      default: true,
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

module.exports = mongoose.model('TimeOffType', timeOffTypeSchema);
