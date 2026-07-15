const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  activityType: { type: String, required: true }, // e.g. 'Running', 'Walking', 'Swimming', 'Cycling'
  targetDistanceKm: { type: Number, required: true },
  timeframe: { type: String, required: true, default: 'DAILY' }, // DAILY, WEEKLY
  completed: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Goal', goalSchema);
