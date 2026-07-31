import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Recharge = () => {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('600');
  const [channel, setChannel] = useState('P-Jwpay');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [transactions, setTransactions] = useState([]);

  // Manual UPI States
  const [step, setStep] = useState(1);
  const [transactionId, setTransactionId] = useState('');
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [copied, setCopied] = useState(false);

  const quickAmounts = ['600', '1000', '2000', '3500', '9000', '25000', '50000', '70000', '100000'];
  const channels = ['P-Jwpay', 'P-Pay'];
  const upiId = channel === 'P-Jwpay' ? 'growmoree@ptyes' : 'gromore@freecharge';

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const token = sessionStorage.getItem('gm_token');
      const balRes = await axios.get(`${API_URL}/auth/balance`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBalance(balRes.data.balance || 0);
      setPhone(balRes.data.referralCode || 'Member');

      const txRes = await axios.get(`${API_URL}/auth/transactions?type=recharge`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransactions(txRes.data.transactions || []);
    } catch (err) {
      console.error('Error loading balance:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setMessage('📋 UPI ID copied to clipboard!');
    setTimeout(() => {
      setCopied(false);
      setMessage('');
    }, 2000);
  };

  const handleScreenshotChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerUpiDeepLink = (app) => {
    const upiUrl = `upi://pay?pa=${upiId}&pn=GrowMore&am=${amount}&cu=INR`;
    let appUrl = upiUrl;

    if (app === 'phonepe') {
      appUrl = `phonepe://pay?pa=${upiId}&pn=GrowMore&am=${amount}&cu=INR`;
    } else if (app === 'gpay') {
      appUrl = `tez://pay?pa=${upiId}&pn=GrowMore&am=${amount}&cu=INR`;
    } else if (app === 'paytm') {
      appUrl = `paytmmp://pay?pa=${upiId}&pn=GrowMore&am=${amount}&cu=INR`;
    }

    // Attempt to open deep link
    window.location.href = appUrl;

    // Automatically advance to proof upload page
    setTimeout(() => {
      setStep(3);
    }, 1000);
  };

  const handleNextStep = () => {
    const numAmount = Number(amount);
    if (!numAmount || numAmount < 500) {
      setMessage('❌ Minimum recharge amount is ₹500');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    setStep(2);
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    if (!transactionId || transactionId.trim().length < 12) {
      setMessage('❌ Please enter a valid 12-digit UTR/Transaction Ref number');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setSubmitting(true);
    try {
      const token = sessionStorage.getItem('gm_token');
      const res = await axios.post(`${API_URL}/auth/money-request`, {
        type: 'recharge',
        amount: Number(amount),
        reference: transactionId.trim(),
        proofImage: screenshotPreview || ''
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setMessage('✅ Recharge submitted successfully! Pending admin approval.');
        setTimeout(() => {
          navigate('/recharge/history');
        }, 2500);
      } else {
        setMessage('❌ Submission failed: ' + res.data.message);
      }
    } catch (err) {
      console.error('Error submitting payment:', err);
      setMessage('❌ ' + (err.response?.data?.message || err.message || 'Submission failed'));
    } finally {
      setSubmitting(false);
      setTimeout(() => setMessage(''), 4500);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '50px', height: '50px', border: '4px solid #e2e8f0', borderTop: '4px solid #16a34a', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <p style={{ color: '#64748b', fontFamily: 'Arial', fontWeight: 600 }}>Loading Recharge...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="recharge-root" style={{ minHeight: '100vh', background: '#f8fafc', color: '#1e293b', paddingBottom: '40px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
        
        .recharge-root * {
          font-family: 'Poppins', sans-serif !important;
        }

        /* Hide Chrome/Safari/Edge/Opera spin buttons */
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        /* Hide Firefox spin buttons */
        input[type=number] {
          -moz-appearance: textfield;
        }

        .channel-btn {
          border: 1px solid #e2e8f0;
          background: white;
          border-radius: 8px;
          padding: 10px 6px;
          font-size: 12px;
          font-weight: 600;
          color: #475569;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: center;
        }
        .channel-btn.active {
          background: #16a34a;
          color: white;
          border-color: #16a34a;
          box-shadow: 0 4px 10px rgba(22, 163, 74, 0.2);
        }

        .amount-btn {
          border: 1px solid #e2e8f0;
          background: white;
          border-radius: 12px;
          padding: 14px 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          justifyContent: center;
        }
        .amount-btn:hover {
          border-color: #16a34a;
          background: #f0fdf4;
        }
        .amount-btn.active {
          background: #16a34a;
          border-color: #16a34a;
          color: white;
          box-shadow: 0 4px 12px rgba(22, 163, 74, 0.2);
        }

        .amount-grid {
          display: grid !important;
          grid-template-columns: repeat(3, 1fr) !important;
          gap: 12px !important;
          margin-bottom: 30px !important;
        }

        @media (max-width: 360px) {
          .amount-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 10px !important;
          }
          .amount-btn {
            padding: 12px 6px !important;
          }
          .amount-btn strong {
            font-size: 14px !important;
          }
          .amount-btn span {
            font-size: 9px !important;
          }
        }

        .submit-btn {
          background: linear-gradient(135deg, #16a34a 0%, #15803d 100%) !important;
          color: white;
          border: none;
          width: 100%;
          padding: 14px;
          border-radius: 14px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 6px 20px rgba(22, 163, 74, 0.3);
          transition: all 0.2s ease;
        }
        .submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(22, 163, 74, 0.4);
        }
        .submit-btn:disabled {
          background: #94a3b8 !important;
          cursor: not-allowed;
          box-shadow: none;
        }

        .upi-app-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 16px;
          display: flex;
          align-items: center;
          justifyContent: space-between;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-bottom: 12px;
        }
        .upi-app-card:hover {
          border-color: #16a34a;
          background: #f0fdf4;
          transform: translateY(-1px);
        }
      `}</style>

      {message && (
        <div style={{ position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)', background: '#1e293b', color: 'white', padding: '12px 24px', borderRadius: '30px', zIndex: 9999, boxShadow: '0 10px 30px rgba(0,0,0,0.15)', fontWeight: 600 }}>
          {message}
        </div>
      )}

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)', color: 'white', padding: '24px 16px', position: 'relative', textAlign: 'center', boxShadow: '0 4px 15px rgba(22, 163, 74, 0.2)' }}>
        <button 
          onClick={() => {
            if (step === 1) navigate('/dashboard');
            else setStep(step - 1);
          }} 
          style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.15)', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '20px', cursor: 'pointer', fontWeight: 700, fontSize: '12px', backdropFilter: 'blur(5px)' }}
        >
          ← Back
        </button>
        <span style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '0.5px' }}>Recharge</span>
        {step === 1 && (
          <button 
            onClick={() => navigate('/recharge/history')} 
            style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '20px', cursor: 'pointer', fontWeight: 700, fontSize: '12px', backdropFilter: 'blur(5px)', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
          >
            History
          </button>
        )}
      </div>

      {/* Main Container */}
      <main style={{ maxWidth: '520px', margin: '-16px auto 0', padding: '0 16px', zIndex: 5, position: 'relative' }}>
        
        {/* Step 1: Selection & Amount */}
        {step === 1 && (
          <>
            {/* Balance Card */}
            <div style={{ background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 8px 30px rgba(0,0,0,0.02)', border: '1px solid rgba(22, 163, 74, 0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Balance</span>
                <strong style={{ fontSize: '28px', color: '#15803d', fontWeight: 800 }}>₹{balance.toFixed(2)}</strong>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', width: '180px' }}>
                {channels.map(ch => (
                  <button key={ch} onClick={() => setChannel(ch)} className={`channel-btn ${channel === ch ? 'active' : ''}`}>{ch}</button>
                ))}
              </div>
            </div>

            {/* Input Card */}
            <div style={{ background: 'white', borderRadius: '20px', padding: '20px', boxShadow: '0 8px 30px rgba(0,0,0,0.02)', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
              <span style={{ display: 'block', fontSize: '13px', color: '#64748b', fontWeight: 500, marginBottom: '8px' }}>Enter Recharge Amount (₹)</span>
              <input 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                placeholder="Min recharge amount 500" 
                style={{ width: '100%', border: '2px solid #e2e8f0', borderRadius: '12px', padding: '14px', fontSize: '20px', fontWeight: 800, color: '#1e293b', outline: 'none', transition: 'border-color 0.2s ease', boxSizing: 'border-box' }}
                onFocus={(e) => e.target.style.borderColor = '#16a34a'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>

            {/* Quick Amount Grid */}
            <div className="amount-grid">
              {quickAmounts.map(val => {
                const isActive = amount === val;
                return (
                  <button 
                    key={val} 
                    onClick={() => setAmount(val)} 
                    className={`amount-btn ${isActive ? 'active' : ''}`}
                  >
                    <strong style={{ fontSize: '16px', fontWeight: 800, color: isActive ? 'white' : '#1e293b' }}>₹{val}</strong>
                    <span style={{ fontSize: '10px', color: isActive ? 'rgba(255,255,255,0.8)' : '#64748b', marginTop: '4px' }}>Priced at ₹{val}</span>
                  </button>
                );
              })}
            </div>

            {/* Recharge Button */}
            <button 
              onClick={handleNextStep} 
              className="submit-btn"
            >
              Recharge
            </button>

            {/* Tips Section */}
            <div style={{ marginTop: '30px', background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '16px', padding: '18px' }}>
              <strong style={{ color: '#d97706', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                ⚠️ Tips & Instructions
              </strong>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#b45309', lineHeight: 1.6 }}>
                <li>Recharge requests are typically processed within <strong>1 minute to 6 hours</strong>.</li>
                <li><strong>6-Hour Credit Guarantee:</strong> If your submitted recharge is verified but not credited within 6 hours, we will credit <strong>double the recharge amount</strong> to your wallet balance (e.g., ₹600 recharge will be credited as ₹1200).</li>
                <li>Please double-check the merchant UPI ID and payment amount before finalizing the transaction.</li>
                <li>Ensure you upload the correct payment receipt screenshot and enter the exact 12-digit UTR/Transaction Ref number.</li>
              </ul>
            </div>
          </>
        )}

        {/* Step 2: UPI Appsdeep linking redirects */}
        {step === 2 && (
          <div style={{ background: 'white', borderRadius: '24px', padding: '24px', boxShadow: '0 8px 30px rgba(0,0,0,0.02)', border: '1px solid #e2e8f0', marginTop: '20px' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <span style={{ fontSize: '13px', color: '#64748b', display: 'block', fontWeight: 600 }}>Amount to Recharge</span>
              <strong style={{ fontSize: '32px', color: '#16a34a', fontWeight: 800, marginTop: '4px', display: 'block' }}>₹{amount}</strong>
            </div>

            {/* UPI ID block */}
            <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '16px', padding: '16px', textAlign: 'center', marginBottom: '24px' }}>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>Merchant UPI ID</span>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                <strong style={{ fontSize: '15px', color: '#0f172a' }}>{upiId}</strong>
                <button 
                  onClick={handleCopyUpi} 
                  style={{ background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '11px', fontWeight: 700 }}
                >
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            {/* UPI Apps Header */}
            <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b', marginBottom: '14px' }}>Select UPI App to Pay:</h4>

            <div className="upi-app-card" onClick={() => triggerUpiDeepLink('phonepe')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src="https://cashfreelogo.cashfree.com/assets_images/pg/upi/32/phonepe.png" alt="PhonePe" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
                <strong style={{ fontSize: '14px', color: '#334155' }}>PhonePe</strong>
              </div>
              <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 700 }}>Pay via PhonePe →</span>
            </div>

            <div className="upi-app-card" onClick={() => triggerUpiDeepLink('gpay')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src="https://cashfreelogo.cashfree.com/assets_images/pg/upi/32/gpay.png" alt="Google Pay" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
                <strong style={{ fontSize: '14px', color: '#334155' }}>Google Pay</strong>
              </div>
              <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 700 }}>Pay via GPay →</span>
            </div>

            <div className="upi-app-card" onClick={() => triggerUpiDeepLink('paytm')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src="https://cashfreelogo.cashfree.com/assets_images/pg/upi/32/paytm.png" alt="Paytm" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
                <strong style={{ fontSize: '14px', color: '#334155' }}>Paytm</strong>
              </div>
              <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 700 }}>Pay via Paytm →</span>
            </div>

            <div className="upi-app-card" onClick={() => triggerUpiDeepLink('generic')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src="https://download.logo.wine/logo/Unified_Payments_Interface/Unified_Payments_Interface-Logo.wine.png" alt="Other UPI" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
                <strong style={{ fontSize: '14px', color: '#334155' }}>Other UPI Apps</strong>
              </div>
              <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 700 }}>Pay via UPI →</span>
            </div>

            <button 
              onClick={() => setStep(3)} 
              className="submit-btn"
              style={{ marginTop: '20px' }}
            >
              I have completed payment
            </button>

            {/* Tips Section */}
            <div style={{ marginTop: '24px', background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '16px', padding: '18px', textAlign: 'left' }}>
              <strong style={{ color: '#d97706', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                ⚠️ Tips & Instructions
              </strong>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#b45309', lineHeight: 1.6 }}>
                <li>Recharge requests are typically processed within <strong>1 minute to 6 hours</strong>.</li>
                <li><strong>6-Hour Credit Guarantee:</strong> If your submitted recharge is verified but not credited within 6 hours, we will credit <strong>double the recharge amount</strong> to your wallet balance (e.g., ₹600 recharge will be credited as ₹1200).</li>
                <li>Please double-check the merchant UPI ID and payment amount before finalizing the transaction.</li>
                <li>Ensure you upload the correct payment receipt screenshot and enter the exact 12-digit UTR/Transaction Ref number.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Step 3: Upload receipt & Enter UTR */}
        {step === 3 && (
          <form onSubmit={handleSubmitPayment} style={{ background: 'white', borderRadius: '24px', padding: '24px', boxShadow: '0 8px 30px rgba(0,0,0,0.02)', border: '1px solid #e2e8f0', marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ textAlign: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: '#64748b', display: 'block', fontWeight: 600 }}>Amount Paid</span>
              <strong style={{ fontSize: '28px', color: '#16a34a', fontWeight: 800, marginTop: '2px', display: 'block' }}>₹{amount}</strong>
            </div>

            {/* UTR Input */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                Enter 12-Digit Transaction UTR / Ref ID <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input 
                type="text" 
                maxLength="12"
                placeholder="Enter 12-digit UTR/Reference ID"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value.replace(/[^0-9]/g, ''))}
                required
                style={{ width: '100%', border: '2px solid #e2e8f0', borderRadius: '12px', padding: '12px 16px', fontSize: '15px', fontWeight: 700, color: '#1e293b', outline: 'none', transition: 'border-color 0.2s ease', boxSizing: 'border-box' }}
                onFocus={(e) => e.target.style.borderColor = '#16a34a'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>

            {/* Proof Screenshot */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                Upload Payment Screenshot <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ border: '2px dashed #cbd5e1', borderRadius: '16px', padding: '20px', textAlign: 'center', background: '#f8fafc', position: 'relative', cursor: 'pointer' }}>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleScreenshotChange}
                  required
                  style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                />
                
                {screenshotPreview ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <img 
                      src={screenshotPreview} 
                      alt="Payment Preview" 
                      style={{ maxHeight: '140px', maxWidth: '100%', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                    />
                    <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 700 }}>✓ Screenshot uploaded</span>
                  </div>
                ) : (
                  <div>
                    <span style={{ fontSize: '32px', display: 'block', marginBottom: '6px' }}>📸</span>
                    <strong style={{ fontSize: '12px', color: '#475569', display: 'block' }}>Choose Image or Take Screenshot</strong>
                    <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block', marginTop: '2px' }}>Supported formats: JPG, PNG, JPEG</span>
                  </div>
                )}
              </div>
            </div>

            <button 
              type="submit" 
              disabled={submitting} 
              className="submit-btn"
              style={{ marginTop: '10px' }}
            >
              {submitting ? 'Submitting Proof...' : 'Submit Payment'}
            </button>
          </form>
        )}
      </main>
    </div>
  );
};

export default Recharge;
