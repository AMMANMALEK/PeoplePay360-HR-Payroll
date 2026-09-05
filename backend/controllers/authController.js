const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public (or Admin depending on requirements)
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, phone, roles, employee } = req.body;

    if (!name || !email || !password) {
      const error = new Error("Name, email, and password are required");
      error.statusCode = 400;
      return next(error);
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      const error = new Error("User already exists");
      error.statusCode = 400;
      return next(error);
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      roles: roles || ['Employee'],
      employee: employee || null
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
const UserLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (typeof email !== "string" || typeof password !== "string") {
      const error = new Error("Invalid input types");
      error.statusCode = 400;
      return next(error);
    }

    // Must explicitly select password because it is { select: false } in schema
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      return next(error);
    }

    if (!user.isActive) {
      const error = new Error("User account is deactivated");
      error.statusCode = 401;
      return next(error);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      return next(error);
    }

    // JWT payload only needs the ID. Roles fetched via req.user in middleware.
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      message: "Login Successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users
// @route   GET /api/auth/users
// @access  Private/Admin
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;

    if (
      (name !== undefined && typeof name !== "string") ||
      (phone !== undefined && typeof phone !== "string")
    ) {
      const error = new Error("Invalid input types");
      error.statusCode = 400;
      return next(error);
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone },
      { new: true, runValidators: true }
    ).select("-password");

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password").populate('employee');
    if (!user){
      const error = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard stats
// @route   GET /api/auth/dashboard
// @access  Private
const getDashboardStats = async (req, res, next) => {
  try {
    const Employee = require("../models/Employee");
    
    const totalUsers = await User.countDocuments();
    const totalEmployees = await Employee.countDocuments();
    
    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalEmployees
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { registerUser, UserLogin, getAllUsers, updateProfile, getProfile, getDashboardStats };
