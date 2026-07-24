const express = require('express');
const { protect, adminOnly } = require('../middleware/auth');
const {
  createGiftCode,
  getAllGiftCodes,
  updateGiftCode,
  deleteGiftCode,
  getCodeRedemptionHistory,
  redeemGiftCode,
  getMyRedemptionHistory
} = require('../controllers/giftController');

const router = express.Router();

// 👤 CUSTOMER SIDE ROUTES (Required User auth)
router.post('/redeem', protect, redeemGiftCode);
router.get('/history', protect, getMyRedemptionHistory);

// 🛡️ ADMIN SIDE ROUTES (Require Admin role)
router.post('/admin/gift-codes', protect, adminOnly, createGiftCode);
router.get('/admin/gift-codes', protect, adminOnly, getAllGiftCodes);
router.put('/admin/gift-codes/:id', protect, adminOnly, updateGiftCode);
router.delete('/admin/gift-codes/:id', protect, adminOnly, deleteGiftCode);
router.get('/admin/gift-codes/:id/history', protect, adminOnly, getCodeRedemptionHistory);

module.exports = router;
