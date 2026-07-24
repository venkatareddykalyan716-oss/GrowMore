const mongoose = require('mongoose');

const promotionTaskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  taskTitle: {
    type: String,
    required: true
  },
  requiredMembers: {
    type: Number,
    required: true
  },
  reward: {
    type: Number,
    required: true
  },
  currentProgress: {
    type: Number,
    default: 0
  },
  claimed: {
    type: Boolean,
    default: false
  },
  claimedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PromotionTask', promotionTaskSchema);
