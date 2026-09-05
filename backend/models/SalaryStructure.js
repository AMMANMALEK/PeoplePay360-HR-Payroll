const mongoose = require('mongoose');

const salaryStructureSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Salary Structure name is required'],
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    company: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

salaryStructureSchema.virtual('rules', {
  ref: 'SalaryRule',
  localField: '_id',
  foreignField: 'salaryStructure',
});

salaryStructureSchema.set('toJSON', { virtuals: true });
salaryStructureSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('SalaryStructure', salaryStructureSchema);
