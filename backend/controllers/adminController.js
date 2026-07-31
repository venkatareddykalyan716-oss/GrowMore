const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Plan = require('../models/Plan');
const ReferralSetting = require('../models/ReferralSetting');
const ReferralHistory = require('../models/ReferralHistory');
const BankDetails = require('../models/BankDetails');
const RewardHistory = require('../models/RewardHistory');

// 📊 Get All Users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).sort('-createdAt').lean();
    
    // Fetch all bank details
    const allBankDetails = await BankDetails.find({});
    const bankDetailsMap = {};
    allBankDetails.forEach(bd => {
      bankDetailsMap[bd.userId.toString()] = bd;
    });

    // Map bank details to users
    const usersWithBankDetails = users.map(user => ({
      ...user,
      bankDetails: bankDetailsMap[user._id.toString()] || null
    }));

    res.json({
      success: true,
      users: usersWithBankDetails
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Server error fetching users' });
  }
};

// 💳 Get All Transactions (Recharges and Withdrawals)
const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      type: { $in: ['recharge', 'withdrawal'] }
    })
    .populate('user', 'phone fullName availableBalance')
    .sort('-createdAt');

    res.json({
      success: true,
      transactions
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ success: false, message: 'Server error fetching transactions' });
  }
};

// ✅ Process Transaction Status (Approve / Reject)
const processTransaction = async (req, res) => {
  try {
    const { transactionId, status, rejectionReason } = req.body; // status: 'completed' or 'failed'
    
    if (!['completed', 'failed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status update' });
    }

    const tx = await Transaction.findById(transactionId);
    if (!tx) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    if (tx.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Transaction already processed' });
    }

    const user = await User.findById(tx.user);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User associated with transaction not found' });
    }

    // Log the admin action
    console.log(`🛡️ [ADMIN ACTION] Admin (Phone: ${req.user.phone}, ID: ${req.user.id}) processed transaction ${transactionId} as ${status}. Rejection Reason: ${rejectionReason || 'None'}`);

    if (tx.type === 'recharge') {
      if (status === 'completed') {
        user.availableBalance += tx.amount;
        user.totalEarnings += tx.amount; // Optionally count recharges in earnings or keep separate
        await user.save();
      }
    } else if (tx.type === 'withdrawal') {
      // Balance was already deducted when withdrawal request was created
      // If failed/rejected, we refund the amount back to user's balance
      if (status === 'failed') {
        user.availableBalance += tx.amount;
        user.totalWithdrawals = Math.max(0, user.totalWithdrawals - tx.amount);
        if (rejectionReason) {
          tx.rejectionReason = rejectionReason;
        }
        await user.save();
      }
    }

    tx.status = status;
    await tx.save();

    res.json({
      success: true,
      message: `Transaction request ${status === 'completed' ? 'approved' : 'rejected'} successfully`,
      transaction: tx
    });
  } catch (error) {
    console.error('Error processing transaction:', error);
    res.status(500).json({ success: false, message: 'Server error processing transaction' });
  }
};

