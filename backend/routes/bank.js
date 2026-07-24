const express = require('express');
const { protect } = require('../middleware/auth');
const {
  saveBankDetails,
  getBankDetails,
  updateBankDetails,
  deleteBankDetails
} = require('../controllers/bankController');

const router = express.Router();

router.post('/save', protect, saveBankDetails);
router.get('/me', protect, getBankDetails);
router.put('/update', protect, updateBankDetails);
router.delete('/delete', protect, deleteBankDetails);

module.exports = router;
