const express = require('express');
const router = express.Router();
const { getRecipes, createRecipe, generateShoppingList } = require('../controllers/recipeController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getRecipes);
router.post('/', protect, createRecipe);
router.post('/generate-shopping-list', protect, generateShoppingList);

module.exports = router;