// ⚙️ Adjust User Balance & Status
const updateUser = async (req, res) => {
  try {
    const { userId, availableBalance, totalEarnings, isActive, role, referralCode } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (availableBalance !== undefined) user.availableBalance = Number(availableBalance);
    if (totalEarnings !== undefined) user.totalEarnings = Number(totalEarnings);
    if (isActive !== undefined) user.isActive = Boolean(isActive);
    if (role !== undefined) user.role = role;
    if (req.body.password !== undefined && req.body.password.trim() !== '') {
      user.password = req.body.password.trim();
    }
    if (referralCode !== undefined && referralCode.trim() !== '') {
      const formattedCode = referralCode.toUpperCase().trim();
      const existingUser = await User.findOne({ referralCode: formattedCode, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Referral code is already taken by another user' });
      }
      user.referralCode = formattedCode;
    }

    await user.save();

    res.json({
      success: true,
      message: 'User settings updated successfully',
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ success: false, message: 'Server error updating user' });
  }
};

// 📋 Get All Plans (Admin view)
const adminGetPlans = async (req, res) => {
  try {
    const plans = await Plan.find({}).sort({ price: 1 });
    res.json({
      success: true,
      plans
    });
  } catch (error) {
    console.error('Error fetching admin plans:', error);
    res.status(500).json({ success: false, message: 'Server error fetching plans' });
  }
};

// ➕ Create New Plan
const createPlan = async (req, res) => {
  try {
    const { name, description, price, dailyIncome, duration, image, category, growthLevel, totalSlots, isActive, sharePower = 0, shareIncome = 0 } = req.body;
    
    const newPlan = await Plan.create({
      name,
      description,
      price: Number(price),
      dailyIncome: Number(dailyIncome),
      duration: Number(duration),
      image: image || '🥤',
      category: category || 'juice',
      growthLevel: growthLevel || 'STARTER',
      totalSlots: Number(totalSlots || 100),
      availableSlots: Number(totalSlots || 100),
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      sharePower: Number(sharePower),
      shareIncome: Number(shareIncome)
    });

    res.status(201).json({
      success: true,
      message: 'Investment plan created successfully',
      plan: newPlan
    });
  } catch (error) {
    console.error('Error creating plan:', error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Plan name must be unique' });
    }
    res.status(500).json({ success: false, message: 'Server error creating plan' });
  }
};

// ✏️ Update Plan
const updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, dailyIncome, duration, image, category, growthLevel, totalSlots, availableSlots, isActive, sharePower, shareIncome } = req.body;
    
    const plan = await Plan.findById(id);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    if (name !== undefined) plan.name = name;
    if (description !== undefined) plan.description = description;
    if (price !== undefined) plan.price = Number(price);
    if (dailyIncome !== undefined) plan.dailyIncome = Number(dailyIncome);
    if (duration !== undefined) plan.duration = Number(duration);
    if (image !== undefined) plan.image = image;
    if (category !== undefined) plan.category = category;
    if (growthLevel !== undefined) plan.growthLevel = growthLevel;
    if (totalSlots !== undefined) plan.totalSlots = Number(totalSlots);
    if (availableSlots !== undefined) plan.availableSlots = Number(availableSlots);
    if (isActive !== undefined) plan.isActive = Boolean(isActive);
    if (sharePower !== undefined) plan.sharePower = Number(sharePower);
    if (shareIncome !== undefined) plan.shareIncome = Number(shareIncome);

    await plan.save();

    res.json({
      success: true,
      message: 'Plan updated successfully',
      plan
    });
  } catch (error) {
    console.error('Error updating plan:', error);
    res.status(500).json({ success: false, message: 'Server error updating plan' });
  }
};

// 🗑️ Delete Plan
const deletePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await Plan.findById(id);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    await plan.deleteOne();

    res.json({
      success: true,
      message: 'Plan deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting plan:', error);
    res.status(500).json({ success: false, message: 'Server error deleting plan' });
  }
};

// 💼 Get All User Investments (Admin view)
const adminGetInvestments = async (req, res) => {
  try {
    const plans = await Plan.find({}).populate('investors.user', 'phone fullName');
    const investments = [];
    
    let dbUpdated = false;
    plans.forEach(plan => {
      if (plan.investors && plan.investors.length > 0) {
        plan.investors.forEach(userInv => {
          if (userInv.amount !== plan.price) {
            userInv.amount = plan.price;
            dbUpdated = true;
          }
          investments.push({
            investmentId: userInv._id,
            planId: plan._id,
            planName: plan.name,
            price: plan.price,
            dailyIncome: plan.dailyIncome,
            duration: plan.duration,
            investedAt: userInv.investedAt,
            amount: userInv.amount,
            user: userInv.user || { phone: 'Unknown', fullName: 'Deleted User' },
            lastClaimedAt: userInv.lastClaimedAt || null,
            claimCount: userInv.claimCount || 0,
            claimsHistory: userInv.claimsHistory || []
          });
        });
        if (dbUpdated) {
          plan.save().catch(err => console.error('Error saving updated plan amount:', err));
          dbUpdated = false;
        }
      }
    });

    investments.sort((a, b) => new Date(b.investedAt) - new Date(a.investedAt));

    res.json({
      success: true,
      investments
    });
  } catch (error) {
    console.error('Error fetching admin investments:', error);
    res.status(500).json({ success: false, message: 'Server error fetching investments' });
  }
};

// ============================
// ⚙️ ADMIN REFERRAL SETTINGS & ADJUSTMENTS
// ============================

const getReferralSettings = async (req, res) => {
  try {
    let settings = await ReferralSetting.findOne();
    if (!settings) {
      settings = await ReferralSetting.create({
        enabled: true,
        maxLevels: 5,
        levels: [14, 8, 5, 3, 2]
      });
    }
    res.json({ success: true, settings });
  } catch (error) {
    console.error('getReferralSettings error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching referral settings' });
  }
};

const updateReferralSettings = async (req, res) => {
  try {
    const { enabled, maxLevels, levels } = req.body;
    let settings = await ReferralSetting.findOne();
    if (!settings) {
      settings = new ReferralSetting();
    }
    
    settings.enabled = enabled !== undefined ? enabled : settings.enabled;
    settings.maxLevels = maxLevels !== undefined ? Number(maxLevels) : settings.maxLevels;
    settings.levels = levels !== undefined ? levels.map(Number) : settings.levels;
    
    await settings.save();
    res.json({ success: true, message: 'Referral settings updated successfully', settings });
  } catch (error) {
    console.error('updateReferralSettings error:', error);
    res.status(500).json({ success: false, message: 'Server error updating settings' });
  }
};

