const mongoose = require('mongoose');

const mealItemSchema = new mongoose.Schema({
  food: { type: mongoose.Schema.Types.ObjectId, ref: 'Food', required: true },
  quantity_g: { type: Number, required: true, default: 100 },
  calories: { type: Number, default: 0 },
  protein: { type: Number, default: 0 },
  carbs: { type: Number, default: 0 },
  fat: { type: Number, default: 0 },
});

const mealSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  mealType: { type: String, required: true }, // BREAKFAST, MORNING_SNACK, LUNCH, EVENING_SNACK, DINNER
  items: [mealItemSchema],
  totalCalories: { type: Number, default: 0 },
  totalProtein: { type: Number, default: 0 },
  totalCarbs: { type: Number, default: 0 },
  totalFat: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Meal', mealSchema);
