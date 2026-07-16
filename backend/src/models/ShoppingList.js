const mongoose = require('mongoose');

const shoppingListSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  items: { type: String, required: true } // comma-separated ingredients
}, { timestamps: true });

shoppingListSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id.toString();
    return ret;
  }
});

module.exports = mongoose.model('ShoppingList', shoppingListSchema);
