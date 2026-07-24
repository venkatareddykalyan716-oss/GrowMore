const mongoose = require('mongoose');

const referralHistorySchema = new mongoose.Schema({
  referrer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  referee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  investmentPlan: {
    type: String,
    required: true
  },
  investmentAmount: {
    type: Number,
    required: true
  },
  commissionLevel: {
    type: Number,
    required: true
  },
  commissionPercent: {
    type: Number,
    required: true
  },
  commissionEarned: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['completed', 'pending', 'failed'],
    default: 'completed'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ReferralHistory', referralHistorySchema);
