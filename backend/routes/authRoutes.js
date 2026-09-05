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