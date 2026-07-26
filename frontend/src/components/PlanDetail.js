import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5005/api';

const PlanDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [investing, setInvesting] = useState(false);
  const [toast, setToast] = useState('');
  const [userBalance, setUserBalance] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    fetchPlanDetails();
    fetchUserBalance();
    
    // Poll user balance every 8 seconds for real-time tracking
    const balanceInterval = setInterval(() => {
      fetchUserBalance();
    }, 8000);
    
    return () => clearInterval(balanceInterval);
  }, [id]);

  const fetchPlanDetails = async () => {
    try {
      const res = await axios.get(`${API_URL}/plans/${id}`);
      if (res.data.success) {
        setPlan(res.data.plan);
      } else {
        setError(res.data.message || 'Plan not found');
      }
    } catch (err) {
      console.error('Error fetching plan details:', err);
      setError('Could not load plan details. Server might be offline.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserBalance = async () => {
    try {
      const token = sessionStorage.getItem('gm_token');
      if (!token) return;
      const res = await axios.get(`${API_URL}/auth/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserBalance(res.data.stats.availableBalance || 0);
    } catch (err) {
      console.error('Error fetching balance:', err);
    }
  };

  const handleInvest = async () => {
    if (quantity < 1) return;
    if (userBalance < plan.price * quantity) {
      showToast('❌ Insufficient balance');
      return;
    }
    setInvesting(true);
    try {
      const token = sessionStorage.getItem('gm_token');
      const res = await axios.post(
        `${API_URL}/plans/${id}/invest`,
        { quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      showToast(res.data.success ? '✅ ' + res.data.message : '❌ ' + res.data.message);
      if (res.data.success) {
        setShowConfirmModal(false);
        fetchPlanDetails();
        fetchUserBalance();
        // Redirect back to dashboard after a delay
        setTimeout(() => {
          navigate('/dashboard#plans');
        }, 1500);
      }
    } catch (err) {
      showToast('❌ ' + (err.response?.data?.message || 'Investment failed'));
    } finally {
      setInvesting(false);
    }
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 2200);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '50px', height: '50px', border: '4px solid #e2e8f0', borderTop: '4px solid #16a34a', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <p style={{ color: '#64748b', fontFamily: 'Arial', fontWeight: 600 }}>Loading product details...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '24px' }}>
        <div style={{ background: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', textAlign: 'center', maxWidth: '400px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <p style={{ color: '#ef4444', fontWeight: 700, marginBottom: '20px' }}>{error || 'Plan not found'}</p>
          <button onClick={() => navigate(-1)} style={{ background: '#16a34a', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="plan-detail-root" style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #f0fdf4 0%, #f8fafc 100%)', color: '#1e293b', paddingBottom: '120px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
        
        .plan-detail-root * {
          font-family: 'Poppins', sans-serif !important;
        }

        .back-btn {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justifyContent: center;
          color: white;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .back-btn:hover {
          background: rgba(255, 255, 255, 0.35);
          transform: scale(1.05);
        }

        .action-button-main {
          background: linear-gradient(135deg, #16a34a, #15803d) !important;
          border: none !important;
          color: white !important;
          font-weight: 700 !important;
          box-shadow: 0 8px 20px rgba(22, 163, 74, 0.3);
          transition: all 0.3s ease;
        }
        .action-button-main:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(22, 163, 74, 0.45) !important;
        }
        .action-button-main:active {
          transform: translateY(0);
        }

        .qty-btn {
          width: 38px;
          height: 38px;
          border: 1px solid #cbd5e1;
          background: white;
          border-radius: 10px;
          font-size: 18px;
          font-weight: 700;
          color: #475569;
          cursor: pointer;
          display: flex;
          align-items: center;
          justifyContent: center;
          transition: all 0.15s ease;
        }
        .qty-btn:hover {
          background: #f1f5f9;
          border-color: #94a3b8;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1.5px solid #f1f5f9;
        }
        .detail-row:last-child {
          border-bottom: none;
        }
      `}</style>

      {toast && (
        <div style={{ position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(8px)', color: 'white', padding: '12px 24px', borderRadius: '30px', zIndex: 20000, boxShadow: '0 12px 30px rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.15)', fontWeight: 600, whiteSpace: 'nowrap', textAlign: 'center', animation: 'fadeIn 0.25s ease' }}>
          {toast}
        </div>
      )}

      {/* Header Bar */}
      <header style={{ background: 'linear-gradient(135deg, #143200 0%, #2b5c00 100%)', color: 'white', padding: '20px 16px 60px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button onClick={() => navigate(-1)} className="back-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
        <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '0.5px' }}>Product Details</span>
      </header>

      {/* Details Container */}
      <main style={{ marginTop: '-40px', padding: '0 16px', maxWidth: '600px', margin: '-40px auto 0' }}>
        
        {/* Main Card */}
        <div style={{ background: 'white', borderRadius: '24px', padding: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          {/* Large Image Plate */}
          <div style={{ position: 'relative', width: '130px', height: '130px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0) 70%)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
            {plan.image && (plan.image.startsWith('data:image/') || plan.image.startsWith('http://') || plan.image.startsWith('https://') || plan.image.startsWith('/')) ? (
              <img src={plan.image} alt="Plan" style={{ width: '90px', height: '90px', objectFit: 'cover', borderRadius: '50%', filter: 'drop-shadow(0 8px 15px rgba(0,0,0,0.06))' }} />
            ) : (
              <span style={{ fontSize: '72px', lineHeight: 1, filter: 'drop-shadow(0 8px 15px rgba(0,0,0,0.06))' }}>{plan.image || '🥤'}</span>
            )}
          </div>

          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#1e293b', margin: '0 0 6px 0', textAlign: 'center' }}>{plan.name}</h2>


          {/* Details Grid (Vertical List) */}
          <div style={{ width: '100%', background: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9', padding: '16px 20px', marginBottom: '24px' }}>
            <div className="detail-row">
              <span style={{ color: '#64748b', fontSize: '13px', fontWeight: 500 }}>Daily Income</span>
              <strong style={{ color: '#16a34a', fontSize: '15px', fontWeight: 700 }}>₹{plan.dailyIncome}</strong>
            </div>
            <div className="detail-row">
              <span style={{ color: '#64748b', fontSize: '13px', fontWeight: 500 }}>Total Income</span>
              <strong style={{ color: '#16a34a', fontSize: '15px', fontWeight: 700 }}>₹{(plan.dailyIncome * plan.duration).toFixed(2)}</strong>
            </div>
            <div className="detail-row">
              <span style={{ color: '#64748b', fontSize: '13px', fontWeight: 500 }}>Duration</span>
              <strong style={{ color: '#1e293b', fontSize: '15px', fontWeight: 700 }}>{plan.duration} Days</strong>
            </div>
            <div className="detail-row">
              <span style={{ color: '#64748b', fontSize: '13px', fontWeight: 500 }}>Plan Price</span>
              <strong style={{ color: '#16a34a', fontSize: '15px', fontWeight: 700 }}>₹{plan.price}</strong>
            </div>
          </div>

          {/* About/Description Section */}
          <div style={{ width: '100%', textAlign: 'left', marginBottom: '20px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 10px 0' }}>About This Plan</h4>
            <p style={{ fontSize: '13.5px', color: '#475569', lineHeight: 1.6, margin: 0, background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
              {plan.description || 'This investment plan yields daily returns directly back into your wallet balance. Participate now to maximize your growth rewards.'}
            </p>
          </div>

          {/* Quantity Selector */}
          <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9', marginBottom: '24px' }}>
            <div>
              <span style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Quantity</span>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>Select slots count</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="qty-btn" disabled={quantity <= 1}>−</button>
              <strong style={{ fontSize: '18px', color: '#1e293b', minWidth: '24px', textAlign: 'center' }}>{quantity}</strong>
              <button onClick={() => setQuantity(q => q + 1)} className="qty-btn">+</button>
            </div>
          </div>

          {/* Financial summary for investment */}
          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', padding: '0 8px' }}>
            <div>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Wallet Balance: <strong>₹{userBalance.toFixed(2)}</strong></span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>Total Cost</span>
              <strong style={{ fontSize: '20px', color: '#16a34a' }}>₹{(plan.price * quantity).toFixed(2)}</strong>
            </div>
          </div>

          {/* Invest Button */}
          <button 
            onClick={() => setShowConfirmModal(true)}
            disabled={investing}
            className="action-button-main"
            style={{ 
              width: '100%', 
              padding: '16px', 
              borderRadius: '16px', 
              fontSize: '15px', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {investing ? (
              <>
                <div style={{ width: '18px', height: '18px', border: '2.5px solid rgba(255,255,255,0.3)', borderTop: '2.5px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>INVEST NOW</span>
              </>
            )}
          </button>

        </div>
      </main>

      {/* Confirmation Dialog Overlay Modal */}
      {showConfirmModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '16px',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '380px',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            border: '1px solid rgba(0,0,0,0.05)',
            animation: 'slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}>
            {/* Modal Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', justifyContent: 'center' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: 0, textAlign: 'center' }}>Confirm Investment</h3>
            </div>

            {/* Plan Details Stack */}
            <div style={{ background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '16px', padding: '14px 16px', marginBottom: '20px' }}>
              <div className="detail-row" style={{ padding: '8px 0' }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Plan Price</span>
                <strong style={{ fontSize: '13px', color: '#1e293b' }}>₹{plan.price}</strong>
              </div>
              <div className="detail-row" style={{ padding: '8px 0' }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Daily Income</span>
                <strong style={{ fontSize: '13px', color: '#16a34a' }}>₹{plan.dailyIncome}</strong>
              </div>
              <div className="detail-row" style={{ padding: '8px 0' }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Total Income</span>
                <strong style={{ fontSize: '13px', color: '#16a34a' }}>₹{(plan.dailyIncome * plan.duration).toFixed(2)}</strong>
              </div>
              <div className="detail-row" style={{ padding: '8px 0' }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Duration</span>
                <strong style={{ fontSize: '13px', color: '#1e293b' }}>{plan.duration} Days</strong>
              </div>
              
              {/* Quantity and Total summary inside modal */}
              {quantity > 1 && (
                <>
                  <div style={{ height: '1.5px', background: '#e2e8f0', margin: '8px 0' }} />
                  <div className="detail-row" style={{ padding: '8px 0' }}>
                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Quantity</span>
                    <strong style={{ fontSize: '13px', color: '#1e293b' }}>{quantity} slots</strong>
                  </div>
                  <div className="detail-row" style={{ padding: '8px 0' }}>
                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Total Cost</span>
                    <strong style={{ fontSize: '14px', color: '#16a34a' }}>₹{(plan.price * quantity).toFixed(2)}</strong>
                  </div>
                </>
              )}
            </div>
            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button 
                onClick={() => setShowConfirmModal(false)}
                disabled={investing}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '12px',
                  color: '#64748b',
                  background: 'white',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Cancel
              </button>
              <button 
                onClick={handleInvest}
                disabled={investing}
                className="action-button-main"
                style={{
                  flex: 2,
                  padding: '12px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                {investing ? (
                  <>
                    <div style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                    <span>Investing...</span>
                  </>
                ) : (
                  <span>Confirm & Pay</span>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default PlanDetail;
