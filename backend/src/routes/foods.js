const express = require('express');
const router = express.Router();
const { getFoods, createFood, getFavorites, toggleFavorite, getFoodByBarcode } = require('../controllers/foodController');
const { protect } = require('../middleware/auth');

router.get('/', getFoods); // Optional protect based on requirements, let's keep it public or protect
router.post('/', protect, createFood);
router.get('/favorites', protect, getFavorites);
router.post('/:id/favorite', protect, toggleFavorite);
router.get('/barcode/:barcode', getFoodByBarcode);

module.exports = router;
