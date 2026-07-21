const { WaterLog, WeightLog, ExerciseLog } = require('../models/Tracking');
const Meal = require('../models/Meal');
const User = require('../models/User');
const Goal = require('../models/Goal');

exports.getWater = async (req, res) => {
  try {
    const { date } = req.query;
    const d = date ? new Date(date) : new Date();
    const start = new Date(d); start.setHours(0, 0, 0, 0);
    const end = new Date(d); end.setHours(23, 59, 59, 999);

    const log = await WaterLog.findOne({ 
      user: req.user.id, 
      date: { $gte: start, $lte: end } 
    });
    res.json({ amountMl: log ? log.amount_ml : 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateWater = async (req, res) => {
  try {
    const { date, amountMl } = req.body;
    const d = date ? new Date(date) : new Date();
    const start = new Date(d); start.setHours(0, 0, 0, 0);
    const end = new Date(d); end.setHours(23, 59, 59, 999);

    let log = await WaterLog.findOne({ user: req.user.id, date: { $gte: start, $lte: end } });
    if (log) {
      log.amount_ml = amountMl;
      await log.save();
    } else {
      log = await WaterLog.create({ user: req.user.id, date: start, amount_ml: amountMl });
    }
    res.json({ amountMl: log.amount_ml });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDashboardSummary = async (req, res) => {
  try {
    const { date } = req.query;
    const d = date ? new Date(date) : new Date();
    const start = new Date(d); start.setHours(0, 0, 0, 0);
    const end = new Date(d); end.setHours(23, 59, 59, 999);

    const user = await User.findById(req.user.id);
    
    // Get meals within date range
    const meals = await Meal.find({ 
      user: req.user.id, 
      date: { $gte: start, $lte: end } 
    }).populate('items.food');
    
    let caloriesConsumed = 0;
    let proteinConsumed = 0;
    let carbsConsumed = 0;
    let fatConsumed = 0;
    
    const formattedMeals = meals.map(meal => {
      caloriesConsumed += (meal.totalCalories || 0);
      proteinConsumed += (meal.totalProtein || 0);
      carbsConsumed += (meal.totalCarbs || 0);
      fatConsumed += (meal.totalFat || 0);
      
      return {
        id: meal._id,
        mealType: meal.mealType,
        mealItems: meal.items,
        totalCalories: Math.round(meal.totalCalories || 0),
        totalProtein: Math.round(meal.totalProtein || 0),
        totalCarbs: Math.round(meal.totalCarbs || 0),
        totalFat: Math.round(meal.totalFat || 0),
      };
    });

    const waterLog = await WaterLog.findOne({ user: req.user.id, date: { $gte: start, $lte: end } });
    const waterConsumedMl = waterLog ? waterLog.amount_ml : 0;
    const waterGoal = (user?.profile?.gender === 'MALE' ? 3000 : 2200);

    // Get exercises for the date to calculate calories burned
    const exercises = await ExerciseLog.find({ user: req.user.id, date: { $gte: start, $lte: end } });
    const totalCaloriesBurned = exercises.reduce((acc, curr) => acc + (curr.caloriesBurned || 0), 0);

    // Ensure fallback goals if user profile fields are missing or 0
    const dailyCaloriesGoal = user?.profile?.dailyCalories || user?.profile?.tdee || 2000;
    const dailyProteinGoal = user?.profile?.dailyProtein || 150;
    const dailyCarbsGoal = user?.profile?.dailyCarbs || 225;
    const dailyFatGoal = user?.profile?.dailyFat || 65;

    res.json({
      dailyCaloriesGoal: Math.round(dailyCaloriesGoal),
      caloriesConsumed: Math.round(caloriesConsumed),
      caloriesBurned: Math.round(totalCaloriesBurned),
      proteinConsumed: Math.round(proteinConsumed),
      dailyProteinGoal: Math.round(dailyProteinGoal),
      carbsConsumed: Math.round(carbsConsumed),
      dailyCarbsGoal: Math.round(dailyCarbsGoal),
      fatConsumed: Math.round(fatConsumed),
      dailyFatGoal: Math.round(dailyFatGoal),
      todayMeals: formattedMeals,
      waterConsumedMl,
      waterGoal
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getWeight = async (req, res) => {
  try {
    const logs = await WeightLog.find({ user: req.user.id }).sort({ date: 1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.logWeight = async (req, res) => {
  try {
    const { date, weight } = req.body;
    const user = await User.findById(req.user.id);
    
    // Calculate new BMI
    const heightM = user.profile.height / 100;
    const bmi = heightM > 0 ? (weight / (heightM * heightM)).toFixed(1) : 0;
    
    const log = await WeightLog.findOneAndUpdate(
      { user: req.user.id, date: new Date(date) },
      { weight, bmi },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    
    // Update user profile
    user.profile.weight = weight;
    user.profile.bmi = parseFloat(bmi);
    await user.save();
    
    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getExercises = async (req, res) => {
  try {
    const { date } = req.query;
    const logs = await ExerciseLog.find({ 
      user: req.user.id, 
      date: new Date(date) 
    }).sort({ createdAt: -1 });
    
    const formattedLogs = logs.map(log => ({
      id: log._id,
      exerciseType: log.exerciseType,
      durationMinutes: log.durationMinutes,
      caloriesBurned: log.caloriesBurned,
      distanceKm: log.distanceKm,
      route: log.route
    }));
    
    res.json(formattedLogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.logExercise = async (req, res) => {
  try {
    const { date, exerciseType, durationMinutes, caloriesBurned, distanceKm, route } = req.body;
    const log = await ExerciseLog.create({
      user: req.user.id,
      date: new Date(date),
      exerciseType,
      durationMinutes,
      caloriesBurned,
      distanceKm: distanceKm || 0,
      route: route || []
    });
    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteExercise = async (req, res) => {
  try {
    const { id } = req.params;
    await ExerciseLog.findOneAndDelete({ _id: id, user: req.user.id });
    res.json({ message: 'Exercise deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- GOAL ENDPOINTS ---

exports.getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createGoal = async (req, res) => {
  try {
    const { activityType, targetDistanceKm, timeframe } = req.body;
    const goal = await Goal.create({
      user: req.user.id,
      activityType,
      targetDistanceKm,
      timeframe: timeframe || 'DAILY'
    });
    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteGoal = async (req, res) => {
  try {
    const { id } = req.params;
    await Goal.findOneAndDelete({ _id: id, user: req.user.id });
    res.json({ message: 'Goal deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
