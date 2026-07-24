const mongoose = require('mongoose');
require('dotenv').config();
const Plan = require('./models/Plan');

const run = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/growmore');
    console.log('Connected!');

    const plans = await Plan.find({});
    console.log('\n--- PLANS ---');
    plans.forEach(p => {
      console.log(`Plan Name: ${p.name} | Price: ${p.price} | Daily Income: ${p.dailyIncome} | Investors Count: ${p.investors.length}`);
      p.investors.forEach((inv, i) => {
        console.log(`  Investor ${i + 1}: User ID: ${inv.user} | Amount: ${inv.amount} | InvestedAt: ${inv.investedAt}`);
      });
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

run();
