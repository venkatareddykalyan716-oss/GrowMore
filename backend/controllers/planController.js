const mongoose = require('mongoose');
const Plan = require('../models/Plan');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const ReferralSetting = require('../models/ReferralSetting');
const ReferralHistory = require('../models/ReferralHistory');
const ReferralCommission = require('../models/ReferralCommission');

// @desc    Get all active plans
// @route   GET /api/plans
const getAllPlans = async (req, res) => {
  try {
    const plans = await Plan.find({ isActive: true })
      .select('-investors')
      .sort({ price: 1 });
    
    res.json({
      success: true,
      count: plans.length,
      plans
    });
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single plan
// @route   GET /api/plans/:id
const getPlan = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id).select('-investors');
    
    if (!plan) {
      return res.status(404).json({ 
        success: false, 
        message: 'Plan not found' 
      });
    }

    res.json({
      success: true,
      plan
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Invest in a plan
// @route   POST /api/plans/:id/invest
const investInPlan = async (req, res) => {
  try {
    const { quantity = 1 } = req.body;
    const plan = await Plan.findById(req.params.id);
    
    if (!plan || !plan.isActive) {
      return res.status(404).json({ 
        success: false, 
        message: 'Plan not available' 
      });
    }

    const slots = plan.availableSlots !== undefined && plan.availableSlots !== null ? plan.availableSlots : (plan.totalSlots || 100);
    if (slots < quantity) {
      return res.status(400).json({ 
        success: false, 
        message: 'Not enough slots available' 
      });
    }

    const user = await User.findById(req.user.userId);
    const totalCost = plan.price * quantity;

    if (user.availableBalance < totalCost) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance. Please recharge your wallet.'
      });
    }

    // Deduct user balance
    user.availableBalance -= totalCost;
    await user.save();

    // Create investment record
    const investment = {
      user: user._id,
      investedAt: new Date(),
      amount: totalCost,
      nextClaimAt: new Date()
    };

    // Update plan
    plan.investors.push(investment);
    plan.availableSlots = slots - quantity;
    plan.totalInvestment = (plan.totalInvestment || 0) + totalCost;
    await plan.save();

    // Create transaction record
    await Transaction.create({
      user: user._id,
      type: 'invest',
      amount: totalCost,
      description: `Investment in ${plan.name} (${quantity}x)`,
      status: 'completed',
      reference: `INV-${Date.now()}`
    });



    res.json({
      success: true,
      message: `Successfully invested in ${plan.name}!`,
      investment: {
        planName: plan.name,
        quantity,
        totalCost,
        dailyIncome: plan.dailyIncome * quantity,
        duration: plan.duration,
        totalReturn: plan.dailyIncome * plan.duration * quantity
      }
    });

  } catch (error) {
    console.error('Invest error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const isClaimedTodayIST = (lastClaimedDate) => {
  if (!lastClaimedDate) return false;
  
  // Current time in IST (UTC + 5.5 hours)
  const now = new Date();
  const utcNow = now.getTime() + (now.getTimezoneOffset() * 60000);
  const istNow = new Date(utcNow + (3600000 * 5.5));
  
  // Last claimed time in IST
  const claimed = new Date(lastClaimedDate);
  const utcClaimed = claimed.getTime() + (claimed.getTimezoneOffset() * 60000);
  const istClaimed = new Date(utcClaimed + (3600000 * 5.5));
  
  return istNow.getUTCDate() === istClaimed.getUTCDate() &&
         istNow.getUTCMonth() === istClaimed.getUTCMonth() &&
         istNow.getUTCFullYear() === istClaimed.getUTCFullYear();
};

const activeClaims = new Set();

const formatRemainingTime = (ms) => {
  if (ms <= 0) return '00:00:00';
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map(val => String(val).padStart(2, '0')).join(':');
};

// @desc    Claim rewards for specific investment
// @route   POST /api/plans/:id/claim/:investmentId
const executeClaim = async (req, res, session) => {
  const { id, investmentId } = req.params;

  // Current time in IST (UTC + 5.5 hours)
  const now = new Date();
  const utcNow = now.getTime() + (now.getTimezoneOffset() * 60000);
  const istNow = new Date(utcNow + (3600000 * 5.5));
  const todayISTString = istNow.toISOString().slice(0, 10);

  const plan = session ? await Plan.findById(id).session(session) : await Plan.findById(id);
  const user = session ? await User.findById(req.user.userId).session(session) : await User.findById(req.user.userId);

  if (!plan) {
    return {
      statusCode: 404,
      data: { success: false, message: 'Plan not found' }
    };
  }

  // Find user's specific investment subdocument
  const userInvestment = plan.investors.find(inv => {
    if (!inv.user || inv.user.toString() !== req.user.userId.toString()) return false;
    if (inv._id && inv._id.toString() === investmentId) return true;
    
    // Fallback to timestamp matching
    const timestamp = new Date(inv.investedAt).getTime().toString();
    if (timestamp === investmentId) return true;
    
    // Fallback for missing/undefined ID
    if (!investmentId || investmentId === 'undefined') return true;
    
    return false;
  });

  if (!userInvestment) {
    return {
      statusCode: 400,
      data: { success: false, message: 'Specific investment record not found' }
    };
  }

  // Verify duration constraint: is the investment still active?
  const elapsedDays = (Date.now() - new Date(userInvestment.investedAt).getTime()) / (24 * 60 * 60 * 1000);
  if (elapsedDays > plan.duration) {
    return {
      statusCode: 400,
      data: { success: false, message: 'This investment plan has expired' }
    };
  }

  // Check if current server time is before nextClaimAt
  const serverNow = new Date();

  if (userInvestment.nextClaimAt) {
    if (serverNow < new Date(userInvestment.nextClaimAt)) {
      const diffMs = new Date(userInvestment.nextClaimAt).getTime() - serverNow.getTime();
      return {
        statusCode: 400,
        data: {
          success: false,
          message: "Daily income already claimed. Please wait until the next claim time.",
          remainingTime: formatRemainingTime(diffMs)
        }
      };
    }
  } else if (isClaimedTodayIST(userInvestment.lastClaimedAt)) {
    // Fallback for legacy claims
    const nextEstimated = new Date(userInvestment.lastClaimedAt);
    nextEstimated.setHours(nextEstimated.getHours() + 24);
    const diffMs = nextEstimated.getTime() - serverNow.getTime();
    return {
      statusCode: 400,
      data: {
        success: false,
        message: "Daily income already claimed. Please wait until the next claim time.",
        remainingTime: formatRemainingTime(Math.max(0, diffMs))
      }
    };
  }

  const invId = userInvestment._id ? userInvestment._id.toString() : investmentId;
  const claimId = `CLAIM-${invId}-${todayISTString}`;

  // Verify no duplicate claim in ReferralCommission
  const existingCommission = session 
    ? await ReferralCommission.findOne({ claimId }).session(session)
    : await ReferralCommission.findOne({ claimId });
    
  if (existingCommission) {
    return {
      statusCode: 400,
      data: { success: false, message: 'Daily income for this product has already been claimed today' }
    };
  }

  const rewardAmount = plan.dailyIncome;
  
  // Update user earnings
  user.totalEarnings = Number((user.totalEarnings + rewardAmount).toFixed(2));
  user.availableBalance = Number((user.availableBalance + rewardAmount).toFixed(2));
  if (session) {
    await user.save({ session });
  } else {
    await user.save();
  }

  // Mark the investment as claimed today securely
  const nextClaimTime = new Date(serverNow.getTime() + 24 * 60 * 60 * 1000);
  userInvestment.lastClaimAt = serverNow;
  userInvestment.nextClaimAt = nextClaimTime;
  userInvestment.totalClaims = (userInvestment.totalClaims || 0) + 1;
  
  if (!userInvestment.claimHistory) userInvestment.claimHistory = [];
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
  const userAgent = req.headers['user-agent'] || '';
  userInvestment.claimHistory.push({
    claimedAt: serverNow,
    amount: rewardAmount,
    ipAddress: clientIp,
    deviceInfo: userAgent.slice(0, 200)
  });

  // Sync legacy fields
  userInvestment.lastClaimedAt = serverNow;
  userInvestment.claimCount = userInvestment.totalClaims;
  if (!userInvestment.claimsHistory) userInvestment.claimsHistory = [];
  userInvestment.claimsHistory.push(serverNow);

  plan.markModified('investors');
  if (session) {
    await plan.save({ session });
  } else {
    await plan.save();
  }

  // Create transaction log for the claiming user
  if (session) {
    await Transaction.create([{
      user: user._id,
      type: 'task_reward',
      amount: rewardAmount,
      description: `Daily income claimed from ${plan.name}`,
      status: 'completed',
      reference: `CLAIM-${invId}-${Date.now()}`
    }], { session });
  } else {
    await Transaction.create({
      user: user._id,
      type: 'task_reward',
      amount: rewardAmount,
      description: `Daily income claimed from ${plan.name}`,
      status: 'completed',
      reference: `CLAIM-${invId}-${Date.now()}`
    });
  }

  // ============================
  // 👥 MULTI-LEVEL REFERRAL CLAIM COMMISSION
  // ============================
  if (user.invitedBy) {
    let currentParentId = user.invitedBy;
    let currentLevel = 1;
    // Percentages: L1 = 14%, L2 = 8%, L3 = 5%, L4 = 3%, L5 = 2%
    const claimLevelPercents = [14, 8, 5, 3, 2];
    const maxLevels = claimLevelPercents.length;

    while (currentParentId && currentLevel <= maxLevels) {
      const parentUser = session 
        ? await User.findById(currentParentId).session(session)
        : await User.findById(currentParentId);
        
      if (!parentUser) break;

      const percentage = claimLevelPercents[currentLevel - 1] || 0;
      if (percentage > 0) {
        const commissionAmount = Number(((rewardAmount * percentage) / 100).toFixed(2));

        if (commissionAmount > 0) {
          // Credit referrer availableBalance and totalEarnings
          parentUser.availableBalance = Number((parentUser.availableBalance + commissionAmount).toFixed(2));
          parentUser.totalEarnings = Number((parentUser.totalEarnings + commissionAmount).toFixed(2));
          if (session) {
            await parentUser.save({ session });
          } else {
            await parentUser.save();
          }

          // Create Transaction Log with type 'Referral Commission'
          if (session) {
            await Transaction.create([{
              user: parentUser._id,
              type: 'Referral Commission',
              amount: commissionAmount,
              description: 'Referral commission earned from daily income claim.',
              status: 'completed',
              reference: `CLAIM_COMM_${claimId}_L${currentLevel}`
            }], { session });
          } else {
            await Transaction.create({
              user: parentUser._id,
              type: 'Referral Commission',
              amount: commissionAmount,
              description: 'Referral commission earned from daily income claim.',
              status: 'completed',
              reference: `CLAIM_COMM_${claimId}_L${currentLevel}`
            });
          }

          // Create ReferralCommission Record
          if (session) {
            await ReferralCommission.create([{
              referrerId: parentUser._id,
              memberId: user._id,
              investmentId: plan.name,
              claimId: claimId,
              level: currentLevel,
              dailyIncome: rewardAmount,
              commissionPercent: percentage,
              commissionAmount: commissionAmount
            }], { session });
          } else {
            await ReferralCommission.create({
              referrerId: parentUser._id,
              memberId: user._id,
              investmentId: plan.name,
              claimId: claimId,
              level: currentLevel,
              dailyIncome: rewardAmount,
              commissionPercent: percentage,
              commissionAmount: commissionAmount
            });
          }

          // Real-Time Socket.io emit
          const io = req.app.get('io');
          if (io) {
            const notificationMessage = `🎉 Referral Bonus Credited!\n\nYour team member claimed today's income.\nCommission Earned: $${commissionAmount}\n\nWallet Updated Successfully.`;
            io.to(parentUser._id.toString()).emit('commission_update', {
              type: 'commission',
              title: '🎉 Referral Bonus Credited!',
              message: notificationMessage,
              newBalance: parentUser.availableBalance
            });
            console.log(`📡 Emitted live socket commission_update to room: ${parentUser._id} for claim commission`);
          }
        }
      }

      // Move up the upline parent tree
      currentParentId = parentUser.invitedBy;
      currentLevel++;
    }
  }

  return {
    statusCode: 200,
    data: {
      success: true,
      message: "Daily income claimed successfully.",
      nextClaimAt: nextClaimTime.toISOString(),
      reward: rewardAmount,
      newBalance: user.availableBalance
    }
  };
};

const claimRewards = async (req, res) => {
  const { investmentId } = req.params;
  
  if (activeClaims.has(investmentId)) {
    return res.status(400).json({
      success: false,
      message: "Daily income claiming is already in progress for this product. Please wait."
    });
  }

  activeClaims.add(investmentId);

  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const result = await executeClaim(req, res, session);

    await session.commitTransaction();
    session.endSession();

    activeClaims.delete(investmentId);
    return res.status(result.statusCode).json(result.data);

  } catch (error) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }

    const isReplicaSetError = error.message && (
      error.message.includes('Transaction numbers are only allowed') ||
      error.message.includes('sessions are not supported') ||
      error.code === 20
    );

    if (isReplicaSetError) {
      console.warn('⚠️ MongoDB standalone detected. Running claim non-transactionally as fallback.');
      try {
        const fallbackResult = await executeClaim(req, res, null);
        activeClaims.delete(investmentId);
        return res.status(fallbackResult.statusCode).json(fallbackResult.data);
      } catch (fallbackError) {
        console.error('Claim error (fallback):', fallbackError);
        activeClaims.delete(investmentId);
        return res.status(500).json({ success: false, message: fallbackError.message || 'Server error' });
      }
    }

    console.error('Claim error:', error);
    activeClaims.delete(investmentId);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Get user's investments
// @route   GET /api/plans/user/my-investments
const getMyInvestments = async (req, res) => {
  try {
    const plans = await Plan.find({});

    const investments = [];
    plans.forEach(plan => {
      if (plan.investors && plan.investors.length > 0) {
        plan.investors.forEach(userInv => {
          if (userInv.user && userInv.user.toString() === req.user.userId.toString()) {
            const elapsedDays = (Date.now() - new Date(userInv.investedAt).getTime()) / (24 * 60 * 60 * 1000);
            const daysLeft = Math.max(0, plan.duration - Math.floor(elapsedDays));
            
            const isClaimed = userInv.nextClaimAt 
              ? (new Date() < new Date(userInv.nextClaimAt)) 
              : isClaimedTodayIST(userInv.lastClaimedAt);

            investments.push({
              investmentId: userInv._id ? userInv._id.toString() : new Date(userInv.investedAt).getTime().toString(),
              planId: plan._id,
              planName: plan.name,
              investedAt: userInv.investedAt,
              amount: plan.price,
              dailyIncome: plan.dailyIncome,
              duration: plan.duration,
              daysLeft,
              growthLevel: plan.growthLevel,
              lastClaimedAt: userInv.lastClaimedAt || null,
              claimCount: userInv.claimCount || 0,
              claimedToday: isClaimed,
              // Secure Claim System fields
              lastClaimAt: userInv.lastClaimAt || userInv.lastClaimedAt || null,
              nextClaimAt: userInv.nextClaimAt || null,
              totalClaims: userInv.totalClaims || userInv.claimCount || 0,
              progress: Math.min(
                100,
                Math.floor(
                  ((Date.now() - new Date(userInv.investedAt).getTime()) / (plan.duration * 24 * 60 * 60 * 1000)) * 100
                )
              )
            });
          }
        });
      }
    });

    res.json({
      success: true,
      serverTime: new Date().toISOString(),
      investments
    });
  } catch (error) {
    console.error('My investments error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getAllPlans,
  getPlan,
  investInPlan,
  claimRewards,
  getMyInvestments
};
