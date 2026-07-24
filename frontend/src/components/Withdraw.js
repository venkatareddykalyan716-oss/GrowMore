import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5005/api';

const Withdraw = () => {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState('');
  const [fullname, setFullname] = useState('');
  const [account, setAccount] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [bankDetailsSaved, setBankDetailsSaved] = useState(false);
  
  // UPI support
  const [withdrawMethod, setWithdrawMethod] = useState('bank'); // 'bank' or 'upi'
  const [upiId, setUpiId] = useState('');

  // History support
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const token = localStorage.getItem('gm_token');
      
      // Load user balance & transaction history
      const res = await axios.get(`${API_URL}/auth/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBalance(res.data.stats.availableBalance || 0);
      setHistory(res.data.recentTransactions?.filter(t => t.type === 'withdrawal') || []);

      // Load user bank details from backend
      try {
        const bankRes = await axios.get(`${API_URL}/bank/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (bankRes.data.success && bankRes.data.bankDetails) {
          setFullname(bankRes.data.bankDetails.accountHolderName || '');
          setAccount(bankRes.data.bankDetails.accountNumber || '');
          setIfsc(bankRes.data.bankDetails.ifscCode || '');
          setBankDetailsSaved(true);
        } else {
          setBankDetailsSaved(false);
        }
      } catch (bankErr) {
        console.log('No bank details saved yet:', bankErr.response?.data?.message || bankErr.message);
        setBankDetailsSaved(false);
      }
    } catch (err) {
      console.error('Error loading user data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      setMessage('❌ Enter a valid amount');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    if (numAmount < 250) {
      setMessage('❌ Minimum withdrawal is ₹250');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    if (numAmount > balance) {
      setMessage('❌ Insufficient balance');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    if (!fullname || !account || !ifsc) {
      setMessage('❌ Please complete Bank Account Info');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('gm_token');
      
      const description = `Bank Transfer: ${account} (${ifsc})`;

      const res = await axios.post(`${API_URL}/auth/money-request`, {
        type: 'withdrawal',
        amount: numAmount,
        description // Send details to the backend money request API
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Save to backend if not saved yet
      if (!bankDetailsSaved) {
        await axios.post(`${API_URL}/bank/save`, {
          accountHolderName: fullname,
          bankName: 'N/A',
          accountNumber: account,
          ifscCode: ifsc
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBankDetailsSaved(true);
      }

      setMessage('🎉 ' + (res.data.message || 'Withdrawal request submitted!'));
      setBalance(res.data.stats?.availableBalance || (balance - numAmount));
      setAmount('');
      // Reload history
      loadUserData();
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.message || 'Withdrawal failed'));
    } finally {
      setSubmitting(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '50px', height: '50px', border: '4px solid #e2e8f0', borderTop: '4px solid #16a34a', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <p style={{ color: '#64748b', fontFamily: 'Arial', fontWeight: 600 }}>Loading Withdraw...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="withdraw-root" style={{ minHeight: '100vh', background: '#f8fafc', color: '#1e293b', paddingBottom: '60px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
        
        .withdraw-root * {
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

        .bank-info-card {
          background: linear-gradient(135deg, #16a34a 0%, #15803d 100%) !important;
          color: white;
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 8px 25px rgba(21, 128, 61, 0.25);
          margin-bottom: 24px;
          border: 1px solid rgba(255,255,255,0.08);
        }

        .bank-input-group {
          margin-bottom: 16px;
        }
        .bank-input-group:last-child {
          margin-bottom: 0;
        }
        .bank-input-group label {
          font-size: 12px;
          font-weight: 600;
          display: block;
          margin-bottom: 6px;
          opacity: 0.9;
        }
        .bank-input-group input {
          width: 100%;
          background: rgba(255, 255, 255, 0.1);
          border: 1.5px solid rgba(255, 255, 255, 0.2);
          border-radius: 10px;
          padding: 12px;
          color: white;
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }
        .bank-input-group input::placeholder {
          color: rgba(255, 255, 255, 0.6);
        }
        .bank-input-group input:focus {
          border-color: rgba(255, 255, 255, 0.8);
          background: rgba(255, 255, 255, 0.15);
        }

        .method-tab {
          flex: 1;
          padding: 12px;
          border: none;
          background: transparent;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          border-radius: 10px;
          transition: all 0.2s;
        }
        .method-tab.active {
          background: #16a34a;
          color: white;
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
          onClick={() => navigate('/dashboard')} 
          style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.15)', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '20px', cursor: 'pointer', fontWeight: 700, fontSize: '12px', backdropFilter: 'blur(5px)' }}
        >
          ← Back
        </button>
        <span style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '0.5px' }}>Withdraw Funds</span>
        <button 
          onClick={() => navigate('/withdraw/history')} 
          style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '20px', cursor: 'pointer', fontWeight: 700, fontSize: '12px', backdropFilter: 'blur(5px)', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
        >
          History
        </button>
      </div>

      {/* Main Container */}
      <main style={{ maxWidth: '520px', margin: '-16px auto 0', padding: '0 16px', zIndex: 5, position: 'relative' }}>
        
        {/* Balance Card */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 8px 30px rgba(0,0,0,0.02)', border: '1px solid rgba(22, 163, 74, 0.1)', marginBottom: '20px' }}>
          <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Available Balance</span>
          <strong style={{ fontSize: '32px', color: '#16a34a', fontWeight: 800 }}>₹{balance.toFixed(2)}</strong>
        </div>

        {/* Input Card */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '20px', boxShadow: '0 8px 30px rgba(0,0,0,0.02)', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
          <span style={{ display: 'block', fontSize: '13px', color: '#64748b', fontWeight: 500, marginBottom: '8px' }}>Enter Withdrawal Amount (₹)</span>
          <input 
            type="number" 
            value={amount} 
            onChange={(e) => setAmount(e.target.value)} 
            placeholder="Min withdrawal amount 250" 
            style={{ width: '100%', border: '2px solid #e2e8f0', borderRadius: '12px', padding: '14px', fontSize: '18px', fontWeight: 700, color: '#1e293b', outline: 'none', transition: 'border-color 0.2s ease', boxSizing: 'border-box' }}
            onFocus={(e) => e.target.style.borderColor = '#16a34a'}
            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
          />
          {amount && (
            <div style={{ marginTop: '8px', fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
              Govt Tax (18%): ₹{(Number(amount) * 0.18).toFixed(2)} | Net Receive: ₹{(Number(amount) * 0.82).toFixed(2)}
            </div>
          )}
        </div>

        {/* Bank Account Info Card */}
        {(() => {
          return (
            <div className="bank-info-card">
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: '10px', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>🏦 Bank Account Details:</h3>
              </div>
              
              <div className="bank-input-group">
                <label>FULL NAME</label>
                <input 
                  type="text" 
                  disabled={bankDetailsSaved}
                  style={bankDetailsSaved ? { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', cursor: 'not-allowed' } : {}}
                  value={fullname} 
                  onChange={(e) => setFullname(e.target.value)} 
                  placeholder="Name on account" 
                />
              </div>
              
              <div className="bank-input-group">
                <label>BANK ACCOUNT NUMBER</label>
                <input 
                  type="text" 
                  disabled={bankDetailsSaved}
                  style={bankDetailsSaved ? { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', cursor: 'not-allowed' } : {}}
                  value={account} 
                  onChange={(e) => setAccount(e.target.value)} 
                  placeholder="Account digits" 
                />
              </div>
              
              <div className="bank-input-group">
                <label>IFSC CODE</label>
                <input 
                  type="text" 
                  disabled={bankDetailsSaved}
                  style={bankDetailsSaved ? { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', cursor: 'not-allowed' } : {}}
                  value={ifsc} 
                  onChange={(e) => setIfsc(e.target.value)} 
                  placeholder="Bank branch code" 
                />
              </div>
            </div>
          );
        })()}

        {/* Withdraw Button */}
        <button 
          onClick={handleWithdraw} 
          disabled={submitting} 
          className="submit-btn"
        >
          {submitting ? 'Processing...' : 'Request Withdrawal'}
        </button>



        {/* Rules Section */}
        <div style={{ marginTop: '20px', background: '#ffffff', borderRadius: '20px', padding: '24px', boxShadow: '0 8px 30px rgba(0,0,0,0.02)', border: '1px solid #eef2e6', marginBottom: '20px' }}>
          <strong style={{ color: '#1e293b', fontSize: '15px', display: 'block', marginBottom: '14px', fontWeight: 800 }}>
            📋 Withdrawal Rules:
          </strong>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span>⏰</span>
              <span><strong>Time:</strong> 00:00 - 00:00 (Withdrawal time is 7*24 hours).</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span>💰</span>
              <span><strong>Minimum Amount:</strong> 250 rupees. Max of 1 withdrawal per day.</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span>🏛️</span>
              <span><strong>Taxes:</strong> The government imposes an <strong>18% tax</strong> on withdrawals.</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span>📅</span>
              <span><strong>Transfer Duration:</strong> Withdrawals from Monday to Friday are normally received within 24 hours. Weekend withdrawals may be slower.</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Withdraw;
