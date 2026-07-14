const express = require('express');
const router = express.Router();
const { logMeal, deleteMeal } = require('../controllers/mealController');
const { protect } = require('../middleware/auth');

router.post('/', protect, logMeal);
router.delete('/:id', protect, deleteMeal);

module.exports = router;
