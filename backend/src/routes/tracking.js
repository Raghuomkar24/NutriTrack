const express = require('express');
const router = express.Router();
const { getWater, updateWater, getDashboardSummary } = require('../controllers/trackingController');
const { protect } = require('../middleware/auth');

router.get('/water', protect, getWater);
router.post('/water', protect, updateWater);
router.get('/dashboard/summary', protect, getDashboardSummary);

module.exports = router;
