const mongoose = require('mongoose');
const User = require('./models/User');
const Admin = require('./models/Admin');

const migrate = async () => {
  try {
    console.log('🔄 [Migration] Checking for users to migrate to Admin collection...');
    
    // Find all users in the User collection that have role === 'admin'
    const adminUsers = await User.find({ role: 'admin' });
    
    if (adminUsers.length === 0) {
      console.log('ℹ️ [Migration] No users with "admin" role found in Users collection.');
      return;
    }

    console.log(`🔄 [Migration] Found ${adminUsers.length} admin accounts to migrate.`);

    for (const user of adminUsers) {
      const existingAdmin = await Admin.findOne({ phone: user.phone });
      
      if (!existingAdmin) {
        // Copy directly using collection.insertOne to prevent re-hashing the password
        await Admin.collection.insertOne({
          name: user.fullName || 'Admin',
          phone: user.phone,
          password: user.password, // Keep current hashed password
          role: 'admin',
          createdAt: user.createdAt || new Date(),
          updatedAt: new Date()
        });
        console.log(`✅ [Migration] Created Admin document for ${user.phone} (${user.fullName}).`);
      } else {
        console.log(`ℹ️ [Migration] Admin document for ${user.phone} already exists.`);
      }

      // Delete from User collection to prevent duplication
      await User.deleteOne({ _id: user._id });
      console.log(`🧹 [Migration] Removed ${user.phone} from Users collection.`);
    }

    // Update ALO FRUT GUAVA plans and investments
    try {
      const Plan = require('./models/Plan');
      const Transaction = require('./models/Transaction');
      
      const guavaPlan = await Plan.findOne({ name: { $regex: /^alo frut guava$/i } });
      if (guavaPlan) {
        console.log(`🔍 [Migration] Found ALO FRUT GUAVA. Current Price: ${guavaPlan.price}`);
        guavaPlan.price = 550;
        let updatedInvestors = 0;
        if (guavaPlan.investors && guavaPlan.investors.length > 0) {
          guavaPlan.investors.forEach(inv => {
            if (inv.amount === 1500) {
              inv.amount = 550;
              updatedInvestors++;
            }
          });
        }
        await guavaPlan.save();
        console.log(`✅ [Migration] Updated ALO FRUT GUAVA plan price to 550 and ${updatedInvestors} investors.`);
      } else {
        console.log('⚠️ [Migration] ALO FRUT GUAVA plan not found in database.');
      }

      const guavaTxs = await Transaction.updateMany(
        { 
          type: 'invest', 
          description: { $regex: /alo frut guava/i }, 
          amount: 1500 
        },
        { $set: { amount: 550 } }
      );
      console.log(`✅ [Migration] Updated ${guavaTxs.modifiedCount} Transaction records for ALO FRUT GUAVA.`);
    } catch (dbErr) {
      console.error('❌ [Migration] Error updating ALO FRUT GUAVA data:', dbErr);
    }

    console.log('🎉 [Migration] Migration completed successfully!');
  } catch (error) {
    console.error('❌ [Migration] Error during admin migration:', error);
  }
};

module.exports = migrate;
