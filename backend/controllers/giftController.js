const GiftCode = require('../models/GiftCode');
const GiftRedemption = require('../models/GiftRedemption');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Plan = require('../models/Plan');

// ==========================================
// 🛡️ ADMIN CONTROLLER FUNCTIONS
// ==========================================

// @desc    Create a new gift code
// @route   POST /api/gift/admin/gift-codes
const createGiftCode = async (req, res) => {
  try {
    const {
      code,
      rewardType,
      rewardAmount,
      status,
      startDate,
      expiryDate,
      maxRedemptions,
      perUserLimit,
      eligibleUsers,
      description
    } = req.body;

    if (!code || !rewardType || !rewardAmount || !expiryDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide code, rewardType, rewardAmount and expiryDate'
      });
    }

    const codeUpper = code.toUpperCase().trim();
    const existing = await GiftCode.findOne({ code: codeUpper });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Gift code already exists'
      });
    }

    const giftCode = await GiftCode.create({
      code: codeUpper,
      rewardType,
      rewardAmount: Number(rewardAmount),
      status: status || 'active',
      startDate: startDate ? new Date(startDate) : new Date(),
      expiryDate: new Date(expiryDate),
      maxRedemptions: maxRedemptions ? Number(maxRedemptions) : 100,
      perUserLimit: perUserLimit ? Number(perUserLimit) : 1,
      eligibleUsers: eligibleUsers || 'all',
      description: description || '',
      createdBy: req.user.userId
    });

    res.status(201).json({
      success: true,
      message: 'Gift code created successfully',
      giftCode
    });
  } catch (error) {
    console.error('Create gift code error:', error);
    res.status(500).json({ success: false, message: 'Server error creating code' });
  }
};

// @desc    Get all gift codes & statistics
// @route   GET /api/gift/admin/gift-codes
const getAllGiftCodes = async (req, res) => {
  try {
    const giftCodes = await GiftCode.find().sort({ createdAt: -1 });

    // Calculate stats
    const totalCodes = giftCodes.length;
    const activeCodes = giftCodes.filter(c => c.status === 'active' && new Date(c.expiryDate) > new Date()).length;
    const expiredCodes = giftCodes.filter(c => new Date(c.expiryDate) <= new Date()).length;
    
    const redemptions = await GiftRedemption.find();
    const totalRedemptions = redemptions.length;
    
    // Today's redemptions
    const today = new Date();
    today.setHours(0,0,0,0);
    const todaysRedemptions = redemptions.filter(r => new Date(r.redeemedAt) >= today).length;

    // Unused codes
    const unusedCodes = giftCodes.filter(c => c.currentRedemptions === 0).length;

    // Top redeemed code
    let topRedeemedCode = 'N/A';
    if (giftCodes.length > 0) {
      const sortedByRedeem = [...giftCodes].sort((a,b) => b.currentRedemptions - a.currentRedemptions);
      if (sortedByRedeem[0] && sortedByRedeem[0].currentRedemptions > 0) {
        topRedeemedCode = `${sortedByRedeem[0].code} (${sortedByRedeem[0].currentRedemptions} claims)`;
      }
    }

    res.json({
      success: true,
      stats: {
        totalCodes,
        activeCodes,
        expiredCodes,
        totalRedemptions,
        todaysRedemptions,
        unusedCodes,
        topRedeemedCode
      },
      giftCodes
    });
  } catch (error) {
    console.error('Get gift codes error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving codes' });
  }
};

// @desc    Update a gift code
// @route   PUT /api/gift/admin/gift-codes/:id
const updateGiftCode = async (req, res) => {
  try {
    const giftCode = await GiftCode.findById(req.params.id);
    if (!giftCode) {
      return res.status(404).json({ success: false, message: 'Gift code not found' });
    }

    const {
      status,
      startDate,
      expiryDate,
      maxRedemptions,
      perUserLimit,
      eligibleUsers,
      description,
      rewardAmount,
      rewardType
    } = req.body;

    if (status !== undefined) giftCode.status = status;
    if (startDate !== undefined) giftCode.startDate = new Date(startDate);
    if (expiryDate !== undefined) giftCode.expiryDate = new Date(expiryDate);
    if (maxRedemptions !== undefined) giftCode.maxRedemptions = Number(maxRedemptions);
    if (perUserLimit !== undefined) giftCode.perUserLimit = Number(perUserLimit);
    if (eligibleUsers !== undefined) giftCode.eligibleUsers = eligibleUsers;
    if (description !== undefined) giftCode.description = description;
    if (rewardAmount !== undefined) giftCode.rewardAmount = Number(rewardAmount);
    if (rewardType !== undefined) giftCode.rewardType = rewardType;

    await giftCode.save();

    res.json({
      success: true,
      message: 'Gift code updated successfully',
      giftCode
    });
  } catch (error) {
    console.error('Update gift code error:', error);
    res.status(500).json({ success: false, message: 'Server error updating code' });
  }
};

// @desc    Delete a gift code
// @route   DELETE /api/gift/admin/gift-codes/:id
const deleteGiftCode = async (req, res) => {
  try {
    const giftCode = await GiftCode.findByIdAndDelete(req.params.id);
    if (!giftCode) {
      return res.status(404).json({ success: false, message: 'Gift code not found' });
    }
    // Delete redemption history for this code
    await GiftRedemption.deleteMany({ giftCode: req.params.id });

    res.json({
      success: true,
      message: 'Gift code and its redemption history deleted successfully'
    });
  } catch (error) {
    console.error('Delete gift code error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting code' });
  }
};

