import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5005/api';

// ─── SVG Sparklines ────────────────────────────────────────────────────────
const Sparkline = ({ data = [], color = '#16a34a', height = 30 }) => {
  if (data.length === 0) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((val, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width="100%" height={height} style={{ overflow: 'visible' }}>
      <polyline fill="none" stroke={color} strokeWidth="2" points={points} />
    </svg>
  );
};

// ─── Custom Responsive Line Area Chart ──────────────────────────────────────
const PremiumAreaChart = ({ dataPoints, color = '#16a34a', fillOpacity = '0.15' }) => {
  const height = 150;
  const width = 500;
  const max = Math.max(...dataPoints) * 1.1 || 100;
  const min = 0;
  const range = max - min;

  const points = dataPoints.map((val, i) => {
    const x = (i / (dataPoints.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return { x, y };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={fillOpacity} />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#grad-${color.replace('#', '')})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

// ─── Custom Bar Chart ────────────────────────────────────────────────────────
const PremiumBarChart = ({ datasets, labels }) => {
  const maxVal = Math.max(...datasets.flat()) * 1.1 || 100;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', flex: 1, alignItems: 'flex-end', gap: '15px', minHeight: '140px', paddingBottom: '10px' }}>
        {labels.map((label, idx) => (
          <div key={label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', width: '100%', height: '120px', justifyContent: 'center' }}>
              {datasets.map((dataset, dIdx) => {
                const val = dataset[idx];
                const heightPct = (val / maxVal) * 100;
                return (
                  <div
                    key={dIdx}
                    style={{
                      width: '12px',
                      height: `${heightPct}%`,
                      background: dIdx === 0 ? 'linear-gradient(to top, #16a34a, #22c55e)' : 'linear-gradient(to top, #ef4444, #f87171)',
                      borderRadius: '6px 6px 0 0',
                      transition: 'height 0.4s ease',
                      boxShadow: dIdx === 0 ? '0 4px 10px rgba(22, 163, 74, 0.2)' : '0 4px 10px rgba(239, 68, 68, 0.2)'
                    }}
                    title={`₹ ${val}`}
                  />
                );
              })}
            </div>
            <span style={{ fontSize: '10px', fontWeight: 600, color: '#94a3b8' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Custom Donut Chart ──────────────────────────────────────────────────────
const PremiumDonutChart = ({ segments }) => {
  const radius = 35;
  const strokeWidth = 14;
  const circ = 2 * Math.PI * radius;
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;

  let accumulatedPercent = 0;

  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ maxHeight: '180px' }}>
      <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth} />
      {segments.map((seg, idx) => {
        const strokeLength = (seg.value / total) * circ;
        const strokeOffset = circ - strokeLength + (accumulatedPercent / 100) * circ;
        accumulatedPercent += (seg.value / total) * 100;

        return (
          <circle
            key={idx}
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={seg.color}
            strokeWidth={strokeWidth}
            strokeDasharray={circ}
            strokeDashoffset={strokeOffset}
            transform="rotate(-90 50 50)"
            style={{ transition: 'stroke-dashoffset 0.5s ease', strokeLinecap: 'round' }}
          />
        );
      })}
      <circle cx="50" cy="50" r="25" fill="#0f172a" />
    </svg>
  );
};

// Promotion milestone rewards history logs component for Admin Panel
const PromotionRewardsPanel = ({ darkMode, rewards = [] }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRewards = rewards.filter(r => {
    const q = searchQuery.toLowerCase();
    return (
      (r.userId?.fullName && r.userId.fullName.toLowerCase().includes(q)) ||
      (r.userId?.phone && r.userId.phone.includes(q)) ||
      (r.userId?._id && r.userId._id.toString().toLowerCase().includes(q)) ||
      (r.taskId?.taskTitle && r.taskId.taskTitle.toLowerCase().includes(q))
    );
  });

  const totalRewardsClaimed = rewards.length;
  const totalPayout = rewards.reduce((sum, r) => sum + (r.reward || 0), 0);

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '24px', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 6px 0' }}>Promotion Rewards Claims</h2>
          <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>Monitor and audit milestone payouts for active team builders.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <div style={{ background: darkMode ? 'rgba(255,255,255,0.03)' : 'white', border: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`, borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justify: 'center', fontSize: '24px' }}>🏆</div>
          <div>
            <h4 style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 600, margin: '0 0 4px 0' }}>Total Claims</h4>
            <p style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>{totalRewardsClaimed} claims</p>
          </div>
        </div>
        <div style={{ background: darkMode ? 'rgba(255,255,255,0.03)' : 'white', border: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`, borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justify: 'center', fontSize: '24px' }}>💰</div>
          <div>
            <h4 style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 600, margin: '0 0 4px 0' }}>Total Milestone Payouts</h4>
            <p style={{ fontSize: '22px', fontWeight: 800, margin: 0, color: '#16a34a' }}>₹{totalPayout.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div style={{ background: darkMode ? 'rgba(255,255,255,0.03)' : 'white', border: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`, borderRadius: '24px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.01)' }}>
        <div style={{ position: 'relative', width: '320px', marginBottom: '20px' }}>
          <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '14px' }}>🔍</span>
          <input 
            type="text" 
            placeholder="Search by name, phone, or task..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              background: darkMode ? '#0f172a' : '#f1f5f9',
              border: `1px solid ${darkMode ? '#334155' : '#cbd5e1'}`,
              borderRadius: '12px',
              padding: '10px 14px 10px 42px',
              color: 'inherit',
              fontSize: '13px',
              outline: 'none',
              fontFamily: 'inherit'
            }}
          />
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}` }}>
                <th style={{ padding: '16px 20px', fontSize: '12px', color: '#94a3b8', fontWeight: 700 }}>Member Info</th>
                <th style={{ padding: '16px 20px', fontSize: '12px', color: '#94a3b8', fontWeight: 700 }}>Task Completed</th>
                <th style={{ padding: '16px 20px', fontSize: '12px', color: '#94a3b8', fontWeight: 700 }}>Reward Amount</th>
                <th style={{ padding: '16px 20px', fontSize: '12px', color: '#94a3b8', fontWeight: 700 }}>Claim Date</th>
                <th style={{ padding: '16px 20px', fontSize: '12px', color: '#94a3b8', fontWeight: 700 }}>Wallet Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredRewards.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8' }}>
                    No promotion milestone claims found.
                  </td>
                </tr>
              ) : (
                filteredRewards.map((reward) => (
                  <tr key={reward._id} style={{ borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` }}>
                    <td style={{ padding: '16px 20px' }}>
                      <strong style={{ display: 'block', fontSize: '13px' }}>{reward.userId?.fullName || 'Deleted User'}</strong>
                      <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginTop: '2px' }}>Phone: {reward.userId?.phone || 'N/A'}</span>
                      <span style={{ fontSize: '10px', color: '#64748b', display: 'block', marginTop: '1px' }}>ID: {reward.userId?._id || 'N/A'}</span>
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '13px', fontWeight: 600 }}>{reward.taskId?.taskTitle || 'Unknown Task'}</td>
                    <td style={{ padding: '16px 20px', fontSize: '14px', fontWeight: 800, color: '#16a34a' }}>₹{reward.reward}</td>
                    <td style={{ padding: '16px 20px', fontSize: '12px', color: '#94a3b8' }}>{new Date(reward.createdAt).toLocaleString()}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        background: '#d1fae5',
                        color: '#065f46'
                      }}>
                        Credited
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Referral Settings and Adjustments Component for Admin Panel
const ReferralConfigPanel = ({ darkMode, users }) => {
  const [enabled, setEnabled] = useState(true);
  const [maxLevels, setMaxLevels] = useState(5);
  const [levels, setLevels] = useState([14, 8, 5, 3, 2]);
  const [topReferrers, setTopReferrers] = useState([]);
  const [selectedUserForAdjust, setSelectedUserForAdjust] = useState('');
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustDesc, setAdjustDesc] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);
  const [adjusting, setAdjusting] = useState(false);
  const [msg, setMsg] = useState('');

  const loadSettings = async () => {
    try {
      const token = localStorage.getItem('gm_token');
      const res = await axios.get(`${API_URL}/admin/referral/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setEnabled(res.data.settings.enabled);
        setMaxLevels(res.data.settings.maxLevels);
        setLevels(res.data.settings.levels || [14, 8, 5, 3, 2]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadTopReferrers = async () => {
    try {
      const token = localStorage.getItem('gm_token');
      const res = await axios.get(`${API_URL}/admin/referral/top`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setTopReferrers(res.data.topReferrers || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadSettings();
    loadTopReferrers();
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const token = localStorage.getItem('gm_token');
      await axios.post(`${API_URL}/admin/referral/settings/update`, {
        enabled,
        maxLevels,
        levels
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMsg('✅ Settings updated successfully!');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg('❌ Failed to update settings');
      setTimeout(() => setMsg(''), 3000);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleLevelPercentChange = (index, value) => {
    const updated = [...levels];
    updated[index] = Number(value) || 0;
    setLevels(updated);
  };

  const handleAdjustCommission = async (e) => {
    e.preventDefault();
    if (!selectedUserForAdjust || !adjustAmount) return;
    setAdjusting(true);
    try {
      const token = localStorage.getItem('gm_token');
      const res = await axios.post(`${API_URL}/admin/referral/adjust`, {
        userId: selectedUserForAdjust,
        amount: Number(adjustAmount),
        description: adjustDesc
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setMsg('✅ Commission adjusted successfully!');
        setAdjustAmount('');
        setAdjustDesc('');
        loadTopReferrers();
        setTimeout(() => setMsg(''), 3000);
      }
    } catch (err) {
      setMsg('❌ Adjustment failed');
      setTimeout(() => setMsg(''), 3000);
    } finally {
      setAdjusting(false);
    }
  };

  useEffect(() => {
    if (maxLevels > 0 && maxLevels !== levels.length) {
      const updated = [...levels];
      if (maxLevels > levels.length) {
        while (updated.length < maxLevels) updated.push(0);
      } else {
        updated.splice(maxLevels);
      }
      setLevels(updated);
    }
  }, [maxLevels]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 4px 0' }}>Referral System Settings</h2>
          <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>Configure levels, commission percentages, execute adjustments, and view top referrers.</p>
        </div>
      </div>

      {msg && (
        <div style={{ padding: '12px 16px', borderRadius: '10px', background: msg.startsWith('✅') ? 'rgba(22,163,74,0.12)' : 'rgba(239,68,68,0.12)', color: msg.startsWith('✅') ? '#16a34a' : '#ef4444', fontWeight: 600, fontSize: '13px' }}>
          {msg}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
        {/* Settings Grid */}
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '20px', border: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 20px 0', color: '#16a34a' }}>⚙️ Referral Config</h3>
          <form onSubmit={handleSaveSettings}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  id="referralEnabled"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#16a34a' }}
                />
                <label htmlFor="referralEnabled" style={{ fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Enable Referral Commissions</label>
              </div>

              <div>
                <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '6px', fontWeight: 600 }}>MAX COMMISSION HIERARCHY LEVELS</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={maxLevels}
                  onChange={(e) => setMaxLevels(Number(e.target.value))}
                  style={{ width: '100%', background: darkMode ? '#0f172a' : '#f1f5f9', border: `1px solid ${darkMode ? '#334155' : '#cbd5e1'}`, borderRadius: '10px', padding: '10px 14px', color: 'inherit', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '8px', fontWeight: 600 }}>COMMISSION PERCENTAGE PER LEVEL</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {levels.map((percent, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '12px', color: '#94a3b8', width: '60px' }}>Level {idx + 1}:</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={percent}
                        onChange={(e) => handleLevelPercentChange(idx, e.target.value)}
                        style={{ flex: 1, background: darkMode ? '#0f172a' : '#f1f5f9', border: `1px solid ${darkMode ? '#334155' : '#cbd5e1'}`, borderRadius: '8px', padding: '8px 12px', color: 'inherit', outline: 'none' }}
                      />
                      <span style={{ fontSize: '13px', fontWeight: 700 }}>%</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={savingSettings}
                style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', color: 'white', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', marginTop: '10px', boxShadow: '0 4px 15px rgba(22, 163, 74, 0.3)' }}
              >
                {savingSettings ? 'Saving...' : 'Save Configuration'}
              </button>
            </div>
          </form>
        </div>

        {/* Adjuster Tool */}
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '20px', border: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 20px 0', color: '#16a34a' }}>👛 Manual Commission Adjuster</h3>
          <form onSubmit={handleAdjustCommission}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '6px', fontWeight: 600 }}>SELECT USER</label>
                <select
                  required
                  value={selectedUserForAdjust}
                  onChange={(e) => setSelectedUserForAdjust(e.target.value)}
                  style={{ width: '100%', background: darkMode ? '#0f172a' : '#f1f5f9', border: `1px solid ${darkMode ? '#334155' : '#cbd5e1'}`, borderRadius: '10px', padding: '10px 14px', color: 'inherit', outline: 'none', cursor: 'pointer' }}
                >
                  <option value="">-- Select Member --</option>
                  {users.map(u => (
                    <option key={u._id} value={u._id}>{u.fullName || 'Member'} ({u.phone})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '6px', fontWeight: 600 }}>ADJUST AMOUNT (₹)</label>
                <input
                  type="number"
                  required
                  placeholder="Positive to credit (+), negative to debit (-)"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  style={{ width: '100%', background: darkMode ? '#0f172a' : '#f1f5f9', border: `1px solid ${darkMode ? '#334155' : '#cbd5e1'}`, borderRadius: '10px', padding: '10px 14px', color: 'inherit', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '6px', fontWeight: 600 }}>DESCRIPTION / MOTIVE</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Special Event Promotion Bonus"
                  value={adjustDesc}
                  onChange={(e) => setAdjustDesc(e.target.value)}
                  style={{ width: '100%', background: darkMode ? '#0f172a' : '#f1f5f9', border: `1px solid ${darkMode ? '#334155' : '#cbd5e1'}`, borderRadius: '10px', padding: '10px 14px', color: 'inherit', outline: 'none' }}
                />
              </div>

              <button
                type="submit"
                disabled={adjusting}
                style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: 'white', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', marginTop: '10px', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)' }}
              >
                {adjusting ? 'Processing...' : 'Apply Wallet Adjustment'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Top Referrers Report */}
      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '20px', border: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
        <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 16px 0', color: '#16a34a' }}>📈 Leaderboard: Top Referrers</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: `1.5px solid ${darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}` }}>
                <th style={{ padding: '12px', fontSize: '11px', color: '#94a3b8', fontWeight: 700 }}>RANK</th>
                <th style={{ padding: '12px', fontSize: '11px', color: '#94a3b8', fontWeight: 700 }}>LEADER NAME</th>
                <th style={{ padding: '12px', fontSize: '11px', color: '#94a3b8', fontWeight: 700 }}>PHONE NUMBER</th>
                <th style={{ padding: '12px', fontSize: '11px', color: '#94a3b8', fontWeight: 700 }}>INVITE CODE</th>
                <th style={{ padding: '12px', fontSize: '11px', color: '#94a3b8', fontWeight: 700 }}>DIRECT REFS</th>
                <th style={{ padding: '12px', fontSize: '11px', color: '#94a3b8', fontWeight: 700 }}>AVAILABLE BALANCE</th>
                <th style={{ padding: '12px', fontSize: '11px', color: '#94a3b8', fontWeight: 700 }}>LIFETIME EARNINGS</th>
              </tr>
            </thead>
            <tbody>
              {topReferrers.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>No active referrers found.</td>
                </tr>
              ) : (
                topReferrers.map((item, idx) => (
                  <tr key={item.id} style={{ borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}` }}>
                    <td style={{ padding: '12px', fontSize: '13px', fontWeight: 800, color: idx === 0 ? '#fbbf24' : idx === 1 ? '#94a3b8' : idx === 2 ? '#b45309' : 'inherit' }}>
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                    </td>
                    <td style={{ padding: '12px', fontSize: '13px', fontWeight: 600 }}>{item.fullName}</td>
                    <td style={{ padding: '12px', fontSize: '12px', color: '#94a3b8' }}>{item.phone}</td>
                    <td style={{ padding: '12px', fontSize: '12px', fontFamily: 'monospace', fontWeight: 700 }}>{item.referralCode}</td>
                    <td style={{ padding: '12px', fontSize: '13px', fontWeight: 700 }}>{item.directCount} members</td>
                    <td style={{ padding: '12px', fontSize: '13px', color: '#16a34a', fontWeight: 700 }}>₹{item.availableBalance}</td>
                    <td style={{ padding: '12px', fontSize: '13px', color: '#16a34a', fontWeight: 700 }}>₹{item.totalEarnings}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [plans, setPlans] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userSearch, setUserSearch] = useState('');
  const [txSearch, setTxSearch] = useState('');
  const [plansSearch, setPlansSearch] = useState('');
  const [investmentsSearch, setInvestmentsSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [darkMode, setDarkMode] = useState(true);

  // View withdrawal details state
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const [rejectionTxId, setRejectionTxId] = useState('');
  const [showFullAccount, setShowFullAccount] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  // Edit user state
  const [editBalance, setEditBalance] = useState('');
  const [editEarnings, setEditEarnings] = useState('');
  const [editStatus, setEditStatus] = useState(true);
  const [editRole, setEditRole] = useState('user');
  const [editPassword, setEditPassword] = useState('');
  const [updatingUser, setUpdatingUser] = useState(false);

  // Investment Plans states
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [planForm, setPlanForm] = useState({
    name: '', description: '', price: '', dailyIncome: '', duration: '',
    image: '🥤', category: 'juice', growthLevel: 'STARTER', totalSlots: '100',
    isActive: true, sharePower: '0', shareIncome: '0'
  });

  // Gift codes states
  const [giftCodes, setGiftCodes] = useState([]);
  const [giftStats, setGiftStats] = useState({
    totalCodes: 0, activeCodes: 0, expiredCodes: 0, totalRedemptions: 0, todaysRedemptions: 0, unusedCodes: 0, topRedeemedCode: 'N/A'
  });
  const [showGiftForm, setShowGiftForm] = useState(false);
  const [editingGift, setEditingGift] = useState(null);
  const [selectedGiftHistory, setSelectedGiftHistory] = useState(null);
  const [giftHistoryList, setGiftHistoryList] = useState([]);
  const [selectedClaimsLog, setSelectedClaimsLog] = useState(null);
  const [selectedPlanFilter, setSelectedPlanFilter] = useState('all');
  const [promotionRewards, setPromotionRewards] = useState([]);
  const [previewScreenshot, setPreviewScreenshot] = useState(null);
  const [giftForm, setGiftForm] = useState({
    code: '', rewardType: 'wallet_balance', rewardAmount: '', status: 'active',
    startDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0],
    maxRedemptions: '100', perUserLimit: '1', eligibleUsers: 'all', description: ''
  });

  const loadGiftCodes = async () => {
    try {
      const token = localStorage.getItem('gm_token');
      const res = await axios.get(`${API_URL}/gift/admin/gift-codes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setGiftCodes(res.data.giftCodes);
        setGiftStats(res.data.stats);
      }
    } catch (err) {
      console.error('Error fetching gift codes:', err);
    }
  };

  useEffect(() => {
    loadAdminData();
    loadGiftCodes();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('gm_token');
      const headers = { Authorization: `Bearer ${token}` };

      const [usersRes, txRes, plansRes, invRes, rewardsRes] = await Promise.all([
        axios.get(`${API_URL}/admin/users`, { headers }),
        axios.get(`${API_URL}/admin/transactions`, { headers }),
        axios.get(`${API_URL}/admin/plans`, { headers }),
        axios.get(`${API_URL}/admin/investments`, { headers }),
        axios.get(`${API_URL}/admin/promotion-rewards`, { headers }).catch(e => ({ data: { success: false } }))
      ]);

      if (usersRes.data.success) setUsers(usersRes.data.users);
      if (txRes.data.success) setTransactions(txRes.data.transactions);
      if (plansRes.data.success) setPlans(plansRes.data.plans);
      if (invRes.data.success) setInvestments(invRes.data.investments);
      if (rewardsRes && rewardsRes.data.success) setPromotionRewards(rewardsRes.data.rewards || []);
    } catch (err) {
      console.error('Error loading admin data:', err);
      setMessage('❌ Failed to load admin data. Access denied.');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlan = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('gm_token');
      const headers = { Authorization: `Bearer ${token}` };
      const url = editingPlan 
        ? `${API_URL}/admin/plan/update/${editingPlan._id}`
        : `${API_URL}/admin/plan/create`;
      const method = editingPlan ? 'put' : 'post';

      const res = await axios[method](url, {
        ...planForm,
        price: Number(planForm.price),
        dailyIncome: Number(planForm.dailyIncome),
        duration: Number(planForm.duration),
        totalSlots: Number(planForm.totalSlots),
        sharePower: Number(planForm.sharePower),
        shareIncome: Number(planForm.shareIncome)
      }, { headers });

      if (res.data.success) {
        setMessage(`✅ Plan ${editingPlan ? 'Updated' : 'Created'} successfully!`);
        setShowPlanForm(false);
        setEditingPlan(null);
        loadAdminData();
        // Reset Form
        setPlanForm({
          name: '', description: '', price: '', dailyIncome: '', duration: '',
          image: '🥤', category: 'juice', growthLevel: 'STARTER', totalSlots: '100',
          isActive: true, sharePower: '0', shareIncome: '0'
        });
      }
    } catch (err) {
      setMessage('❌ Failed to save plan: ' + (err.response?.data?.message || err.message));
    }
    setTimeout(() => setMessage(''), 4000);
  };

  const handleDeletePlan = async (id) => {
    if (!window.confirm('Are you sure you want to delete this investment plan?')) return;
    try {
      const token = localStorage.getItem('gm_token');
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.delete(`${API_URL}/admin/plan/delete/${id}`, { headers });
      if (res.data.success) {
        setMessage('🗑️ Plan deleted successfully!');
        loadAdminData();
      }
    } catch (err) {
      setMessage('❌ Failed to delete plan');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const handleProcessTx = async (transactionId, status) => {
    try {
      const token = localStorage.getItem('gm_token');
      const res = await axios.post(`${API_URL}/admin/transaction/process`, {
        transactionId,
        status
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setMessage(`✅ Request ${status === 'completed' ? 'Approved' : 'Rejected'}!`);
        loadAdminData();
      }
    } catch (err) {
      setMessage('❌ Failed to process transaction');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const handleViewWithdrawDetails = async (withdrawalId) => {
    setLoadingDetails(true);
    try {
      const token = localStorage.getItem('gm_token');
      const res = await axios.get(`${API_URL}/admin/withdrawals/${withdrawalId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setSelectedWithdrawal(res.data);
        setShowFullAccount(false);
      } else {
        setMessage('❌ Failed to fetch details');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      console.error(err);
      setMessage('❌ Failed to fetch details');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleOpenReject = (txId) => {
    setRejectionTxId(txId);
    setRejectionReasonInput('');
    setShowRejectionForm(true);
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectionReasonInput.trim()) return;
    try {
      const token = localStorage.getItem('gm_token');
      const res = await axios.post(`${API_URL}/admin/transaction/process`, {
        transactionId: rejectionTxId,
        status: 'failed',
        rejectionReason: rejectionReasonInput.trim()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setMessage('❌ Withdrawal Rejected successfully!');
        setSelectedWithdrawal(null);
        setShowRejectionForm(false);
        loadAdminData();
      }
    } catch (err) {
      setMessage('❌ Failed to reject transaction');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const handleApproveFromModal = async (txId) => {
    await handleProcessTx(txId, 'completed');
    setSelectedWithdrawal(null);
  };

  const handleOpenEditUser = (user) => {
    setSelectedUser(user);
    setEditBalance(user.availableBalance.toString());
    setEditEarnings(user.totalEarnings.toString());
    setEditStatus(user.isActive);
    setEditRole(user.role || 'user');
    setEditPassword('');
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    setUpdatingUser(true);
    try {
      const token = localStorage.getItem('gm_token');
      const updateData = {
        userId: selectedUser._id,
        availableBalance: Number(editBalance),
        totalEarnings: Number(editEarnings),
        isActive: editStatus,
        role: editRole
      };
      if (editPassword.trim()) {
        updateData.password = editPassword.trim();
      }
      const res = await axios.post(`${API_URL}/admin/user/update`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setMessage('✅ User updated successfully!');
        setSelectedUser(null);
        loadAdminData();
      }
    } catch (err) {
      setMessage('❌ Failed to update user');
    } finally {
      setUpdatingUser(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    if (!window.confirm(`⚠️ Are you sure you want to permanently delete user ${selectedUser.phone}?\nThis will delete the user and all associated records (transactions, bank details, withdrawals, etc.). This action CANNOT be undone.`)) {
      return;
    }
    setUpdatingUser(true);
    try {
      const token = localStorage.getItem('gm_token');
      const res = await axios.delete(`${API_URL}/admin/user/delete/${selectedUser._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setMessage('🗑️ User deleted successfully!');
        setSelectedUser(null);
        loadAdminData();
      }
    } catch (err) {
      setMessage('❌ Failed to delete user: ' + (err.response?.data?.message || err.message));
    } finally {
      setUpdatingUser(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleSaveGiftCode = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('gm_token');
      const url = editingGift 
        ? `${API_URL}/gift/admin/gift-codes/${editingGift._id}`
        : `${API_URL}/gift/admin/gift-codes`;
      const method = editingGift ? 'put' : 'post';

      const res = await axios[method](url, giftForm, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setMessage(`✅ Gift Code ${editingGift ? 'Updated' : 'Created'} successfully!`);
        setShowGiftForm(false);
        setEditingGift(null);
        loadGiftCodes();
        // Reset form
        setGiftForm({
          code: '', rewardType: 'wallet_balance', rewardAmount: '', status: 'active',
          startDate: new Date().toISOString().split('T')[0],
          expiryDate: new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0],
          maxRedemptions: '100', perUserLimit: '1', eligibleUsers: 'all', description: ''
        });
      }
    } catch (err) {
      setMessage('❌ Failed to save gift code: ' + (err.response?.data?.message || err.message));
    }
    setTimeout(() => setMessage(''), 4000);
  };

  const handleDeleteGiftCode = async (id) => {
    if (!window.confirm('Are you sure you want to delete this gift code and all its redemption records?')) return;
    try {
      const token = localStorage.getItem('gm_token');
      const res = await axios.delete(`${API_URL}/gift/admin/gift-codes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setMessage('🗑️ Gift code deleted successfully!');
        loadGiftCodes();
      }
    } catch (err) {
      setMessage('❌ Failed to delete gift code');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const handleViewGiftHistory = async (gift) => {
    setSelectedGiftHistory(gift);
    try {
      const token = localStorage.getItem('gm_token');
      const res = await axios.get(`${API_URL}/gift/admin/gift-codes/${gift._id}/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setGiftHistoryList(res.data.history);
      }
    } catch (err) {
      console.error('Error fetching history logs:', err);
    }
  };

  const handleGenerateRandomCode = () => {
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    setGiftForm(prev => ({ ...prev, code: `GM-${randomStr}` }));
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setMessage('📋 Code copied to clipboard!');
    setTimeout(() => setMessage(''), 2000);
  };

  const handleExportGiftCodes = () => {
    const headers = ['Code', 'Reward Type', 'Amount', 'Status', 'Expiry', 'Claims', 'Limit'];
    const rows = giftCodes.map(c => [
      c.code, c.rewardType, c.rewardAmount, c.status, new Date(c.expiryDate).toLocaleDateString(),
      c.currentRedemptions, c.maxRedemptions
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "growmore_gift_codes.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportRechargesPDF = async () => {
    try {
      setMessage('Generating PDF...');
      
      const jspdfLib = window.jspdf;
      if (!jspdfLib) {
        throw new Error('PDF library not loaded. Please wait a moment and try again.');
      }

      const { jsPDF } = jspdfLib;
      const doc = new jsPDF();

      if (typeof doc.autoTable !== 'function') {
        throw new Error('PDF Table plugin not fully loaded. Please reload/refresh the page.');
      }

      const rechargeList = transactions.filter(t => t.type === 'recharge');
      const totalVal = rechargeList.reduce((acc, curr) => acc + curr.amount, 0);
      const completedVal = rechargeList.filter(t => t.status === 'completed').reduce((acc, curr) => acc + curr.amount, 0);
      const pendingVal = rechargeList.filter(t => t.status === 'pending').reduce((acc, curr) => acc + curr.amount, 0);
      const balanceVal = totalVal - completedVal;

      // Title & Header Info
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(22, 163, 74); // Green color
      doc.text('GrowMore - Recharge Statement', 14, 20);

      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, 28);
      doc.text(`Total Amount: Rs. ${totalVal.toFixed(2)}  |  Completed: Rs. ${completedVal.toFixed(2)}  |  Pending: Rs. ${pendingVal.toFixed(2)}  |  Balance: Rs. ${balanceVal.toFixed(2)}`, 14, 34);

      // Table Columns and Rows
      const tableColumn = ["S.No", "User Phone", "Reference Code", "Amount", "Status", "Date & Time"];
      const tableRows = [];

      rechargeList.forEach((t, idx) => {
        tableRows.push([
          idx + 1,
          t.user?.phone || 'N/A',
          t.reference || 'N/A',
          `Rs. ${t.amount.toFixed(2)}`,
          t.status.toUpperCase(),
          new Date(t.createdAt).toLocaleString()
        ]);
      });

      doc.autoTable({
        startY: 42,
        head: [tableColumn],
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [22, 163, 74] }, // Green header
        styles: { fontSize: 9 }
      });

      doc.save('growmore_recharge_data.pdf');
      setMessage('✅ PDF Downloaded Successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error generating PDF:', err);
      setMessage(`❌ Failed: ${err.message || 'Error generating PDF'}`);
      setTimeout(() => setMessage(''), 4000);
    }
  };

  const handleExportWithdrawalsPDF = async () => {
    try {
      setMessage('Generating PDF...');
      
      const jspdfLib = window.jspdf;
      if (!jspdfLib) {
        throw new Error('PDF library not loaded. Please wait a moment and try again.');
      }

      const { jsPDF } = jspdfLib;
      const doc = new jsPDF();

      if (typeof doc.autoTable !== 'function') {
        throw new Error('PDF Table plugin not fully loaded. Please reload/refresh the page.');
      }

      const withdrawalList = transactions.filter(t => t.type === 'withdrawal');
      const totalVal = withdrawalList.reduce((acc, curr) => acc + curr.amount, 0);
      const completedVal = withdrawalList.filter(t => t.status === 'completed').reduce((acc, curr) => acc + curr.amount, 0);
      const pendingVal = withdrawalList.filter(t => t.status === 'pending').reduce((acc, curr) => acc + curr.amount, 0);
      const balanceVal = totalVal - completedVal;

      // Title & Header Info
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(220, 38, 38); // Red color
      doc.text('GrowMore - Withdrawal Statement', 14, 20);

      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, 28);
      doc.text(`Total Amount: Rs. ${totalVal.toFixed(2)}  |  Completed: Rs. ${completedVal.toFixed(2)}  |  Pending: Rs. ${pendingVal.toFixed(2)}  |  Balance: Rs. ${balanceVal.toFixed(2)}`, 14, 34);

      // Table Columns and Rows
      const tableColumn = ["S.No", "Customer Name", "Phone Number", "Request ID", "Amount", "Status", "Date & Time"];
      const tableRows = [];

      withdrawalList.forEach((t, idx) => {
        const numericId = (() => {
          const idStr = t.reference || t._id || '';
          let hash = 0;
          for (let i = 0; i < idStr.length; i++) {
            hash = idStr.charCodeAt(i) + ((hash << 5) - hash);
          }
          return Math.abs(hash % 900000) + 100000;
        })();

        tableRows.push([
          idx + 1,
          t.user?.fullName || 'N/A',
          t.user?.phone || 'N/A',
          numericId,
          `Rs. ${t.amount.toFixed(2)}`,
          t.status.toUpperCase(),
          new Date(t.createdAt).toLocaleString()
        ]);
      });

      doc.autoTable({
        startY: 42,
        head: [tableColumn],
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [220, 38, 38] }, // Red header
        styles: { fontSize: 9 }
      });

      doc.save('growmore_withdrawal_data.pdf');
      setMessage('✅ PDF Downloaded Successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error generating PDF:', err);
      setMessage(`❌ Failed: ${err.message || 'Error generating PDF'}`);
      setTimeout(() => setMessage(''), 4000);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('gm_token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  // Filtered lists
  const filteredUsers = users.filter(u => {
    const searchLower = userSearch.toLowerCase();
    const matchesUser = u.phone.includes(userSearch) ||
      (u.fullName && u.fullName.toLowerCase().includes(searchLower)) ||
      (u.referralCode && u.referralCode.toLowerCase().includes(searchLower));
      
    if (matchesUser) return true;
    
    // Fallback: check if the search term matches any of this user's transaction reference IDs (recharge IDs)
    return transactions.some(t => {
      if (!t.reference) return false;
      const txUserId = t.user?._id ? t.user._id.toString() : (t.user ? t.user.toString() : '');
      return txUserId === u._id.toString() && t.reference.toLowerCase().includes(searchLower);
    });
  });

  const filteredTxs = transactions.filter(t => {
    const idStr = t.reference || t._id || '';
    let hash = 0;
    for (let i = 0; i < idStr.length; i++) {
      hash = idStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    const numericId = (Math.abs(hash % 900000) + 100000).toString();

    return (
      (t.user?.phone && t.user.phone.includes(txSearch)) ||
      (t.user?.fullName && t.user.fullName.toLowerCase().includes(txSearch.toLowerCase())) ||
      t.type.toLowerCase().includes(txSearch.toLowerCase()) ||
      t.status.toLowerCase().includes(txSearch.toLowerCase()) ||
      (t.reference && t.reference.toLowerCase().includes(txSearch.toLowerCase())) ||
      (t._id && t._id.toLowerCase().includes(txSearch.toLowerCase())) ||
      numericId.includes(txSearch)
    );
  });

  const filteredPlans = plans.filter(p =>
    p.name.toLowerCase().includes(plansSearch.toLowerCase()) ||
    p.growthLevel.toLowerCase().includes(plansSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(plansSearch.toLowerCase())
  );

  const filteredInvestments = investments.filter(inv => {
    const matchesSearch = inv.planName.toLowerCase().includes(investmentsSearch.toLowerCase()) ||
      (inv.user?.phone && inv.user.phone.includes(investmentsSearch)) ||
      (inv.user?.fullName && inv.user.fullName.toLowerCase().includes(investmentsSearch.toLowerCase()));
      
    const matchesPlan = selectedPlanFilter === 'all' || 
      inv.planName.toLowerCase() === selectedPlanFilter.toLowerCase();
      
    return matchesSearch && matchesPlan;
  });

  // Stats calculation
  const totalUsersCount = users.length;
  const activeUsersCount = users.filter(u => u.isActive).length;
  const pendingDeposits = transactions.filter(t => t.type === 'recharge' && t.status === 'pending');
  const pendingWithdrawals = transactions.filter(t => t.type === 'withdrawal' && t.status === 'pending');
  const totalRechargeAmt = transactions.filter(t => t.type === 'recharge' && t.status === 'completed').reduce((acc, curr) => acc + curr.amount, 0);
  const totalWithdrawAmt = transactions.filter(t => t.type === 'withdrawal' && t.status === 'completed').reduce((acc, curr) => acc + curr.amount, 0);
  const onlineUsersCount = Math.max(1, Math.floor(activeUsersCount * 0.25)); // Mock online calculation

  // Real-time Bar Chart grouping by the last 7 days
  const getLast7DaysStats = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const labels = [];
    const deposits = [];
    const withdrawals = [];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toDateString();
      labels.push(days[d.getDay()]);
      
      const depSum = transactions
        .filter(t => t.type === 'recharge' && t.status === 'completed' && new Date(t.createdAt).toDateString() === dateStr)
        .reduce((sum, t) => sum + t.amount, 0);
      deposits.push(depSum);
      
      const withSum = transactions
        .filter(t => t.type === 'withdrawal' && t.status === 'completed' && new Date(t.createdAt).toDateString() === dateStr)
        .reduce((sum, t) => sum + t.amount, 0);
      withdrawals.push(withSum);
    }
    
    // Fallback so the chart is never completely blank on first launch
    const hasData = deposits.some(v => v > 0) || withdrawals.some(v => v > 0);
    if (!hasData) {
      return {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          [40, 55, 65, 80, 50, 75, 90],
          [20, 25, 45, 30, 35, 60, 50]
        ]
      };
    }
    
    return { labels, datasets: [deposits, withdrawals] };
  };

  // Real-time Area Chart showing cumulative completed deposits
  const getRevenueAreaPoints = () => {
    const completedDeps = transactions
      .filter(t => t.type === 'recharge' && t.status === 'completed')
      .slice(0, 10)
      .reverse();
    
    let sum = 0;
    const points = completedDeps.map(t => {
      sum += t.amount;
      return sum;
    });
    
    return points.length >= 2 ? points : [30, 45, 35, 60, 80, 75, 110, 95, 140, 150];
  };

  const barChartData = getLast7DaysStats();
  const areaChartData = getRevenueAreaPoints();


  // Menu items list
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', emoji: '📊' },
    { id: 'users', label: 'Users', emoji: '' },
    { id: 'investments', label: 'Investments', emoji: '💼' },
    { id: 'plans', label: 'Investment Plans', emoji: '📋' },
    { id: 'deposits', label: 'Deposits', emoji: '💰' },
    { id: 'withdrawals', label: 'Withdrawals', emoji: '💸' },
    { id: 'referral', label: 'Referral', emoji: '🤝' },
    { id: 'giftcodes', label: 'Gift Codes', emoji: '🎁' },
    { id: 'promotion_rewards', label: 'Promotion Rewards', emoji: '🏆' }
  ];

  // Features list for Feature Grid
  const featuresList = [
    { title: 'Dashboard Analytics', text: 'Total Users, Active Users, Revenue, and Growth Charts.', emoji: '📊', gradient: 'linear-gradient(135deg, #10b981, #059669)' },
    { title: 'User Management', text: 'View details, adjust wallet balance, block/unblock accounts.', emoji: '', gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' },
    { title: 'Investment Plans', text: 'Configure plan parameters, edit ROI settings, and add images.', emoji: '💼', gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' },
    { title: 'Deposit Management', text: 'Review incoming proof of payments and approve deposits.', emoji: '💰', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
    { title: 'Withdrawal Management', text: 'Approve withdrawal requests and view bank transfer details.', emoji: '💸', gradient: 'linear-gradient(135deg, #ef4444, #b91c1c)' },
    { title: 'Wallet Adjustment', text: 'Adjust main wallet, bonus wallet, and referral commissions.', emoji: '👛', gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)' },
    { title: 'Referral System', text: 'Configure level earnings, team commissions, and referral tree.', emoji: '🤝', gradient: 'linear-gradient(135deg, #10b981, #047857)' },

    { title: 'KYC Checks', text: 'Validate Aadhaar, PAN, and selfie photos of members.', emoji: '', gradient: 'linear-gradient(135deg, #64748b, #334155)' },
    { title: 'Notification Center', text: 'Send push alerts, SMS announcements, and emails.', emoji: '', gradient: 'linear-gradient(135deg, #ec4899, #be185d)' },
    { title: 'Reports & Export', text: 'Generate Excel and PDF sheets of profit and revenue data.', emoji: '📈', gradient: 'linear-gradient(135deg, #0ea5e9, #0284c7)' },
    { title: 'Support Center', text: 'Manage active live chat tickets and customer issues.', emoji: '💬', gradient: 'linear-gradient(135deg, #a855f7, #7e22ce)' },
    { title: 'Platform Settings', text: 'Upload logos, change payment gateway details, and SMTP settings.', emoji: '⚙️', gradient: 'linear-gradient(135deg, #475569, #1e293b)' },
    { title: 'Security & 2FA', text: 'Audit session logs, set role access levels, and enable 2FA.', emoji: '🔒', gradient: 'linear-gradient(135deg, #16a34a, #0f172a)' }
  ];

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '65px', height: '65px', border: '4px solid #1e293b', borderTop: '4px solid #16a34a', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 18px' }}></div>
          <p style={{ color: '#94a3b8', fontSize: '16px', fontWeight: 600 }}>Loading GrowMore Premium Admin Panel...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: darkMode ? '#0f172a' : '#f8fafc', color: darkMode ? '#f8fafc' : '#0f172a', fontFamily: "'Poppins', sans-serif", transition: 'all 0.3s ease' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #16a34a; border-radius: 3px; }
        .sidebar-btn:hover { background: rgba(22, 163, 74, 0.15) !important; color: #16a34a !important; }
        .feature-card:hover { transform: translateY(-5px); box-shadow: 0 15px 35px rgba(0,0,0,0.3) !important; }
        .widget-card:hover { transform: translateY(-3px); box-shadow: 0 10px 25px rgba(22, 163, 74, 0.1) !important; }
      `}</style>

      {/* ─── Sidebar Menu ─── */}
      <aside style={{ width: '280px', flexShrink: 0, background: darkMode ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)', borderRight: `1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`, backdropFilter: 'blur(20px)', display: 'flex', flexDirection: 'column', zIndex: 10 }}>
        {/* Sidebar Header */}
        <div style={{ padding: '24px 28px', borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* GrowMore Logo (leaf + upward arrow icon) */}
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(22, 163, 74, 0.3)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 22h20L12 2z" />
              <path d="M12 8v8" />
              <path d="M9 13l3-3 3 3" />
            </svg>
          </div>
          <div>
            <span style={{ fontSize: '18px', fontWeight: 800, background: 'linear-gradient(135deg, #16a34a, #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'block' }}>GrowMore</span>
            <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#94a3b8' }}>Admin Panel</span>
          </div>
        </div>

        {/* Sidebar Nav */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px' }}>
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="sidebar-btn"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '12px 18px',
                  background: isActive ? 'linear-gradient(135deg, rgba(22, 163, 74, 0.25) 0%, rgba(22, 163, 74, 0.08) 100%)' : 'transparent',
                  color: isActive ? '#16a34a' : (darkMode ? '#94a3b8' : '#64748b'),
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '13px',
                  textAlign: 'left',
                  marginBottom: '4px',
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? 'inset 0 1px 0 rgba(255,255,255,0.05)' : 'none'
                }}
              >
                <span style={{ fontSize: '17px' }}>{item.emoji}</span>
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer (Logout) */}
        <div style={{ padding: '16px 20px', borderTop: `1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}` }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '12px',
              background: 'rgba(239, 68, 68, 0.08)',
              color: '#ef4444',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '13px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.15)'}
            onMouseOut={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.08)'}
          >
            <span>🚪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* ─── Main Panel Content ─── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto' }}>
        
        {/* ─── Header ─── */}
        <header style={{
          height: '75px',
          background: darkMode ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
          backdropFilter: 'blur(20px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          position: 'sticky',
          top: 0,
          zIndex: 5
        }}>
          {/* Search bar */}
          <div style={{ position: 'relative', width: '300px' }}>
            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '14px' }}>🔍</span>
            <input 
              type="text" 
              placeholder={
                activeTab === 'users' ? 'Search user by phone or name...' :
                activeTab === 'plans' ? 'Search plan by name or growth level...' :
                activeTab === 'investments' ? 'Search investments by user, plan...' :
                'Search transaction...'
              } 
              value={
                activeTab === 'users' ? userSearch :
                activeTab === 'plans' ? plansSearch :
                activeTab === 'investments' ? investmentsSearch : txSearch
              }
              onChange={(e) => {
                const val = e.target.value;
                if (activeTab === 'users') setUserSearch(val);
                else if (activeTab === 'plans') setPlansSearch(val);
                else if (activeTab === 'investments') setInvestmentsSearch(val);
                else setTxSearch(val);
              }}
              style={{
                width: '100%',
                background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                borderRadius: '12px',
                padding: '10px 14px 10px 42px',
                color: 'inherit',
                fontSize: '13px',
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Dark/Light mode toggle */}
            <button 
              onClick={() => setDarkMode(!darkMode)}
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: '18px',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s',
                color: 'inherit'
              }}
              onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
              onMouseOut={(e) => e.target.style.background = 'transparent'}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>

            {/* Notifications */}
            <div style={{ position: 'relative', cursor: 'pointer' }}>
              <span style={{ fontSize: '18px' }}>🔔</span>
              {(pendingDeposits.length + pendingWithdrawals.length) > 0 && (
                <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#ef4444', color: 'white', fontSize: '9px', fontWeight: 900, borderRadius: '50%', padding: '2px 5px', minWidth: '16px', textAlign: 'center' }}>
                  {pendingDeposits.length + pendingWithdrawals.length}
                </span>
              )}
            </div>

            {/* Admin Profile */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderLeft: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, paddingLeft: '14px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #16a34a, #fbbf24)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '13px' }}>
                A
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'inherit' }}>Super Admin</span>
                <span style={{ fontSize: '9px', color: '#16a34a', fontWeight: 700 }}>Online</span>
              </div>
            </div>
          </div>
        </header>

        {/* ─── Main Content Area ─── */}
        <main style={{ flex: 1, padding: '36px 40px' }}>
          
          {message && (
            <div style={{
              padding: '16px 20px',
              borderRadius: '12px',
              background: message.includes('❌') ? '#fef2f2' : '#f0fdf4',
              color: message.includes('❌') ? '#991b1b' : '#166534',
              border: `1px solid ${message.includes('❌') ? '#fca5a5' : '#86efac'}`,
              fontSize: '14px',
              fontWeight: 600,
              marginBottom: '28px',
              display: 'flex',
              alignItems: 'center',
              boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
            }}>
              {message}
            </div>
          )}

          {/* ─── View 1: Dashboard Home ─── */}
          {activeTab === 'dashboard' && (
            <div>
              {/* Hero Section */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(22, 163, 74, 0.12) 0%, rgba(15, 23, 42, 0.9) 100%)',
                borderRadius: '24px',
                padding: '42px 48px',
                marginBottom: '36px',
                border: `1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                boxShadow: '0 20px 45px rgba(0,0,0,0.15)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(22, 163, 74, 0.15) 0%, transparent 70%)', filter: 'blur(40px)' }}></div>
                
                <h1 style={{ fontSize: '32px', fontWeight: 900, margin: 0, letterSpacing: '-0.5px' }}>
                  GrowMore <span style={{ background: 'linear-gradient(135deg, #16a34a 0%, #fbbf24 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Admin Dashboard</span>
                </h1>
                <p style={{ fontSize: '15px', color: '#94a3b8', maxWidth: '650px', lineHeight: 1.6, margin: 0 }}>
                  Manage users, investments, payments, reports, and platform operations from one intelligent dashboard.
                </p>
              </div>

              {/* Dashboard Widgets */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '36px' }}>
                {[
                  { title: 'Total Users', value: totalUsersCount, icon: '', color: '#3b82f6', spark: [20, 24, 28, 35, 45, 52, 60] },
                  { title: "Today's Revenue", value: `₹${(totalRechargeAmt / 30).toFixed(0)}`, icon: '💰', color: '#16a34a', spark: [10, 15, 12, 22, 30, 28, 35] },
                  { title: 'Monthly Revenue', value: `₹${totalRechargeAmt}`, icon: '📈', color: '#fbbf24', spark: [80, 100, 95, 120, 140, 160, 185] },
                  { title: 'Active Investments', value: users.filter(u => u.availableBalance > 0).length, icon: '💼', color: '#8b5cf6', spark: [15, 18, 20, 25, 28, 32, 40] },
                  { title: 'Pending Withdrawals', value: pendingWithdrawals.length, icon: '💸', color: '#ef4444', spark: [8, 6, 12, 15, 5, 8, 3] },
                  { title: 'Total Deposits', value: `₹${totalRechargeAmt}`, icon: '🏦', color: '#06b6d4', spark: [50, 70, 65, 85, 110, 120, 135] },
                  { title: 'Profit Distributed', value: `₹${(totalWithdrawAmt * 0.4).toFixed(0)}`, icon: '🎯', color: '#10b981', spark: [20, 25, 30, 35, 40, 48, 55] },
                  { title: 'Online Users', value: onlineUsersCount, icon: '🟢', color: '#16a34a', spark: [5, 9, 12, 8, 14, 15, 12] }
                ].map((widget, i) => (
                  <div 
                    key={i} 
                    className="widget-card"
                    style={{
                      background: darkMode ? 'rgba(255,255,255,0.03)' : 'white',
                      border: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                      borderRadius: '20px',
                      padding: '24px',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.02)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8' }}>{widget.title}</span>
                      <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: `${widget.color}15`, color: widget.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                        {widget.icon}
                      </div>
                    </div>
                    <span style={{ fontSize: '26px', fontWeight: 800, color: 'inherit', marginBottom: '8px' }}>{widget.value}</span>
                    <div style={{ marginTop: 'auto', opacity: 0.6 }}>
                      <Sparkline data={widget.spark} color={widget.color} height={25} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Charts Section */}
              <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '20px', color: 'inherit' }}>Platform Analytics Charts</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '40px' }}>
                {/* Area Chart */}
                <div style={{ background: darkMode ? 'rgba(255,255,255,0.03)' : 'white', border: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`, borderRadius: '24px', padding: '28px', boxShadow: '0 8px 30px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                      <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 4px 0' }}>Investment Growth & Revenue</h3>
                      <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>Comparison of monthly business intake</p>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#16a34a', background: 'rgba(22,163,74,0.1)', padding: '4px 8px', borderRadius: '8px' }}>+24% YoY</span>
                  </div>
                  <div style={{ height: '150px', position: 'relative' }}>
                    <PremiumAreaChart dataPoints={areaChartData} color="#16a34a" />
                  </div>
                </div>

                {/* Bar Chart */}
                <div style={{ background: darkMode ? 'rgba(255,255,255,0.03)' : 'white', border: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`, borderRadius: '24px', padding: '28px', boxShadow: '0 8px 30px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                      <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 4px 0' }}>Deposits vs Withdrawals</h3>
                      <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>Weekly transaction flow levels</p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', fontSize: '10px', fontWeight: 700 }}>
                      <span style={{ color: '#16a34a' }}>● Deposits</span>
                      <span style={{ color: '#ef4444' }}>● Withdrawals</span>
                    </div>
                  </div>
                  <PremiumBarChart 
                    datasets={barChartData.datasets}
                    labels={barChartData.labels}
                  />
                </div>

                {/* Donut Chart */}
                <div style={{ background: darkMode ? 'rgba(255,255,255,0.03)' : 'white', border: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`, borderRadius: '24px', padding: '28px', boxShadow: '0 8px 30px rgba(0,0,0,0.02)' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 20px 0' }}>User Registration & Tiers</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                      <PremiumDonutChart 
                        segments={[
                          { label: 'Active Users', value: activeUsersCount, color: '#16a34a' },
                          { label: 'Deactivated', value: totalUsersCount - activeUsersCount, color: '#ef4444' }
                        ]}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {[
                        { label: 'Active Users', value: activeUsersCount, color: '#16a34a' },
                        { label: 'Deactivated', value: totalUsersCount - activeUsersCount, color: '#ef4444' }
                      ].map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: item.color }} />
                          <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>{item.label}</span>
                          <span style={{ fontSize: '12px', fontWeight: 700, marginLeft: '10px' }}>{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature Grid */}
              <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '20px', color: 'inherit' }}>Platform Feature Directory</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                {featuresList.map((feat, idx) => (
                  <div 
                    key={idx} 
                    className="feature-card"
                    style={{
                      background: darkMode ? 'rgba(255,255,255,0.03)' : 'white',
                      border: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                      borderRadius: '20px',
                      padding: '24px',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.02)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: feat.gradient, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                        {feat.emoji}
                      </div>
                      <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>{feat.title}</h3>
                    </div>
                    <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>{feat.text}</p>
                    <span style={{ alignSelf: 'flex-start', fontSize: '11px', color: '#16a34a', fontWeight: 700, marginTop: 'auto' }}>Configure Setting →</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── View 2: Users Management ─── */}
          {activeTab === 'users' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>Manage Members</h2>
                <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>Showing {filteredUsers.length} of {users.length} users</span>
              </div>

              <div style={{ overflowX: 'auto', background: darkMode ? 'rgba(255, 255, 255, 0.02)' : 'white', border: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`, borderRadius: '18px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', border: 'none' }}>
                  <thead>
                    <tr style={{ background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}` }}>
                      <th style={{ padding: '16px', fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Phone Number</th>
                      <th style={{ padding: '16px', fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Full Name</th>
                      <th style={{ padding: '16px', fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Referral Code</th>
                      <th style={{ padding: '16px', fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Wallet Balance</th>
                      <th style={{ padding: '16px', fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Earnings</th>
                      <th style={{ padding: '16px', fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Status</th>
                      <th style={{ padding: '16px', fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Role</th>
                      <th style={{ padding: '16px', fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user._id} style={{ borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
                        <td style={{ padding: '16px', fontWeight: 600, fontSize: '13px' }}>{user.phone}</td>
                        <td style={{ padding: '16px', fontSize: '13px' }}>{user.fullName || '—'}</td>
                        <td style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#16a34a' }}>{user.referralCode}</td>
                        <td style={{ padding: '16px', fontSize: '13px', fontWeight: 700 }}>₹{user.availableBalance.toFixed(2)}</td>
                        <td style={{ padding: '16px', fontSize: '13px', fontWeight: 700 }}>₹{user.totalEarnings.toFixed(2)}</td>
                        <td style={{ padding: '16px' }}>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: 700,
                            background: user.isActive ? 'rgba(22, 163, 74, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                            color: user.isActive ? '#16a34a' : '#ef4444'
                          }}>
                            {user.isActive ? 'Active' : 'Suspended'}
                          </span>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: 700,
                            background: user.role === 'admin' ? 'rgba(251, 191, 36, 0.12)' : 'rgba(22, 163, 74, 0.05)',
                            color: user.role === 'admin' ? '#fbbf24' : '#94a3b8'
                          }}>
                            {user.role}
                          </span>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <button 
                            onClick={() => handleOpenEditUser(user)}
                            style={{
                              background: '#16a34a',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '6px 12px',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              boxShadow: '0 4px 10px rgba(22, 163, 74, 0.25)'
                            }}
                          >
                            Edit Settings
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ─── View 3: Deposits (Recharges) ─── */}
          {activeTab === 'deposits' && (
            <div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '24px', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 6px 0' }}>Deposit Requests</h2>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '12px', color: '#94a3b8', alignItems: 'center' }}>
                    <span>Showing <strong>{filteredTxs.filter(t => t.type === 'recharge').length}</strong> requests</span>
                    <span>•</span>
                    <span>Total Recharge Value: <strong style={{ color: '#16a34a' }}>₹{transactions.filter(t => t.type === 'recharge' && t.status === 'completed').reduce((acc, curr) => acc + curr.amount, 0)}</strong></span>
                    <span>•</span>
                    <span>Total Recharge Count: <strong>{transactions.filter(t => t.type === 'recharge').length}</strong> requests (<strong>{transactions.filter(t => t.type === 'recharge' && t.status === 'completed').length}</strong> completed)</span>
                  </div>
                </div>
                
                <button 
                  onClick={handleExportRechargesPDF}
                  style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 18px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  📥 Download PDF
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {filteredTxs.filter(t => t.type === 'recharge').map((tx) => (
                  <div key={tx._id} style={{
                    background: darkMode ? 'rgba(255,255,255,0.03)' : 'white',
                    border: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                    borderRadius: '16px',
                    padding: '20px 24px',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.02)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700 }}>User Phone: {tx.user?.phone || '—'}</span>
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>Ref (UTR): {tx.reference}</span>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>Submitted: {new Date(tx.createdAt).toLocaleString()}</span>
                      {tx.proofImage && (
                        <span 
                          onClick={() => setPreviewScreenshot(tx.proofImage)}
                          style={{ color: '#3b82f6', fontSize: '12px', fontWeight: 600, textDecoration: 'underline', cursor: 'pointer', display: 'block', marginTop: '4px' }}
                        >
                          🖼️ View Proof Screenshot
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                      <span style={{ fontSize: '18px', fontWeight: 800, color: '#16a34a' }}>₹{tx.amount}</span>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: 700,
                        background: tx.status === 'completed' ? 'rgba(22, 163, 74, 0.12)' : tx.status === 'pending' ? 'rgba(251, 191, 36, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                        color: tx.status === 'completed' ? '#16a34a' : tx.status === 'pending' ? '#fbbf24' : '#ef4444'
                      }}>
                        {tx.status}
                      </span>

                      {tx.status === 'pending' ? (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            onClick={() => handleProcessTx(tx._id, 'completed')}
                            style={{ background: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 14px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleProcessTx(tx._id, 'failed')}
                            style={{ background: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', padding: '8px 14px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>Processed</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── View 4: Withdrawals ─── */}
          {activeTab === 'withdrawals' && (
            <div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '24px', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 6px 0' }}>Withdrawal Requests</h2>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '12px', color: '#94a3b8', alignItems: 'center' }}>
                    <span>Showing <strong>{filteredTxs.filter(t => t.type === 'withdrawal').length}</strong> requests</span>
                    <span>•</span>
                    <span>Total Withdraw Value: <strong style={{ color: '#ef4444' }}>₹{transactions.filter(t => t.type === 'withdrawal' && t.status === 'completed').reduce((acc, curr) => acc + curr.amount, 0)}</strong></span>
                    <span>•</span>
                    <span>Total Withdraw Count: <strong>{transactions.filter(t => t.type === 'withdrawal').length}</strong> requests (<strong>{transactions.filter(t => t.type === 'withdrawal' && t.status === 'completed').length}</strong> completed)</span>
                  </div>
                </div>
                
                <button 
                  onClick={handleExportWithdrawalsPDF}
                  style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 18px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  📥 Download PDF
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {filteredTxs.filter(t => t.type === 'withdrawal').map((tx) => (
                  <div key={tx._id} style={{
                    background: darkMode ? 'rgba(255,255,255,0.03)' : 'white',
                    border: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                    borderRadius: '16px',
                    padding: '20px 24px',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.02)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700 }}>Customer: {tx.user?.fullName || 'Member'} ({tx.user?.phone || '—'})</span>
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                        ID: {(() => {
                          const idStr = tx.reference || tx._id || '';
                          let hash = 0;
                          for (let i = 0; i < idStr.length; i++) {
                            hash = idStr.charCodeAt(i) + ((hash << 5) - hash);
                          }
                          return Math.abs(hash % 900000) + 100000;
                        })()} | Ref: {tx.reference}
                      </span>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>Submitted: {new Date(tx.createdAt).toLocaleString()}</span>
                      {tx.rejectionReason && (
                        <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: 600 }}>Reason: {tx.rejectionReason}</span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                      <span style={{ fontSize: '18px', fontWeight: 800, color: '#ef4444' }}>₹{tx.amount}</span>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: 700,
                        background: tx.status === 'completed' ? 'rgba(22, 163, 74, 0.12)' : tx.status === 'pending' ? 'rgba(251, 191, 36, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                        color: tx.status === 'completed' ? '#16a34a' : tx.status === 'pending' ? '#fbbf24' : '#ef4444'
                      }}>
                        {tx.status}
                      </span>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={() => handleViewWithdrawDetails(tx._id)}
                          style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '8px', padding: '8px 14px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                        >
                          👁 View
                        </button>
                        {tx.status === 'pending' ? (
                          <>
                            <button 
                              onClick={() => handleApproveFromModal(tx._id)}
                              style={{ background: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 14px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleOpenReject(tx._id)}
                              style={{ background: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', padding: '8px 14px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                            >
                              Reject
                            </button>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── View: Gift Codes Management ─── */}
          {activeTab === 'giftcodes' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 4px 0' }}>Gift Code (Promo Code) Management</h2>
                  <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>Generate, configure, and monitor customer promo codes & cashback vouchers.</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={handleExportGiftCodes}
                    style={{ background: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24', border: '1px solid rgba(251, 191, 36, 0.2)', borderRadius: '10px', padding: '10px 18px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    📥 Export CSV
                  </button>
                  <button 
                    onClick={() => {
                      setEditingGift(null);
                      setGiftForm({
                        code: '', rewardType: 'wallet_balance', rewardAmount: '', status: 'active',
                        startDate: new Date().toISOString().split('T')[0],
                        expiryDate: new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0],
                        maxRedemptions: '100', perUserLimit: '1', eligibleUsers: 'all', description: ''
                      });
                      setShowGiftForm(true);
                    }}
                    style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 18px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)' }}
                  >
                    ➕ Create Gift Code
                  </button>
                </div>
              </div>

              {/* Statistics Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                {[
                  { title: 'Total Gift Codes', value: giftStats.totalCodes || 0, icon: '🎫', color: '#3b82f6' },
                  { title: 'Active Codes', value: giftStats.activeCodes || 0, icon: '✅', color: '#16a34a' },
                  { title: 'Expired Codes', value: giftStats.expiredCodes || 0, icon: '⏰', color: '#ef4444' },
                  { title: 'Total Redemptions', value: giftStats.totalRedemptions || 0, icon: '', color: '#8b5cf6' },
                  { title: "Today's Redemptions", value: giftStats.todaysRedemptions || 0, icon: '📅', color: '#06b6d4' },
                  { title: 'Top Redeemed Code', value: giftStats.topRedeemedCode || 'N/A', icon: '🏆', color: '#fbbf24' }
                ].map((stat, idx) => (
                  <div key={idx} style={{ background: darkMode ? 'rgba(255,255,255,0.03)' : 'white', border: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`, borderRadius: '18px', padding: '20px', boxShadow: '0 8px 30px rgba(0,0,0,0.01)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>{stat.title}</span>
                      <span style={{ fontSize: '16px' }}>{stat.icon}</span>
                    </div>
                    <span style={{ fontSize: '20px', fontWeight: 800, color: stat.color }}>{stat.value}</span>
                  </div>
                ))}
              </div>

              {/* Gift Codes List */}
              <div style={{ overflowX: 'auto', background: darkMode ? 'rgba(255, 255, 255, 0.02)' : 'white', border: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`, borderRadius: '18px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', border: 'none' }}>
                  <thead>
                    <tr style={{ background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}` }}>
                      <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#94a3b8' }}>CODE</th>
                      <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#94a3b8' }}>REWARD TYPE</th>
                      <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#94a3b8' }}>VALUE</th>
                      <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#94a3b8' }}>REDEMPTIONS</th>
                      <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#94a3b8' }}>ELIGIBILITY</th>
                      <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#94a3b8' }}>STATUS</th>
                      <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#94a3b8' }}>EXPIRY</th>
                      <th style={{ padding: '16px 20px', textAlign: 'center', fontSize: '12px', fontWeight: 700, color: '#94a3b8' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {giftCodes.length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '13px', fontWeight: 600 }}>No gift codes generated yet. Click "Create Gift Code" to get started!</td>
                      </tr>
                    ) : (
                      giftCodes.map((code) => {
                        const isExpired = new Date(code.expiryDate) <= new Date();
                        return (
                          <tr key={code._id} style={{ borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` }}>
                            <td style={{ padding: '16px 20px', fontSize: '13px', fontWeight: 700 }}>
                              <span style={{ color: '#16a34a', marginRight: '6px', cursor: 'pointer' }} onClick={() => handleCopyCode(code.code)} title="Copy Code">📋</span>
                              {code.code}
                            </td>
                            <td style={{ padding: '16px 20px', fontSize: '12px', textTransform: 'capitalize', color: '#94a3b8' }}>
                              {code.rewardType.replace('_', ' ')}
                            </td>
                            <td style={{ padding: '16px 20px', fontSize: '13px', fontWeight: 700, color: '#16a34a' }}>
                              ₹{code.rewardAmount}
                            </td>
                            <td style={{ padding: '16px 20px', fontSize: '12px' }}>
                              {code.currentRedemptions} / {code.maxRedemptions}
                            </td>
                            <td style={{ padding: '16px 20px', fontSize: '12px', textTransform: 'capitalize' }}>
                              {code.eligibleUsers} Users
                            </td>
                            <td style={{ padding: '16px 20px' }}>
                              <span style={{
                                padding: '4px 8px', borderRadius: '8px', fontSize: '10px', fontWeight: 700,
                                background: code.status === 'active' && !isExpired ? 'rgba(22,163,74,0.12)' : 'rgba(239,68,68,0.12)',
                                color: code.status === 'active' && !isExpired ? '#16a34a' : '#ef4444'
                              }}>
                                {isExpired ? 'Expired' : code.status}
                              </span>
                            </td>
                            <td style={{ padding: '16px 20px', fontSize: '12px', color: '#94a3b8' }}>
                              {new Date(code.expiryDate).toLocaleDateString()}
                            </td>
                            <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                <button 
                                  onClick={() => handleViewGiftHistory(code)}
                                  style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: 'none', borderRadius: '6px', padding: '6px 10px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                                >
                                  Logs 📋
                                </button>
                                <button 
                                  onClick={() => {
                                    setEditingGift(code);
                                    setGiftForm({
                                      code: code.code, rewardType: code.rewardType, rewardAmount: code.rewardAmount, status: code.status,
                                      startDate: new Date(code.startDate).toISOString().split('T')[0],
                                      expiryDate: new Date(code.expiryDate).toISOString().split('T')[0],
                                      maxRedemptions: code.maxRedemptions.toString(), perUserLimit: code.perUserLimit.toString(),
                                      eligibleUsers: code.eligibleUsers, description: code.description || ''
                                    });
                                    setShowGiftForm(true);
                                  }}
                                  style={{ background: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24', border: 'none', borderRadius: '6px', padding: '6px 10px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                                >
                                  Edit
                                </button>
                                <button 
                                  onClick={() => handleDeleteGiftCode(code._id)}
                                  style={{ background: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', border: 'none', borderRadius: '6px', padding: '6px 10px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ─── Create/Edit Gift Code Form Modal ─── */}
          {showGiftForm && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: '20px' }}>
              <div style={{ background: darkMode ? '#1e293b' : 'white', borderRadius: '24px', border: `1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`, padding: '30px', maxWidth: '520px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 800, color: '#16a34a', borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`, paddingBottom: '14px' }}>
                  {editingGift ? `Edit Gift Code: ${giftForm.code}` : 'Generate New Gift Code'}
                </h3>
                
                <form onSubmit={handleSaveGiftCode}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                    
                    <div>
                      <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px', fontWeight: 600 }}>GIFT CODE CODE</label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input 
                          type="text" 
                          required 
                          value={giftForm.code} 
                          onChange={(e) => setGiftForm({...giftForm, code: e.target.value.toUpperCase()})}
                          placeholder="e.g. WELCOME500"
                          style={{ flex: 1, background: darkMode ? '#0f172a' : '#f1f5f9', border: `1px solid ${darkMode ? '#334155' : '#cbd5e1'}`, borderRadius: '10px', padding: '10px 14px', color: 'inherit', outline: 'none', fontFamily: 'inherit', fontWeight: 700 }}
                        />
                        {!editingGift && (
                          <button 
                            type="button" 
                            onClick={handleGenerateRandomCode}
                            style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 14px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                          >
                            🎲 Random
                          </button>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px', fontWeight: 600 }}>REWARD TYPE</label>
                        <select 
                          value={giftForm.rewardType} 
                          onChange={(e) => setGiftForm({...giftForm, rewardType: e.target.value})}
                          style={{ width: '100%', background: darkMode ? '#0f172a' : '#f1f5f9', border: `1px solid ${darkMode ? '#334155' : '#cbd5e1'}`, borderRadius: '10px', padding: '10px 14px', color: 'inherit', outline: 'none', fontFamily: 'inherit', cursor: 'pointer' }}
                        >
                          <option value="wallet_balance">Wallet Balance</option>
                          <option value="bonus_wallet">Bonus Wallet</option>
                          <option value="cashback">Cashback</option>
                          <option value="free_investment_plan">Free Investment Plan</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px', fontWeight: 600 }}>REWARD VALUE (₹ or Level)</label>
                        <input 
                          type="number" 
                          required 
                          placeholder="e.g. 500"
                          value={giftForm.rewardAmount} 
                          onChange={(e) => setGiftForm({...giftForm, rewardAmount: e.target.value})}
                          style={{ width: '100%', background: darkMode ? '#0f172a' : '#f1f5f9', border: `1px solid ${darkMode ? '#334155' : '#cbd5e1'}`, borderRadius: '10px', padding: '10px 14px', color: 'inherit', outline: 'none', fontFamily: 'inherit' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px', fontWeight: 600 }}>START DATE</label>
                        <input 
                          type="date" 
                          required 
                          value={giftForm.startDate} 
                          onChange={(e) => setGiftForm({...giftForm, startDate: e.target.value})}
                          style={{ width: '100%', background: darkMode ? '#0f172a' : '#f1f5f9', border: `1px solid ${darkMode ? '#334155' : '#cbd5e1'}`, borderRadius: '10px', padding: '10px 14px', color: 'inherit', outline: 'none', fontFamily: 'inherit' }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px', fontWeight: 600 }}>EXPIRY DATE</label>
                        <input 
                          type="date" 
                          required 
                          value={giftForm.expiryDate} 
                          onChange={(e) => setGiftForm({...giftForm, expiryDate: e.target.value})}
                          style={{ width: '100%', background: darkMode ? '#0f172a' : '#f1f5f9', border: `1px solid ${darkMode ? '#334155' : '#cbd5e1'}`, borderRadius: '10px', padding: '10px 14px', color: 'inherit', outline: 'none', fontFamily: 'inherit' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px', fontWeight: 600 }}>MAX REDEMPTIONS (Users)</label>
                        <input 
                          type="number" 
                          required 
                          value={giftForm.maxRedemptions} 
                          onChange={(e) => setGiftForm({...giftForm, maxRedemptions: e.target.value})}
                          style={{ width: '100%', background: darkMode ? '#0f172a' : '#f1f5f9', border: `1px solid ${darkMode ? '#334155' : '#cbd5e1'}`, borderRadius: '10px', padding: '10px 14px', color: 'inherit', outline: 'none', fontFamily: 'inherit' }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px', fontWeight: 600 }}>PER USER LIMIT (Claims)</label>
                        <input 
                          type="number" 
                          required 
                          value={giftForm.perUserLimit} 
                          onChange={(e) => setGiftForm({...giftForm, perUserLimit: e.target.value})}
                          style={{ width: '100%', background: darkMode ? '#0f172a' : '#f1f5f9', border: `1px solid ${darkMode ? '#334155' : '#cbd5e1'}`, borderRadius: '10px', padding: '10px 14px', color: 'inherit', outline: 'none', fontFamily: 'inherit' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px', fontWeight: 600 }}>ELIGIBLE USERS</label>
                        <select 
                          value={giftForm.eligibleUsers} 
                          onChange={(e) => setGiftForm({...giftForm, eligibleUsers: e.target.value})}
                          style={{ width: '100%', background: darkMode ? '#0f172a' : '#f1f5f9', border: `1px solid ${darkMode ? '#334155' : '#cbd5e1'}`, borderRadius: '10px', padding: '10px 14px', color: 'inherit', outline: 'none', fontFamily: 'inherit', cursor: 'pointer' }}
                        >
                          <option value="all">All Users</option>
                          <option value="new">New Users (Last 48 Hrs)</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px', fontWeight: 600 }}>STATUS</label>
                        <select 
                          value={giftForm.status} 
                          onChange={(e) => setGiftForm({...giftForm, status: e.target.value})}
                          style={{ width: '100%', background: darkMode ? '#0f172a' : '#f1f5f9', border: `1px solid ${darkMode ? '#334155' : '#cbd5e1'}`, borderRadius: '10px', padding: '10px 14px', color: 'inherit', outline: 'none', fontFamily: 'inherit', cursor: 'pointer' }}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px', fontWeight: 600 }}>DESCRIPTION</label>
                      <textarea 
                        value={giftForm.description} 
                        onChange={(e) => setGiftForm({...giftForm, description: e.target.value})}
                        placeholder="Describe promo constraints/campaign notes..."
                        style={{ width: '100%', height: '60px', background: darkMode ? '#0f172a' : '#f1f5f9', border: `1px solid ${darkMode ? '#334155' : '#cbd5e1'}`, borderRadius: '10px', padding: '10px 14px', color: 'inherit', outline: 'none', fontFamily: 'inherit', resize: 'none' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button 
                      type="button"
                      onClick={() => setShowGiftForm(false)} 
                      style={{ background: darkMode ? '#334155' : '#e2e8f0', color: 'inherit', border: 'none', padding: '12px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '13px' }}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '13px', boxShadow: '0 4px 15px rgba(22, 163, 74, 0.3)' }}
                    >
                      Save Code
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ─── Redemption History Modal ─── */}
          {selectedGiftHistory && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: '20px' }}>
              <div style={{ background: darkMode ? '#1e293b' : 'white', borderRadius: '24px', border: `1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`, padding: '30px', maxWidth: '580px', width: '100%', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`, paddingBottom: '14px', marginBottom: '20px' }}>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#3b82f6' }}>
                    Redemption History: {selectedGiftHistory.code}
                  </h3>
                  <button 
                    onClick={() => setSelectedGiftHistory(null)}
                    style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}
                  >
                    Close
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {giftHistoryList.length === 0 ? (
                    <p style={{ textAlign: 'center', padding: '30px 10px', color: '#94a3b8', fontSize: '13px', fontWeight: 600 }}>No claims recorded yet for this code.</p>
                  ) : (
                    giftHistoryList.map((log) => (
                      <div key={log._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc', borderRadius: '12px', border: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : '#f1f5f9'}` }}>
                        <div>
                          <strong style={{ display: 'block', fontSize: '13px' }}>User: {log.user?.phone || 'Unknown'}</strong>
                          <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginTop: '2px' }}>IP: {log.ipAddress || 'N/A'}</span>
                          <span style={{ fontSize: '10px', color: '#64748b', display: 'block', marginTop: '2px' }}>{new Date(log.redeemedAt).toLocaleString()}</span>
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: 800, color: '#16a34a' }}>
                          +₹{log.rewardAmount}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* ─── Detailed Claims History Modal ─── */}
          {selectedClaimsLog && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: '20px' }}>
              <div style={{ background: darkMode ? '#1e293b' : 'white', borderRadius: '24px', border: `1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`, padding: '30px', maxWidth: '500px', width: '100%', maxHeight: '75vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`, paddingBottom: '14px', marginBottom: '20px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#16a34a' }}>
                      📋 Claims Logs
                    </h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#94a3b8' }}>
                      {selectedClaimsLog.planName} (User: {selectedClaimsLog.user?.fullName || '—'} - {selectedClaimsLog.user?.phone || 'Unknown'})
                    </p>
                  </div>
                  <button 
                    onClick={() => setSelectedClaimsLog(null)}
                    style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}
                  >
                    Close
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {(() => {
                    const timeline = [];
                    const start = new Date(selectedClaimsLog.investedAt);
                    const utcStart = start.getTime() + (start.getTimezoneOffset() * 60000);
                    const istStart = new Date(utcStart + (3600000 * 5.5));
                    
                    const now = new Date();
                    const utcNow = now.getTime() + (now.getTimezoneOffset() * 60000);
                    const istNow = new Date(utcNow + (3600000 * 5.5));
                    
                    const current = new Date(istStart);
                    current.setUTCHours(0, 0, 0, 0);
                    
                    const today = new Date(istNow);
                    today.setUTCHours(0, 0, 0, 0);
                    
                    const duration = selectedClaimsLog.duration || 30;
                    
                    const claims = (selectedClaimsLog.claimsHistory || []).map(ts => {
                      const d = new Date(ts);
                      const utcD = d.getTime() + (d.getTimezoneOffset() * 60000);
                      const istD = new Date(utcD + (3600000 * 5.5));
                      return istD.toISOString().slice(0, 10);
                    });
                    
                    let dayIndex = 1;
                    while (current <= today && dayIndex <= duration) {
                      const dateStr = current.toISOString().slice(0, 10);
                      const claimIdx = claims.indexOf(dateStr);
                      const isTodayDate = dateStr === istNow.toISOString().slice(0, 10);
                      
                      if (claimIdx !== -1) {
                        timeline.push({
                          dayNumber: dayIndex,
                          date: dateStr,
                          status: 'claimed',
                          amount: selectedClaimsLog.dailyIncome,
                          timestamp: selectedClaimsLog.claimsHistory[claimIdx]
                        });
                      } else if (isTodayDate) {
                        timeline.push({
                          dayNumber: dayIndex,
                          date: dateStr,
                          status: 'pending',
                          amount: 0,
                          timestamp: new Date().toISOString()
                        });
                      } else {
                        timeline.push({
                          dayNumber: dayIndex,
                          date: dateStr,
                          status: 'skipped',
                          amount: 0,
                          timestamp: new Date(current.getTime() - (3600000 * 5.5)).toISOString()
                        });
                      }
                      
                      current.setDate(current.getDate() + 1);
                      dayIndex++;
                    }
                    
                    if (timeline.length === 0) {
                      return (
                        <div style={{ textAlign: 'center', padding: '30px 10px', color: '#94a3b8' }}>
                          <span style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}>📭</span>
                          <p style={{ margin: 0, fontSize: '12px', fontWeight: 600 }}>No claims recorded yet for this investment.</p>
                        </div>
                      );
                    }

                    // Sort in reverse order (newest day first)
                    timeline.reverse();

                    return timeline.map((item, index) => {
                      const isClaimed = item.status === 'claimed';
                      const isPending = item.status === 'pending';
                      const statusColor = isClaimed ? '#16a34a' : isPending ? '#fbbf24' : '#ef4444';
                      
                      return (
                        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc', borderRadius: '12px', border: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : '#f1f5f9'}` }}>
                          <span style={{ fontSize: '11px', fontWeight: 800, background: statusColor, color: 'white', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {item.dayNumber}
                          </span>
                          <div style={{ flex: 1 }}>
                            <span style={{ fontSize: '13px', fontWeight: 700, display: 'block', color: isClaimed ? 'inherit' : isPending ? '#fbbf24' : '#ef4444' }}>
                              {isClaimed ? 'Daily Reward Credited' : isPending ? 'Today\'s Reward Pending' : 'Daily Claim Skipped/Missed'}
                            </span>
                            <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginTop: '2px' }}>
                              {isClaimed 
                                ? `${new Date(item.timestamp).toLocaleDateString()} at ${new Date(item.timestamp).toLocaleTimeString()}`
                                : new Date(item.timestamp).toLocaleDateString()
                              }
                            </span>
                          </div>
                          <span style={{ fontSize: '13px', fontWeight: 800, color: statusColor }}>
                            {isClaimed ? `+₹${item.amount}` : '₹0.00'}
                          </span>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* ─── View 5: Investment Plans Management ─── */}
          {activeTab === 'plans' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 4px 0' }}>Investment Plans Management</h2>
                  <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>Configure product catalog, adjust pricing tiers, set daily payouts, and manage growth levels.</p>
                </div>
                <button 
                  onClick={() => {
                    setEditingPlan(null);
                    setPlanForm({
                      name: '', description: '', price: '', dailyIncome: '', duration: '',
                      image: '🥤', category: 'juice', growthLevel: 'VIP 0', totalSlots: '100',
                      isActive: true, sharePower: '0', shareIncome: '0'
                    });
                    setShowPlanForm(true);
                  }}
                  style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 18px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)' }}
                >
                  ➕ Create Investment Plan
                </button>
              </div>

              {/* Plans stats summary */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                {[
                  { title: 'Total Plans', value: plans.length, icon: '📋', color: '#3b82f6' },
                  { title: 'Active Plans', value: plans.filter(p => p.isActive).length, icon: '✅', color: '#16a34a' },
                  { title: 'Inactive Plans', value: plans.filter(p => !p.isActive).length, icon: '⚠️', color: '#ef4444' }
                ].map((stat, idx) => (
                  <div key={idx} style={{ background: darkMode ? 'rgba(255,255,255,0.03)' : 'white', border: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`, borderRadius: '18px', padding: '20px', boxShadow: '0 8px 30px rgba(0,0,0,0.01)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>{stat.title}</span>
                      <span style={{ fontSize: '16px' }}>{stat.icon}</span>
                    </div>
                    <span style={{ fontSize: '20px', fontWeight: 800, color: stat.color }}>{stat.value}</span>
                  </div>
                ))}
              </div>

              {/* Plans Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                {filteredPlans.length === 0 ? (
                  <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: '#94a3b8', background: darkMode ? 'rgba(255,255,255,0.02)' : 'white', borderRadius: '18px', border: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
                    No plans found matching the query.
                  </div>
                ) : (
                  filteredPlans.map((plan) => (
                    <div key={plan._id} style={{
                      background: darkMode ? 'rgba(255,255,255,0.03)' : 'white',
                      border: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                      borderRadius: '20px',
                      padding: '24px',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.02)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px',
                      position: 'relative'
                    }}>
                      <span style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        padding: '4px 8px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: 700,
                        background: plan.isActive ? 'rgba(22, 163, 74, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                        color: plan.isActive ? '#16a34a' : '#ef4444'
                      }}>
                        {plan.isActive ? 'Active' : 'Inactive'}
                      </span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: darkMode ? '#1e293b' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', overflow: 'hidden' }}>
                          {plan.image && (plan.image.startsWith('data:image/') || plan.image.startsWith('http://') || plan.image.startsWith('https://') || plan.image.startsWith('/')) ? (
                            <img src={plan.image} alt="Plan" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            plan.image || '🥤'
                          )}
                        </div>
                        <div>
                          <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 2px 0' }}>{plan.name}</h3>
                        </div>
                      </div>

                      <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, lineHeight: 1.5, minHeight: '36px' }}>{plan.description}</p>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: darkMode ? 'rgba(255,255,255,0.01)' : '#f8fafc', padding: '12px', borderRadius: '12px', border: `1px solid ${darkMode ? 'rgba(255,255,255,0.03)' : '#f1f5f9'}` }}>
                        <div>
                          <span style={{ display: 'block', fontSize: '10px', color: '#94a3b8' }}>PLAN PRICE</span>
                          <strong style={{ fontSize: '14px', color: '#16a34a' }}>₹{plan.price}</strong>
                        </div>
                        <div>
                          <span style={{ display: 'block', fontSize: '10px', color: '#94a3b8' }}>DAILY INCOME</span>
                          <strong style={{ fontSize: '14px', color: '#fbbf24' }}>₹{plan.dailyIncome}/day</strong>
                        </div>
                        <div style={{ marginTop: '6px' }}>
                          <span style={{ display: 'block', fontSize: '10px', color: '#94a3b8' }}>DURATION</span>
                          <strong style={{ fontSize: '13px' }}>{plan.duration} Days</strong>
                        </div>
                        <div style={{ marginTop: '6px' }}>
                          <span style={{ display: 'block', fontSize: '10px', color: '#94a3b8' }}>SLOTS AVAILABLE</span>
                          <strong style={{ fontSize: '13px' }}>{plan.availableSlots || 0} / {plan.totalSlots || 0}</strong>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                        <button 
                          onClick={() => {
                            setEditingPlan(plan);
                            setPlanForm({
                              name: plan.name,
                              description: plan.description,
                              price: plan.price.toString(),
                              dailyIncome: plan.dailyIncome.toString(),
                              duration: plan.duration.toString(),
                              image: plan.image || '🥤',
                              category: plan.category || 'juice',
                              growthLevel: plan.growthLevel || 'VIP 0',
                              totalSlots: plan.totalSlots.toString(),
                              isActive: plan.isActive,
                              sharePower: (plan.sharePower || 0).toString(),
                              shareIncome: (plan.shareIncome || 0).toString()
                            });
                            setShowPlanForm(true);
                          }}
                          style={{ flex: 1, background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: 'none', borderRadius: '10px', padding: '10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                        >
                          ✏️ Edit Plan
                        </button>
                        <button 
                          onClick={() => handleDeletePlan(plan._id)}
                          style={{ flex: 1, background: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', border: 'none', borderRadius: '10px', padding: '10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                        >
                          🗑️ Delete Plan
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ─── View 6: User Investments Dashboard ─── */}
          {activeTab === 'investments' && (
            <div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 4px 0' }}>User Investments Log</h2>
                  <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>Monitor real-time customer deposit deployment, active products, and payout claims history.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 750, color: '#94a3b8', letterSpacing: '0.5px' }}>PLAN FILTER:</span>
                    <select
                      value={selectedPlanFilter}
                      onChange={(e) => setSelectedPlanFilter(e.target.value)}
                      style={{ 
                        background: darkMode ? '#1e293b' : 'white', 
                        border: `1px solid ${darkMode ? '#334155' : '#cbd5e1'}`, 
                        borderRadius: '10px', 
                        padding: '8px 14px', 
                        color: 'inherit', 
                        fontSize: '12px', 
                        fontWeight: 700, 
                        outline: 'none', 
                        cursor: 'pointer',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.02)'
                      }}
                    >
                      <option value="all">📁 All Plans</option>
                      {Array.from(new Set(investments.map(inv => inv.planName))).filter(Boolean).map(planName => (
                        <option key={planName} value={planName}>🥤 {planName}</option>
                      ))}
                    </select>
                  </div>
                  <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>Showing {filteredInvestments.length} total investments</span>
                </div>
              </div>

              {/* Investments summary stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                {[
                  { title: 'Total Investment Value', value: `₹${investments.reduce((sum, inv) => sum + inv.amount, 0).toFixed(2)}`, icon: '💰', color: '#16a34a' },
                  { title: 'Total Investments Count', value: investments.length, icon: '💼', color: '#3b82f6' },
                  { title: 'Average Payout P.D.', value: `₹${(investments.reduce((sum, inv) => sum + inv.dailyIncome, 0) / (investments.length || 1)).toFixed(2)}`, icon: '📈', color: '#fbbf24' }
                ].map((stat, idx) => (
                  <div key={idx} style={{ background: darkMode ? 'rgba(255,255,255,0.03)' : 'white', border: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`, borderRadius: '18px', padding: '20px', boxShadow: '0 8px 30px rgba(0,0,0,0.01)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>{stat.title}</span>
                      <span style={{ fontSize: '16px' }}>{stat.icon}</span>
                    </div>
                    <span style={{ fontSize: '20px', fontWeight: 800, color: stat.color }}>{stat.value}</span>
                  </div>
                ))}
              </div>

              {/* Investments Table */}
              <div style={{ overflowX: 'auto', background: darkMode ? 'rgba(255, 255, 255, 0.02)' : 'white', border: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`, borderRadius: '18px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', border: 'none' }}>
                  <thead>
                    <tr style={{ background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}` }}>
                      <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#94a3b8' }}>USER DETAILS</th>
                      <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#94a3b8' }}>PLAN NAME</th>
                      <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#94a3b8' }}>AMOUNT</th>
                      <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#94a3b8' }}>DAILY RETURN</th>
                      <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#94a3b8' }}>CLAIMS</th>
                      <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#94a3b8' }}>PURCHASED AT</th>
                      <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#94a3b8' }}>LAST CLAIMED</th>
                      <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#94a3b8' }}>EXPIRY COUNTDOWN</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvestments.length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '13px', fontWeight: 600 }}>No active user investments found.</td>
                      </tr>
                    ) : (
                      filteredInvestments.map((inv) => {
                        const investedTime = new Date(inv.investedAt).getTime();
                        const expiryTime = investedTime + (inv.duration * 24 * 60 * 60 * 1000);
                        const msRemaining = expiryTime - Date.now();
                        
                        let countdownText = 'Expired';
                        let countdownColor = '#ef4444';
                        if (msRemaining > 0) {
                          const days = Math.floor(msRemaining / (24 * 60 * 60 * 1000));
                          const hours = Math.floor((msRemaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
                          const mins = Math.floor((msRemaining % (60 * 60 * 1000)) / (60 * 1000));
                          const secs = Math.floor((msRemaining % (60 * 1000)) / 1000);
                          
                          if (days > 0) {
                            countdownText = `${days}d ${hours}h left`;
                          } else if (hours > 0) {
                            countdownText = `${hours}h ${mins}m left`;
                          } else {
                            countdownText = `${mins}m ${secs}s left`;
                          }
                          countdownColor = '#16a34a';
                        }
                        
                        const expiryDateStr = new Date(expiryTime).toLocaleString();
                        
                        return (
                          <tr key={inv.investmentId} style={{ borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` }}>
                            <td style={{ padding: '16px 20px' }}>
                              <strong style={{ display: 'block', fontSize: '13px' }}>{inv.user?.fullName || '—'}</strong>
                              <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginTop: '2px' }}>{inv.user?.phone || 'Unknown'}</span>
                            </td>
                            <td style={{ padding: '16px 20px', fontSize: '13px', fontWeight: 600 }}>{inv.planName}</td>
                            <td style={{ padding: '16px 20px', fontSize: '13px', fontWeight: 700, color: '#16a34a' }}>₹{inv.amount}</td>
                            <td style={{ padding: '16px 20px', fontSize: '13px', fontWeight: 700, color: '#fbbf24' }}>₹{inv.dailyIncome}/day</td>
                            <td 
                              onClick={() => setSelectedClaimsLog(inv)}
                              style={{ padding: '16px 20px', cursor: 'pointer' }}
                              title="Click to view detailed claim timestamps"
                            >
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', background: darkMode ? 'rgba(22, 163, 74, 0.05)' : 'rgba(22, 163, 74, 0.02)', padding: '6px 10px', borderRadius: '10px', border: `1px dashed ${darkMode ? 'rgba(22, 163, 74, 0.2)' : 'rgba(22, 163, 74, 0.1)'}`, transition: 'all 0.2s' }}
                                   onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#16a34a'; e.currentTarget.style.background = 'rgba(22, 163, 74, 0.1)'; }}
                                   onMouseLeave={(e) => { e.currentTarget.style.borderColor = darkMode ? 'rgba(22, 163, 74, 0.2)' : 'rgba(22, 163, 74, 0.1)'; e.currentTarget.style.background = darkMode ? 'rgba(22, 163, 74, 0.05)' : 'rgba(22, 163, 74, 0.02)'; }}
                              >
                                <strong style={{ fontSize: '13px', color: '#16a34a' }}>{inv.claimCount || 0} claimed 📋</strong>
                                <span style={{ fontSize: '10px', color: '#94a3b8' }}>out of {inv.duration}d</span>
                              </div>
                            </td>
                            <td style={{ padding: '16px 20px', fontSize: '12px', color: '#94a3b8' }}>
                              {new Date(inv.investedAt).toLocaleString()}
                            </td>
                            <td style={{ padding: '16px 20px', fontSize: '12px', color: '#94a3b8' }}>
                              {inv.lastClaimedAt ? new Date(inv.lastClaimedAt).toLocaleString() : 'Never'}
                            </td>
                            <td style={{ padding: '16px 20px' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <strong style={{ fontSize: '13px', color: countdownColor }}>{countdownText}</strong>
                                <span style={{ fontSize: '10px', color: '#94a3b8' }}>{expiryDateStr}</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ─── Create/Edit Investment Plan Modal Form ─── */}
          {showPlanForm && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: '20px' }}>
              <div style={{ background: darkMode ? '#1e293b' : 'white', borderRadius: '24px', border: `1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`, padding: '30px', maxWidth: '540px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 800, color: '#16a34a', borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`, paddingBottom: '14px' }}>
                  {editingPlan ? `Edit Investment Plan: ${planForm.name}` : 'Create New Investment Plan'}
                </h3>
                
                <form onSubmit={handleSavePlan}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                    
                    <div style={{ marginBottom: '10px' }}>
                      <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px', fontWeight: 600 }}>PLAN NAME</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g. Mango Fresh"
                        value={planForm.name} 
                        onChange={(e) => setPlanForm({...planForm, name: e.target.value})}
                        style={{ width: '100%', background: darkMode ? '#0f172a' : '#f1f5f9', border: `1px solid ${darkMode ? '#334155' : '#cbd5e1'}`, borderRadius: '10px', padding: '10px 14px', color: 'inherit', outline: 'none', fontFamily: 'inherit', fontWeight: 700 }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px', fontWeight: 600 }}>DESCRIPTION</label>
                      <textarea 
                        required
                        value={planForm.description} 
                        onChange={(e) => setPlanForm({...planForm, description: e.target.value})}
                        placeholder="Describe the plan benefits, payouts, limits..."
                        style={{ width: '100%', height: '70px', background: darkMode ? '#0f172a' : '#f1f5f9', border: `1px solid ${darkMode ? '#334155' : '#cbd5e1'}`, borderRadius: '10px', padding: '10px 14px', color: 'inherit', outline: 'none', fontFamily: 'inherit', resize: 'none' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px', fontWeight: 600 }}>PRICE (₹)</label>
                        <input 
                          type="number" 
                          required 
                          placeholder="e.g. 500"
                          value={planForm.price} 
                          onChange={(e) => setPlanForm({...planForm, price: e.target.value})}
                          style={{ width: '100%', background: darkMode ? '#0f172a' : '#f1f5f9', border: `1px solid ${darkMode ? '#334155' : '#cbd5e1'}`, borderRadius: '10px', padding: '10px 14px', color: 'inherit', outline: 'none', fontFamily: 'inherit' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px', fontWeight: 600 }}>DAILY INCOME (₹)</label>
                        <input 
                          type="number" 
                          required 
                          placeholder="e.g. 50"
                          value={planForm.dailyIncome} 
                          onChange={(e) => setPlanForm({...planForm, dailyIncome: e.target.value})}
                          style={{ width: '100%', background: darkMode ? '#0f172a' : '#f1f5f9', border: `1px solid ${darkMode ? '#334155' : '#cbd5e1'}`, borderRadius: '10px', padding: '10px 14px', color: 'inherit', outline: 'none', fontFamily: 'inherit' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px', fontWeight: 600 }}>DURATION (Days)</label>
                        <input 
                          type="number" 
                          required 
                          placeholder="e.g. 35"
                          value={planForm.duration} 
                          onChange={(e) => setPlanForm({...planForm, duration: e.target.value})}
                          style={{ width: '100%', background: darkMode ? '#0f172a' : '#f1f5f9', border: `1px solid ${darkMode ? '#334155' : '#cbd5e1'}`, borderRadius: '10px', padding: '10px 14px', color: 'inherit', outline: 'none', fontFamily: 'inherit' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px', fontWeight: 600 }}>TOTAL SLOTS</label>
                        <input 
                          type="number" 
                          required 
                          value={planForm.totalSlots} 
                          onChange={(e) => setPlanForm({...planForm, totalSlots: e.target.value})}
                          style={{ width: '100%', background: darkMode ? '#0f172a' : '#f1f5f9', border: `1px solid ${darkMode ? '#334155' : '#cbd5e1'}`, borderRadius: '10px', padding: '10px 14px', color: 'inherit', outline: 'none', fontFamily: 'inherit' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px', fontWeight: 600 }}>PLAN CATEGORY</label>
                        <select 
                          value={planForm.category} 
                          onChange={(e) => setPlanForm({...planForm, category: e.target.value})}
                          style={{ width: '100%', background: darkMode ? '#0f172a' : '#f1f5f9', border: `1px solid ${darkMode ? '#334155' : '#cbd5e1'}`, borderRadius: '10px', padding: '10px 14px', color: 'inherit', outline: 'none', fontFamily: 'inherit', cursor: 'pointer' }}
                        >
                          <option value="juice">Juice products</option>
                          <option value="fruit">Fruit products</option>
                          <option value="organic">Organic products</option>
                          <option value="premium">Premium products</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px', fontWeight: 600 }}>IMAGE / EMOJI</label>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <input 
                            type="text" 
                            required 
                            placeholder="Emoji or Image URL"
                            value={planForm.image} 
                            onChange={(e) => setPlanForm({...planForm, image: e.target.value})}
                            style={{ flex: 1, background: darkMode ? '#0f172a' : '#f1f5f9', border: `1px solid ${darkMode ? '#334155' : '#cbd5e1'}`, borderRadius: '10px', padding: '10px 14px', color: 'inherit', outline: 'none', fontFamily: 'inherit' }}
                          />
                          <label style={{
                            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                            color: 'white',
                            borderRadius: '10px',
                            padding: '10px 14px',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 4px 10px rgba(59, 130, 246, 0.25)',
                            whiteSpace: 'nowrap'
                          }}>
                            📁 Upload
                            <input 
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (uploadEvent) => {
                                    setPlanForm({ ...planForm, image: uploadEvent.target.result });
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              style={{ display: 'none' }}
                            />
                          </label>
                        </div>
                        {planForm.image && (planForm.image.startsWith('data:image/') || planForm.image.startsWith('http://') || planForm.image.startsWith('https://') || planForm.image.startsWith('/')) && (
                          <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '10px', color: '#94a3b8' }}>Preview:</span>
                            <img src={planForm.image} alt="Preview" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px', border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }} />
                            <button 
                              type="button" 
                              onClick={() => setPlanForm({ ...planForm, image: '🥤' })}
                              style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                            >
                              Reset
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px', fontWeight: 600 }}>SHARE POWER</label>
                        <input 
                          type="number" 
                          placeholder="e.g. 20"
                          value={planForm.sharePower} 
                          onChange={(e) => setPlanForm({...planForm, sharePower: e.target.value})}
                          style={{ width: '100%', background: darkMode ? '#0f172a' : '#f1f5f9', border: `1px solid ${darkMode ? '#334155' : '#cbd5e1'}`, borderRadius: '10px', padding: '10px 14px', color: 'inherit', outline: 'none', fontFamily: 'inherit' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px', fontWeight: 600 }}>SHARE INCOME (₹)</label>
                        <input 
                          type="number" 
                          placeholder="e.g. 5"
                          value={planForm.shareIncome} 
                          onChange={(e) => setPlanForm({...planForm, shareIncome: e.target.value})}
                          style={{ width: '100%', background: darkMode ? '#0f172a' : '#f1f5f9', border: `1px solid ${darkMode ? '#334155' : '#cbd5e1'}`, borderRadius: '10px', padding: '10px 14px', color: 'inherit', outline: 'none', fontFamily: 'inherit' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                      <input 
                        type="checkbox" 
                        id="planActiveCheckbox"
                        checked={planForm.isActive} 
                        onChange={(e) => setPlanForm({...planForm, isActive: e.target.checked})} 
                        style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#16a34a' }}
                      />
                      <label htmlFor="planActiveCheckbox" style={{ fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                        Is Plan Active (Uncheck to hide plan from front-end store)
                      </label>
                    </div>

                  </div>

                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button 
                      type="button"
                      onClick={() => setShowPlanForm(false)} 
                      style={{ background: darkMode ? '#334155' : '#e2e8f0', color: 'inherit', border: 'none', padding: '12px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '13px' }}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '13px', boxShadow: '0 4px 15px rgba(22, 163, 74, 0.3)' }}
                    >
                      Save Plan
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ─── View 7: Referral System Settings Configuration ─── */}
          {activeTab === 'referral' && (
            <ReferralConfigPanel darkMode={darkMode} users={users} />
          )}

          {/* ─── View 8: Promotion Rewards Claims logs ─── */}
          {activeTab === 'promotion_rewards' && (
            <PromotionRewardsPanel darkMode={darkMode} rewards={promotionRewards} />
          )}

          {/* Fallback for other sidebar items */}
          {!['dashboard', 'users', 'deposits', 'withdrawals', 'giftcodes', 'plans', 'investments', 'referral', 'promotion_rewards'].includes(activeTab) && (
            <div style={{ padding: '80px 20px', textAlign: 'center', background: darkMode ? 'rgba(255,255,255,0.03)' : 'white', borderRadius: '24px', border: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
              <span style={{ fontSize: '60px', display: 'block', marginBottom: '18px' }}>⚙️</span>
              <h3 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 10px 0' }}>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Sub-Panel</h3>
              <p style={{ color: '#94a3b8', fontSize: '14px', maxWidth: '420px', margin: '0 auto', lineHeight: 1.6 }}>
                You have requested the configured <strong>{activeTab}</strong> settings view. This panel features full mockup data for deployment validation.
              </p>
            </div>
          )}

        </main>
      </div>

      {/* ─── Edit User Modal ─── */}
      {selectedUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999,
          padding: '20px'
        }}>
          <div style={{
            background: darkMode ? '#1e293b' : 'white',
            borderRadius: '24px',
            border: `1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
            padding: '36px',
            maxWidth: '460px',
            width: '100%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 800, color: '#16a34a', borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`, paddingBottom: '14px' }}>
              Configure: {selectedUser.phone}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '6px', fontWeight: 600 }}>AVAILABLE BALANCE (₹)</label>
                <input 
                  type="number" 
                  value={editBalance} 
                  onChange={(e) => setEditBalance(e.target.value)} 
                  style={{ width: '100%', background: darkMode ? '#0f172a' : '#f1f5f9', border: `1px solid ${darkMode ? '#334155' : '#cbd5e1'}`, borderRadius: '10px', padding: '12px 14px', color: 'inherit', outline: 'none', fontFamily: 'inherit' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '6px', fontWeight: 600 }}>TOTAL EARNINGS (₹)</label>
                <input 
                  type="number" 
                  value={editEarnings} 
                  onChange={(e) => setEditEarnings(e.target.value)} 
                  style={{ width: '100%', background: darkMode ? '#0f172a' : '#f1f5f9', border: `1px solid ${darkMode ? '#334155' : '#cbd5e1'}`, borderRadius: '10px', padding: '12px 14px', color: 'inherit', outline: 'none', fontFamily: 'inherit' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '6px', fontWeight: 600 }}>USER ROLE</label>
                <select 
                  value={editRole} 
                  onChange={(e) => setEditRole(e.target.value)} 
                  style={{ width: '100%', background: darkMode ? '#0f172a' : '#f1f5f9', border: `1px solid ${darkMode ? '#334155' : '#cbd5e1'}`, borderRadius: '10px', padding: '12px 14px', color: 'inherit', outline: 'none', fontFamily: 'inherit', cursor: 'pointer' }}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '6px', fontWeight: 600 }}>CHANGE PASSWORD</label>
                <input 
                  type="text" 
                  placeholder="Enter new password to change"
                  value={editPassword} 
                  onChange={(e) => setEditPassword(e.target.value)} 
                  style={{ width: '100%', background: darkMode ? '#0f172a' : '#f1f5f9', border: `1px solid ${darkMode ? '#334155' : '#cbd5e1'}`, borderRadius: '10px', padding: '12px 14px', color: 'inherit', outline: 'none', fontFamily: 'inherit' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '6px', fontWeight: 600 }}>TOTAL REFERRALS</label>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#16a34a', padding: '12px 14px', background: darkMode ? '#0f172a' : '#f1f5f9', borderRadius: '10px', border: `1px solid ${darkMode ? '#334155' : '#cbd5e1'}`, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {selectedUser.directReferrals?.length || 0} members
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                <input 
                  type="checkbox" 
                  id="userStatusCheckbox"
                  checked={editStatus} 
                  onChange={(e) => setEditStatus(e.target.checked)} 
                  style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#16a34a' }}
                />
                <label htmlFor="userStatusCheckbox" style={{ fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                  Account Active (Suspends user if unchecked)
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={handleDeleteUser}
                  disabled={updatingUser}
                  style={{ background: '#ef4444', color: 'white', border: 'none', padding: '12px 18px', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '13px', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.25)' }}
                >
                  Delete Account
                </button>
                <button 
                  onClick={() => setEditStatus(prev => !prev)}
                  disabled={updatingUser}
                  style={{ 
                    background: editStatus ? '#e11d48' : '#16a34a', 
                    color: 'white', 
                    border: 'none', 
                    padding: '12px 18px', 
                    borderRadius: '10px', 
                    cursor: 'pointer', 
                    fontWeight: 700, 
                    fontSize: '13px', 
                    boxShadow: editStatus ? '0 4px 15px rgba(225, 29, 72, 0.25)' : '0 4px 15px rgba(22, 163, 74, 0.25)' 
                  }}
                >
                  {editStatus ? 'Suspend' : 'Unsuspend'}
                </button>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={() => setSelectedUser(null)} 
                  style={{ background: darkMode ? '#334155' : '#e2e8f0', color: 'inherit', border: 'none', padding: '12px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleUpdateUser} 
                  disabled={updatingUser} 
                  style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '13px', boxShadow: '0 4px 15px rgba(22, 163, 74, 0.3)' }}
                >
                  {updatingUser ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Loading Withdrawal Details Indicator ─── */}
      {loadingDetails && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10005 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '50px', height: '50px', border: '4px solid #1e293b', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 14px' }}></div>
            <p style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 600 }}>Fetching Customer Bank Credentials...</p>
          </div>
        </div>
      )}

      {/* ─── Modal 1: Rejection Reason Dialog ─── */}
      {showRejectionForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10010, padding: '20px' }}>
          <div style={{ background: '#1e293b', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.08)', padding: '28px', maxWidth: '440px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 800, color: '#ef4444' }}>❌ Reject Withdrawal Request</h3>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '20px', lineHeight: 1.5 }}>Please enter a valid rejection reason. The customer will see this message in their transaction history logs.</p>
            
            <form onSubmit={handleConfirmReject}>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '10px', color: '#94a3b8', display: 'block', marginBottom: '6px', fontWeight: 700 }}>REJECTION MOTIVE</label>
                <textarea 
                  required
                  rows="3"
                  value={rejectionReasonInput}
                  onChange={(e) => setRejectionReasonInput(e.target.value)}
                  placeholder="e.g. Incorrect IFSC code or invalid bank account details."
                  style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: '10px', padding: '12px 14px', color: '#f8fafc', outline: 'none', fontFamily: 'inherit', fontSize: '13px', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button 
                  type="button"
                  onClick={() => setShowRejectionForm(false)} 
                  style={{ background: '#334155', color: '#f8fafc', border: 'none', padding: '12px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  style={{ background: '#ef4444', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '13px', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)' }}
                >
                  Submit Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Modal 2: View Bank Details Popup ─── */}
      {selectedWithdrawal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10002, padding: '20px' }}>
          <div style={{ background: '#0f172a', borderRadius: '28px', border: '1px solid rgba(255,255,255,0.08)', padding: '32px', maxWidth: '780px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px rgba(0, 0, 0, 0.6)' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px', marginBottom: '24px' }}>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 900, color: '#16a34a' }}>🏦 Withdrawal Verification Panel</h3>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Transaction ID: {selectedWithdrawal.withdrawal._id}</span>
              </div>
              <button 
                onClick={() => setSelectedWithdrawal(null)} 
                style={{ background: 'rgba(255,255,255,0.05)', border: 'none', width: '32px', height: '32px', borderRadius: '50%', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ✕
              </button>
            </div>

            {/* Information Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))', gap: '24px', marginBottom: '28px' }}>
              
              {/* Customer Info Card */}
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', padding: '20px' }}>
                <h4 style={{ margin: '0 0 14px 0', fontSize: '13px', color: '#3b82f6', fontWeight: 800 }}>👤 CUSTOMER PROFILE</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8' }}>Full Name:</span>
                    <strong style={{ color: '#f8fafc' }}>{selectedWithdrawal.user.fullName || 'Member'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8' }}>Phone Number:</span>
                    <strong style={{ color: '#f8fafc' }}>{selectedWithdrawal.user.phone}</strong>
                  </div>
                </div>
              </div>

              {/* Bank Details Card */}
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h4 style={{ margin: 0, fontSize: '13px', color: '#10b981', fontWeight: 800 }}>🏦 BANK DETAILS</h4>
                </div>
                {selectedWithdrawal.bankDetails ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#94a3b8' }}>Account Holder:</span>
                      <strong style={{ color: '#f8fafc' }}>{selectedWithdrawal.bankDetails.accountHolderName}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#94a3b8' }}>Bank Name:</span>
                      <strong style={{ color: '#f8fafc' }}>{selectedWithdrawal.bankDetails.bankName}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#94a3b8' }}>Account Number:</span>
                      <strong style={{ color: '#f8fafc', letterSpacing: '0.5px' }}>
                        {selectedWithdrawal.bankDetails.accountNumber}
                      </strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#94a3b8' }}>IFSC Code:</span>
                      <strong style={{ color: '#f8fafc', fontFamily: 'monospace' }}>{selectedWithdrawal.bankDetails.ifscCode}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#94a3b8' }}>Branch Name:</span>
                      <strong style={{ color: '#f8fafc' }}>{selectedWithdrawal.bankDetails.branchName}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#94a3b8' }}>UPI ID:</span>
                      <strong style={{ color: '#f8fafc' }}>{selectedWithdrawal.bankDetails.upiId}</strong>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '30px 10px', color: '#ef4444', fontSize: '12px', fontWeight: 600 }}>
                    ⚠️ No bank details registered for this user in database.
                  </div>
                )}
              </div>

              {/* Payout & Financial Status Card */}
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', padding: '20px' }}>
                <h4 style={{ margin: '0 0 14px 0', fontSize: '13px', color: '#fbbf24', fontWeight: 800 }}>💰 TRANSACTION SUMMARY</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8' }}>Gross Amount:</span>
                    <strong style={{ color: '#f8fafc' }}>₹{selectedWithdrawal.withdrawal.amount.toFixed(2)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8' }}>Tax / Fee (18%):</span>
                    <strong style={{ color: '#ef4444' }}>₹{(selectedWithdrawal.withdrawal.amount * 0.18).toFixed(2)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '6px', marginTop: '2px' }}>
                    <span style={{ color: '#10b981', fontWeight: 700 }}>Net Transfer:</span>
                    <strong style={{ color: '#10b981', fontSize: '14px' }}>₹{(selectedWithdrawal.withdrawal.amount * 0.82).toFixed(2)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                    <span style={{ color: '#94a3b8' }}>User Wallet Balance:</span>
                    <strong style={{ color: '#f8fafc' }}>₹{selectedWithdrawal.user.availableBalance?.toFixed(2) || '0.00'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8' }}>Request Date:</span>
                    <strong style={{ color: '#f8fafc' }}>{new Date(selectedWithdrawal.withdrawal.createdAt).toLocaleString()}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                    <span style={{ color: '#94a3b8' }}>Status:</span>
                    <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 800, background: selectedWithdrawal.withdrawal.status === 'completed' ? 'rgba(22, 163, 74, 0.12)' : selectedWithdrawal.withdrawal.status === 'pending' ? 'rgba(251, 191, 36, 0.12)' : 'rgba(239, 68, 68, 0.12)', color: selectedWithdrawal.withdrawal.status === 'completed' ? '#16a34a' : selectedWithdrawal.withdrawal.status === 'pending' ? '#fbbf24' : '#ef4444' }}>
                      {selectedWithdrawal.withdrawal.status}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Document Image Lightbox */}
            {previewImage && (
              <div 
                onClick={() => setPreviewImage(null)}
                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10020, cursor: 'pointer' }}
              >
                <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '40px', maxWidth: '500px', width: '90%', textAlign: 'center', position: 'relative' }}>
                  <span style={{ position: 'absolute', top: '15px', right: '20px', fontSize: '20px', color: '#94a3b8' }}>✕</span>
                  <div style={{ width: '120px', height: '120px', borderRadius: '24px', background: `${previewImage.bg}15`, color: previewImage.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', margin: '0 auto 20px', border: `2px dashed ${previewImage.bg}` }}>
                  </div>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#f8fafc' }}>{previewImage.desc}</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', lineHeight: 1.5 }}>This matches a simulated secure document image payload for KYC verification.</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', justifyBetween: 'space-between', gap: '14px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px' }}>
              <button 
                onClick={() => setSelectedWithdrawal(null)} 
                style={{ background: '#334155', color: '#f8fafc', border: 'none', padding: '12px 24px', borderRadius: '12px', cursor: 'pointer', fontWeight: 700, fontSize: '13px' }}
              >
                Close View
              </button>
              
              {selectedWithdrawal.withdrawal.status === 'pending' && (
                <div style={{ display: 'flex', gap: '12px', marginLeft: 'auto' }}>
                  <button 
                    onClick={() => handleOpenReject(selectedWithdrawal.withdrawal._id)}
                    style={{ background: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '12px 24px', borderRadius: '12px', cursor: 'pointer', fontWeight: 700, fontSize: '13px' }}
                  >
                    ❌ Reject Withdrawal
                  </button>
                  <button 
                    onClick={() => handleApproveFromModal(selectedWithdrawal.withdrawal._id)}
                    style={{ background: '#16a34a', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', cursor: 'pointer', fontWeight: 700, fontSize: '13px', boxShadow: '0 4px 15px rgba(22, 163, 74, 0.3)' }}
                  >
                    ✅ Approve Withdrawal
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
      {/* ─── View Payment Proof Screenshot Modal ─── */}
      {previewScreenshot && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10007, padding: '20px' }}>
          <div style={{ background: darkMode ? '#1e293b' : 'white', borderRadius: '24px', padding: '24px', maxWidth: '500px', width: '100%', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)', border: `1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`, paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800 }}>Payment Proof Screenshot</h3>
              <button 
                onClick={() => setPreviewScreenshot(null)}
                style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}
              >
                Close
              </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', background: '#0f172a', borderRadius: '16px', padding: '12px', overflow: 'hidden' }}>
              <img 
                src={previewScreenshot} 
                alt="Payment Proof" 
                style={{ maxWidth: '100%', maxHeight: '60vh', objectFit: 'contain', borderRadius: '8px' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
