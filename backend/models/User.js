const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true,
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
  },
  countryCode: {
    type: String,
    default: '+91'
  },
  fullName: {
    type: String,
    trim: true,
    default: ''
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    sparse: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  inviteCode: {
    type: String,
    required: [true, 'Invitation code is required'],
    uppercase: true,
    trim: true
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  securityQuestion: {
    type: String,
    required: [true, 'Security question is required'],
    enum: ['partner', 'brother', 'sister', 'mother', 'father', 'pet', 'teacher', 'city', 'friend']
  },
  securityAnswer: {
    type: String,
    required: [true, 'Security answer is required']
  },
  referralCode: {
    type: String,
    unique: true,
    uppercase: true
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  availableBalance: {
    type: Number,
    default: 0
  },
  totalWithdrawals: {
    type: Number,
    default: 0
  },
  directReferrals: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  level: {
    type: Number,
    default: 1
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user'
  },
  lastLogin: {
    type: Date
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Generate unique referral code with GM prefix
userSchema.pre('save', async function(next) {
  if (!this.referralCode) {
    let isUnique = false;
    while (!isUnique) {
      const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
      const code = `GM${randomStr}`;
      const existing = await mongoose.models.User.findOne({ referralCode: code });
      if (!existing) {
        this.referralCode = code;
        isUnique = true;
      }
    }
  }
  next();
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get public profile
userSchema.methods.getPublicProfile = function() {
  return {
    id: this._id,
    phone: this.phone,
    countryCode: this.countryCode,
    fullName: this.fullName,
    referralCode: this.referralCode,
    totalEarnings: this.totalEarnings,
    availableBalance: this.availableBalance,
    level: this.level,
    role: this.role,
    isActive: this.isActive,
    joinedAt: this.joinedAt
  };
};

module.exports = mongoose.model('User', userSchema);
