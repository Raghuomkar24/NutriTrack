const User = require('../models/User');

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Format response to match expected frontend structure
    const response = {
      user: { email: user.email },
      ...user.profile,
      bmi: user.profile.bmi?.toFixed(1),
      bmr: Math.round(user.profile.bmr),
      tdee: Math.round(user.profile.tdee),
      dailyCalories: Math.round(user.profile.dailyCalories),
      dailyProtein: Math.round(user.profile.dailyProtein),
      dailyCarbs: Math.round(user.profile.dailyCarbs),
      dailyFat: Math.round(user.profile.dailyFat),
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { name, mobile, age, gender, height, weight, targetWeight, activityLevel, goal, diet } = req.body;
    
    // Recalculate macros
    let bmr = (10 * weight) + (6.25 * height) - (5 * age);
    bmr = gender === 'MALE' ? bmr + 5 : bmr - 161;
    
    const activityMultipliers = {
      'SEDENTARY': 1.2,
      'LIGHTLY_ACTIVE': 1.375,
      'MODERATELY_ACTIVE': 1.55,
      'VERY_ACTIVE': 1.725,
      'EXTRA_ACTIVE': 1.9
    };
    
    const tdee = bmr * (activityMultipliers[activityLevel] || 1.2);
    
    let dailyCalories = tdee;
    if (goal === 'LOSE_WEIGHT') dailyCalories -= 500;
    if (goal === 'GAIN_MUSCLE') dailyCalories += 350;
    
    const bmi = weight / ((height/100) * (height/100));
    const dailyProtein = weight * 2.2;
    const dailyFat = (dailyCalories * 0.25) / 9;
    const dailyCarbs = (dailyCalories - (dailyProtein * 4) - (dailyFat * 9)) / 4;

    user.profile = {
      name, mobile, age, gender, height, weight, targetWeight, activityLevel, goal, diet: diet || user.profile.diet,
      bmr, tdee, dailyCalories, bmi, dailyProtein, dailyFat, dailyCarbs
    };
    
    await user.save();
    
    res.json({
      user: { email: user.email },
      ...user.profile,
      bmi: user.profile.bmi?.toFixed(1),
      bmr: Math.round(user.profile.bmr),
      tdee: Math.round(user.profile.tdee),
      dailyCalories: Math.round(user.profile.dailyCalories),
      dailyProtein: Math.round(user.profile.dailyProtein),
      dailyCarbs: Math.round(user.profile.dailyCarbs),
      dailyFat: Math.round(user.profile.dailyFat),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProfile, updateProfile };
