import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5005/api';

const WithdrawHistory = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const token = sessionStorage.getItem('gm_token');
      const res = await axios.get(`${API_URL}/auth/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransactions(res.data.recentTransactions || []);
    } catch (err) {
      console.error('Error loading withdraw history:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '50px', height: '50px', border: '4px solid #e2e8f0', borderTop: '4px solid #16a34a', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <p style={{ color: '#64748b', fontFamily: 'Arial', fontWeight: 600 }}>Loading History...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const withdrawTx = transactions.filter(tx => tx.type === 'withdrawal');

  return (
    <div className="withdraw-history-root" style={{ minHeight: '100vh', background: '#f8fafc', color: '#1e293b', paddingBottom: '40px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
        .withdraw-history-root * {
          font-family: 'Poppins', sans-serif !important;
        }
      `}</style>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)', color: 'white', padding: '24px 16px', position: 'relative', textAlign: 'center', boxShadow: '0 4px 15px rgba(22, 163, 74, 0.2)' }}>
        <button 
          onClick={() => navigate('/withdraw')} 
          style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.15)', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '20px', cursor: 'pointer', fontWeight: 700, fontSize: '12px', backdropFilter: 'blur(5px)' }}
        >
          ← Back
        </button>
        <span style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '0.5px' }}>Withdrawal History</span>
      </div>

      {/* Main List */}
      <main style={{ maxWidth: '520px', margin: '24px auto 0', padding: '0 16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {withdrawTx.length === 0 ? (
            <div style={{ background: 'white', borderRadius: '20px', padding: '40px 20px', textAlign: 'center', border: '1px solid #e2e8f0', boxShadow: '0 8px 30px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
              <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#64748b' }}>No withdrawal requests found.</p>
            </div>
          ) : (
            withdrawTx.map((tx, idx) => (
              <div 
                key={idx} 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '18px 20px', 
                  background: 'white', 
                  borderRadius: '20px', 
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.01)'
                }}
              >
                <div>
                  <strong style={{ display: 'block', fontSize: '16px', color: '#1e293b' }}>
                    ₹{tx.amount.toFixed(2)}
                  </strong>
                  <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginTop: '4px', wordBreak: 'break-all' }}>
                    {tx.description || 'Withdrawal request'}
                  </span>
                  <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginTop: '4px', wordBreak: 'break-all' }}>
                    Withdrawal ID: {tx._id}
                  </span>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '4px' }}>
                    {new Date(tx.createdAt).toLocaleString()}
                  </span>
                  {tx.rejectionReason && (
                    <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: 600, display: 'block', marginTop: '4px' }}>
                      Reason: {tx.rejectionReason}
                    </span>
                  )}
                </div>
                <div>
                  <span style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    background: tx.status === 'completed' ? '#d1fae5' : tx.status === 'failed' ? '#fee2e2' : '#fef3c7',
                    color: tx.status === 'completed' ? '#065f46' : tx.status === 'failed' ? '#991b1b' : '#92400e'
                  }}>
                    {tx.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default WithdrawHistory;
