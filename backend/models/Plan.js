const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: ''
  },
  sharePower: {
    type: Number,
    required: true
  },
  shareIncome: {
    type: Number,
    required: true
  },
  dailyIncome: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  duration: {
    type: Number,
    required: true // in days
  },
  growthLevel: {
    type: String,
    default: 'VIP 0'
  },
  category: {
    type: String,
    enum: ['juice', 'fruit', 'organic', 'premium'],
    default: 'juice'
  },
  totalSlots: {
    type: Number,
    default: 100
  },
  availableSlots: {
    type: Number,
    default: 100
  },
  isActive: {
    type: Boolean,
    default: true
  },
  totalInvestment: {
    type: Number,
    default: 0
  },
  investors: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    investedAt: {
      type: Date,
      default: Date.now
    },
    amount: Number,
    lastClaimedAt: {
      type: Date,
      default: null
    },
    claimCount: {
      type: Number,
      default: 0
    },
    claimsHistory: {
      type: [Date],
      default: []
    },
    lastClaimAt: {
      type: Date,
      default: null
    },
    nextClaimAt: {
      type: Date,
      default: null
    },
    totalClaims: {
      type: Number,
      default: 0
    },
    claimHistory: [{
      claimedAt: { type: Date, required: true },
      amount: { type: Number, required: true },
      ipAddress: { type: String },
      deviceInfo: { type: String }
    }]
  }]
}, {
  timestamps: true
});

// Calculate total return
planSchema.virtual('totalReturn').get(function() {
  return this.dailyIncome * this.duration;
});

// Calculate ROI percentage
planSchema.virtual('roi').get(function() {
  return ((this.dailyIncome * this.duration / this.price) * 100).toFixed(2);
});

planSchema.set('toJSON', { virtuals: true });
planSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Plan', planSchema);
