const express = require('express');
const { protect, adminOnly } = require('../middleware/auth');
const {
  getAllUsers,
  getAllTransactions,
  processTransaction,
  updateUser,
  adminGetPlans,
  createPlan,
  updatePlan,
  deletePlan,
  adminGetInvestments,
  getReferralSettings,
  updateReferralSettings,
  getTopReferrers,
  adjustReferralCommission,
  getWithdrawalDetails,
  deleteUser,
  getPromotionRewards
} = require('../controllers/adminController');

const router = express.Router();

// All routes here require auth and admin role
router.use(protect, adminOnly);

router.get('/users', getAllUsers);
router.get('/transactions', getAllTransactions);
router.get('/withdrawals/:withdrawalId', getWithdrawalDetails);
router.post('/transaction/process', processTransaction);
router.post('/user/update', updateUser);
router.delete('/user/delete/:userId', deleteUser);
router.get('/promotion-rewards', getPromotionRewards);

// Plan Management Routes
router.get('/plans', adminGetPlans);
router.post('/plan/create', createPlan);
router.put('/plan/update/:id', updatePlan);
router.delete('/plan/delete/:id', deletePlan);

// Investment Management Route
router.get('/investments', adminGetInvestments);

// Referral System Admin Management Routes
router.get('/referral/settings', getReferralSettings);
router.post('/referral/settings/update', updateReferralSettings);
router.get('/referral/top', getTopReferrers);
router.post('/referral/adjust', adjustReferralCommission);

module.exports = router;
