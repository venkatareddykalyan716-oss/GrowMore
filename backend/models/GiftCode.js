const mongoose = require('mongoose');

const giftCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  rewardType: {
    type: String,
    enum: ['wallet_balance', 'bonus_wallet', 'cashback', 'investment_credit', 'vip_upgrade', 'free_investment_plan'],
    required: true
  },
  rewardAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date,
    required: true
  },
  maxRedemptions: {
    type: Number,
    default: 100
  },
  currentRedemptions: {
    type: Number,
    default: 0
  },
  perUserLimit: {
    type: Number,
    default: 1
  },
  eligibleUsers: {
    type: String,
    enum: ['all', 'new', 'vip', 'specific'],
    default: 'all'
  },
  description: {
    type: String,
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('GiftCode', giftCodeSchema);
