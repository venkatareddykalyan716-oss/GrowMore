import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:5000/api';

function ButtonSpecificIcon({ name = '', size = 16, color = '#15803d', style = {} }) {
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
    style: { display: 'inline-block', verticalAlign: 'middle', marginRight: '6px', ...style }
  };

  const drawPaths = () => {
    switch (normName) {
      case 'home':
      case 'app':
        return [
          React.createElement('path', { key: 'p1', d: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' }),
          React.createElement('polyline', { key: 'p2', points: '9 22 9 12 15 12 15 22' })
        ];
      case 'invite':
        return [
          React.createElement('path', { key: 'p1', d: 'M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' }),
          React.createElement('circle', { key: 'p2', cx: '8.5', cy: '7', r: '4' }),
          React.createElement('line', { key: 'p3', x1: '20', y1: '8', x2: '20', y2: '14' }),
          React.createElement('line', { key: 'p4', x1: '23', y1: '11', x2: '17', y2: '11' })
        ];
      case 'bonus':
        return [
          React.createElement('polyline', { key: 'p1', points: '20 12 20 22 4 22 4 12' }),
          React.createElement('rect', { key: 'p2', x: '2', y: '7', width: '20', height: '5' }),
          React.createElement('line', { key: 'p3', x1: '12', y1: '22', x2: '12', y2: '7' }),
          React.createElement('path', { key: 'p4', d: 'M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z' }),
          React.createElement('path', { key: 'p5', d: 'M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z' })
        ];
      case 'services':
        return [
          React.createElement('rect', { key: 'p1', x: '3', y: '3', width: '7', height: '7' }),
          React.createElement('rect', { key: 'p2', x: '14', y: '3', width: '7', height: '7' }),
          React.createElement('rect', { key: 'p3', x: '14', y: '14', width: '7', height: '7' }),
          React.createElement('rect', { key: 'p4', x: '3', y: '14', width: '7', height: '7' })
        ];
      case 'myproduct':
      case 'myproducts':
      case 'product':
        return [
          React.createElement('line', { key: 'p1', x1: '16.5', y1: '9.4', x2: '7.5', y2: '4.21' }),
          React.createElement('polygon', { key: 'p2', points: '12 22.08 12 12 3 6.92 3 17.08 12 22.08' }),
          React.createElement('polygon', { key: 'p3', points: '12 12 21 6.92 21 17.08 12 22.08 12 12' }),
          React.createElement('polygon', { key: 'p4', points: '12 2 21 6.92 12 12 3 6.92 12 2' }),
          React.createElement('line', { key: 'p5', x1: '12', y1: '22.08', x2: '12', y2: '12' })
        ];
      case 'recharge':
        return [
          React.createElement('rect', { key: 'p1', x: '1', y: '4', width: '22', height: '16', rx: '2', ry: '2' }),
          React.createElement('line', { key: 'p2', x1: '1', y1: '10', x2: '23', y2: '10' }),
          React.createElement('line', { key: 'p3', x1: '7', y1: '15', x2: '11', y2: '15' })
        ];
      case 'withdraw':
        return [
          React.createElement('line', { key: 'p1', x1: '12', y1: '1', x2: '12', y2: '23' }),
          React.createElement('path', { key: 'p2', d: 'M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' })
        ];
      case 'task':
      case 'tasks':
        return [
          React.createElement('path', { key: 'p1', d: 'M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2' }),
          React.createElement('rect', { key: 'p2', x: '8', y: '2', width: '8', height: '4', rx: '1', ry: '1' }),
          React.createElement('polyline', { key: 'p3', points: '9 11 12 14 22 4' })
        ];
      case 'plans':
        return [
          React.createElement('line', { key: 'p1', x1: '18', y1: '20', x2: '18', y2: '10' }),
          React.createElement('line', { key: 'p2', x1: '12', y1: '20', x2: '12', y2: '4' }),
          React.createElement('line', { key: 'p3', x1: '6', y1: '20', x2: '6', y2: '14' })
        ];
      case 'myteam':
      case 'team':
        return [
          React.createElement('path', { key: 'p1', d: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' }),
          React.createElement('circle', { key: 'p2', cx: '9', cy: '7', r: '4' }),
          React.createElement('path', { key: 'p3', d: 'M23 21v-2a4 4 0 0 0-3-3.87' }),
          React.createElement('path', { key: 'p4', d: 'M16 3.13a4 4 0 0 1 0 7.75' })
        ];
      case 'settings':
        return [
          React.createElement('circle', { key: 'p1', cx: '12', cy: '12', r: '3' }),
          React.createElement('path', { key: 'p2', d: 'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z' })
        ];
      case 'leaderboard':
        return [
          React.createElement('path', { key: 'p1', d: 'M6 9H4.5a2.5 2.5 0 0 1 0-5H6' }),
          React.createElement('path', { key: 'p2', d: 'M18 9h1.5a2.5 2.5 0 0 0 0-5H18' }),
          React.createElement('path', { key: 'p3', d: 'M4 22h16' }),
          React.createElement('path', { key: 'p4', d: 'M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34' }),
          React.createElement('path', { key: 'p5', d: 'M12 2a4 4 0 0 1 4 4v6H8V6a4 4 0 0 1 4-4z' })
        ];
      case 'support':
        return [
          React.createElement('path', { key: 'p1', d: 'M3 18v-6a9 9 0 0 1 18 0v6' }),
          React.createElement('path', { key: 'p2', d: 'M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z' })
        ];
      case 'market':
        return [
          React.createElement('circle', { key: 'p1', cx: 9, cy: 21, r: 1 }),
          React.createElement('circle', { key: 'p2', cx: 20, cy: 21, r: 1 }),
          React.createElement('path', { key: 'p3', d: 'M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6' })
        ];
      case 'my':
      case 'profile':
        return [
          React.createElement('path', { key: 'p1', d: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' }),
          React.createElement('circle', { key: 'p2', cx: 12, cy: 7, r: 4 })
        ];
      default:
        return [
          React.createElement('circle', { key: 'p1', cx: '12', cy: '12', r: '10' })
        ];
    }
  };

  return React.createElement('svg', iconProps, ...drawPaths());
}

function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({ totalEarnings: 0, availableBalance: 0, directReferrals: 0, totalTeam: 0, referralCode: '' });
  const [loading, setStatsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = sessionStorage.getItem('gm_token');
        const res = await fetch(API_URL + '/auth/dashboard', {
          headers: { 'Authorization': 'Bearer ' + token }
        });
        const data = await res.json();
        if (data.success) setStats(data.stats);
      } catch (err) {
        console.log('Error:', err);
      }
      setStatsLoading(false);
    };
    loadData();
  }, []);

  const shareLink = window.location.origin + '/register?inviteCode=' + stats.referralCode;

  if (loading) {
    return React.createElement('div', { style: { padding: '50px', textAlign: 'center' } },
      React.createElement('h2', null, 'Loading GrowMore...')
    );
  }

  return React.createElement('div', { className: 'dashboard-root', style: { minHeight: '100vh', background: 'linear-gradient(to bottom, #f0fdf4 0%, #f4fbf7 50%, #ffffff 100%)', padding: '24px 20px', fontFamily: 'Arial' } },
    React.createElement('style', null, `
      @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
      .dashboard-root * {
        font-family: 'Poppins', sans-serif !important;
      }
      .action-card {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
      }
      .action-card:hover {
        transform: translateY(-4px) !important;
        box-shadow: 0 10px 25px rgba(22, 163, 74, 0.12) !important;
      }
      .action-card-primary:hover {
        box-shadow: 0 10px 25px rgba(22, 163, 74, 0.35) !important;
      }
      .logout-btn {
        transition: all 0.2s ease;
      }
      .logout-btn:hover {
        background: #dc2626 !important;
        transform: translateY(-1px);
      }
      .stat-card-pc {
        transition: all 0.3s ease;
      }
      .stat-card-pc:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 25px rgba(0,0,0,0.05) !important;
      }
    `),

    // HEADER
    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '900px', margin: '0 auto 24px', padding: '18px 24px', background: 'white', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.03)', border: '1px solid rgba(226, 237, 207, 0.4)' } },
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '12px' } },
        React.createElement('div', { style: { fontSize: '32px', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.05))' } }, '🌱'),
        React.createElement('div', null,
          React.createElement('h1', { style: { color: '#15803d', margin: 0, fontSize: '22px', fontWeight: 800, letterSpacing: '0.5px' } }, 'GrowMore')
        )
      ),
      React.createElement('div', { style: { display: 'flex', gap: '10px' } },
        user?.role === 'admin' && React.createElement('button', { onClick: () => navigate('/admin'), style: { background: '#fbbf24', color: '#1e293b', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', boxShadow: '0 4px 12px rgba(251, 191, 36, 0.3)' } }, '👑 Admin Panel'),
        React.createElement('button', { className: 'logout-btn', onClick: () => { logout(); navigate('/login'); }, style: { background: '#ef4444', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)' } }, 'Logout')
      )
    ),

    // MAIN CARD
    React.createElement('div', { style: { maxWidth: '900px', margin: '0 auto', background: 'white', borderRadius: '24px', padding: '30px', boxShadow: '0 15px 45px rgba(0,0,0,0.02)', border: '1px solid rgba(226, 237, 207, 0.3)' } },

      // Welcome
      React.createElement('div', { style: { background: 'linear-gradient(135deg, #0c2712 0%, #174221 50%, #255a30 100%)', color: 'white', padding: '26px 30px', borderRadius: '16px', marginBottom: '28px', boxShadow: '0 12px 35px rgba(23, 66, 33, 0.25)', border: '1px solid rgba(255,255,255,0.08)', position: 'relative', overflow: 'hidden' } },
        React.createElement('div', { style: { position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(74, 187, 29, 0.15)', filter: 'blur(30px)' } }),
        React.createElement('h2', { style: { margin: '0 0 6px 0', fontSize: '24px', fontWeight: 700, zIndex: 1, position: 'relative' } }, 'Welcome back, ' + (user?.fullName || 'Member') + '! 🌱'),
        React.createElement('p', { style: { margin: 0, opacity: 0.85, fontSize: '14px', zIndex: 1, position: 'relative' } }, 'Phone: ' + (user?.countryCode || '') + ' ' + (user?.phone || ''))
      ),

      // Stats
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' } },
        [
          { label: 'Total Earnings', value: '₹' + stats.totalEarnings, color: '#f59e0b', bg: '#fffcf2', emoji: '💰' },
          { label: 'Balance', value: '₹' + stats.availableBalance, color: '#10b981', bg: '#f2fbf7', emoji: '💵' },
          { label: 'Referrals', value: stats.directReferrals, color: '#3b82f6', bg: '#f2f7fb', emoji: '' },
          { label: 'Team', value: stats.totalTeam, color: '#8b5cf6', bg: '#f7f2fb', emoji: '🌐' }
        ].map((item, i) =>
          React.createElement('div', { key: i, className: 'stat-card-pc', style: { background: item.bg, padding: '20px 16px', borderRadius: '14px', borderLeft: `5px solid ${item.color}`, border: `1px solid rgba(0,0,0,0.02)`, borderLeftColor: item.color, boxShadow: '0 6px 15px rgba(0,0,0,0.01)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '100px' } },
            React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' } },
              React.createElement('span', { style: { fontSize: '13px', color: '#64748b', fontWeight: 500 } }, item.label),
              React.createElement('span', { style: { fontSize: '20px' } }, item.emoji)
            ),
            React.createElement('p', { style: { margin: 0, fontSize: '20px', fontWeight: 800, color: '#1e293b' } }, item.value)
          )
        )
      ),

      // Referral Code
      React.createElement('div', { style: { background: '#f0fdf4', padding: '20px', borderRadius: '16px', marginBottom: '28px', border: '2px dashed #16a34a' } },
        React.createElement('p', { style: { margin: '0 0 4px 0', fontWeight: 800, color: '#15803d', fontSize: '15px' } }, '🎯 Your Invite Code'),
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '12px', background: 'white', padding: '10px 16px', borderRadius: '8px', border: '1px solid rgba(22, 163, 74, 0.15)', marginTop: '8px' } },
          React.createElement('span', { style: { flex: 1, fontWeight: 800, color: '#047857', fontSize: '18px' } }, stats.referralCode),
          React.createElement('button', { onClick: () => { navigator.clipboard.writeText(shareLink); alert('Link copied!'); }, style: { background: '#16a34a', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, fontSize: '13px', boxShadow: '0 4px 12px rgba(22, 163, 74, 0.2)' } }, '📋 Copy Link')
        )
      ),

      // ✅ QUICK ACTIONS - 8 BUTTONS!
      React.createElement('h3', { style: { color: '#1f2937', marginBottom: '16px', fontWeight: 700, fontSize: '18px' } }, '⚡ Quick Actions'),
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '28px' } },
        React.createElement('button', { className: 'action-card action-card-primary', onClick: () => navigate('/plans'), style: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'linear-gradient(135deg, #16a34a, #22c55e)', color: 'white', border: 'none', padding: '16px 8px', borderRadius: '12px', cursor: 'pointer', fontWeight: 700, fontSize: '13px', boxShadow: '0 6px 15px rgba(22, 163, 74, 0.2)' } },
          React.createElement(ButtonSpecificIcon, { name: 'plans', size: 16, color: 'white' }),
          '💰 Plans'
        ),
        React.createElement('button', { className: 'action-card', onClick: () => { navigator.clipboard.writeText(shareLink); alert('Link copied!'); }, style: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'white', border: '2px solid #3b82f6', color: '#3b82f6', padding: '16px 8px', borderRadius: '12px', cursor: 'pointer', fontWeight: 700, fontSize: '13px', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' } },
          React.createElement(ButtonSpecificIcon, { name: 'invite', size: 16, color: '#3b82f6' }),
          '📧 Invite'
        ),
        React.createElement('button', { className: 'action-card', onClick: () => alert('Daily Bonus!'), style: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'white', border: '2px solid #f59e0b', color: '#f59e0b', padding: '16px 8px', borderRadius: '12px', cursor: 'pointer', fontWeight: 700, fontSize: '13px', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' } },
          React.createElement(ButtonSpecificIcon, { name: 'bonus', size: 16, color: '#f59e0b' }),
          '🎁 Bonus'
        ),
        React.createElement('button', { className: 'action-card', onClick: () => alert('Services'), style: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'white', border: '2px solid #8b5cf6', color: '#8b5cf6', padding: '16px 8px', borderRadius: '12px', cursor: 'pointer', fontWeight: 700, fontSize: '13px', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' } },
          React.createElement(ButtonSpecificIcon, { name: 'services', size: 16, color: '#8b5cf6' }),
          '🛍️ Services'
        ),
        React.createElement('button', { className: 'action-card', onClick: () => alert('My Products'), style: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'white', border: '2px solid #06b6d4', color: '#06b6d4', padding: '16px 8px', borderRadius: '12px', cursor: 'pointer', fontWeight: 700, fontSize: '13px', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' } },
          React.createElement(ButtonSpecificIcon, { name: 'myproduct', size: 16, color: '#06b6d4' }),
          '📦 My Product'
        ),
        React.createElement('button', { className: 'action-card', onClick: () => navigate('/recharge'), style: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'white', border: '2px solid #ec4899', color: '#ec4899', padding: '16px 8px', borderRadius: '12px', cursor: 'pointer', fontWeight: 700, fontSize: '13px', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' } },
          React.createElement(ButtonSpecificIcon, { name: 'recharge', size: 16, color: '#ec4899' }),
          '💳 Recharge'
        ),
        React.createElement('button', { className: 'action-card', onClick: () => navigate('/withdraw'), style: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'white', border: '2px solid #dc2626', color: '#dc2626', padding: '16px 8px', borderRadius: '12px', cursor: 'pointer', fontWeight: 700, fontSize: '13px', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' } },
          React.createElement(ButtonSpecificIcon, { name: 'withdraw', size: 16, color: '#dc2626' }),
          '💸 Withdraw'
        ),
        React.createElement('button', { className: 'action-card', onClick: () => alert('Tasks'), style: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'white', border: '2px solid #10b981', color: '#10b981', padding: '16px 8px', borderRadius: '12px', cursor: 'pointer', fontWeight: 700, fontSize: '13px', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' } },
          React.createElement(ButtonSpecificIcon, { name: 'task', size: 16, color: '#10b981' }),
          '📋 Task'
        )
      ),

      // More Services
      React.createElement('h3', { style: { color: '#1f2937', marginBottom: '16px', fontWeight: 700, fontSize: '18px' } }, '🌟 More Services'),
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' } },
        React.createElement('button', { className: 'action-card', onClick: () => alert('Team'), style: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'white', border: '2px solid #e5e7eb', color: '#475569', padding: '16px 8px', borderRadius: '12px', cursor: 'pointer', fontWeight: 700, fontSize: '13px', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' } },
          React.createElement(ButtonSpecificIcon, { name: 'team', size: 16, color: '#16a34a' }),
          'My Team'
        ),
        React.createElement('button', { className: 'action-card', onClick: () => alert('Settings'), style: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'white', border: '2px solid #e5e7eb', color: '#475569', padding: '16px 8px', borderRadius: '12px', cursor: 'pointer', fontWeight: 700, fontSize: '13px', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' } },
          React.createElement(ButtonSpecificIcon, { name: 'settings', size: 16, color: '#16a34a' }),
          '⚙️ Settings'
        ),
        React.createElement('button', { className: 'action-card', onClick: () => alert('Leaderboard'), style: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'white', border: '2px solid #e5e7eb', color: '#475569', padding: '16px 8px', borderRadius: '12px', cursor: 'pointer', fontWeight: 700, fontSize: '13px', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' } },
          React.createElement(ButtonSpecificIcon, { name: 'leaderboard', size: 16, color: '#16a34a' }),
          '🏆 Leaderboard'
        ),
        React.createElement('button', { className: 'action-card', onClick: () => alert('Support'), style: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'white', border: '2px solid #e5e7eb', color: '#475569', padding: '16px 8px', borderRadius: '12px', cursor: 'pointer', fontWeight: 700, fontSize: '13px', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' } },
          React.createElement(ButtonSpecificIcon, { name: 'support', size: 16, color: '#16a34a' }),
          '📞 Support'
        )
      )
    )
  );
}

export default Dashboard;
