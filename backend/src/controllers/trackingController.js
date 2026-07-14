const { WaterLog } = require('../models/Tracking');
const Meal = require('../models/Meal');
const User = require('../models/User');

exports.getWater = async (req, res) => {
  try {
    const { date } = req.query;
    const log = await WaterLog.findOne({ 
      user: req.user.id, 
      date: new Date(date) 
    });
    res.json({ amountMl: log ? log.amount_ml : 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateWater = async (req, res) => {
  try {
    const { date, amountMl } = req.body;
    let log = await WaterLog.findOne({ user: req.user.id, date: new Date(date) });
    if (log) {
      log.amount_ml = amountMl;
      await log.save();
    } else {
      log = await WaterLog.create({ user: req.user.id, date: new Date(date), amount_ml: amountMl });
    }
    res.json({ amountMl: log.amount_ml });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDashboardSummary = async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = new Date(date);
    const user = await User.findById(req.user.id);
    
    // Get meals
    const meals = await Meal.find({ user: req.user.id, date: targetDate }).populate('items.food');
    
    let caloriesConsumed = 0;
    let proteinConsumed = 0;
    let carbsConsumed = 0;
    let fatConsumed = 0;
    
    const formattedMeals = meals.map(meal => {
      caloriesConsumed += meal.totalCalories;
      proteinConsumed += meal.totalProtein;
      carbsConsumed += meal.totalCarbs;
      fatConsumed += meal.totalFat;
      
      return {
        id: meal._id,
        mealType: meal.mealType,
        mealItems: meal.items,
        totalCalories: Math.round(meal.totalCalories),
        totalProtein: Math.round(meal.totalProtein),
        totalCarbs: Math.round(meal.totalCarbs),
        totalFat: Math.round(meal.totalFat),
      };
    });

    const waterLog = await WaterLog.findOne({ user: req.user.id, date: targetDate });
    const waterConsumedMl = waterLog ? waterLog.amount_ml : 0;
    const waterGoal = user.profile.gender === 'MALE' ? 3000 : 2200;

    res.json({
      dailyCaloriesGoal: user.profile.dailyCalories,
      caloriesConsumed: Math.round(caloriesConsumed),
      caloriesBurned: 0, // Mocked for now, from ExerciseLog
      proteinConsumed: Math.round(proteinConsumed),
      dailyProteinGoal: Math.round(user.profile.dailyProtein),
      carbsConsumed: Math.round(carbsConsumed),
      dailyCarbsGoal: Math.round(user.profile.dailyCarbs),
      fatConsumed: Math.round(fatConsumed),
      dailyFatGoal: Math.round(user.profile.dailyFat),
      todayMeals: formattedMeals,
      waterConsumedMl,
      waterGoal
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
