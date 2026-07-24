const BankDetails = require('../models/BankDetails');

// ============================
// ➕ SAVE BANK DETAILS (One-time only)
// ============================
const saveBankDetails = async (req, res) => {
  try {
    const { accountHolderName, accountNumber, bankName, ifscCode, branchName, upiId } = req.body;

    if (!accountHolderName || !accountNumber || !bankName || !ifscCode) {
      return res.status(400).json({
        success: false,
        message: 'Please provide Account Holder Name, Bank Name, Account Number, and IFSC Code.'
      });
    }

    // Check if user already has saved bank details
    const existing = await BankDetails.findOne({ userId: req.user.id });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Bank details can only be added once. Please contact customer support to modify them.'
      });
    }

    const bankDetails = await BankDetails.create({
      userId: req.user.id,
      accountHolderName: accountHolderName.trim(),
      accountNumber: accountNumber.trim(),
      bankName: bankName.trim(),
      ifscCode: ifscCode.trim(),
      branchName: branchName ? branchName.trim() : '',
      upiId: upiId ? upiId.trim() : ''
    });

    res.status(201).json({
      success: true,
      message: 'Bank details saved successfully!',
      bankDetails
    });
  } catch (error) {
    console.error('❌ saveBankDetails error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error saving bank details.'
    });
  }
};

// ============================
// 🔍 GET MY BANK DETAILS
// ============================
const getBankDetails = async (req, res) => {
  try {
    const bankDetails = await BankDetails.findOne({ userId: req.user.id });
    if (!bankDetails) {
      return res.status(404).json({
        success: false,
        message: 'No bank account added. Please add your bank details.'
      });
    }

    res.json({
      success: true,
      bankDetails
    });
  } catch (error) {
    console.error('❌ getBankDetails error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving bank details.'
    });
  }
};

// ============================
// ✏️ UPDATE BANK DETAILS
// ============================
const updateBankDetails = async (req, res) => {
  try {
    const { accountHolderName, accountNumber, bankName, ifscCode, branchName, upiId } = req.body;

    const bankDetails = await BankDetails.findOne({ userId: req.user.id });
    if (!bankDetails) {
      return res.status(404).json({
        success: false,
        message: 'Bank details not found for this user.'
      });
    }

    if (accountHolderName) bankDetails.accountHolderName = accountHolderName.trim();
    if (accountNumber) bankDetails.accountNumber = accountNumber.trim();
    if (bankName) bankDetails.bankName = bankName.trim();
    if (ifscCode) bankDetails.ifscCode = ifscCode.trim();
    if (branchName !== undefined) bankDetails.branchName = branchName.trim();
    if (upiId !== undefined) bankDetails.upiId = upiId.trim();

    await bankDetails.save();

    res.json({
      success: true,
      message: 'Bank details updated successfully!',
      bankDetails
    });
  } catch (error) {
    console.error('❌ updateBankDetails error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating bank details.'
    });
  }
};

// ============================
// 🗑️ DELETE BANK DETAILS
// ============================
const deleteBankDetails = async (req, res) => {
  try {
    const bankDetails = await BankDetails.findOneAndDelete({ userId: req.user.id });
    if (!bankDetails) {
      return res.status(404).json({
        success: false,
        message: 'Bank details not found.'
      });
    }

    res.json({
      success: true,
      message: 'Bank details deleted successfully!'
    });
  } catch (error) {
    console.error('❌ deleteBankDetails error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting bank details.'
    });
  }
};

module.exports = {
  saveBankDetails,
  getBankDetails,
  updateBankDetails,
  deleteBankDetails
};
