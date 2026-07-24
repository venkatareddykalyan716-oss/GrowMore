const mongoose = require('mongoose');

const rewardHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PromotionTask',
    required: true
  },
  reward: {
    type: Number,
    required: true
  },
  transactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('RewardHistory', rewardHistorySchema);
