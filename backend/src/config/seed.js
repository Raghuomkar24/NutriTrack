const User = require('../models/User');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Seeding demo users...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      
      await User.create({
        email: 'user@nutritrack.com',
        password: hashedPassword,
        roles: ['ROLE_USER'],
        profile: {
          name: 'Demo User',
          mobile: '+1 (555) 123-4567',
          age: 30,
          gender: 'MALE',
          height: 180,
          weight: 80,
          targetWeight: 75,
          activityLevel: 'MODERATELY_ACTIVE',
          goal: 'LOSE_WEIGHT',
          diet: 'VEGETARIAN',
          bmi: 24.7,
          bmr: 1814,
          tdee: 2811,
          dailyCalories: 2311,
          dailyProtein: 176,
          dailyFat: 64,
          dailyCarbs: 258
        }
      });
      
      await User.create({
        email: 'admin@nutritrack.com',
        password: hashedPassword,
        roles: ['ROLE_ADMIN', 'ROLE_USER'],
        profile: {
          name: 'Demo Admin',
          mobile: '+1 (555) 999-9999',
          age: 35,
          gender: 'FEMALE',
          height: 165,
          weight: 60,
          targetWeight: 60,
          activityLevel: 'VERY_ACTIVE',
          goal: 'MAINTAIN',
          diet: 'NON_VEGETARIAN',
          bmi: 22,
          bmr: 1334,
          tdee: 2301,
          dailyCalories: 2301,
          dailyProtein: 132,
          dailyFat: 64,
          dailyCarbs: 299
        }
      });
      
      console.log('Demo users seeded successfully!');
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

module.exports = seedDatabase;
