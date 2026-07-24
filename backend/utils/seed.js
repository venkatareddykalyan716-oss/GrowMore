require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Check if admin exists
    const existingAdmin = await User.findOne({ phone: '9999999999' });
    if (existingAdmin) {
      console.log('⚠️ Admin already exists!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📱 Phone:        9999999999');
      console.log('🔑 Password:     admin123');
      console.log('🎫 Invite Code:  GMADMIN');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      process.exit(0);
    }
    
    // Create admin user
    const admin = await User.create({
      phone: '9999999999',
      countryCode: '+91',
      fullName: 'GrowMore Admin',
      password: 'admin123',
      inviteCode: 'GMADMIN',
      referralCode: 'GMADMIN',
      securityQuestion: 'partner',
      securityAnswer: 'admin',
      role: 'admin',
      isActive: true,
      isVerified: true
    });
    
    console.log('\n✅ Admin user created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📱 Phone:        9999999999');
    console.log('🔑 Password:     admin123');
    console.log('🎫 Invite Code:  GMADMIN');
    console.log('🔗 Referral Code: GMADMIN');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

seedAdmin();
