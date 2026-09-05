<<<<<<< HEAD
const express = require('express');
const { login, logout, me } = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/login', login);
router.post('/logout', logout);
router.get('/me', requireAuth, me);

module.exports = router;
=======
const express = require("express");
const router = express.Router();
const {registerUser, UserLogin, getAllUsers, updateProfile, getProfile, getDashboardStats} = require("../controllers/authController");
const { protect, checkRole } = require("../middleware/authMiddleware");

// @route POST /api/auth/register
// @desc Register a new User
router.post("/register", registerUser);

// @route POST /api/auth/login
// @desc Login existing User
router.post("/login", UserLogin);

router.get("/users", protect, checkRole('Admin', 'HRManager'), getAllUsers);
router.get("/dashboard", protect, getDashboardStats);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

module.exports = router;
>>>>>>> 3035e89c7acb4b8ccf2f83eb29ddd1bd13812d82
