const mongoose = require('mongoose');

const giftRedemptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  giftCode: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GiftCode',
    required: true
  },
  code: {
    type: String,
    required: true
  },
  rewardAmount: {
    type: Number,
    required: true
  },
  rewardType: {
    type: String,
    required: true
  },
  redeemedAt: {
    type: Date,
    default: Date.now
  },
  ipAddress: {
    type: String,
    default: ''
  },
  deviceInfo: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('GiftRedemption', giftRedemptionSchema);
