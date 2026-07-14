const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  roles: {
    type: [String],
    default: ['ROLE_USER'],
  },
  profile: {
    name: { type: String, required: true },
    mobile: String,
    age: Number,
    gender: String,
    height: Number, // in cm
    weight: Number, // in kg
    targetWeight: Number,
    activityLevel: String, // SEDENTARY, LIGHTLY_ACTIVE, MODERATELY_ACTIVE, VERY_ACTIVE, EXTRA_ACTIVE
    goal: String, // LOSE_WEIGHT, MAINTAIN, GAIN_MUSCLE
    bmi: Number,
    bmr: Number,
    tdee: Number,
    dailyCalories: Number,
    dailyProtein: Number,
    dailyCarbs: Number,
    dailyFat: Number,
    diet: { type: String, default: 'NON_VEGETARIAN' }
  },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Food' }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
