const mongoose = require('mongoose');

const recipeIngredientSchema = new mongoose.Schema({
  id: {
    recipeId: mongoose.Schema.Types.ObjectId,
    ingredientId: mongoose.Schema.Types.ObjectId
  },
  ingredient: {
    name: { type: String, required: true },
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 }
  },
  quantityG: { type: Number, required: true }
}, { id: false, _id: false }); // Disable automatic virtual id and subdoc _id for clean embedding

const recipeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  instructions: String,
  imageUrl: String,
  calories: { type: Number, default: 0 },
  protein: { type: Number, default: 0 },
  fat: { type: Number, default: 0 },
  carbs: { type: Number, default: 0 },
  recipeIngredients: [recipeIngredientSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

recipeSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id.toString();
    return ret;
  }
});

module.exports = mongoose.model('Recipe', recipeSchema);
