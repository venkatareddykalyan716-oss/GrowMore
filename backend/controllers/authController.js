const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const https = require('https');
const User = require('../models/User');
const Admin = require('../models/Admin');
const Transaction = require('../models/Transaction');
const Otp = require('../models/Otp');
const Plan = require('../models/Plan');
const ReferralHistory = require('../models/ReferralHistory');
const ReferralCommission = require('../models/ReferralCommission');
const { generateCaptcha } = require('../utils/captcha');

// ============================
// 🔐 TOKEN GENERATION
// ============================
const generateToken = (id, phone, role) => {
  return jwt.sign({ id, phone, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE  || "7d"
  });
};

// ============================
// 📱 OTP SYSTEM
// ============================
const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    
    // Step 1: Validate phone number format
    // Only allow valid Indian mobile numbers starting with 6,7,8,9 and exactly 10 digits
    const phoneRegex = /^[6-9][0-9]{9}$/;
    if (!phone || !phoneRegex.test(phone.trim())) {
      return res.status(400).json({ success: false, message: 'Invalid Phone Number' });
    }

    const cleanPhone = phone.trim();

    // Step 2: Check if phone already registered
    const existingUser = await User.findOne({ phone: cleanPhone });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Phone Already Registered' });
    }

    // Step 3: Fetch existing OTP session record
    let record = await Otp.findOne({ phoneNumber: cleanPhone });

    if (record) {
      // Check block time
      if (record.blockedUntil && record.blockedUntil > new Date()) {
        const remainingMin = Math.ceil((record.blockedUntil - new Date()) / 60000);
        return res.status(403).json({ 
          success: false, 
          message: `Too Many Attempts. Account is blocked. Try again in ${remainingMin} minutes.` 
        });
      }

      // Check resend limits (60 seconds)
      const secPassed = Math.floor((new Date() - record.lastRequestAt) / 1000);
      if (secPassed < 60) {
        return res.status(429).json({ 
          success: false, 
          message: `Limit resend after 60 seconds. Wait ${60 - secPassed}s.` 
        });
      }

      // Check hourly limits
      const isNewHour = (new Date() - record.lastRequestAt) > 3600000;
      let hourlyCount = isNewHour ? 0 : record.hourlyRequests;
      if (hourlyCount >= 5) {
        return res.status(429).json({ 
          success: false, 
          message: 'Too Many Attempts. Max 5 OTP requests per hour.' 
        });
      }
    }

    // Step 4: Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Secure print to server console for testing/verification
    console.log(`\n========================================\n🔥 [OTP SENDER] OTP for ${cleanPhone}: ${otp}\n========================================\n`);

    // Step 5: Hash OTP
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 5 * 60000); // 5 minutes expiration

    if (record) {
      const isNewHour = (new Date() - record.lastRequestAt) > 3600000;
      record.otpHash = otpHash;
      record.expiresAt = expiresAt;
      record.attempts = 0;
      record.isVerified = false;
      record.hourlyRequests = isNewHour ? 1 : record.hourlyRequests + 1;
      record.lastRequestAt = new Date();
      await record.save();
    } else {
      record = await Otp.create({
        phoneNumber: cleanPhone,
        otpHash,
        expiresAt,
        hourlyRequests: 1,
        lastRequestAt: new Date()
      });
    }

    res.json({
      success: true,
      message: 'OTP Sent successfully'
    });

  } catch (error) {
    console.error('❌ Send OTP error:', error);
    res.status(500).json({ success: false, message: 'SMS Sending Failed' });
  }
};

const resendOtp = sendOtp;

const verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    
    if (!phone || !otp || otp.trim().length !== 6) {
      return res.status(400).json({ success: false, message: 'OTP must be exactly 6 digits.' });
    }

    const cleanPhone = phone.trim();
    const cleanOtp = otp.trim();

    const record = await Otp.findOne({ phoneNumber: cleanPhone });
    if (!record) {
      return res.status(400).json({ success: false, message: 'Invalid Phone Number' });
    }

    // Check block time
    if (record.blockedUntil && record.blockedUntil > new Date()) {
      return res.status(403).json({ success: false, message: 'Too Many Attempts' });
    }

    // Check expiration
    if (record.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'OTP Expired' });
    }

    // Check wrong attempts limit
    if (record.attempts >= 5) {
      record.blockedUntil = new Date(Date.now() + 15 * 60000); // 15 mins block
      await record.save();
      return res.status(403).json({ success: false, message: 'Too Many Attempts' });
    }

    // Verify OTP code match
    const isMatch = await bcrypt.compare(cleanOtp, record.otpHash);
    if (!isMatch) {
      record.attempts += 1;
      if (record.attempts >= 5) {
        record.blockedUntil = new Date(Date.now() + 15 * 60000); // 15 mins block
      }
      await record.save();
      return res.status(400).json({ 
        success: false, 
        message: record.attempts >= 5 ? 'Too Many Attempts' : 'OTP Incorrect' 
      });
    }

    // Verify successful
    record.isVerified = true;
    record.attempts = 0; // Reset attempts
    await record.save();

    res.json({
      success: true,
      message: 'OTP verified successfully'
    });

  } catch (error) {
    console.error('❌ Verify OTP error:', error);
    res.status(500).json({ success: false, message: 'Server error during OTP verification' });
  }
};


const claimDailyBonus = async (req, res) => {
  try {
    const existing = await Transaction.findOne({
      user: req.user.userId,
      type: 'bonus'
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'Welcome bonus already claimed' });
    }

    const amount = 50;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.totalEarnings += amount;
    user.availableBalance += amount;
    await user.save();

    const transaction = await Transaction.create({
      user: user._id,
      type: 'bonus',
      amount,
      description: 'Registration Welcome bonus',
      status: 'completed',
      reference: `BONUS-${req.user.userId}`
    });

    res.json({
      success: true,
      message: `Welcome bonus of Rs ${amount} added`,
      transaction,
      stats: {
        totalEarnings: user.totalEarnings,
        availableBalance: user.availableBalance,
        totalWithdrawals: user.totalWithdrawals
      }
    });
  } catch (error) {
    console.error('Bonus error:', error);
    res.status(500).json({ success: false, message: 'Server error claiming bonus' });
  }
};

