const express = require('express');
const {
  getAllPlans,
  getPlan,
  investInPlan,
  claimRewards,
  getMyInvestments
} = require('../controllers/planController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', getAllPlans);
router.get('/user/my-investments', protect, getMyInvestments);
router.get('/:id', getPlan);
router.post('/:id/invest', protect, investInPlan);
router.post('/:id/claim/:investmentId', protect, claimRewards);

module.exports = router;