// @desc    Get redemption logs for a specific gift code
// @route   GET /api/gift/admin/gift-codes/:id/history
const getCodeRedemptionHistory = async (req, res) => {
  try {
    const history = await GiftRedemption.find({ giftCode: req.params.id })
      .populate('user', 'phone fullName')
      .sort({ redeemedAt: -1 });

    res.json({
      success: true,
      history
    });
  } catch (error) {
    console.error('Get code history error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving logs' });
  }
};


// ==========================================
// 👤 CUSTOMER CONTROLLER FUNCTIONS
// ==========================================

// @desc    Redeem a gift code
// @route   POST /api/gift/redeem
const redeemGiftCode = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Invalid Gift Code' });
    }

    const codeUpper = code.toUpperCase().trim();
    const giftCode = await GiftCode.findOne({ code: codeUpper });
    
    // 1. Verify existence
    if (!giftCode) {
      return res.status(404).json({ success: false, message: 'Invalid Gift Code' });
    }

    // 2. Check disabled/active status
    if (giftCode.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Gift Code Disabled' });
    }

    const now = new Date();

    // 3. Check start date
    if (new Date(giftCode.startDate) > now) {
      return res.status(400).json({ success: false, message: 'Gift Code Not Active Yet' });
    }

    // 4. Check expiry date
    if (new Date(giftCode.expiryDate) <= now) {
      return res.status(400).json({ success: false, message: 'Gift Code Expired' });
    }

    // 5. Check redemption count
    if (giftCode.currentRedemptions >= giftCode.maxRedemptions) {
      return res.status(400).json({ success: false, message: 'Maximum Redemption Reached' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User Account Not Found' });
    }

    // 6. Check eligibility
    if (giftCode.eligibleUsers === 'new') {
      // Reg date within last 48 hours is considered "new user"
      const hoursSinceJoined = (now - new Date(user.joinedAt)) / (1000 * 60 * 60);
      if (hoursSinceJoined > 48) {
        return res.status(400).json({ success: false, message: 'Not Eligible (New Users Only)' });
      }
    } else if (giftCode.eligibleUsers === 'vip') {
      if (!user.level || user.level < 2) {
        return res.status(400).json({ success: false, message: 'Not Eligible (VIP Members Only)' });
      }
    }

    // 7. Check per-user limit
    const userRedeemedCount = await GiftRedemption.countDocuments({
      user: user._id,
      giftCode: giftCode._id
    });
    if (userRedeemedCount >= giftCode.perUserLimit) {
      return res.status(400).json({ success: false, message: 'Already Redeemed' });
    }

    // 8. Process rewards
    const rewardType = giftCode.rewardType;
    const rewardVal = giftCode.rewardAmount;
    let rewardLabel = `₹${rewardVal} Cash`;

    if (rewardType === 'wallet_balance' || rewardType === 'bonus_wallet' || rewardType === 'cashback' || rewardType === 'investment_credit') {
      user.availableBalance += rewardVal;
      await user.save();

      // Create transaction ledger
      await Transaction.create({
        user: user._id,
        type: 'bonus',
        amount: rewardVal,
        description: `Redeemed promo code: ${giftCode.code}`,
        status: 'completed',
        reference: `GIFT-${giftCode.code}-${Date.now()}`
      });
      rewardLabel = `₹${rewardVal} Balance`;

    } else if (rewardType === 'vip_upgrade') {
      user.level = (user.level || 0) + Number(rewardVal);
      await user.save();
      rewardLabel = `VIP level upgrade (+${rewardVal})`;

    } else if (rewardType === 'free_investment_plan') {
      // Find plan matching reward amount (price) or active plan
      const plan = await Plan.findOne({ price: rewardVal, isActive: true });
      if (!plan) {
        return res.status(400).json({
          success: false,
          message: 'No eligible plans found matching reward amount'
        });
      }

      // Add to plan investors
      plan.investors.push({
        user: user._id,
        investedAt: new Date(),
        amount: rewardVal
      });
      plan.availableSlots = Math.max(0, plan.availableSlots - 1);
      await plan.save();

      // Create transaction log
      await Transaction.create({
        user: user._id,
        type: 'bonus',
        amount: rewardVal,
        description: `Free plan Gift: ${plan.name}`,
        status: 'completed',
        reference: `GIFT-PLAN-${giftCode.code}-${Date.now()}`
      });
      rewardLabel = `Free Plan: ${plan.name}`;
    }

    // 9. Increment redemption counts & save redemption log
    giftCode.currentRedemptions += 1;
    await giftCode.save();

    await GiftRedemption.create({
      user: user._id,
      giftCode: giftCode._id,
      code: giftCode.code,
      rewardAmount: rewardVal,
      rewardType: rewardType,
      ipAddress: req.ip || '',
      deviceInfo: req.headers['user-agent'] || ''
    });

    res.json({
      success: true,
      message: `🎉 Congratulations! You received ${rewardLabel}. Added to your Wallet Successfully.`,
      rewardType,
      rewardAmount: rewardVal,
      rewardLabel
    });
  } catch (error) {
    console.error('Redeem gift code error:', error);
    res.status(500).json({ success: false, message: 'Server error processing redemption' });
  }
};

// @desc    Get user's personal redemption history
// @route   GET /api/gift/history
const getMyRedemptionHistory = async (req, res) => {
  try {
    const history = await GiftRedemption.find({ user: req.user.userId })
      .sort({ redeemedAt: -1 })
      .limit(20);

    res.json({
      success: true,
      history
    });
  } catch (error) {
    console.error('Get customer history error:', error);
    res.status(500).json({ success: false, message: 'Server error loading records' });
  }
};

module.exports = {
  createGiftCode,
  getAllGiftCodes,
  updateGiftCode,
  deleteGiftCode,
  getCodeRedemptionHistory,
  redeemGiftCode,
  getMyRedemptionHistory
};
