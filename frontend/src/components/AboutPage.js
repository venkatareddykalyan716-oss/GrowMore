import React from 'react';
import { useNavigate } from 'react-router-dom';

const AboutPage = () => {
  const navigate = useNavigate();

  return (
    <div className="about-root" style={{ minHeight: '100vh', background: '#f8fafc', color: '#1e293b', paddingBottom: '40px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
        
        .about-root * {
          font-family: 'Poppins', sans-serif !important;
        }

        .instruction-card {
          background: white;
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 8px 30px rgba(0,0,0,0.02);
          border: 1px solid #e2e8f0;
          margin-bottom: 20px;
        }

        .step-badge {
          background: #16a34a;
          color: white;
          font-size: 11px;
          font-weight: 800;
          padding: 4px 10px;
          border-radius: 20px;
          display: inline-block;
          margin-bottom: 12px;
        }
      `}</style>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)', color: 'white', padding: '24px 16px', position: 'relative', textAlign: 'center', boxShadow: '0 4px 15px rgba(22, 163, 74, 0.2)' }}>
        <button 
          onClick={() => navigate('/dashboard')} 
          style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.15)', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '20px', cursor: 'pointer', fontWeight: 700, fontSize: '12px', backdropFilter: 'blur(5px)' }}
        >
          ← Back
        </button>
        <span style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '0.5px' }}>About GrowMore</span>
      </div>

      {/* Main Container */}
      <main style={{ maxWidth: '520px', margin: '-16px auto 0', padding: '0 16px', zIndex: 5, position: 'relative' }}>
        
        {/* Intro Card */}
        <div className="instruction-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '30px 20px' }}>
          <span style={{ fontSize: '64px' }}>🌱</span>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#16a34a', margin: '12px 0 4px 0' }}>GrowMore</h2>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '16px' }}>Grow Today, Greater Tomorrow</span>
          <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: 1.6 }}>
            Welcome to <strong>GrowMore</strong>, a premier investment and digital reward ecosystem built to help you grow your wealth securely and efficiently. Below is a comprehensive guide to maximizing your earnings.
          </p>
        </div>

        {/* 💡 How to Get Started Section */}
        <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: '24px 0 14px 4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          💡 Complete Platform Guide & Instructions
        </h3>

        {/* Step 1 */}
        <div className="instruction-card">
          <span className="step-badge">Product Purchase</span>
          <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: 800, color: '#1e293b' }}>1. Buying Yield-Generating Products</h4>
          <p style={{ margin: 0, fontSize: '12.5px', color: '#475569', lineHeight: 1.6 }}>
            Navigate to the <strong>Product</strong> tab to explore available assets. Choose a product and complete the purchase. Each product has a defined duration and generates steady daily rewards credited to your wallet balance.
          </p>
        </div>

        {/* Step 2 */}
        <div className="instruction-card">
          <span className="step-badge">Daily Income Claim</span>
          <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: 800, color: '#1e293b' }}>2. Making Daily Yield Claims</h4>
          <p style={{ margin: 0, fontSize: '12.5px', color: '#475569', lineHeight: 1.6 }}>
            You must log in to the GrowMore dashboard every day to claim your product yield. Remember: <strong>unclaimed days are skipped and marked as missed (₹0.00)</strong>, so make sure to claim your daily rewards on time!
          </p>
        </div>

        {/* Step 3 */}
        <div className="instruction-card">
          <span className="step-badge">Milestone Tasks</span>
          <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: 800, color: '#1e293b' }}>3. Inviting Active Referrals</h4>
          <p style={{ margin: 0, fontSize: '12.5px', color: '#475569', lineHeight: 1.6 }}>
            Visit the <strong>Task</strong> page to check milestone rewards. When your invitees register using your link and purchase at least one active product, they become an Active Member. Reach referral milestones to unlock cash rewards (up to ₹12,000)!
          </p>
        </div>

        {/* Step 4 */}
        <div className="instruction-card">
          <span className="step-badge">Wallet Recharge</span>
          <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: 800, color: '#1e293b' }}>4. Instant UPI Wallet Deposits</h4>
          <p style={{ margin: 0, fontSize: '12.5px', color: '#475569', lineHeight: 1.6 }}>
            Depositing funds is fast and simple. Input your amount, select an app like PhonePe, Paytm, or GPay to pay, and submit the 12-digit transaction ID along with the payment receipt screenshot. Your deposit will be reviewed and credited securely.
          </p>
        </div>

        {/* Step 5 */}
        <div className="instruction-card">
          <span className="step-badge">Earnings Withdrawal</span>
          <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: 800, color: '#1e293b' }}>5. Direct-to-Bank Withdrawals</h4>
          <p style={{ margin: 0, fontSize: '12.5px', color: '#475569', lineHeight: 1.6 }}>
            Once you have accumulated withdrawable earnings, link your bank details securely under "My bank account" in your profile and request a withdrawal. Verified payouts are processed quickly to your bank account.
          </p>
        </div>

        {/* Risk Disclaimer */}
        <div className="instruction-card" style={{ background: '#fef2f2', border: '1px solid #fecaca', borderLeft: '5px solid #ef4444', marginBottom: '20px' }}>
          <span className="step-badge" style={{ background: '#ef4444' }}>Capital Risk Warning</span>
          <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: 800, color: '#991b1b' }}>Financial & Loss Disclaimer</h4>
          <p style={{ margin: 0, fontSize: '12px', color: '#7f1d1d', lineHeight: 1.6, fontWeight: 500 }}>
            Digital asset investments are subject to market risks. GrowMore does not offer guaranteed returns on lost capital, and the company is not liable for any financial losses or damages incurred. Please invest responsibly.
          </p>
        </div>

        {/* Bottom Banner */}
        <div style={{ background: '#f0fdf4', borderRadius: '16px', padding: '16px', border: '1px solid rgba(22, 163, 74, 0.15)', textAlign: 'center', marginTop: '24px' }}>
          <strong style={{ fontSize: '12px', color: '#16a34a', display: 'block' }}>Thank you for choosing GrowMore to build your financial future!</strong>
        </div>

      </main>
    </div>
  );
};

export default AboutPage;
