const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Admin = require('./models/Admin');

const phone = process.argv[2];
const newPassword = process.argv[3] || '123456'; // Default password if none provided

if (!phone) {
  console.log('❌ Error: Please specify a 10-digit phone number.');
  console.log('Usage: node setPassword.js <phone_number> [new_password]');
  process.exit(1);
}

const run = async () => {
  try {
    console.log('🔄 Connecting to GrowMore Database...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/growmore');
    console.log('✅ Connected!');

    // 1. Search Admin collection first
    const admin = await Admin.findOne({ phone: phone.trim() });
    if (admin) {
      admin.password = newPassword;
      await admin.save();
      console.log(`\n🎉 Success! Password for ADMIN ${admin.name} (${phone}) has been reset to: "${newPassword}"`);
      process.exit(0);
    }

    // 2. Search User collection next
    const user = await User.findOne({ phone: phone.trim() });
    if (user) {
      user.password = newPassword;
      await user.save();
      console.log(`\n🎉 Success! Password for USER ${user.fullName} (${phone}) has been reset to: "${newPassword}"`);
      process.exit(0);
    }

    console.log(`❌ Error: Account with phone number "${phone}" not found in database.`);
    process.exit(1);
  } catch (error) {
    console.error('❌ Database error:', error);
    process.exit(1);
  }
};

run();
