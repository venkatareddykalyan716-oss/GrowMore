const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Admin = require('./models/Admin');

const run = async () => {
  try {
    console.log('🔄 Connecting to GrowMore Database...');
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/growmore');
    console.log('✅ Connected!');

    const admins = await Admin.find({});
    console.log(`\n🛡️  ADMINS IN DB (${admins.length}):`);
    admins.forEach(a => {
      console.log(`- Name: ${a.name} | Phone: ${a.phone} | Role: ${a.role} | Password Hash: ${a.password}`);
    });

    const users = await User.find({ phone: { $in: ['9346697486', '9346697487'] } });
    console.log(`\n👤 SUSPECTED USERS IN DB (${users.length}):`);
    users.forEach(u => {
      console.log(`- Name: ${u.fullName} | Phone: ${u.phone} | Role: ${u.role} | Password Hash: ${u.password}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

run();