const getTopReferrers = async (req, res) => {
  try {
    const topReferrers = await User.find({ 'directReferrals.0': { $exists: true } })
      .select('fullName phone referralCode directReferrals availableBalance totalEarnings')
      .lean();

    const formatted = topReferrers.map(u => ({
      id: u._id,
      fullName: u.fullName || 'Member',
      phone: u.phone,
      referralCode: u.referralCode,
      directCount: u.directReferrals.length,
      availableBalance: u.availableBalance,
      totalEarnings: u.totalEarnings
    })).sort((a, b) => b.directCount - a.directCount);

    res.json({ success: true, topReferrers: formatted.slice(0, 100) });
  } catch (error) {
    console.error('getTopReferrers error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching top referrers' });
  }
};

const adjustReferralCommission = async (req, res) => {
  try {
    const { userId, amount, description } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const adjustAmount = Number(amount);
    if (isNaN(adjustAmount) || adjustAmount === 0) {
      return res.status(400).json({ success: false, message: 'Enter a valid non-zero amount' });
    }

    // Update wallet
    user.availableBalance = Number((user.availableBalance + adjustAmount).toFixed(2));
    if (adjustAmount > 0) {
      user.totalEarnings = Number((user.totalEarnings + adjustAmount).toFixed(2));
    }
    await user.save();

    // Create transaction log
    await Transaction.create({
      user: user._id,
      type: 'referral_commission',
      amount: Math.abs(adjustAmount),
      description: description || `Admin commission adjustment: ${adjustAmount > 0 ? 'Credit' : 'Debit'}`,
      status: 'completed',
      reference: `ADJ_${Date.now()}`
    });

    // Create a dummy ReferralHistory log to record it
    await ReferralHistory.create({
      referrer: user._id,
      referee: user._id,
      investmentPlan: 'Admin Adjustment',
      investmentAmount: 0,
      commissionLevel: 0,
      commissionPercent: 0,
      commissionEarned: adjustAmount,
      status: 'completed'
    });

    // Emit live update
    const io = req.app.get('io');
    if (io) {
      io.to(user._id.toString()).emit('commission_update', {
        type: 'commission',
        title: adjustAmount > 0 ? '🎁 Admin Bonus Credited' : '💸 Admin Debit Processed',
        message: description || `Admin has adjusted your balance by ${adjustAmount > 0 ? '+' : ''}$${adjustAmount}.`,
        newBalance: user.availableBalance
      });
    }

    res.json({ success: true, message: 'Balance adjusted successfully', balance: user.availableBalance });
  } catch (error) {
    console.error('adjustReferralCommission error:', error);
    res.status(500).json({ success: false, message: 'Server error during adjustment' });
  }
};

module.exports = {
  getAllUsers,
  getAllTransactions,
  processTransaction,
  updateUser,
  adminGetPlans,
  createPlan,
  updatePlan,
  deletePlan,
  adminGetInvestments,
  getReferralSettings,
  updateReferralSettings,
  getTopReferrers,
  adjustReferralCommission
};

// 🔍 Get Withdrawal Request Details (including User, Bank Details, and KYC Details)
const getWithdrawalDetails = async (req, res) => {
  try {
    const { withdrawalId } = req.params;

    // Log the admin action
    console.log(`🛡️ [ADMIN ACTION] Admin (Phone: ${req.user.phone}, ID: ${req.user.id}) viewed withdrawal request details for ID: ${withdrawalId}`);

    const withdrawal = await Transaction.findById(withdrawalId);
    if (!withdrawal || withdrawal.type !== 'withdrawal') {
      return res.status(404).json({
        success: false,
        message: 'Withdrawal request not found'
      });
    }

    const user = await User.findById(withdrawal.user).lean();
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User associated with this request not found'
      });
    }

    const bankDetails = await BankDetails.findOne({ userId: user._id });

    // Construct mock kycDetails (since documents aren't stored in DB yet)
    const kycDetails = {
      status: user.isVerified ? 'Verified' : 'Pending',
      documents: {
        passbookImage: '',
        cancelledCheque: '',
        bankStatement: ''
      }
    };

    res.json({
      success: true,
      withdrawal,
      user: {
        id: user._id,
        phone: user.phone,
        fullName: user.fullName,
        email: user.email || 'N/A',
        isActive: user.isActive,
        isVerified: user.isVerified,
        joinedAt: user.joinedAt || user.createdAt
      },
      bankDetails: bankDetails ? {
        accountHolderName: bankDetails.accountHolderName,
        bankName: bankDetails.bankName,
        accountNumber: bankDetails.accountNumber,
        ifscCode: bankDetails.ifscCode,
        branchName: bankDetails.branchName || 'N/A',
        upiId: bankDetails.upiId || 'N/A'
      } : null,
      kycDetails
    });
  } catch (error) {
    console.error('Error fetching withdrawal details:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching withdrawal request details'
    });
  }
};

