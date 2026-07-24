const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Admin = require('./models/Admin');

const phone = process.argv[2];

const run = async () => {
  try {
    console.log('🔄 Connecting to GrowMore Database...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/growmore');
    console.log('✅ Connected!');

    if (!phone) {
      console.log('\n❓ Usage: node makeAdmin.js <phone_number>');
      await listAllUsers();
      process.exit(0);
    }

    // 1. Check if user exists in User collection
    const user = await User.findOne({ phone: phone.trim() });
    if (!user) {
      // Maybe they are already in the Admin collection?
      const adminExists = await Admin.findOne({ phone: phone.trim() });
      if (adminExists) {
        console.log(`\nℹ️  "${phone}" is already in the Admin collection.`);
        process.exit(0);
      }
      console.log(`\n❌ Error: Account with phone number "${phone}" not found in Users.`);
      await listAllUsers();
      process.exit(1);
    }

    // 2. Insert into Admin collection (copying the hashed password directly)
    let admin = await Admin.findOne({ phone: phone.trim() });
    if (!admin) {
      await Admin.collection.insertOne({
        name: user.fullName || 'Admin',
        phone: user.phone,
        password: user.password, // Copy the already hashed password
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`\n🎉 Created admin document for ${user.fullName || 'Admin'} (${phone}) in Admin collection.`);
    } else {
      await Admin.updateOne({ phone: phone.trim() }, {
        $set: { password: user.password } // Sync password hash
      });
      console.log(`\n🎉 Updated existing admin password hash for ${phone}.`);
    }

    // 3. Remove from User collection
    await User.deleteOne({ phone: phone.trim() });
    console.log(`🧹 Removed ${phone} from Users collection to keep collections separate.`);

    console.log('\n✅ Success! You can now log in using the standard Login page.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database error:', error);
    process.exit(1);
  }
};

const listAllUsers = async () => {
  const users = await User.find({}, 'phone fullName role');
  const admins = await Admin.find({}, 'phone name role');
  
  console.log('\n📋 Here are the registered accounts in your database:');
  if (admins.length > 0) {
    console.log('\n🛡️  ADMINS:');
    admins.forEach(a => {
      console.log(`   - Phone: ${a.phone} | Name: ${a.name || '—'} | Role: admin`);
    });
  }
  if (users.length > 0) {
    console.log('\n👤 USERS:');
    users.forEach(u => {
      console.log(`   - Phone: ${u.phone} | Name: ${u.fullName || '—'} | Role: ${u.role}`);
    });
  }
  if (users.length === 0 && admins.length === 0) {
    console.log('ℹ️  No accounts registered in the database yet.');
  }
};

run();
