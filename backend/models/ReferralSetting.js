const mongoose = require('mongoose');

const referralSettingSchema = new mongoose.Schema({
  enabled: {
    type: Boolean,
    default: true
  },
  maxLevels: {
    type: Number,
    default: 5
  },
  levels: {
    type: [Number],
    default: [14, 8, 5, 3, 2] // Level 1: 14%, Level 2: 8%, Level 3: 5%, Level 4: 3%, Level 5: 2%
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ReferralSetting', referralSettingSchema);
