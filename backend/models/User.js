const mongoose = require('mongoose');
const { ROLES } = require('../constants/roles');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
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
      required: true,
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
