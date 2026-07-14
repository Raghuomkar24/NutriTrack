const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String }, // e.g. "Fruits", "Vegetables", "Meats"
  brand: String,
  calories: { type: Number, default: 0 },
  protein: { type: Number, default: 0 },
  fat: { type: Number, default: 0 },
  carbohydrates: { type: Number, default: 0 },
  fiber: { type: Number, default: 0 },
  sugar: { type: Number, default: 0 },
  sodium: { type: Number, default: 0 },
  cholesterol: { type: Number, default: 0 },
  potassium: { type: Number, default: 0 },
  calcium: { type: Number, default: 0 },
  iron: { type: Number, default: 0 },
  servingSize: { type: String, default: '100g' },
  barcode: { type: String, unique: true, sparse: true },
  imageUrl: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Food', foodSchema);
