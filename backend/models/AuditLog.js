/**
 * AuditLog Model
 *
 * Tracks all administrative, RBAC security, and governance actions.
 * Used by the Admin Portal to audit role modifications, account changes, and system settings.
 */

const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    logId: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    action: {
      type: String,
      required: [true, 'Action is required'],
      trim: true,
    },
    administrator: {
      type: String,
      trim: true,
      default: 'Marcus Vance',
    },
    performedBy: {
      type: String,
      trim: true,
    },
    module: {
      type: String,
      trim: true,
      default: 'Users',
    },
    target: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      trim: true,
      default: 'Success',
    },
    severity: {
      type: String,
      trim: true,
      default: 'info',
    },
    details: {
      type: String,
      trim: true,
      default: '',
    },
    rawDate: {
      type: Date,
      default: Date.now,
    },
    timestamp: {
      type: String,
      default: () => new Date().toLocaleString(),
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

auditLogSchema.pre('save', function (next) {
  if (!this.logId) {
    this.logId = `AUD-${Math.floor(100 + Math.random() * 900)}`;
  }
  if (!this.performedBy && this.administrator) {
    this.performedBy = this.administrator;
  }
  if (!this.administrator && this.performedBy) {
    this.administrator = this.performedBy;
  }
  next();
});

auditLogSchema.index({ rawDate: -1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ module: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
