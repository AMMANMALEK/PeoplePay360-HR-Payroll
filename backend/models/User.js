const mongoose = require('mongoose');
<<<<<<< HEAD
const { ROLES } = require('../constants/roles');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
=======
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
>>>>>>> 3035e89c7acb4b8ccf2f83eb29ddd1bd13812d82
      unique: true,
      lowercase: true,
      trim: true,
    },
<<<<<<< HEAD
    passwordHash: {
      type: String,
      default: null,
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      required: true,
=======
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },
    phone: {
      type: String,
      trim: true,
>>>>>>> 3035e89c7acb4b8ccf2f83eb29ddd1bd13812d82
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
<<<<<<< HEAD
      unique: true,
      sparse: true,
=======
    },
    roles: {
      type: [String],
      enum: ['Employee', 'HRManager', 'HRPayrollUser', 'HRPayrollManager', 'Admin'],
      default: ['Employee'],
    },
    isActive: {
      type: Boolean,
      default: true,
>>>>>>> 3035e89c7acb4b8ccf2f83eb29ddd1bd13812d82
    },
  },
  {
    timestamps: true,
  }
);

<<<<<<< HEAD
=======
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

>>>>>>> 3035e89c7acb4b8ccf2f83eb29ddd1bd13812d82
module.exports = mongoose.model('User', userSchema);
