const mongoose = require('mongoose');

const referralCommissionSchema = new mongoose.Schema({
  referrerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  investmentId: {
    type: String,
    required: true
  },
  claimId: {
    type: String,
    required: true
  },
  level: {
    type: Number,
    required: true
  },
  dailyIncome: {
    type: Number,
    required: true
  },
  commissionPercent: {
    type: Number,
    required: true
  },
  commissionAmount: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ReferralCommission', referralCommissionSchema);
