/**
 * SalaryStructure Model
 *
 * A named template that bundles a set of SalaryRules together.
 * Examples: 'Engineering & Tech Structure', 'Sales & Commercial Structure'.
 *
 * Used by Contracts and Payruns to determine which rules are evaluated.
 */

const mongoose = require('mongoose');

const salaryStructureSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, 'Salary Structure name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual population to load all child rules in sequence
salaryStructureSchema.virtual('rules', {
  ref: 'SalaryRule',
  localField: '_id',
  foreignField: 'salaryStructure',
});

salaryStructureSchema.set('toJSON', { virtuals: true });
salaryStructureSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('SalaryStructure', salaryStructureSchema);
