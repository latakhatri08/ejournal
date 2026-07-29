const express = require('express');
const router = express.Router();
const { getDashboard, getMoodTrend } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/dashboard', getDashboard);
router.get('/mood-trend', getMoodTrend);

module.exports = router;
