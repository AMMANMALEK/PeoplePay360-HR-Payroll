/**
 * User Model
 *
 * Handles authentication, RBAC platform role assignments, and account status.
 * An optional link exists to an Employee record for self-service portal users.
 *
 * Roles supported:
 *   - ADMIN: Complete platform access across HR, Payroll, and System modules.
 *   - HR_PAYROLL_MANAGER: Full HR operations and payroll execution/validation.
 *   - HR_MANAGER: Workforce management, contracts, attendance, and leave approval.
 *   - HR_PAYROLL_USER: All HR Manager rights plus create/read/update on payruns and payslips; read-only salary config.
 *   - EMPLOYEE: Self-service profile, shift tracking, clocking in/out, and leave requests.
 */

const mongoose = require('mongoose');
const { ROLES } = require('../constants/roles');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      default: null,
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      required: [true, 'Role is required'],
      default: ROLES.EMPLOYEE,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
      unique: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
