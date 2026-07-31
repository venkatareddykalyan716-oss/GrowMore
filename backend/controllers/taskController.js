const User = require('../models/User');
const Plan = require('../models/Plan');
const Transaction = require('../models/Transaction');
const PromotionTask = require('../models/PromotionTask');
const RewardHistory = require('../models/RewardHistory');

// Helper to count active referrals dynamically
const getActiveReferralCount = async (userId) => {
  const user = await User.findById(userId);
  if (!user || !user.directReferrals || user.directReferrals.length === 0) {
    return 0;
  }
  
  let activeCount = 0;
  
  // Find all plans that have investments from these direct referrals
  const plans = await Plan.find({
    'investors.user': { $in: user.directReferrals }
  });
  
  // For each direct referral, check if they have at least one active investment
  for (const refId of user.directReferrals) {
    let hasActiveInvestment = false;
    
    for (const plan of plans) {
      const invs = plan.investors.filter(inv => inv.user && inv.user.toString() === refId.toString());
      for (const inv of invs) {
        const elapsedDays = (Date.now() - new Date(inv.investedAt).getTime()) / (24 * 60 * 60 * 1000);
        if (elapsedDays <= plan.duration) {
          hasActiveInvestment = true;
          break;
        }
      }
      if (hasActiveInvestment) break;
    }
    
    if (hasActiveInvestment) {
      activeCount++;
    }
  }
  
  return activeCount;
};

// Seed standard tasks for a user
const seedUserTasks = async (userId) => {
  const defaultMilestones = [
    { title: 'Invite 1 Active Member', required: 1, reward: 100 },
    { title: 'Invite 3 Active Members', required: 3, reward: 200 },
    { title: 'Invite 8 Active Members', required: 8, reward: 500 },
    { title: 'Invite 16 Active Members', required: 16, reward: 1000 },
    { title: 'Invite 32 Active Members', required: 32, reward: 2400 },
    { title: 'Invite 64 Active Members', required: 64, reward: 5000 },
    { title: 'Invite 128 Active Members', required: 128, reward: 12000 }
  ];

  const existing = await PromotionTask.findOne({ userId });
  if (!existing) {
    const tasks = defaultMilestones.map(m => ({
      userId,
      taskTitle: m.title,
      requiredMembers: m.required,
      reward: m.reward,
      currentProgress: 0,
      claimed: false
    }));
    await PromotionTask.insertMany(tasks);
  }
};

// @desc    Get user milestone tasks
// @route   GET /api/auth/tasks
const getUserTasks = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Auto-seed if not exist
    await seedUserTasks(userId);
    
    // Calculate current progress
    const activeCount = await getActiveReferralCount(userId);
    
    // Sync progress for all unclaimed tasks
    await PromotionTask.updateMany(
      { userId, claimed: false },
      { currentProgress: activeCount }
    );
    
    // Find all tasks
    const tasks = await PromotionTask.find({ userId }).sort({ requiredMembers: 1 });
    
    res.json({
      success: true,
      activeCount,
      tasks
    });
  } catch (error) {
    console.error('Error fetching user tasks:', error);
    res.status(500).json({ success: false, message: 'Server error fetching tasks' });
  }
};

// @desc    Claim milestone reward
// @route   POST /api/auth/tasks/claim/:taskId
const claimTaskReward = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { taskId } = req.params;
    
    const task = await PromotionTask.findOne({ _id: taskId, userId });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    
    if (task.claimed) {
      return res.status(400).json({ success: false, message: 'Reward already claimed' });
    }
    
    // Recalculate progress to verify
    const activeCount = await getActiveReferralCount(userId);
    if (activeCount < task.requiredMembers) {
      return res.status(400).json({ success: false, message: 'Milestone target not reached yet' });
    }
    
    // Update task status
    task.claimed = true;
    task.claimedAt = new Date();
    task.currentProgress = activeCount;
    await task.save();
    
    // Update user balance
    const user = await User.findById(userId);
    user.availableBalance += task.reward;
    user.totalEarnings += task.reward;
    await user.save();
    
    // Create transaction log
    const tx = await Transaction.create({
      user: userId,
      type: 'bonus',
      amount: task.reward,
      description: `Claimed Referral Milestone Reward: ${task.taskTitle}`,
      status: 'completed',
      reference: `MIL-CLAIM-${task._id}-${Date.now()}`
    });
    
    // Create Reward History log
    await RewardHistory.create({
      userId,
      taskId: task._id,
      reward: task.reward,
      transactionId: tx._id
    });
    
    // Emit socket update if socket server is attached
    const io = req.app.get('io');
    if (io) {
      io.to(userId.toString()).emit('commission_update', {
        type: 'bonus',
        title: '🎉 Milestone Reward Claimed!',
        message: `Congratulations! You received $${task.reward} for completing "${task.taskTitle}"!`,
        newBalance: user.availableBalance
      });
    }
    
    res.json({
      success: true,
      message: `Successfully claimed $${task.reward}!`,
      newBalance: user.availableBalance
    });
  } catch (error) {
    console.error('Error claiming task reward:', error);
    res.status(500).json({ success: false, message: 'Server error claiming reward' });
  }
};

module.exports = {
  getUserTasks,
  claimTaskReward,
  getActiveReferralCount,
  seedUserTasks
};
