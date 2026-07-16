const express = require('express');
const router = express.Router();
const { getShoppingLists, deleteShoppingList } = require('../controllers/recipeController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getShoppingLists);
router.delete('/:id', protect, deleteShoppingList);

module.exports = router;
