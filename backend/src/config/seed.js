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

    const Food = require('../models/Food');
    const indianFoodCount = await Food.countDocuments({ brand: 'Indian' });
    if (indianFoodCount === 0) {
      console.log('Seeding initial food items (including Indian foods)...');
      const foodsToSeed = [
        { name: 'Roti (Whole Wheat)', brand: 'Indian', calories: 297, protein: 9, carbohydrates: 60, fat: 3, servingSize: '1 piece (40g)' },
        { name: 'Chapati', brand: 'Indian', calories: 297, protein: 9, carbohydrates: 60, fat: 3, servingSize: '1 piece (40g)' },
        { name: 'Dal (Lentils Cooked)', brand: 'Indian', calories: 116, protein: 9, carbohydrates: 20, fat: 0.4, servingSize: '1 cup (200g)' },
        { name: 'Curd (Yogurt)', brand: 'Indian', calories: 98, protein: 3.5, carbohydrates: 11, fat: 4.3, servingSize: '1 cup (150g)' },
        { name: 'Milk (Whole)', brand: 'Generic', calories: 61, protein: 3.2, carbohydrates: 4.8, fat: 3.3, servingSize: '1 cup (244ml)' },
        { name: 'Fruit Juice (Mixed, Fresh)', brand: 'Generic', calories: 45, protein: 0.5, carbohydrates: 10, fat: 0.1, servingSize: '1 glass (200ml)' },
        { name: 'Holige (Obbattu)', brand: 'Indian', calories: 320, protein: 5, carbohydrates: 55, fat: 10, servingSize: '1 piece (50g)' },
        { name: 'Kadubu', brand: 'Indian', calories: 150, protein: 4, carbohydrates: 30, fat: 2, servingSize: '1 piece (60g)' },
        { name: 'Poori', brand: 'Indian', calories: 300, protein: 6, carbohydrates: 35, fat: 15, servingSize: '1 piece (40g)' },
        { name: 'Idli', brand: 'Indian', calories: 140, protein: 4, carbohydrates: 30, fat: 0.4, servingSize: '2 pieces (100g)' },
        { name: 'Vada (Medu Vada)', brand: 'Indian', calories: 300, protein: 10, carbohydrates: 30, fat: 15, servingSize: '1 piece (50g)' },
        { name: 'Dosa', brand: 'Indian', calories: 168, protein: 3.9, carbohydrates: 29, fat: 3.7, servingSize: '1 piece (80g)' },
        { name: 'White Rice (Cooked)', brand: 'Indian', calories: 130, protein: 2.7, carbohydrates: 28, fat: 0.3, servingSize: '1 cup (158g)' }
      ];
      await Food.insertMany(foodsToSeed);
      console.log('Indian foods seeded successfully!');
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

module.exports = seedDatabase;