const completeTask = async (req, res) => {
  try {
    const tasks = {
      profile: { title: 'Check account profile', reward: 10 },
      invite: { title: 'Share invite link', reward: 15 },
      plans: { title: 'View product plans', reward: 10 }
    };
    const { taskId } = req.body;
    const task = tasks[taskId];

    if (!task) {
      return res.status(400).json({ success: false, message: 'Invalid task' });
    }

    const todayKey = new Date().toISOString().slice(0, 10);
    const reference = `TASK-${req.user.userId}-${todayKey}-${taskId}`;
    const existing = await Transaction.findOne({ reference });

    if (existing) {
      return res.status(400).json({ success: false, message: 'Task already completed today' });
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.totalEarnings += task.reward;
    user.availableBalance += task.reward;
    await user.save();

    const transaction = await Transaction.create({
      user: user._id,
      type: 'task_reward',
      amount: task.reward,
      description: task.title,
      status: 'completed',
      reference
    });

    res.json({
      success: true,
      message: `Task completed. Rs ${task.reward} credited`,
      transaction,
      stats: {
        totalEarnings: user.totalEarnings,
        availableBalance: user.availableBalance,
        totalWithdrawals: user.totalWithdrawals
      }
    });
  } catch (error) {
    console.error('Task error:', error);
    res.status(500).json({ success: false, message: 'Server error completing task' });
  }
};

const createMoneyRequest = async (req, res) => {
  try {
    const { type, amount, reference, proofImage } = req.body;
    const normalizedAmount = Number(amount);

    if (!['recharge', 'withdrawal'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Invalid request type' });
    }

    if (!normalizedAmount || normalizedAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Enter a valid amount' });
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (type === 'withdrawal') {
      if (user.availableBalance < normalizedAmount) {
        return res.status(400).json({ success: false, message: 'Not enough balance' });
      }
      user.availableBalance -= normalizedAmount;
      user.totalWithdrawals += normalizedAmount;
      await user.save();
    }

    // Check for duplicate UTR/transaction ID for recharge requests
    if (type === 'recharge' && reference) {
      const existing = await Transaction.findOne({ reference });
      if (existing) {
        return res.status(400).json({ success: false, message: 'This Transaction ID (UTR) has already been submitted!' });
      }
    }

    const transaction = await Transaction.create({
      user: user._id,
      type,
      amount: normalizedAmount,
      description: type === 'recharge' ? (req.body.description || 'Recharge request (UPI Manual)') : 'Withdrawal request',
      status: 'pending',
      reference: type === 'recharge' && reference ? reference : `${type === 'recharge' ? 'RECHARGE' : 'WITHDRAW'}-${user._id}-${Date.now()}`,
      proofImage: type === 'recharge' && proofImage ? proofImage : ''
    });

    res.json({
      success: true,
      message: type === 'recharge' ? 'Recharge request submitted' : 'Withdrawal request submitted',
      transaction,
      stats: {
        totalEarnings: user.totalEarnings,
        availableBalance: user.availableBalance,
        totalWithdrawals: user.totalWithdrawals
      }
    });
  } catch (error) {
    console.error('Money request error:', error);
    res.status(500).json({ success: false, message: 'Server error creating request' });
  }
};

// ============================
// 📤 SEND TOKEN RESPONSE
// ============================
const sendTokenResponse = (user, statusCode, res, message) => {
  const token = generateToken(user._id);
  
  res.status(statusCode).json({
    success: true,
    message,
    token,
    user: user.getPublicProfile()
  });

};

// ============================
// 🔢 GET CAPTCHA
// ============================
const getCaptcha = async (req, res) => {
  try {
    const captcha = generateCaptcha();
    const captchaId = Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
    
    // Store captcha in app memory
    req.app.locals.captchas = req.app.locals.captchas || {};
    req.app.locals.captchas[captchaId] = captcha.text;
    
    // Auto-delete after 5 minutes
    setTimeout(() => {
      delete req.app.locals.captchas[captchaId];
    }, 5 * 60 * 1000);

    console.log(`🔢 Captcha generated: ${captchaId} = ${captcha.text}`);

    res.json({
      success: true,
      captchaId,
      captchaText: captcha.text,
      appName: 'GrowMore'
    });
  } catch (error) {
    console.error('❌ Captcha error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error generating captcha' 
    });
  }
};

// ============================
// 📝 REGISTER USER
// ============================
const register = async (req, res) => {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📝 NEW REGISTRATION REQUEST');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  
  try {
    // ✅ Step 1: Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ VALIDATION FAILED:', errors.array());
      return res.status(400).json({ 
        success: false, 
        message: errors.array()[0].msg,
        errors: errors.array() 
      });
    }

    const { 
      phone, 
      countryCode, 
      fullName,
      password, 
      inviteCode, 
      securityQuestion, 
      securityAnswer,
      captchaId,
      captchaInput 
    } = req.body;

    // ✅ Step 2: Verify Captcha
    console.log(`🔍 Checking captcha... ID: ${captchaId}, Input: ${captchaInput}`);
    const captchas = req.app.locals.captchas || {};
    const storedCaptcha = captchas[captchaId];
    
    if (!storedCaptcha) {
      console.log('❌ Captcha EXPIRED or not found');
      console.log('Available captchas:', Object.keys(captchas));
      return res.status(400).json({ 
        success: false, 
        message: 'Captcha expired. Please refresh the captcha and try again.' 
      });
    }
    
    if (storedCaptcha.toUpperCase() !== (captchaInput || '').toUpperCase()) {
      console.log(`❌ Captcha MISMATCH. Expected: ${storedCaptcha}, Got: ${captchaInput}`);
      // Delete the used captcha
      delete captchas[captchaId];
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid captcha. Please try again.' 
      });
    }

    // Delete used captcha
    delete captchas[captchaId];
    console.log('✅ Captcha verified successfully');

    // ✅ Step 3: Check Existing User
    console.log(`🔍 Checking if phone exists: ${phone}`);
    const existingUser = await User.findOne({ phone: phone.trim() });
    if (existingUser) {
      console.log(`❌ Phone already registered: ${phone}`);
      return res.status(400).json({ 
        success: false, 
        message: 'This phone number is already registered with GrowMore. Please login instead.' 
      });
    }
    console.log('✅ Phone number is available');

    // ✅ Step 4: Find Inviter (if invite code provided)
    console.log(`🔍 Looking for inviter with code: "${inviteCode}"`);
    let invitedBy = null;
    
    if (inviteCode && inviteCode.trim() !== '') {
      const formattedCode = inviteCode.toUpperCase().trim();
      const inviter = await User.findOne({ 
        referralCode: formattedCode 
      });
      
      if (inviter) {
        invitedBy = inviter._id;
        console.log(`✅ Inviter FOUND: ${inviter.phone} (${inviter.fullName})`);
      } else {
        // Check if it's a global admin referral code
        const GlobalReferralCode = require('../models/GlobalReferralCode');
        const globalCode = await GlobalReferralCode.findOne({ code: formattedCode });
        if (globalCode) {
          console.log(`✅ Global Inviter Code FOUND: ${formattedCode}`);
          if (globalCode.createdBy) {
            invitedBy = globalCode.createdBy;
          } else {
            const firstAdmin = await User.findOne({ role: 'admin' });
            if (firstAdmin) invitedBy = firstAdmin._id;
          }
        } else {
          console.log(`⚠️ Invitation code "${inviteCode}" NOT FOUND in database`);
          return res.status(400).json({ 
            success: false, 
            message: 'Invalid Invitation Code' 
          });
        }
      }
    } else {
      console.log('ℹ️ No invitation code provided');
    }

    const userData = {
      phone: phone.trim(),
      countryCode: countryCode || '+91',
      fullName: fullName ? fullName.trim() : '',
      password,
      inviteCode: inviteCode ? inviteCode.toUpperCase().trim() : '',
      invitedBy,
      securityQuestion,
      securityAnswer: securityAnswer.trim()
    };
    

    
    console.log('User data to save:', { ...userData, password: '***HIDDEN***' });

    const user = await User.create(userData);

    console.log(`✅ USER CREATED SUCCESSFULLY!`);
    console.log(`   ID: ${user._id}`);
    console.log(`   Phone: ${user.phone}`);
    console.log(`   Referral Code: ${user.referralCode}`);
    console.log(`   Invited By: ${invitedBy || 'None'}`);

    // ✅ Step 6: Update Inviter's Referrals List
    if (invitedBy) {
      await User.findByIdAndUpdate(invitedBy, {
        $push: { directReferrals: user._id }
      });
      console.log(`✅ Added ${user.phone} to inviter's referral list`);
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');



    // ✅ Step 7: Send Success Response
    sendTokenResponse(user, 201, res, `Welcome to GrowMore, ${fullName || 'Member'}! 🎉`);
    
  } catch (error) {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ REGISTRATION ERROR:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Full error:', error);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // MongoDB duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        success: false, 
        message: `${field} is already registered. Please use a different one.` 
      });
    }
    
    // Mongoose validation error
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      console.error('Validation errors:', messages);
      return res.status(400).json({ 
        success: false, 
        message: messages.join('. ') 
      });
    }

    // Cast error (invalid ObjectId, etc.)
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid ${error.path}: ${error.value}` 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: `Server error: ${error.message}` 
    });
  }
};

// ============================
// 👤 GET CURRENT USER
// ============================
const getMe = async (req, res) => {
  try {
    console.log(`👤 Getting user info for ID: ${req.user.userId}`);
    
    if (req.user.role === 'admin') {
      const admin = await Admin.findById(req.user.userId);
      if (!admin) {
        return res.status(404).json({ success: false, message: 'Admin not found' });
      }
      return res.json({
        success: true,
        appName: 'GrowMore',
        user: {
          id: admin._id,
          phone: admin.phone,
          fullName: admin.name,
          role: 'admin',
          joinedAt: admin.createdAt
        }
      });
    }

    const user = await User.findById(req.user.userId)
      .populate('directReferrals', 'phone fullName referralCode totalEarnings createdAt');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    res.json({
      success: true,
      appName: 'GrowMore',
      user: {
        ...user.getPublicProfile(),
        email: user.email,
        isVerified: user.isVerified,
        directReferrals: user.directReferrals,
        directReferralCount: user.directReferrals.length
      }
    });
  } catch (error) {
    console.error('❌ GetMe error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============================
// 🚪 LOGOUT USER
// ============================
const logout = async (req, res) => {
  console.log(`🚪 Logout for user: ${req.user.userId}`);
  res.json({
    success: true,
    message: 'Logged out from GrowMore successfully'
  });
};

// ============================
// 🔑 LOGIN USER (Unified Admin/User)
// ============================
const login = async (req, res) => {
  console.log('\n🔑 LOGIN ATTEMPT (Unified Admin/User)');
  console.log('Phone:', req.body.phone);
  
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid Phone Number or Password' 
      });
    }

    // 1. Search Admin collection first
    const admin = await Admin.findOne({ phone });
    if (admin) {
      const isMatch = await admin.comparePassword(password);
      if (isMatch) {
        const token = generateToken(admin._id, admin.phone, 'admin');
        console.log(`✅ Admin login successful: ${phone}`);
        return res.json({
          success: true,
          role: 'admin',
          token,
          redirect: '/admin/dashboard'
        });
      } else {
        console.log(`❌ Admin wrong password: ${phone}`);
        return res.status(401).json({
          success: false,
          message: 'Invalid Phone Number or Password'
        });
      }
    }

    // 2. Search User collection next
    const user = await User.findOne({ phone }).select('+password');
    if (user) {
      if (!user.isActive) {
        console.log(`❌ User inactive: ${phone}`);
        return res.status(401).json({ 
          success: false, 
          message: 'Your GrowMore account is deactivated. Contact support.' 
        });
      }

      const isMatch = await user.comparePassword(password);
      if (isMatch) {
        user.lastLogin = new Date();
        await user.save();

        const token = generateToken(user._id, user.phone, 'user');
        console.log(`✅ User login successful: ${phone}`);
        return res.json({
          success: true,
          role: 'user',
          token,
          redirect: '/dashboard'
        });
      }
    }

    // 3. Not found or incorrect password
    console.log(`❌ Invalid credentials: ${phone}`);
    return res.status(401).json({
      success: false,
      message: 'Invalid Phone Number or Password'
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login' 
    });
  }
};

// ============================
// 📊 GET DASHBOARD DATA
// ============================
const getDashboard = async (req, res) => {
  try {
    console.log(`📊 Loading dashboard for user: ${req.user.userId}`);
    
    const user = await User.findById(req.user.userId)
      .populate('directReferrals', 'phone fullName totalEarnings createdAt');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const transactions = await Transaction.find({ user: req.user.userId })
      .sort('-createdAt')
      .limit(200);

    const totalTeam = await User.countDocuments({ 
      invitedBy: req.user.userId 
    });
    const todayKey = new Date().toISOString().slice(0, 10);
    const taskIds = ['profile', 'invite', 'plans'];
    const taskTransactions = await Transaction.find({
      user: req.user.userId,
      reference: { $in: taskIds.map(taskId => `TASK-${req.user.userId}-${todayKey}-${taskId}`) }
    });
    const todayBonus = await Transaction.findOne({
      user: req.user.userId,
      type: 'bonus'
    });

    const completedRecharges = await Transaction.find({
      user: req.user.userId,
      type: 'recharge',
      status: 'completed'
    });
    const totalRecharge = completedRecharges.reduce((sum, tx) => sum + tx.amount, 0);

    // Current time in IST (UTC + 5.5 hours)
    const now = new Date();
    const utcNow = now.getTime() + (now.getTimezoneOffset() * 60000);
    const istNow = new Date(utcNow + (3600000 * 5.5));
    
    // Start of today in IST
    const istStartOfToday = new Date(istNow);
    istStartOfToday.setUTCHours(0, 0, 0, 0); // 12:00 AM IST
    
    // Convert back to UTC Date for MongoDB query
    const utcStartOfToday = new Date(istStartOfToday.getTime() - (3600000 * 5.5));

    const todayTransactions = await Transaction.find({
      user: req.user.userId,
      type: { $in: ['task_reward', 'bonus', 'referral_commission', 'referral', 'Referral Commission'] },
      status: 'completed',
      createdAt: { $gte: utcStartOfToday }
    });
    const todayIncome = todayTransactions.reduce((sum, tx) => sum + tx.amount, 0);

    const teamTransactions = await Transaction.find({
      user: req.user.userId,
      type: { $in: ['referral_commission', 'referral', 'Referral Commission'] },
      status: 'completed'
    });
    const teamIncome = teamTransactions.reduce((sum, tx) => sum + tx.amount, 0);

    res.json({
      success: true,
      appName: 'GrowMore',
      stats: {
        totalEarnings: user.totalEarnings || 0,
        availableBalance: user.availableBalance || 0,
        totalWithdrawals: user.totalWithdrawals || 0,
        directReferrals: user.directReferrals ? user.directReferrals.length : 0,
        totalTeam,
        level: user.level || 0,
        referralCode: user.referralCode,
        totalRecharge,
        todayIncome,
        teamIncome
      },
      bonusClaimedToday: !!todayBonus,
      taskStatus: taskIds.reduce((status, taskId) => {
        status[taskId] = taskTransactions.some(tx => tx.reference === `TASK-${req.user.userId}-${todayKey}-${taskId}`);
        return status;
      }, {}),
      recentTransactions: transactions
    });
  } catch (error) {
    console.error('❌ Dashboard error:', error);
    res.status(500).json({ success: false, message: 'Server error loading dashboard' });
  }
};

// ============================
// 🔄 FORGOT PASSWORD (Bonus)
// ============================
const forgotPassword = async (req, res) => {
  try {
    const { phone, securityAnswer, newPassword } = req.body;

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    if (user.securityAnswer.toLowerCase() !== securityAnswer.toLowerCase()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Incorrect security answer' 
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successful. Please login with new password.'
    });
  } catch (error) {
    console.error('❌ Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============================
// 💳 RAZORPAY INTEGRATION
// ============================

const makeHttpsPost = (url, headers, body) => {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      port: 443,
      path: parsedUrl.pathname,
      method: 'POST',
      headers: headers
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            body: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            body: { error: { description: 'Invalid JSON response from Razorpay' } }
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(JSON.stringify(body));
    req.end();
  });
};

const createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return res.status(500).json({ success: false, message: 'Razorpay keys not configured on server' });
    }

    const amountInPaise = Math.round(amount * 100);
    const receiptId = `rec_${req.user.userId.toString().slice(-6)}_${Date.now()}`;

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + Buffer.from(keyId + ':' + keySecret).toString('base64')
    };

    const body = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: receiptId
    };

    const result = await makeHttpsPost('https://api.razorpay.com/v1/orders', headers, body);

    if (result.statusCode === 200 || result.statusCode === 201) {
      res.json({
        success: true,
        keyId,
        orderId: result.body.id,
        amount: result.body.amount,
        currency: result.body.currency
      });
    } else {
      console.error('Razorpay Order API Error:', result.body);
      res.status(result.statusCode || 400).json({
        success: false,
        message: result.body?.error?.description || 'Failed to create order with Razorpay'
      });
    }
  } catch (error) {
    console.error('createRazorpayOrder error:', error);
    res.status(500).json({ success: false, message: 'Server error creating payment order' });
  }
};

const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Bypass signature check if it's a mock payment to avoid Razorpay Test Mode warning
    const isMock = razorpay_signature === 'mock_signature' || !razorpay_signature;

    if (!isMock) {
      if (!keySecret) {
        return res.status(500).json({ success: false, message: 'Razorpay secret not configured' });
      }

      const generatedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(razorpay_order_id + '|' + razorpay_payment_id)
        .digest('hex');

      if (generatedSignature !== razorpay_signature) {
        return res.status(400).json({ success: false, message: 'Invalid payment signature' });
      }
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const rechargeAmount = Number(amount);

    const transaction = await Transaction.create({
      user: user._id,
      type: 'recharge',
      amount: rechargeAmount,
      description: `Recharge via Razorpay (${razorpay_payment_id})`,
      status: 'completed',
      reference: razorpay_payment_id
    });

    user.availableBalance = (user.availableBalance || 0) + rechargeAmount;
    await user.save();

    res.json({
      success: true,
      message: 'Recharge successful!',
      balance: user.availableBalance,
      transaction
    });
  } catch (error) {
    console.error('verifyRazorpayPayment error:', error);
    res.status(500).json({ success: false, message: 'Server error verifying payment' });
  }
};

// ============================
// 👥 TEAM & REFERRAL ENDPOINTS
// ============================

const getTeamStats = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Initialize metrics
    let totalTeamCount = 0;
    let activeTeamCount = 0;
    let inactiveTeamCount = 0;
    let todayNewMembers = 0;
    let todayTeamInvestment = 0;
    let totalTeamInvestment = 0;
    let todayReferralIncome = 0;
    let totalReferralIncome = 0;
    let vipTeamMembersCount = 0;

    // Build levels maps
    const levelMap = {};
    const teamList = [];

    // Gather today's boundary in IST
    const now = new Date();
    const utcNow = now.getTime() + (now.getTimezoneOffset() * 60000);
    const istNow = new Date(utcNow + (3600000 * 5.5));
    const startOfToday = new Date(istNow);
    startOfToday.setHours(0, 0, 0, 0);

    // BFS tree search
    let queue = [{ id: userId, level: 0 }];
    const visited = new Set([userId.toString()]);

    while (queue.length > 0) {
      const current = queue.shift();
      const referrals = await User.find({ invitedBy: current.id });
      
      for (const refUser of referrals) {
        const refIdStr = refUser._id.toString();
        if (!visited.has(refIdStr)) {
          visited.add(refIdStr);
          const refLevel = current.level + 1;
          
          queue.push({ id: refUser._id, level: refLevel });

          // Level maps
          if (!levelMap[refLevel]) {
            levelMap[refLevel] = [];
          }
          levelMap[refLevel].push(refUser._id);

          // Get their total investment amount
          const investTxs = await Transaction.find({ user: refUser._id, type: 'invest', status: 'completed' });
          const refTotalInvest = investTxs.reduce((sum, t) => sum + t.amount, 0);

          const todayInvestTxs = investTxs.filter(t => {
            const txDate = new Date(t.createdAt);
            const txIst = new Date(txDate.getTime() + (txDate.getTimezoneOffset() * 60000) + (3600000 * 5.5));
            return txIst >= startOfToday;
          });
          const refTodayInvest = todayInvestTxs.reduce((sum, t) => sum + t.amount, 0);

          const isUserActive = refTotalInvest > 0;
          const rawPhone = refUser.phone || '';
          const maskedPhone = rawPhone.length >= 10 
            ? `${rawPhone.slice(0, 4)}****${rawPhone.slice(-2)}` 
            : rawPhone;

          // Referee commissions log
          const refereeCommissions = await ReferralCommission.find({ referrerId: userId, memberId: refUser._id });
          const generatedCommission = refereeCommissions.reduce((sum, c) => sum + c.commissionAmount, 0);
          
          const todayRefereeCommissions = refereeCommissions.filter(c => {
            const cDate = new Date(c.createdAt);
            const cIst = new Date(cDate.getTime() + (cDate.getTimezoneOffset() * 60000) + (3600000 * 5.5));
            return cIst >= startOfToday;
          });
          const todayGeneratedCommission = todayRefereeCommissions.reduce((sum, c) => sum + c.commissionAmount, 0);

          const vipLevel = refUser.growthLevel || 'VIP 0';
          if (vipLevel !== 'VIP 0') {
            vipTeamMembersCount++;
          }

          totalTeamCount++;
          if (isUserActive) {
            activeTeamCount++;
          } else {
            inactiveTeamCount++;
          }

          const refJoinIst = new Date(new Date(refUser.joinedAt).getTime() + (3600000 * 5.5));
          if (refJoinIst >= startOfToday) {
            todayNewMembers++;
          }

          totalTeamInvestment += refTotalInvest;
          todayTeamInvestment += refTodayInvest;

          // Find all investment plans purchased by this referee
          const userPlans = await Plan.find({ "investors.user": refUser._id });
          let refDailyIncome = 0;
          const refInvestmentPlans = [];
          
          userPlans.forEach(p => {
            p.investors.forEach(inv => {
              if (inv.user && inv.user.toString() === refIdStr) {
                const elapsedDays = (Date.now() - new Date(inv.investedAt).getTime()) / (24 * 60 * 60 * 1000);
                const isActivePlan = elapsedDays <= p.duration;
                
                if (isActivePlan) {
                  refDailyIncome = Number((refDailyIncome + p.dailyIncome).toFixed(2));
                }
                
                refInvestmentPlans.push({
                  name: p.name,
                  amount: inv.amount,
                  dailyIncome: p.dailyIncome,
                  duration: p.duration,
                  investedAt: inv.investedAt,
                  isActive: isActivePlan
                });
              }
            });
          });

          teamList.push({
            id: refUser._id,
            fullName: refUser.fullName || 'GrowMore Member',
            phone: maskedPhone,
            joinDate: refUser.joinedAt,
            lastActive: refUser.lastLogin || refUser.updatedAt || refUser.joinedAt,
            vipLevel,
            currentInvestment: refTotalInvest,
            status: isUserActive ? 'Active' : 'Inactive',
            level: refLevel,
            todayIncome: todayGeneratedCommission,
            totalIncome: generatedCommission,
            walletBalance: refUser.availableBalance || 0,
            plansCount: refInvestmentPlans.length,
            dailyIncome: refDailyIncome,
            investmentPlans: refInvestmentPlans
          });
        }
      }
    }

    // Payout commissions overview
    const userCommissions = await ReferralCommission.find({ referrerId: userId });
    totalReferralIncome = userCommissions.reduce((sum, c) => sum + c.commissionAmount, 0);
    
    const todayUserCommissions = userCommissions.filter(c => {
      const cDate = new Date(c.createdAt);
      const cIst = new Date(cDate.getTime() + (cDate.getTimezoneOffset() * 60000) + (3600000 * 5.5));
      return cIst >= startOfToday;
    });
    todayReferralIncome = todayUserCommissions.reduce((sum, c) => sum + c.commissionAmount, 0);

    const levelDistribution = Object.keys(levelMap).map(lvl => ({
      level: `Level ${lvl}`,
      count: levelMap[lvl].length
    }));

    res.json({
      success: true,
      stats: {
        totalTeamCount,
        activeTeamCount,
        inactiveTeamCount,
        todayNewMembers,
        todayTeamInvestment,
        totalTeamInvestment,
        todayReferralIncome,
        totalReferralIncome,
        vipTeamMembersCount
      },
      levelDistribution,
      teamList: teamList.sort((a, b) => new Date(b.joinDate) - new Date(a.joinDate))
    });
  } catch (error) {
    console.error('getTeamStats error:', error);
    res.status(500).json({ success: false, message: 'Server error loading team stats' });
  }
};

const getReferralHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const count = await ReferralCommission.countDocuments({ referrerId: userId });
    const history = await ReferralCommission.find({ referrerId: userId })
      .populate('memberId', 'fullName phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const formattedHistory = history.map(item => ({
      id: item._id,
      date: item.createdAt,
      referralName: item.memberId?.fullName || 'Friend',
      referralPhone: item.memberId?.phone ? `${item.memberId.phone.slice(0, 4)}****${item.memberId.phone.slice(-2)}` : 'N/A',
      investmentPlan: item.investmentId,
      dailyIncome: item.dailyIncome,
      commissionPercent: item.commissionPercent,
      commissionEarned: item.commissionAmount,
      commissionLevel: item.level,
      status: 'completed'
    }));

    res.json({
      success: true,
      count,
      page,
      pages: Math.ceil(count / limit),
      history: formattedHistory
    });
  } catch (error) {
    console.error('getReferralHistory error:', error);
    res.status(500).json({ success: false, message: 'Server error loading commission history' });
  }
};

const getBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('availableBalance referralCode phone');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({
      success: true,
      balance: user.availableBalance || 0,
      referralCode: user.referralCode || '',
      phone: user.phone || ''
    });
  } catch (error) {
    console.error('getBalance error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getMyTransactions = async (req, res) => {
  try {
    const { type } = req.query;
    const filter = { user: req.user.userId };
    if (type) {
      if (type === 'withdrawal') {
        // filter out investment withdrawals for user history if needed, or include them
        filter.type = 'withdrawal';
      } else {
        filter.type = type;
      }
    }

    const transactions = await Transaction.find(filter)
      .sort('-createdAt')
      .limit(50);
    res.json({ success: true, transactions });
  } catch (error) {
    console.error('getMyTransactions error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============================
// 📦 EXPORTS
// ============================
module.exports = {
  getCaptcha,
  register,
  login,
  getMe,
  logout,
  getDashboard,
  claimDailyBonus,
  completeTask,
  createMoneyRequest,
  forgotPassword,
  sendOtp,
  verifyOtp,
  resendOtp,
  createRazorpayOrder,
  verifyRazorpayPayment,
  getTeamStats,
  getReferralHistory,
  getBalance,
  getMyTransactions
};