// 🗑️ Delete User
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Find the user first
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // 1. Remove user from upline's directReferrals array
    if (user.invitedBy) {
      await User.findByIdAndUpdate(user.invitedBy, {
        $pull: { directReferrals: user._id }
      });
    }
    
    // 2. Delete related records
    await Transaction.deleteMany({ user: user._id });
    await Transaction.deleteMany({ relatedUser: user._id });
    try {
      const BankDetails = require('../models/BankDetails');
      if (BankDetails) await BankDetails.deleteMany({ user: user._id });
    } catch (e) {}
    try {
      const GiftRedemption = require('../models/GiftRedemption');
      if (GiftRedemption) await GiftRedemption.deleteMany({ user: user._id });
    } catch (e) {}
    try {
      const ReferralHistory = require('../models/ReferralHistory');
      if (ReferralHistory) {
        await ReferralHistory.deleteMany({ user: user._id });
        await ReferralHistory.deleteMany({ referrer: user._id });
      }
    } catch (e) {}
    try {
      const ReferralCommission = require('../models/ReferralCommission');
      if (ReferralCommission) {
        await ReferralCommission.deleteMany({ user: user._id });
        await ReferralCommission.deleteMany({ referrer: user._id });
      }
    } catch (e) {}
    
    // 3. Delete the user
    await user.deleteOne();
    
    console.log(`🛡️ [ADMIN ACTION] Admin (Phone: ${req.user?.phone || 'Unknown'}, ID: ${req.user?.id || 'Unknown'}) deleted user ${user.phone} (ID: ${userId})`);
    
    res.json({
      success: true,
      message: 'User and all associated records deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, message: 'Server error deleting user' });
  }
};

// 🏆 Get All Promotion Milestone Reward Claims
const getPromotionRewards = async (req, res) => {
  try {
    const rewards = await RewardHistory.find()
      .populate('userId', 'fullName phone')
      .populate('taskId', 'taskTitle reward claimedAt')
      .populate('transactionId', 'status')
      .sort('-createdAt');

    res.json({
      success: true,
      rewards
    });
  } catch (error) {
    console.error('Error fetching promotion rewards:', error);
    res.status(500).json({ success: false, message: 'Server error fetching promotion rewards' });
  }
};

const GlobalReferralCode = require('../models/GlobalReferralCode');

// 🔑 Get All Global Referral Codes
const getGlobalReferralCodes = async (req, res) => {
  try {
    const codes = await GlobalReferralCode.find()
      .populate('createdBy', 'fullName phone')
      .sort('-createdAt');
    res.json({ success: true, codes });
  } catch (error) {
    console.error('Error fetching global referral codes:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ➕ Create Global Referral Code
const createGlobalReferralCode = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code || !code.trim()) {
      return res.status(400).json({ success: false, message: 'Referral code is required' });
    }
    const formattedCode = code.toUpperCase().trim();

    // Check if code exists in User referralCode
    const existingUser = await User.findOne({ referralCode: formattedCode });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Referral code is already taken by a registered member' });
    }

    // Check if code exists in GlobalReferralCode
    const existingGlobal = await GlobalReferralCode.findOne({ code: formattedCode });
    if (existingGlobal) {
      return res.status(400).json({ success: false, message: 'This global referral code already exists' });
    }

    const newGlobal = await GlobalReferralCode.create({
      code: formattedCode,
      createdBy: req.user._id
    });

    res.json({ success: true, message: 'Global referral code created successfully', newGlobal });
  } catch (error) {
    console.error('Error creating global referral code:', error);
    res.status(500).json({ success: false, message: 'Server error creating global referral code' });
  }
};

// 🗑️ Delete Global Referral Code
const deleteGlobalReferralCode = async (req, res) => {
  try {
    const { id } = req.params;
    const globalCode = await GlobalReferralCode.findById(id);
    if (!globalCode) {
      return res.status(404).json({ success: false, message: 'Global referral code not found' });
    }
    await globalCode.deleteOne();
    res.json({ success: true, message: 'Global referral code deleted successfully' });
  } catch (error) {
    console.error('Error deleting global referral code:', error);
    res.status(500).json({ success: false, message: 'Server error deleting global referral code' });
  }
};

module.exports = {
  getAllUsers,
  getAllTransactions,
  processTransaction,
  updateUser,
  adminGetPlans,
  createPlan,
  updatePlan,
  deletePlan,
  adminGetInvestments,
  getReferralSettings,
  updateReferralSettings,
  getTopReferrers,
  adjustReferralCommission,
  getWithdrawalDetails,
  deleteUser,
  getPromotionRewards,
  getGlobalReferralCodes,
  createGlobalReferralCode,
  deleteGlobalReferralCode
};
