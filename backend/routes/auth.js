const express = require('express');
const { body } = require('express-validator');
const {
  getCaptcha,
  register,
  login,
  getMe,
  logout,
  getDashboard,
  claimDailyBonus,
  completeTask,
  createMoneyRequest,
  sendOtp,
  verifyOtp,
  resendOtp,
  forgotPassword,
  createRazorpayOrder,
  verifyRazorpayPayment,
  getTeamStats,
  getReferralHistory
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

const registerValidation = [
  body('phone')
    .trim()
    .matches(/^[0-9]{10}$/)
    .withMessage('Please enter a valid 10-digit phone number'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('inviteCode')
    .trim()
    .notEmpty()
    .withMessage('Invitation code is required'),
  body('securityQuestion')
    .notEmpty()
    .withMessage('Security question is required'),
  body('securityAnswer')
    .trim()
    .notEmpty()
    .withMessage('Security answer is required')
];

router.get('/captcha', getCaptcha);
router.post('/register', registerValidation, register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/dashboard', protect, getDashboard);
router.post('/bonus/daily', protect, claimDailyBonus);
router.post('/tasks/complete', protect, completeTask);
router.post('/money-request', protect, createMoneyRequest);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/forgot-password', forgotPassword);
router.post('/logout', protect, logout);

// Razorpay Payment Gateway Routes
router.post('/razorpay/create-order', protect, createRazorpayOrder);
router.post('/razorpay/verify-payment', protect, verifyRazorpayPayment);

// Referral & Team routes
router.get('/team/stats', protect, getTeamStats);
router.get('/team/history', protect, getReferralHistory);

// Promotion Milestone Tasks routes
const { getUserTasks, claimTaskReward } = require('../controllers/taskController');
router.get('/promotion-tasks', protect, getUserTasks);
router.post('/promotion-tasks/claim/:taskId', protect, claimTaskReward);

module.exports = router;
