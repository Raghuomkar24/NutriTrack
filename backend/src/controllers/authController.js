const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Calculate BMR and TDEE
const calculateMacros = (profile) => {
  const { weight, height, age, gender, activityLevel, goal } = profile;
  
  // Mifflin-St Jeor Equation
  let bmr = (10 * weight) + (6.25 * height) - (5 * age);
  bmr = gender === 'MALE' ? bmr + 5 : bmr - 161;
  
  let activityMultipliers = {
    'SEDENTARY': 1.2,
    'LIGHTLY_ACTIVE': 1.375,
    'MODERATELY_ACTIVE': 1.55,
    'VERY_ACTIVE': 1.725,
    'EXTRA_ACTIVE': 1.9
  };
  
  let tdee = bmr * (activityMultipliers[activityLevel] || 1.2);
  
  let dailyCalories = tdee;
  if (goal === 'LOSE_WEIGHT') dailyCalories -= 500;
  if (goal === 'GAIN_MUSCLE') dailyCalories += 350;
  
  let bmi = weight / ((height/100) * (height/100));

  // Approx macros
  let dailyProtein = weight * 2.2; // approx 2.2g per kg
  let dailyFat = (dailyCalories * 0.25) / 9; // 25% fat
  let dailyCarbs = (dailyCalories - (dailyProtein * 4) - (dailyFat * 9)) / 4;

  return { bmr, tdee, dailyCalories, bmi, dailyProtein, dailyFat, dailyCarbs };
};

exports.registerUser = async (req, res) => {
  try {
    const { email, password, name, mobile, age, gender, height, weight, targetWeight, activityLevel, goal, diet } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const profileInput = { name, mobile, age, gender, height, weight, targetWeight, activityLevel, goal, diet: diet || 'NON_VEGETARIAN' };
    const macros = calculateMacros(profileInput);

    const user = await User.create({
      email,
      password: hashedPassword,
      profile: { ...profileInput, ...macros }
    });

    if (user) {
      res.status(201).json({
        id: user._id,
        email: user.email,
        name: user.profile.name,
        roles: user.roles,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.authUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        id: user._id,
        email: user.email,
        name: user.profile.name,
        roles: user.roles,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};
