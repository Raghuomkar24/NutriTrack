const mongoose = require('mongoose');

const waterLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  amount_ml: { type: Number, required: true, default: 0 },
}, { timestamps: true });

const weightLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  weight: { type: Number, required: true },
  bmi: { type: Number, required: true },
}, { timestamps: true });

const exerciseLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  exerciseType: { type: String, required: true }, // RUNNING, WALKING, GYM, CYCLING, YOGA, SWIMMING
  durationMinutes: { type: Number, required: true },
  caloriesBurned: { type: Number, required: true },
  distanceKm: { type: Number, default: 0 },
  route: { type: [[Number]], default: [] } // Array of [lat, lng]
}, { timestamps: true });

module.exports = {
  WaterLog: mongoose.model('WaterLog', waterLogSchema),
  WeightLog: mongoose.model('WeightLog', weightLogSchema),
  ExerciseLog: mongoose.model('ExerciseLog', exerciseLogSchema),
};
