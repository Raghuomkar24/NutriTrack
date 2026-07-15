const express = require('express');
const router = express.Router();
const { 
  getWater, updateWater, getDashboardSummary,
  getWeight, logWeight,
  getExercises, logExercise, deleteExercise
} = require('../controllers/trackingController');
const { protect } = require('../middleware/auth');

router.get('/water', protect, getWater);
router.post('/water', protect, updateWater);
router.get('/dashboard/summary', protect, getDashboardSummary);

// Weight routes
router.get('/weight', protect, getWeight);
router.post('/weight', protect, logWeight);

// Exercise routes
router.get('/exercise', protect, getExercises);
router.post('/exercise', protect, logExercise);
router.delete('/exercise/:id', protect, deleteExercise);

module.exports = router;
