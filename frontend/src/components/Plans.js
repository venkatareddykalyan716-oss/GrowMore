import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// 🌿 ButtonSpecificIcon Helper for Bottom Nav on Plans page
const ButtonSpecificIcon = ({ name = '', size = 20, color = '#15803d', style = {} }) => {
  const normName = name.toLowerCase().trim().replace(/[^a-z]/g, '');
  
  const iconProps = {
    xmlns: "http://www.w3.org/2000/svg",
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    stroke: color,
    strokeWidth: "2.5",
    fill: "none",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: { display: 'inline-block', verticalAlign: 'middle', ...style }
  };

  switch (normName) {
    case 'home':
      return (
        <svg {...iconProps}>
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    case 'product':
    case 'plans':
      return (
        <svg {...iconProps}>
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      );
    case 'market':
      return (
        <svg {...iconProps}>
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
      );
    case 'team':
      return (
        <svg {...iconProps}>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case 'my':
    case 'profile':
      return (
        <svg {...iconProps}>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    default:
      return (
        <svg {...iconProps}>
          <circle cx="12" cy="12" r="10" />
        </svg>
      );
  }
};

const Plans = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const token = sessionStorage.getItem('gm_token');
      console.log('Loading plans from:', `${API_URL}/plans`);
      
      const res = await fetch(`${API_URL}/plans`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      console.log('Plans response:', data);
      
      if (data.success) {
        setPlans(data.plans);
      } else {
        setMessage('Failed to load plans: ' + (data.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Failed to load plans:', err);
      setMessage('Network error. Make sure backend is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  const handleInvest = async (planId) => {
    const token = sessionStorage.getItem('gm_token');
    try {
      const res = await fetch(`${API_URL}/plans/${planId}/invest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ quantity: 1 })
      });
      const data = await res.json();
      setMessage(data.success ? '✅ ' + data.message : '❌ ' + data.message);
      if (data.success) loadPlans();
    } catch (err) {
      setMessage('❌ Network error');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const handleClaim = async (planId) => {
    const token = sessionStorage.getItem('gm_token');
    try {
      const res = await fetch(`${API_URL}/plans/${planId}/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      setMessage(data.success ? data.message : '❌ ' + data.message);
    } catch (err) {
      setMessage('❌ Network error');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0fdf4' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '50px', height: '50px', border: '4px solid #d1fae5', borderTop: '4px solid #16a34a', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <p style={{ color: '#15803d', fontFamily: 'Arial', fontWeight: 600 }}>Loading Plans...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="plans-root" style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #f0fdf4 0%, #f4fbf7 50%, #ffffff 100%)', color: '#1e293b', paddingBottom: '98px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
        
        .plans-root * {
          font-family: 'Poppins', sans-serif !important;
        }
        
        .modern-clean-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          padding: 14px 16px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
          transition: all 0.2s ease-out;
        }
        .modern-clean-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(22, 163, 74, 0.08);
          border-color: #22c55e;
        }
        
        .claim-btn {
          background: transparent !important;
          border: 1.5px solid #16a34a !important;
          color: #16a34a !important;
          transition: all 0.3s ease;
        }
        .claim-btn:hover {
          background: #16a34a !important;
          color: white !important;
          box-shadow: 0 4px 12px rgba(22, 163, 74, 0.15) !important;
        }
        
        .badge-pill {
          background: #f0fdf4 !important;
          border: 1px solid rgba(22, 163, 74, 0.2) !important;
          color: #16a34a !important;
          font-weight: 600 !important;
        }

        .bottom-nav-btn {
          transition: all 0.2s ease;
        }
        .bottom-nav-btn:hover {
          color: #4a8211 !important;
        }
      `}</style>
      
      {message && (
        <div style={{ position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(8px)', color: 'white', padding: '12px 24px', borderRadius: '30px', zIndex: 9999, boxShadow: '0 12px 30px rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.15)', fontWeight: 600, whiteSpace: 'nowrap', textAlign: 'center', animation: 'fadeIn 0.25s ease' }}>
          {message}
        </div>
      )}

      {/* Top Header Bar matching Home style */}
      <div style={{ 
        background: 'linear-gradient(135deg, #143200 0%, #2b5c00 100%)', 
        color: 'white', 
        textAlign: 'center', 
        padding: '24px 16px 28px', 
        fontSize: '24px', 
        fontWeight: 800, 
        letterSpacing: '1px', 
        textTransform: 'uppercase', 
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        position: 'relative'
      }}>
        {/* Back Button left-aligned */}
        <button 
          onClick={() => navigate('/dashboard')} 
          style={{ 
            position: 'absolute', 
            left: '16px', 
            top: '50%', 
            transform: 'translateY(-50%)', 
            background: 'rgba(255,255,255,0.15)', 
            color: 'white', 
            border: 'none', 
            padding: '8px 14px', 
            borderRadius: '20px', 
            cursor: 'pointer', 
            fontWeight: 700, 
            fontSize: '12px',
            backdropFilter: 'blur(5px)',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.25)'}
          onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.15)'}
        >
          ← Back
        </button>
        GrowMore
      </div>

      {/* Main Content overlapping top header exactly like Home screen */}
      <main style={{ maxWidth: '520px', margin: '-16px auto 0', padding: '0 16px', zIndex: 5, position: 'relative' }}>
        
        {/* Overlapping Title Card */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '20px', marginBottom: '20px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid rgba(226, 237, 207, 0.4)' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 4px 0', color: '#15803d' }}>🌱 Investment Plans</h2>
          <p style={{ color: '#16a34a', fontSize: '13px', fontWeight: 600, margin: 0 }}>Choose your plan and start earning daily rewards</p>
        </div>

        {/* Plans Feed stacked vertically */}
        {plans.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#16a34a' }}>
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>📦</div>
            <p style={{ fontSize: '18px', fontWeight: 600 }}>No plans available</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {plans.map(plan => (
              <div 
                key={plan._id} 
                className="modern-clean-card" 
                onClick={() => navigate(`/plans/${plan._id}`)}
                style={{ cursor: 'pointer' }}
              >
                {/* Left Side: Image container */}
                <div style={{ 
                  width: '76px', 
                  height: '76px', 
                  borderRadius: '16px', 
                  background: '#f8fafc', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  flexShrink: 0, 
                  border: '1px solid #f1f5f9' 
                }}>
                  {plan.image && (plan.image.startsWith('data:image/') || plan.image.startsWith('http://') || plan.image.startsWith('https://') || plan.image.startsWith('/')) ? (
                    <img src={plan.image} alt="Plan" style={{ width: '56px', height: '56px', objectFit: 'contain' }} />
                  ) : (
                    <span style={{ fontSize: '42px' }}>{plan.image || '🥤'}</span>
                  )}
                </div>

                {/* Right Side: Information Content */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>{plan.name}</h3>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                    <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>⏱️ {plan.duration} Days</span>
                    <span style={{ color: '#cbd5e1' }}>|</span>
                    <span style={{ color: '#16a34a', fontWeight: 700 }}>${plan.price}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: '#64748b' }}>
                    <span>Daily: <strong style={{ color: '#16a34a' }}>${plan.dailyIncome}</strong></span>
                    <span style={{ color: '#cbd5e1' }}>|</span>
                    <span>Total: <strong style={{ color: '#1e293b' }}>${(plan.dailyIncome * plan.duration).toFixed(0)}</strong></span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: '6px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleClaim(plan._id); }} 
                        className="claim-btn" 
                        style={{ 
                          padding: '5px 12px', 
                          borderRadius: '20px', 
                          cursor: 'pointer', 
                          fontWeight: 700, 
                          fontSize: '11px',
                          border: '1.5px solid #16a34a',
                          background: 'transparent',
                          color: '#16a34a'
                        }}
                      >
                        CLAIM
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); navigate(`/plans/${plan._id}`); }} 
                        style={{ 
                          background: 'linear-gradient(135deg, #16a34a, #15803d)', 
                          color: 'white', 
                          border: 'none', 
                          padding: '6px 16px', 
                          borderRadius: '20px', 
                          fontSize: '11.5px', 
                          fontWeight: 700, 
                          cursor: 'pointer', 
                          boxShadow: '0 4px 10px rgba(22, 163, 74, 0.2)' 
                        }}
                      >
                        INVEST
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Bottom Nav matching Home exactly */}
      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', maxWidth: '520px', margin: '0 auto', boxShadow: '0 -8px 30px rgba(0,0,0,0.08)', borderRadius: '24px 24px 0 0', border: '1px solid rgba(226, 237, 207, 0.4)', overflow: 'hidden', zIndex: 1000 }}>
        {[
          ['Home', () => navigate('/dashboard', { state: { activePanel: 'home' } })], 
          ['Product', () => {}], 
          ['Market', () => navigate('/plans')], 
          ['Team', () => navigate('/dashboard', { state: { activePanel: 'invite' } })], 
          ['Profile', () => navigate('/dashboard', { state: { activePanel: 'profile' } })]
        ].map(([label, onClick]) => {
          const isActive = (label === 'Product');
          return (
            <button 
              key={label} 
              onClick={onClick} 
              className="bottom-nav-btn"
              style={{ 
                border: 'none', 
                background: 'transparent', 
                color: isActive ? '#4a8211' : '#8c98a4', 
                padding: '10px 4px 6px', 
                cursor: 'pointer', 
                fontWeight: isActive ? 800 : 600,
                fontSize: '11px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '2px'
              }}
            >
              <ButtonSpecificIcon name={label} size={20} color={isActive ? '#4a8211' : '#8c98a4'} />
              <span style={{ fontSize: '11px', fontWeight: isActive ? 700 : 500 }}>{label}</span>
              {isActive && <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#4a8211' }}></span>}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Plans;
