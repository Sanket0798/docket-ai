const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getPlans,
  getCreditUsage,
  getCreditHistory,
  createOrder,
  verifyPayment,
  getPaymentHistory,
} = require('../controllers/credits.controller');

router.get('/plans', getPlans);
router.get('/usage', protect, getCreditUsage);
router.get('/history', protect, getCreditHistory);
router.post('/order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.get('/payments', protect, getPaymentHistory);

module.exports = router;
