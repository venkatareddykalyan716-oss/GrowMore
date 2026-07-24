require('dotenv').config();
const mongoose = require('mongoose');
const Plan = require('../models/Plan');

const seedPlans = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Clear existing plans
    await Plan.deleteMany({});
    console.log('🗑️  Cleared old plans');
    
    const plans = [
      {
        name: 'TROPIC-FRESH ELIXIR',
        description: 'Premium tropical fruit juice blend with mango, kiwi, and strawberry',
        image: '🥭',
        sharePower: 15,
        shareIncome: 25,
        dailyIncome: 15,
        price: 2516,
        duration: 75,
        growthLevel: 'STARTER',
        category: 'juice',
        totalSlots: 500,
        availableSlots: 500
      },
      {
        name: 'POME-GARNET PULSE',
        description: 'Antioxidant-rich pomegranate juice for energy and vitality',
        image: '🍷',
        sharePower: 12,
        shareIncome: 0,
        dailyIncome: 12,
        price: 1500,
        duration: 60,
        growthLevel: 'STARTER',
        category: 'juice',
        totalSlots: 300,
        availableSlots: 300
      },
      {
        name: 'GOLDEN CARROT GOLD',
        description: 'Fresh carrot juice packed with vitamins and minerals',
        image: '🥕',
        sharePower: 20,
        shareIncome: 599,
        dailyIncome: 20,
        price: 2516,
        duration: 80,
        growthLevel: 'GOLD',  // ← FIXED! Was 'SETER'
        category: 'juice',
        totalSlots: 400,
        availableSlots: 400
      },
      {
        name: 'ORCHARD-CORE ESSENCE',
        description: 'Premium apple and mixed fruit orchard juice',
        image: '🍎',
        sharePower: 10,
        shareIncome: 18,
        dailyIncome: 10,
        price: 1800,
        duration: 50,
        growthLevel: 'BRONZE',
        category: 'fruit',
        totalSlots: 350,
        availableSlots: 350
      },
      {
        name: 'ZEST-LINE FUSION',
        description: 'Citrus fusion blend with lemon, orange, and tropical fruits',
        image: '🍊',
        sharePower: 22,
        shareIncome: 35,
        dailyIncome: 22,
        price: 3500,
        duration: 80,
        growthLevel: 'SILVER',
        category: 'juice',
        totalSlots: 250,
        availableSlots: 250
      },
      {
        name: 'BERRY-BLISS BOOSTER',
        description: 'Mixed berry antioxidant powerhouse juice',
        image: '🫐',
        sharePower: 18,
        shareIncome: 28,
        dailyIncome: 18,
        price: 2800,
        duration: 70,
        growthLevel: 'GOLD',
        category: 'juice',
        totalSlots: 200,
        availableSlots: 200
      },
      {
        name: 'CITRUS-SUNRISE BOOST',
        description: 'Morning citrus energy blend with orange and lemon',
        image: '🍋',
        sharePower: 16,
        shareIncome: 22,
        dailyIncome: 16,
        price: 2200,
        duration: 65,
        growthLevel: 'BRONZE',
        category: 'juice',
        totalSlots: 300,
        availableSlots: 300
      },
      {
        name: 'TROPICAL-MANGO DREAM',
        description: 'Sweet mango paradise juice with tropical fruits',
        image: '🥭',
        sharePower: 25,
        shareIncome: 45,
        dailyIncome: 25,
        price: 4000,
        duration: 90,
        growthLevel: 'PLATINUM',
        category: 'premium',
        totalSlots: 150,
        availableSlots: 150
      }
    ];

    await Plan.insertMany(plans);
    console.log(`\n✅ ${plans.length} plans seeded successfully!\n`);
    plans.forEach(p => {
      console.log(`  📦 ${p.image} ${p.name} - ₹${p.price} (${p.dailyIncome}/day for ${p.duration} days) - ${p.growthLevel}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

seedPlans();
