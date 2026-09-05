<<<<<<< HEAD
const User = require('../models/User');
const Employee = require('../models/Employee');
const { getConfiguredUsers } = require('../config/authUsers');
const { ROLES, getPermissionsForRole } = require('../constants/roles');
const { matchConfiguredRole } = require('../services/authService');
const { createSession, destroySession } = require('../services/sessionStore');
const { verifyPassword } = require('../utils/password');
const { isEmployeeAccountActive } = require('../services/employeeAccountService');
const {
  SESSION_COOKIE,
  getSessionIdFromRequest,
} = require('../middleware/auth');
const { SESSION_TTL_MS } = require('../services/sessionStore');

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  path: '/',
  maxAge: SESSION_TTL_MS,
};

const toPublicUser = (auth) => ({
  email: auth.email,
  role: auth.role,
  employeeId: auth.employeeId,
  employeeCode: auth.employeeCode,
  permissions: auth.permissions,
});

const resolveConfiguredEmployeeLink = async () => {
  const configured = getConfiguredUsers()[ROLES.EMPLOYEE];
  let employee = null;

  if (configured.employeeCode) {
    employee = await Employee.findOne({ employeeCode: configured.employeeCode });
  }

  if (!employee && configured.email) {
    employee = await Employee.findOne({ email: configured.email });
  }

  return {
    employeeId: employee ? employee._id : null,
    employeeCode: employee ? employee.employeeCode : configured.employeeCode || null,
  };
};

const upsertUser = async ({ email, role, employeeId }) => {
  return User.findOneAndUpdate(
    { email },
    { email, role, employee: employeeId },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

const issueSession = async (res, { email, role, employeeId, employeeCode, userId }) => {
  const sessionId = createSession({
    userId: userId.toString(),
    email,
    role,
    employeeId: employeeId ? employeeId.toString() : null,
    employeeCode: employeeCode || null,
  });

  res.cookie(SESSION_COOKIE, sessionId, cookieOptions);

  return res.status(200).json({
    success: true,
    message: 'Signed in successfully',
    data: toPublicUser({
      email,
      role,
      employeeId: employeeId ? employeeId.toString() : null,
      employeeCode: employeeCode || null,
      permissions: getPermissionsForRole(role),
    }),
  });
};

const login = async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const configuredRole = matchConfiguredRole(email, password);

    if (configuredRole === ROLES.HR_MANAGER) {
      const user = await upsertUser({ email, role: ROLES.HR_MANAGER, employeeId: null });
      return issueSession(res, {
        email: user.email,
        role: user.role,
        employeeId: null,
        employeeCode: null,
        userId: user._id,
      });
    }

    const dbUser = await User.findOne({ email, role: ROLES.EMPLOYEE }).select('+passwordHash');
    if (dbUser?.passwordHash) {
      if (!verifyPassword(password, dbUser.passwordHash)) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      if (!dbUser.employee) {
        return res.status(403).json({
          success: false,
          message: 'No employee record is linked to this account',
        });
      }

      const employee = await Employee.findById(dbUser.employee);
      if (!employee) {
        return res.status(403).json({
          success: false,
          message: 'No employee record is linked to this account',
        });
      }

      if (!isEmployeeAccountActive(employee)) {
        return res.status(403).json({
          success: false,
          message: 'This employee account is not active',
        });
      }

      return issueSession(res, {
        email: dbUser.email,
        role: ROLES.EMPLOYEE,
        employeeId: employee._id,
        employeeCode: employee.employeeCode,
        userId: dbUser._id,
      });
    }

    if (configuredRole === ROLES.EMPLOYEE) {
      const { employeeId, employeeCode } = await resolveConfiguredEmployeeLink();
      if (employeeId) {
        const employee = await Employee.findById(employeeId);
        if (employee && !isEmployeeAccountActive(employee)) {
          return res.status(403).json({
            success: false,
            message: 'This employee account is not active',
          });
        }
      }
      const user = await upsertUser({ email, role: ROLES.EMPLOYEE, employeeId });
      return issueSession(res, {
        email: user.email,
        role: user.role,
        employeeId,
        employeeCode,
        userId: user._id,
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid email or password',
    });
  } catch (error) {
    return next(error);
  }
};

const logout = (req, res) => {
  const sessionId = getSessionIdFromRequest(req);
  destroySession(sessionId);
  res.clearCookie(SESSION_COOKIE, { path: '/' });
  return res.status(200).json({
    success: true,
    message: 'Signed out successfully',
  });
};

const me = (req, res) => {
  return res.status(200).json({
    success: true,
    data: toPublicUser(req.auth),
  });
};

module.exports = {
  login,
  logout,
  me,
};
=======
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
>>>>>>> 3035e89c7acb4b8ccf2f83eb29ddd1bd13812d82
