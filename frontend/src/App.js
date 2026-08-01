import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Plans from './components/Plans';
import Recharge from './components/Recharge';
import Withdraw from './components/Withdraw';
import AdminDashboard from './components/AdminDashboard';
import PlanDetail from './components/PlanDetail';
import RechargeHistory from './components/RechargeHistory';
import WithdrawHistory from './components/WithdrawHistory';
import AboutPage from './components/AboutPage';


// Define base API URL dynamically
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5005/api';

const Logo = ({ size = 100, style = {} }) => (
  <img 
    src="/logo.svg" 
    alt="GrowMore Logo" 
    style={{ 
      width: size, 
      height: 'auto', 
      display: 'block', 
      margin: '0 auto',
      ...style 
    }} 
  />
);

const LogoIcon = ({ size = 48, style = {} }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="100 30 200 200" 
    width={size} 
    height={size}
    style={{ display: 'block', ...style }}
  >
    <defs>
      <linearGradient id="iconLeafGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#84cc16" stopOpacity="1" />
        <stop offset="100%" stopColor="#22c55e" stopOpacity="1" />
      </linearGradient>
      <linearGradient id="iconGGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#14532d" stopOpacity="1" />
        <stop offset="100%" stopColor="#166534" stopOpacity="1" />
      </linearGradient>
    </defs>
    <circle cx="200" cy="130" r="80" fill="none" stroke="url(#iconGGradient)" strokeWidth="14"/>
    <path d="M 280 130 L 280 165 L 230 165" fill="none" stroke="url(#iconGGradient)" strokeWidth="14" strokeLinecap="round"/>
    <path d="M 200 210 Q 200 180 200 150" fill="none" stroke="#14532d" strokeWidth="6" strokeLinecap="round"/>
    <path d="M 200 140 Q 230 80 290 60 Q 280 130 200 140 Z" fill="url(#iconLeafGradient)"/>
    <path d="M 200 160 Q 170 130 130 120 Q 145 160 200 160 Z" fill="url(#iconLeafGradient)"/>
  </svg>
);

// 🌿 ButtonSpecificIcon Component for buttons
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
    case 'telegram':
      return (
        <svg {...iconProps}>
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      );
    case 'home':
    case 'app':
      return (
        <svg {...iconProps}>
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    case 'invite':
      return (
        <svg {...iconProps}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="8.5" cy="7" r="4" />
          <line x1="20" y1="8" x2="20" y2="14" />
          <line x1="23" y1="11" x2="17" y2="11" />
        </svg>
      );
    case 'bonus':
      return (
        <svg {...iconProps}>
          <polyline points="20 12 20 22 4 22 4 12" />
          <rect x="2" y="7" width="20" height="5" />
          <line x1="12" y1="22" x2="12" y2="7" />
          <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
          <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
        </svg>
      );
    case 'services':
      return (
        <svg {...iconProps}>
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      );
    case 'myproduct':
    case 'product':
      return (
        <svg {...iconProps}>
          <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
          <polygon points="12 22.08 12 12 3 6.92 3 17.08 12 22.08" />
          <polygon points="12 12 21 6.92 21 17.08 12 22.08 12 12" />
          <polygon points="12 2 21 6.92 12 12 3 6.92 12 2" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      );
    case 'recharge':
      return (
        <svg {...iconProps}>
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
          <line x1="1" y1="10" x2="23" y2="10" />
          <line x1="7" y1="15" x2="11" y2="15" />
        </svg>
      );
    case 'withdraw':
      return (
        <svg {...iconProps}>
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      );
    case 'task':
    case 'tasks':
      return (
        <svg {...iconProps}>
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
          <polyline points="9 11 12 14 22 4" />
        </svg>
      );
    case 'about':
      return (
        <svg {...iconProps}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      );
    case 'plans':
      return (
        <svg {...iconProps}>
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      );
    case 'myteam':
    case 'team':
      return (
        <svg {...iconProps}>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case 'settings':
      return (
        <svg {...iconProps}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      );
    case 'leaderboard':
      return (
        <svg {...iconProps}>
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
          <path d="M4 22h16" />
          <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" />
          <path d="M12 2a4 4 0 0 1 4 4v6H8V6a4 4 0 0 1 4-4z" />
        </svg>
      );
    case 'support':
      return (
        <svg {...iconProps}>
          <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
          <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
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
    case 'my':
    case 'profile':
      return (
        <svg {...iconProps}>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    case 'logout':
      return (
        <svg {...iconProps}>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
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

// 🔐 Auth Context (Inline)
const AuthContext = React.createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(sessionStorage.getItem('gm_token'));

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await axios.get(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data.success) {
            setUser(res.data.user);
          }
        } catch (err) {
          console.error('Failed to load user:', err);
          logout();
        }
      }
    };
    loadUser();
  }, [token]);

  const login = async (phone, password) => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { phone, password });
      const { token, role } = res.data;
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('gm_token', token);
      sessionStorage.setItem('role', role);
      setToken(token);
      setUser(res.data.user || { role });
      return { success: true, role, redirect: res.data.redirect };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (data) => {
    try {
      const res = await axios.post(`${API_URL}/auth/register`, data);
      sessionStorage.setItem('token', res.data.token);
      sessionStorage.setItem('gm_token', res.data.token);
      sessionStorage.setItem('role', 'user');
      setToken(res.data.token);
      setUser(res.data.user);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('gm_token');
    sessionStorage.removeItem('role');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => React.useContext(AuthContext);

// 🛡️ Protected Route
const ProtectedRoute = ({ children }) => {
  const token = sessionStorage.getItem('gm_token');
  const role = sessionStorage.getItem('role');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  if (role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  
  return children;
};

// 👑 Admin Protected Route
const AdminRoute = ({ children }) => {
  const token = sessionStorage.getItem('gm_token');
  const role = sessionStorage.getItem('role');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  if (role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// 📝 Register Page
const Register = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();
  const [showWelcome, setShowWelcome] = useState(true);
  const [seconds, setSeconds] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    phone: '',
    countryCode: '+91',
    fullName: '',
    password: '',
    confirmPassword: '',
    inviteCode: new URLSearchParams(window.location.search).get('inviteCode') || '',
    securityQuestion: '',
    securityAnswer: ''
  });

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (seconds > 0) {
      const timer = setTimeout(() => setSeconds(seconds - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [seconds]);

  // Captcha loading logic removed

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    const { confirmPassword, ...submitData } = formData;
    const result = await register(submitData);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      
      {/* Welcome Modal */}
      {showWelcome && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '16px', maxWidth: '400px', width: '100%', padding: '28px', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '50px', marginBottom: '10px' }}>🌱</div>
              <h2 style={{ color: '#15803d', fontSize: '22px', marginBottom: '5px' }}>Welcome to GrowMore</h2>
            </div>
            <div style={{ color: '#4b5563', fontSize: '14px', lineHeight: 1.6, marginBottom: '20px' }}>
              <p style={{ marginBottom: '10px' }}><strong>GrowMore</strong> is a leading referral-based growth platform founded to empower individuals across India to grow their network and earn rewards.</p>
              <p style={{ marginBottom: '10px' }}>So far, we have helped more than <strong>500,000+ people</strong> across 21 states in India to earn additional income.</p>
              <p>A person can have only one account on GrowMore. Members must be 18 years or older.</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <button onClick={() => setShowWelcome(false)} disabled={seconds > 0} style={{ background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)', color: 'white', border: 'none', padding: '12px 40px', borderRadius: '25px', cursor: seconds > 0 ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '14px', opacity: seconds > 0 ? 0.6 : 1 }}>
                {seconds > 0 ? `Please wait... ${seconds}s` : 'OK'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="auth-card" style={{ maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <Logo size={100} />
          <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '8px' }}>Create your account</p>
        </div>

        {error && <div style={{ padding: '12px', borderRadius: '8px', marginBottom: '15px', background: '#fee2e2', color: '#b91c1c', fontSize: '14px', border: '1px solid #fecaca' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', color: '#374151', fontSize: '13px', marginBottom: '5px', fontWeight: 600 }}>Phone Number</label>
            <div style={{ display: 'flex', border: '2px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
              <select name="countryCode" value={formData.countryCode} onChange={handleChange} style={{ background: '#f9fafb', padding: '12px', border: 'none', borderRight: '2px solid #e5e7eb', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                <option value="+91">+91</option>
                <option value="+1">+1</option>
                <option value="+44">+44</option>
              </select>
              <input type="tel" name="phone" placeholder="Enter phone number" value={formData.phone} onChange={handleChange} required maxLength="10" pattern="[0-9]{10}" style={{ flex: 1, padding: '12px 15px', border: 'none', outline: 'none', fontSize: '14px' }} />
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', color: '#374151', fontSize: '13px', marginBottom: '5px', fontWeight: 600 }}>Full Name</label>
            <input type="text" name="fullName" placeholder="Enter your name" value={formData.fullName} onChange={handleChange} style={{ width: '100%', padding: '12px 15px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', color: '#374151', fontSize: '13px', marginBottom: '5px', fontWeight: 600 }}>Password</label>
            <input type="password" name="password" placeholder="Min 6 characters" value={formData.password} onChange={handleChange} required minLength="6" style={{ width: '100%', padding: '12px 15px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', color: '#374151', fontSize: '13px', marginBottom: '5px', fontWeight: 600 }}>Confirm Password</label>
            <input type="password" name="confirmPassword" placeholder="Confirm password" value={formData.confirmPassword} onChange={handleChange} required minLength="6" style={{ width: '100%', padding: '12px 15px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', color: '#374151', fontSize: '13px', marginBottom: '5px', fontWeight: 600 }}>Invitation Code</label>
            <input type="text" name="inviteCode" placeholder="Enter invitation code" value={formData.inviteCode} onChange={handleChange} required style={{ width: '100%', padding: '12px 15px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', color: '#374151', fontSize: '13px', marginBottom: '5px', fontWeight: 600 }}>Security Question</label>
            <select name="securityQuestion" value={formData.securityQuestion} onChange={handleChange} required style={{ width: '100%', padding: '12px 15px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', cursor: 'pointer' }}>
              <option value="">Select a security question</option>
              <option value="partner">What is your partner's name?</option>
              <option value="brother">What is your brother's name?</option>
              <option value="sister">What is your sister's name?</option>
              <option value="mother">What is your mother's name?</option>
              <option value="father">What is your father's name?</option>
              <option value="pet">What is your pet's name?</option>
              <option value="teacher">What is your favourite teacher's name?</option>
              <option value="city">What city were you born in?</option>
              <option value="friend">What is your best friend's name?</option>
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', color: '#374151', fontSize: '13px', marginBottom: '5px', fontWeight: 600 }}>Answer</label>
            <input type="text" name="securityAnswer" placeholder="Enter your answer" value={formData.securityAnswer} onChange={handleChange} required style={{ width: '100%', padding: '12px 15px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          {/* Captcha removed */}

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '10px', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Creating account...' : 'Join GrowMore'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', color: '#6b7280', fontSize: '14px' }}>
          Already have an account? <a href="/login" style={{ color: '#16a34a', textDecoration: 'none', fontWeight: 600 }}>Login</a>
        </div>
      </div>
    </div>
  );
};


// 🔑 Login Page (Unified Login Flow)
const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({ phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Forgot Password States
  const [showForgot, setShowForgot] = useState(false);
  const [forgotData, setForgotData] = useState({ phone: '', securityAnswer: '', newPassword: '', confirmNewPassword: '' });
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      const role = sessionStorage.getItem('role');
      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await login(formData.phone, formData.password);
    if (result.success) {
      if (result.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(result.message || 'Invalid Phone Number or Password');
    }
    setLoading(false);
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (forgotData.newPassword !== forgotData.confirmNewPassword) {
      setError('Passwords do not match');
      return;
    }
    setForgotLoading(true);
    setError('');
    setForgotSuccess('');

    try {
      const res = await axios.post(`${API_URL}/auth/forgot-password`, {
        phone: forgotData.phone,
        securityAnswer: forgotData.securityAnswer,
        newPassword: forgotData.newPassword
      });

      if (res.data.success) {
        setForgotSuccess(res.data.message || 'Password reset successful!');
        setForgotData({ phone: '', securityAnswer: '', newPassword: '', confirmNewPassword: '' });
        setTimeout(() => {
          setShowForgot(false);
          setForgotSuccess('');
        }, 2500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  if (showForgot) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <div className="auth-card" style={{ maxWidth: '400px' }}>
          <div style={{ textAlign: 'center', marginBottom: '25px' }}>
            <Logo size={100} />
            <p style={{ color: '#6b7280', fontSize: '15px', fontWeight: 700, marginTop: '8px' }}>Reset Your Password</p>
          </div>

          {error && <div style={{ padding: '12px', borderRadius: '8px', marginBottom: '15px', background: '#fee2e2', color: '#b91c1c', fontSize: '14px' }}>{error}</div>}
          {forgotSuccess && <div style={{ padding: '12px', borderRadius: '8px', marginBottom: '15px', background: '#d1fae5', color: '#065f46', fontSize: '14px', border: '1px solid #a7f3d0' }}>{forgotSuccess}</div>}

          <form onSubmit={handleForgotSubmit}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', color: '#374151', fontSize: '13px', marginBottom: '5px', fontWeight: 600 }}>Phone Number</label>
              <input type="tel" placeholder="Enter registered phone number" value={forgotData.phone} onChange={(e) => setForgotData({ ...forgotData, phone: e.target.value })} required style={{ width: '100%', padding: '12px 15px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', color: '#374151', fontSize: '13px', marginBottom: '5px', fontWeight: 600 }}>Security Answer</label>
              <input type="text" placeholder="Enter your security question answer" value={forgotData.securityAnswer} onChange={(e) => setForgotData({ ...forgotData, securityAnswer: e.target.value })} required style={{ width: '100%', padding: '12px 15px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', color: '#374151', fontSize: '13px', marginBottom: '5px', fontWeight: 600 }}>New Password</label>
              <input type="password" placeholder="Enter new password" value={forgotData.newPassword} onChange={(e) => setForgotData({ ...forgotData, newPassword: e.target.value })} required minLength="6" style={{ width: '100%', padding: '12px 15px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: '#374151', fontSize: '13px', marginBottom: '5px', fontWeight: 600 }}>Confirm New Password</label>
              <input type="password" placeholder="Confirm new password" value={forgotData.confirmNewPassword} onChange={(e) => setForgotData({ ...forgotData, confirmNewPassword: e.target.value })} required minLength="6" style={{ width: '100%', padding: '12px 15px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <button type="submit" disabled={forgotLoading} style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: forgotLoading ? 'not-allowed' : 'pointer', opacity: forgotLoading ? 0.7 : 1 }}>
              {forgotLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <span onClick={() => { setShowForgot(false); setError(''); }} style={{ color: '#16a34a', textDecoration: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}>Back to Login</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div className="auth-card" style={{ maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <Logo size={100} />
          <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '8px' }}>Login to your account</p>
        </div>

        {error && <div style={{ padding: '12px', borderRadius: '8px', marginBottom: '15px', background: '#fee2e2', color: '#b91c1c', fontSize: '14px' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', color: '#374151', fontSize: '13px', marginBottom: '5px', fontWeight: 600 }}>Phone Number</label>
            <input type="tel" name="phone" placeholder="Enter phone number" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required style={{ width: '100%', padding: '12px 15px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: '6px' }}>
            <label style={{ display: 'block', color: '#374151', fontSize: '13px', marginBottom: '5px', fontWeight: 600 }}>Password</label>
            <input type="password" name="password" placeholder="Enter password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required style={{ width: '100%', padding: '12px 15px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ textAlign: 'right', marginBottom: '16px' }}>
            <span 
              onClick={() => { setShowForgot(true); setError(''); }} 
              style={{ color: '#16a34a', fontSize: '13px', fontWeight: 600, cursor: 'pointer', textDecoration: 'none' }}
            >
              Forgot Password?
            </span>
          </div>
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Logging in...' : 'Login to GrowMore'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', color: '#6b7280', fontSize: '14px' }}>
          New to GrowMore? <a href="/register" style={{ color: '#16a34a', textDecoration: 'none', fontWeight: 600 }}>Create Account</a>
        </div>
      </div>
    </div>
  );
};

// 📊 Dashboard (Simplified)
const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const token = sessionStorage.getItem('gm_token');
        const res = await axios.get(`${API_URL}/auth/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data.stats);
      } catch (err) {
        console.error('Dashboard load failed:', err);
        if (err.response?.status === 401) {
          logout();
          navigate('/login');
        }
      }
    };
    loadStats();
  }, [logout, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!stats) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0fdf4' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '50px', height: '50px', border: '4px solid #d1fae5', borderTop: '4px solid #16a34a', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <p style={{ color: '#15803d', fontWeight: 600 }}>Loading GrowMore...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const shareLink = `${window.location.origin}/register?inviteCode=${stats.referralCode}`;
  const quickActions = [
    { label: 'Invite', color: '#3b82f6', onClick: () => openPanel('invite') },
    { label: 'Bonus', color: '#f59e0b', onClick: () => openPanel('gift') },
    { label: 'Services', color: '#8b5cf6', onClick: () => alert('Services') },
    { label: 'My Product', color: '#06b6d4', onClick: () => alert('My Product') },
    { label: 'Recharge', color: '#ec4899', onClick: () => alert('Recharge') },
    { label: 'Withdraw', color: '#dc2626', onClick: () => alert('Withdraw') },
    { label: 'Task', color: '#10b981', onClick: () => alert('Task') }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f0fdf4', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '900px', margin: '0 auto 24px', padding: '18px 24px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Logo size={50} />
          <div>
            <h1 style={{ color: '#15803d', fontSize: '22px', fontWeight: 800, margin: 0 }}>GrowMore</h1>
            <p style={{ color: '#16a34a', fontSize: '10px', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', margin: 0 }}>Grow Today, Greater Tomorrow</p>
          </div>
        </div>
        <button onClick={handleLogout} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
          Logout
        </button>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', background: 'white', borderRadius: '16px', padding: '28px' }}>
        <div style={{ background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)', color: 'white', padding: '24px', borderRadius: '12px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '22px', marginBottom: '6px' }}>Welcome back, {user?.fullName || 'Member'}! 🌱</h2>
          <p>Phone: {user?.countryCode} {user?.phone}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '28px' }}>
          <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '20px', textAlign: 'center', borderLeft: '4px solid #f59e0b' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>💰</div>
            <h4 style={{ color: '#6b7280', fontSize: '13px', marginBottom: '6px' }}>Total Earnings</h4>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>₹ {stats.totalEarnings || 0}</p>
          </div>
          <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '20px', textAlign: 'center', borderLeft: '4px solid #16a34a' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>💵</div>
            <h4 style={{ color: '#6b7280', fontSize: '13px', marginBottom: '6px' }}>Balance</h4>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>₹ {stats.availableBalance || 0}</p>
          </div>
          <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '20px', textAlign: 'center', borderLeft: '4px solid #3b82f6' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}></div>
            <h4 style={{ color: '#6b7280', fontSize: '13px', marginBottom: '6px' }}>Referrals</h4>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>{stats.directReferrals || 0}</p>
          </div>
          <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '20px', textAlign: 'center', borderLeft: '4px solid #8b5cf6' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🌐</div>
            <h4 style={{ color: '#6b7280', fontSize: '13px', marginBottom: '6px' }}>Team</h4>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>{stats.totalTeam || 0}</p>
          </div>
        </div>

        <div style={{ background: '#f0fdf4', padding: '22px', borderRadius: '12px', marginBottom: '24px', border: '2px dashed #16a34a' }}>
          <h3 style={{ color: '#15803d', marginBottom: '12px' }}>🎯 Your Referral Code</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'white', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px' }}>
            <span style={{ flex: 1, fontWeight: 'bold', color: '#047857', fontSize: '16px' }}>{stats.referralCode}</span>
            <button onClick={() => { navigator.clipboard.writeText(stats.referralCode); alert('Copied!'); }} style={{ background: '#16a34a', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 600 }}>📋 Copy</button>
          </div>
          <h3 style={{ color: '#15803d', marginBottom: '12px' }}>🔗 Share Link</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'white', padding: '12px 16px', borderRadius: '8px' }}>
            <span style={{ flex: 1, fontSize: '12px', color: '#4b5563', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{shareLink}</span>
            <button onClick={() => { navigator.clipboard.writeText(shareLink); alert('Copied!'); }} style={{ background: '#16a34a', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 600 }}>📋 Copy</button>
          </div>
        </div>

        <div>
          <h3 style={{ color: '#1f2937', marginBottom: '12px' }}>Quick Actions</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
            {quickActions.map(action => (
              <button key={action.label} onClick={action.onClick} style={{ background: 'white', border: `2px solid ${action.color}`, color: action.color, padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s' }}>
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// 📱 Mobile Dashboard View
const MobileDashboard = ({ requests = [], setRequests }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (location.state?.activePanel) {
      setActivePanel(location.state.activePanel);
      setIsHomeActive(location.state.activePanel === 'home');
    }
  }, [location]);
  const [stats, setStats] = useState(null);
  const [teamStats, setTeamStats] = useState(null);
  const [levelDistribution, setLevelDistribution] = useState([]);
  const [teamList, setTeamList] = useState([]);
  const [memberFilter, setMemberFilter] = useState('all');
  const [memberSearchName, setMemberSearchName] = useState('');
  const [memberSearchPhone, setMemberSearchPhone] = useState('');
  const [memberSortBy, setMemberSortBy] = useState('joinDateDesc');
  const [selectedMember, setSelectedMember] = useState(null);
  const [referralHistory, setReferralHistory] = useState([]);
  const [referralHistoryPage, setReferralHistoryPage] = useState(1);
  const [referralHistoryPages, setReferralHistoryPages] = useState(1);
  const [socket, setSocket] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [bonusClaimed, setBonusClaimed] = useState(false);
  const [toast, setToast] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [rewardDetail, setRewardDetail] = useState({});
  const [lastUpdated, setLastUpdated] = useState('');
  const [investments, setInvestments] = useState([]);
  const [investmentsLoading, setInvestmentsLoading] = useState(false);
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [giftCodeInput, setGiftCodeInput] = useState('');
  const [bankDetailsInput, setBankDetailsInput] = useState({ holderName: '', bankName: '', accountNumber: '', ifsc: '', upiId: '' });
  const [bankDetailsSaved, setBankDetailsSaved] = useState(false);

  // Panel navigation state (URL hash-based routing)
  const [activePanel, setActivePanel] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'product' || hash === 'market') return 'plans';
    return hash || 'home';
  }); 
  const [isHomeActive, setIsHomeActive] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    return !hash || hash === 'home';
  });

  const openPanel = (panelName) => {
    window.location.hash = panelName;
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || 'home';
      let targetPanel = hash;
      if (hash === 'product' || hash === 'market') targetPanel = 'plans';
      setActivePanel(targetPanel);
      setIsHomeActive(targetPanel === 'home');
    };

    window.addEventListener('hashchange', handleHashChange);
    // Sync initial load state
    handleHashChange();

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activePanel]);

  const [inviteSubTab, setInviteSubTab] = useState('link');

  // Tasks state
  const [tasks, setTasks] = useState([
    { id: 'profile', title: 'Check Profile Details', reward: 10, done: false },
    { id: 'invite', title: 'Share Refer & Earn Link', reward: 15, done: false },
    { id: 'plans', title: 'Check Product Plans', reward: 10, done: false }
  ]);
  const [promotionTasks, setPromotionTasks] = useState([]);
  const [activeReferralCount, setActiveReferralCount] = useState(0);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [claimedRewardAmount, setClaimedRewardAmount] = useState(0);

  const loadTeamStats = async () => {
    try {
      const token = sessionStorage.getItem('gm_token');
      const res = await axios.get(`${API_URL}/auth/team/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setTeamStats(res.data.stats);
        setLevelDistribution(res.data.levelDistribution || []);
        setTeamList(res.data.teamList || []);
      }
    } catch (err) {
      console.error('Error loading team stats:', err);
    }
  };

  const loadReferralHistory = async (page = 1) => {
    try {
      const token = sessionStorage.getItem('gm_token');
      const res = await axios.get(`${API_URL}/auth/team/history?page=${page}&limit=10`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setReferralHistory(res.data.history || []);
        setReferralHistoryPage(res.data.page);
        setReferralHistoryPages(res.data.pages);
      }
    } catch (err) {
      console.error('Error loading referral history:', err);
    }
  };

  useEffect(() => {
    if (user && user.id) {
      const initSocket = (ioLib) => {
        const socketUrl = API_URL.replace('/api', '');
        
        const socketClient = ioLib(socketUrl, {
          withCredentials: true
        });

        socketClient.emit('join', user.id);

        socketClient.on('commission_update', (data) => {
          showToast(`${data.title}\n${data.message}`);
          loadStats();
          loadTeamStats();
          loadReferralHistory(1);
        });

        setSocket(socketClient);
        return socketClient;
      };

      let activeSocket = null;

      if (window.io) {
        activeSocket = initSocket(window.io);
      } else {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/socket.io-client@4.7.2/dist/socket.io.min.js';
        script.onload = () => {
          if (window.io) {
            activeSocket = initSocket(window.io);
          }
        };
        document.body.appendChild(script);
      }

      return () => {
        if (activeSocket) {
          activeSocket.disconnect();
        }
      };
    }
  }, [user]);

  useEffect(() => {
    if (activePanel === 'invite') {
      loadTeamStats();
      loadReferralHistory(1);
    } else if (activePanel === 'task') {
      loadPromotionTasks();
    }
  }, [activePanel]);

  const loadStats = async () => {
    try {
      const token = sessionStorage.getItem('gm_token');
      const res = await axios.get(`${API_URL}/auth/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data.stats);
      setRecentTransactions(res.data.recentTransactions || []);
      setBonusClaimed(!!res.data.bonusClaimedToday);
      setTasks((currentTasks) => currentTasks.map((task) => ({
        ...task,
        done: !!res.data.taskStatus?.[task.id]
      })));
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Dashboard load failed:', err);
      if (err.response?.status === 401) {
        logout();
        navigate('/login');
      }
    }
  };

  const loadBankDetails = async () => {
    try {
      const token = sessionStorage.getItem('gm_token');
      if (!token) return;
      const res = await axios.get(`${API_URL}/bank/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success && res.data.bankDetails) {
        setBankDetailsInput({
          holderName: res.data.bankDetails.accountHolderName || '',
          bankName: res.data.bankDetails.bankName || '',
          accountNumber: res.data.bankDetails.accountNumber || '',
          ifsc: res.data.bankDetails.ifscCode || '',
          upiId: res.data.bankDetails.upiId || ''
        });
        setBankDetailsSaved(true);
      } else {
        setBankDetailsSaved(false);
      }
    } catch (err) {
      console.log('No bank details loaded or error:', err.response?.data?.message || err.message);
      setBankDetailsSaved(false);
    }
  };

  const loadInvestments = async (showLoading = true) => {
    if (showLoading) setInvestmentsLoading(true);
    try {
      const token = sessionStorage.getItem('gm_token');
      const res = await axios.get(`${API_URL}/plans/user/my-investments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInvestments(res.data.investments || []);
    } catch (err) {
      console.error('Investments load failed:', err);
      showToast('Could not load products');
    } finally {
      if (showLoading) setInvestmentsLoading(false);
    }
  };

  useEffect(() => {
    if (activePanel === 'plans') {
      loadPlans();
    }
    if (activePanel === 'myproduct') {
      loadInvestments();
    }
  }, [activePanel]);

  const loadPlans = async () => {
    setPlansLoading(true);
    try {
      const token = sessionStorage.getItem('gm_token');
      const res = await fetch(`${API_URL}/plans`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setPlans(data.plans);
      }
    } catch (err) {
      console.error('Failed to load plans:', err);
    } finally {
      setPlansLoading(false);
    }
  };

  const handleInvest = async (planId) => {
    try {
      const token = sessionStorage.getItem('gm_token');
      const res = await axios.post(`${API_URL}/plans/${planId}/invest`, { quantity: 1 }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast(res.data.success ? '✅ ' + res.data.message : '❌ ' + res.data.message);
      if (res.data.success) {
        loadPlans();
        loadStats(); // reload balance
        loadInvestments();
      }
    } catch (err) {
      showToast('❌ ' + (err.response?.data?.message || 'Network error'));
    }
  };

  const handleClaim = async (planId, investmentId) => {
    try {
      const token = sessionStorage.getItem('gm_token');
      const res = await axios.post(`${API_URL}/plans/${planId}/claim/${investmentId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast(res.data.success ? res.data.message : '❌ ' + res.data.message);
      if (res.data.success) {
        loadStats(); // reload balance
        loadInvestments(false); // reload the investments list to update claimed state without layout collapse
      }
    } catch (err) {
      showToast('❌ ' + (err.response?.data?.message || 'Network error'));
    }
  };

  useEffect(() => {
    loadStats();
    loadBankDetails();
    loadPlans();
    
    // Poll stats and background data every 8 seconds for real-time balance tracking
    const pollInterval = setInterval(() => {
      loadStats();
      if (activePanel === 'myproduct') {
        loadInvestments(false);
      }
    }, 8000);

    return () => clearInterval(pollInterval);
  }, [activePanel]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 2200);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const copyInvite = () => {
    const inviteLink = `${window.location.origin}/register?inviteCode=${stats?.referralCode || ''}`;
    navigator.clipboard.writeText(inviteLink);
    showToast('Referral link copied successfully!');
  };

  const claimBonus = async () => {
    if (bonusClaimed) {
      showToast('Daily bonus already claimed!');
      return;
    }
    try {
      const token = sessionStorage.getItem('gm_token');
      const res = await axios.post(`${API_URL}/auth/bonus/daily`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBonusClaimed(true);
      showToast(res.data.message || 'Daily bonus claimed successfully!');
      loadStats();
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not claim bonus');
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      const token = sessionStorage.getItem('gm_token');
      const res = await axios.post(`${API_URL}/auth/tasks/complete`, { taskId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(tasks.map((item) => item.id === taskId ? { ...item, done: true } : item));
      showToast(res.data.message || 'Task reward added');
      loadStats();
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not complete task');
      loadStats();
    }
  };

  const loadPromotionTasks = async () => {
    setTasksLoading(true);
    try {
      const token = sessionStorage.getItem('gm_token');
      const res = await axios.get(`${API_URL}/auth/promotion-tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setPromotionTasks(res.data.tasks || []);
        setActiveReferralCount(res.data.activeCount || 0);
      }
    } catch (err) {
      console.error('Error loading promotion tasks:', err);
    } finally {
      setTasksLoading(false);
    }
  };

  const handleClaimMilestone = async (taskId) => {
    try {
      const token = sessionStorage.getItem('gm_token');
      const res = await axios.post(`${API_URL}/auth/promotion-tasks/claim/${taskId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        const completedTask = promotionTasks.find(t => t._id === taskId);
        const rewardAmount = completedTask ? completedTask.reward : 100;
        setClaimedRewardAmount(rewardAmount);
        setShowConfetti(true);
        loadPromotionTasks();
        loadStats();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to claim reward');
    }
  };

  const actionButtons = [
    { label: 'Plans', gradient: 'linear-gradient(135deg, #10b981, #059669)', shadow: 'rgba(16, 185, 129, 0.25)', onClick: () => openPanel('plans') },
    { label: 'Invite', gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', shadow: 'rgba(59, 130, 246, 0.25)', onClick: () => openPanel('invite') },
    { label: 'Bonus', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)', shadow: 'rgba(245, 158, 11, 0.25)', onClick: () => openPanel('gift') },
    { label: 'Services', gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', shadow: 'rgba(139, 92, 246, 0.25)', onClick: () => openPanel('services') },
    { label: 'My product', gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)', shadow: 'rgba(6, 182, 212, 0.25)', onClick: () => openPanel('myproduct') },
    { label: 'Recharge', gradient: 'linear-gradient(135deg, #ec4899, #be185d)', shadow: 'rgba(236, 72, 153, 0.25)', onClick: () => navigate('/recharge') },
    { label: 'Withdraw', gradient: 'linear-gradient(135deg, #ef4444, #b91c1c)', shadow: 'rgba(239, 68, 68, 0.25)', onClick: () => navigate('/withdraw') },
    { label: 'Task', gradient: 'linear-gradient(135deg, #10b981, #047857)', shadow: 'rgba(16, 185, 129, 0.25)', onClick: () => openPanel('task') }
  ];

  const renderPanel = () => {
    if (activePanel === 'invite') {
      const shareLink = `${window.location.origin}/register?inviteCode=${stats?.referralCode || ''}`;
      
      // Social Share URLs
      const whatsappUrl = `https://api.whatsapp.com/send?text=Join%20GrowMore%20now%20to%20start%20investing%20and%20earning%20daily!%20Register%20here:%20${encodeURIComponent(shareLink)}`;
      const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareLink)}&text=Join%20GrowMore%20now%20to%20start%20investing%20and%20earning%20daily!`;
      const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`;
      const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareLink)}&text=Join%20GrowMore%20now%20to%20start%20investing%20and%20earning%20daily!`;
      const emailUrl = `mailto:?subject=GrowMore%20Invitation&body=Join%20GrowMore%20now%20to%20start%20investing%20and%20earning%20daily!%20Register%20here:%20${shareLink}`;

      return (
        <div style={{ background: '#f8fafc', paddingBottom: '30px' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Team & Referrals</h2>
          </div>

          {/* Dynamic Counters Card Grid */}
          <div style={{ 
            background: 'white', 
            borderRadius: '20px', 
            padding: '20px', 
            boxShadow: '0 4px 20px rgba(0,0,0,0.01)', 
            border: '1px solid #e2e8f0',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', textAlign: 'center' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '16px', color: '#1e293b', fontWeight: 800 }}>{teamStats?.totalTeamCount || 0}</strong>
                <span style={{ display: 'block', fontSize: '9px', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>Total Team</span>
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '16px', color: '#16a34a', fontWeight: 800 }}>{teamStats?.activeTeamCount || 0}</strong>
                <span style={{ display: 'block', fontSize: '9px', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>Active</span>
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '16px', color: '#ef4444', fontWeight: 800 }}>{teamStats?.inactiveTeamCount || 0}</strong>
                <span style={{ display: 'block', fontSize: '9px', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>Inactive</span>
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '16px', color: '#1e293b', fontWeight: 800 }}>{teamStats?.todayNewMembers || 0}</strong>
                <span style={{ display: 'block', fontSize: '9px', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>Today New</span>
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '16px', color: '#1e293b', fontWeight: 800 }}>₹{teamStats?.todayTeamInvestment || 0}</strong>
                <span style={{ display: 'block', fontSize: '9px', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>Today Invest</span>
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '16px', color: '#1e293b', fontWeight: 800 }}>₹{teamStats?.totalTeamInvestment || 0}</strong>
                <span style={{ display: 'block', fontSize: '9px', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>Total Invest</span>
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '16px', color: '#16a34a', fontWeight: 800 }}>₹{(teamStats?.todayReferralIncome || 0).toFixed(2)}</strong>
                <span style={{ display: 'block', fontSize: '9px', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>Today Bonus</span>
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '16px', color: '#16a34a', fontWeight: 800 }}>₹{(teamStats?.totalReferralIncome || 0).toFixed(2)}</strong>
                <span style={{ display: 'block', fontSize: '9px', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>Total Bonus</span>
              </div>

            </div>
          </div>

          <div style={{ display: 'flex', gap: '6px', background: '#f1f5f9', padding: '4px', borderRadius: '12px', marginBottom: '20px' }}>
            {[
              ['link', 'Invite'],
              ['list', 'Members'],
              ['history', 'Payouts']
            ].map(([tabId, tabLabel]) => (
              <button
                key={tabId}
                onClick={() => setInviteSubTab(tabId)}
                style={{
                  flex: 1,
                  padding: '8px 4px',
                  border: 'none',
                  background: inviteSubTab === tabId ? 'linear-gradient(135deg, #16a34a, #15803d)' : 'transparent',
                  color: inviteSubTab === tabId ? 'white' : '#64748b',
                  fontSize: '11px',
                  fontWeight: 700,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: inviteSubTab === tabId ? '0 4px 10px rgba(22, 163, 74, 0.15)' : 'none'
                }}
              >
                {tabLabel}
              </button>
            ))}
          </div>

          {/* 🔗 INVITE LINK TAB */}
          {inviteSubTab === 'link' && (
            <div style={{ background: 'white', borderRadius: '20px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.01)', animation: 'slideIn 0.2s ease' }}>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '15px', color: '#1e293b', fontWeight: 800 }}>Invite Friends</h3>
              <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: '#64748b', lineHeight: 1.5 }}>Share your referral details. Earn automatic commissions across 5 levels of team hierarchy purchases!</p>
              
              <div style={{ marginBottom: '16px' }}>
                <span style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>Your Invite Code</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '10px 14px', borderRadius: '12px' }}>
                  <strong style={{ flex: 1, fontFamily: 'monospace', fontSize: '18px', color: '#16a34a', letterSpacing: '0.5px' }}>{stats?.referralCode}</strong>
                  <button onClick={() => { navigator.clipboard.writeText(stats?.referralCode || ''); showToast('Code copied successfully!'); }} style={{ background: '#16a34a', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '11px', fontWeight: 700 }}>Copy</button>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <span style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>Your Invite Link</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '10px 14px', borderRadius: '12px' }}>
                  <span style={{ flex: 1, fontSize: '12px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{shareLink}</span>
                  <button onClick={copyInvite} style={{ background: '#16a34a', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '11px', fontWeight: 700 }}>Copy Link</button>
                </div>
              </div>

              {/* Social Sharing Shortcuts */}
              <div>
                <span style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '10px', textAlign: 'center' }}>Or Share Via</span>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                  {/* WhatsApp */}
                  <a href={whatsappUrl} target="_blank" rel="noreferrer" style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#25d366', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', boxShadow: '0 4px 10px rgba(37,211,102,0.2)' }}>
                    <span style={{ fontSize: '18px', color: 'white' }}>💬</span>
                  </a>
                  {/* Telegram */}
                  <a href={telegramUrl} target="_blank" rel="noreferrer" style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#0088cc', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', boxShadow: '0 4px 10px rgba(0,136,204,0.2)' }}>
                    <span style={{ fontSize: '16px', color: 'white' }}>✈️</span>
                  </a>
                  {/* Facebook */}
                  <a href={facebookUrl} target="_blank" rel="noreferrer" style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#3b5998', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', boxShadow: '0 4px 10px rgba(59,89,152,0.2)' }}>
                    <span style={{ fontSize: '16px', color: 'white' }}>f</span>
                  </a>
                  {/* Instagram / Twitter */}
                  <a href={twitterUrl} target="_blank" rel="noreferrer" style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#1da1f2', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', boxShadow: '0 4px 10px rgba(29,161,242,0.2)' }}>
                    <span style={{ fontSize: '16px', color: 'white' }}>t</span>
                  </a>
                  {/* Email */}
                  <a href={emailUrl} style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', boxShadow: '0 4px 10px rgba(100,116,139,0.2)' }}>
                    <span style={{ fontSize: '16px', color: 'white' }}>✉️</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* 👥 MEMBERS TAB */}
          {inviteSubTab === 'list' && (() => {
            const totalActiveMembers = teamList.filter(ref => ref.status === 'Active').length;
            const totalInactiveMembers = teamList.filter(ref => ref.status === 'Inactive').length;

            const filteredTeamList = teamList
              .filter(ref => {
                // Status Filter
                if (memberFilter === 'active' && ref.status !== 'Active') return false;
                if (memberFilter === 'inactive' && ref.status !== 'Inactive') return false;
                
                // Name Search
                if (memberSearchName && !ref.fullName.toLowerCase().includes(memberSearchName.toLowerCase())) return false;
                
                // Phone Search (digits only, matching masked or unmasked patterns)
                if (memberSearchPhone && !ref.phone.replace(/[*-]/g, '').includes(memberSearchPhone.replace(/[*-]/g, '')) && !ref.phone.includes(memberSearchPhone)) return false;
                
                return true;
              })
              .sort((a, b) => {
                if (memberSortBy === 'joinDateDesc') {
                  return new Date(b.joinDate) - new Date(a.joinDate);
                } else if (memberSortBy === 'joinDateAsc') {
                  return new Date(a.joinDate) - new Date(b.joinDate);
                } else if (memberSortBy === 'investmentDesc') {
                  return b.currentInvestment - a.currentInvestment;
                } else if (memberSortBy === 'investmentAsc') {
                  return a.currentInvestment - b.currentInvestment;
                }
                return 0;
              });

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: 'slideIn 0.2s ease' }}>
                {/* 2. Simplified Filter tabs */}
                <div style={{ display: 'flex', gap: '8px', background: '#f1f5f9', padding: '4px', borderRadius: '10px', width: 'fit-content' }}>
                  {[
                    ['all', 'All Members'],
                    ['active', 'Active'],
                    ['inactive', 'Inactive']
                  ].map(([val, label]) => (
                    <button
                      key={val}
                      onClick={() => setMemberFilter(val)}
                      style={{
                        padding: '6px 14px',
                        border: 'none',
                        background: memberFilter === val ? 'white' : 'transparent',
                        color: memberFilter === val ? '#16a34a' : '#64748b',
                        fontSize: '11px',
                        fontWeight: 700,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        boxShadow: memberFilter === val ? '0 2px 6px rgba(0,0,0,0.05)' : 'none',
                        outline: 'none',
                        transition: 'all 0.2s'
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {/* 3. Team Members Cards List */}
                {filteredTeamList.length === 0 ? (
                  <div style={{
                    background: 'white',
                    borderRadius: '20px',
                    padding: '30px 20px',
                    border: '1px solid #e2e8f0',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}></div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', color: '#1e293b', fontWeight: 800 }}>No Members Found</h3>
                    <p style={{ margin: '0 auto 16px auto', fontSize: '12px', color: '#64748b', maxWidth: '300px' }}>
                      Invite friends to join your network and grow your team.
                    </p>
                    <button
                      onClick={() => setInviteSubTab('link')}
                      style={{
                        background: 'linear-gradient(135deg, #16a34a, #15803d)',
                        color: 'white',
                        border: 'none',
                        padding: '8px 20px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Invite Friends
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {filteredTeamList.map((ref, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: 'white',
                          borderRadius: '16px',
                          border: '1px solid #e2e8f0',
                          padding: '14px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.01)',
                          animation: 'fadeIn 0.2s ease'
                        }}
                      >
                        {/* Header Details */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: ref.status === 'Active' ? '#d1fae5' : '#fee2e2',
                              color: ref.status === 'Active' ? '#065f46' : '#991b1b',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '13px',
                              fontWeight: 700
                            }}>
                              {ref.fullName?.charAt(0).toUpperCase() || 'M'}
                            </div>
                            <div>
                              <strong style={{ fontSize: '13px', color: '#1e293b', display: 'block' }}>{ref.fullName}</strong>
                              <span style={{ fontSize: '11px', color: '#64748b' }}>{ref.phone} • Lvl {ref.level}</span>
                            </div>
                          </div>
                          
                          <span style={{
                            background: ref.status === 'Active' ? '#d1fae5' : '#fee2e2',
                            color: ref.status === 'Active' ? '#065f46' : '#991b1b',
                            fontSize: '9px',
                            fontWeight: 800,
                            padding: '3px 8px',
                            borderRadius: '10px',
                            textTransform: 'uppercase'
                          }}>
                            {ref.status}
                          </span>
                        </div>

                        {/* Simplified metrics */}
                        <div style={{ fontSize: '12px', color: '#475569', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                          <span>Invested: <strong style={{ color: '#1e293b' }}>₹{ref.currentInvestment}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <style>{`
                  @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(4px); }
                    to { opacity: 1; transform: translateY(0); }
                  }
                `}</style>

                {/* 7. Member Details Popup */}
                {selectedMember && (
                  <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'rgba(15, 23, 42, 0.6)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 99999,
                    padding: '20px'
                  }}>
                    <div style={{
                      background: 'white',
                      borderRadius: '24px',
                      maxWidth: '480px',
                      width: '100%',
                      padding: '24px',
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                      border: '1px solid #f1f5f9',
                      maxHeight: '85vh',
                      overflowY: 'auto',
                      position: 'relative',
                      animation: 'fadeIn 0.25s ease-out'
                    }}>
                      {/* Close Button */}
                      <button 
                        onClick={() => setSelectedMember(null)}
                        style={{
                          position: 'absolute',
                          top: '20px',
                          right: '20px',
                          background: '#f1f5f9',
                          border: 'none',
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          color: '#64748b',
                          outline: 'none',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#e2e8f0'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#f1f5f9'}
                      >
                        ✕
                      </button>

                      {/* Profile Header */}
                      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <div style={{
                          width: '72px',
                          height: '72px',
                          borderRadius: '50%',
                          background: selectedMember.status === 'Active' ? 'linear-gradient(135deg, #d1fae5, #a7f3d0)' : 'linear-gradient(135deg, #fee2e2, #fecaca)',
                          color: selectedMember.status === 'Active' ? '#065f46' : '#991b1b',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '28px',
                          fontWeight: 700,
                          marginBottom: '12px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                        }}>
                          {selectedMember.fullName?.charAt(0).toUpperCase() || 'M'}
                        </div>
                        <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', color: '#1e293b', fontWeight: 800 }}>{selectedMember.fullName}</h3>
                        <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#64748b' }}>{selectedMember.phone}</p>
                        
                        <span style={{
                          background: selectedMember.status === 'Active' ? '#d1fae5' : '#fee2e2',
                          color: selectedMember.status === 'Active' ? '#065f46' : '#991b1b',
                          fontSize: '10px',
                          fontWeight: 800,
                          padding: '4px 12px',
                          borderRadius: '12px',
                          textTransform: 'uppercase',
                          display: 'inline-block'
                        }}>
                          {selectedMember.status}
                        </span>
                      </div>

                      {/* Detail Metrics Grid */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '12px',
                        marginBottom: '20px',
                        background: '#f8fafc',
                        padding: '16px',
                        borderRadius: '16px',
                        border: '1px solid #f1f5f9'
                      }}>
                        <div>
                          <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Wallet Balance</span>
                          <strong style={{ fontSize: '14px', color: '#1e293b', fontWeight: 800 }}>₹{selectedMember.walletBalance || 0}</strong>
                        </div>
                        <div>
                          <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Total Investment</span>
                          <strong style={{ fontSize: '14px', color: '#1e293b', fontWeight: 800 }}>₹{selectedMember.currentInvestment || 0}</strong>
                        </div>
                        <div>
                          <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Daily Income</span>
                          <strong style={{ fontSize: '14px', color: '#16a34a', fontWeight: 800 }}>₹{selectedMember.dailyIncome || 0}</strong>
                        </div>
                        <div>
                          <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Referral Earnings</span>
                          <strong style={{ fontSize: '14px', color: '#16a34a', fontWeight: 800 }}>₹{(selectedMember.totalIncome || 0).toFixed(2)}</strong>
                        </div>
                      </div>

                      {/* Timestamps */}
                      <div style={{
                        fontSize: '12px',
                        color: '#64748b',
                        marginBottom: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        borderBottom: '1px solid #f1f5f9',
                        paddingBottom: '14px'
                      }}>
                        <div>📅 <strong>Registration Date:</strong> {new Date(selectedMember.joinDate).toLocaleString()}</div>
                        <div>⚡ <strong>Last Active:</strong> {new Date(selectedMember.lastActive).toLocaleString()}</div>
                      </div>

                      {/* Active Plans List */}
                      <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#1e293b', fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Purchased Plans</span>
                        <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '8px', fontSize: '11px', color: '#475569' }}>{selectedMember.plansCount || 0} plans</span>
                      </h4>
                      
                      {(!selectedMember.investmentPlans || selectedMember.investmentPlans.length === 0) ? (
                        <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', padding: '16px 0' }}>No investment plans active.</p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
                          {selectedMember.investmentPlans.map((plan, idx) => (
                            <div key={idx} style={{
                              padding: '10px 12px',
                              background: '#f8fafc',
                              borderRadius: '12px',
                              border: '1px solid #f1f5f9',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}>
                              <div>
                                <strong style={{ fontSize: '12px', color: '#1e293b', display: 'block' }}>{plan.name}</strong>
                                <span style={{ fontSize: '10px', color: '#64748b' }}>Amount: ₹{plan.amount} • {plan.duration}d</span>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <span style={{
                                  background: plan.isActive ? '#d1fae5' : '#e2e8f0',
                                  color: plan.isActive ? '#065f46' : '#64748b',
                                  fontSize: '9px',
                                  fontWeight: 800,
                                  padding: '2px 6px',
                                  borderRadius: '8px',
                                  display: 'inline-block',
                                  marginBottom: '2px',
                                  textTransform: 'uppercase'
                                }}>
                                  {plan.isActive ? 'Active' : 'Expired'}
                                </span>
                                <span style={{ display: 'block', fontSize: '10px', color: '#16a34a', fontWeight: 700 }}>+₹{plan.dailyIncome}/d</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* PAYOUTS TAB */}
          {inviteSubTab === 'history' && (
            <div style={{ background: 'white', borderRadius: '20px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.01)', animation: 'slideIn 0.2s ease' }}>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '15px', color: '#1e293b', fontWeight: 800 }}>Commission History</h3>
              <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: '#64748b' }}>Logs of all level commission payouts credited to your account.</p>

              {referralHistory.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 10px', color: '#64748b' }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>💰</div>
                  <p style={{ margin: 0, fontSize: '12px', fontWeight: 600 }}>No commission payouts found.</p>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                    {referralHistory.map((item, idx) => (
                      <div key={idx} style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: '14px', border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ fontSize: '13px', color: '#1e293b', display: 'block' }}>{item.referralName} (Lvl {item.commissionLevel})</strong>
                          <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '2px' }}>Claimed: {item.investmentPlan} (Daily: ₹{item.dailyIncome || 0})</span>
                          <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block', marginTop: '2px' }}>{new Date(item.date).toLocaleString()}</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <strong style={{ fontSize: '14px', color: '#16a34a', fontWeight: 800 }}>+₹{item.commissionEarned}</strong>
                          <span style={{ display: 'block', fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>{item.commissionPercent}% share</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {referralHistoryPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                      <button 
                        onClick={() => loadReferralHistory(referralHistoryPage - 1)} 
                        disabled={referralHistoryPage === 1}
                        style={{ border: '1px solid #cbd5e1', background: 'white', color: '#475569', borderRadius: '8px', padding: '6px 12px', fontSize: '11px', cursor: referralHistoryPage === 1 ? 'not-allowed' : 'pointer' }}
                      >
                        Prev
                      </button>
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Page {referralHistoryPage} of {referralHistoryPages}</span>
                      <button 
                        onClick={() => loadReferralHistory(referralHistoryPage + 1)} 
                        disabled={referralHistoryPage === referralHistoryPages}
                        style={{ border: '1px solid #cbd5e1', background: 'white', color: '#475569', borderRadius: '8px', padding: '6px 12px', fontSize: '11px', cursor: referralHistoryPage === referralHistoryPages ? 'not-allowed' : 'pointer' }}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    if (activePanel === 'profile') {
      const displayPhone = user?.phone || '9985238221';
      const vipLevel = stats.level !== undefined ? stats.level : 0;
      
      const menuItems = [
        { label: 'My Order', icon: 'plans', gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)', shadow: 'rgba(6, 182, 212, 0.25)', onClick: () => openPanel('myproduct') },
        { label: 'Transaction', icon: 'task', gradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', shadow: 'rgba(16, 185, 129, 0.25)', onClick: () => openPanel('transactions') },
        { label: 'My bank account', icon: 'recharge', gradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)', shadow: 'rgba(236, 72, 153, 0.25)', onClick: () => setActiveModal('bank') },
        { label: 'Recharge Records', icon: 'market', gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', shadow: 'rgba(245, 158, 11, 0.25)', onClick: () => openPanel('recharge_records') },
        { label: 'Withdraw Records', icon: 'withdraw', gradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', shadow: 'rgba(2, 132, 199, 0.25)', onClick: () => openPanel('withdraw_records') },
        { label: 'My team', icon: 'team', gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', shadow: 'rgba(59, 130, 246, 0.25)', onClick: () => openPanel('invite') },
        { label: 'Gift', icon: 'tasks', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', shadow: 'rgba(139, 92, 246, 0.25)', onClick: () => openPanel('gift') },
        { label: 'Online service', icon: 'support', gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', shadow: 'rgba(16, 185, 129, 0.25)', onClick: () => setActiveModal('support_channels') },
        { label: 'About Us', icon: 'about', gradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', shadow: 'rgba(99, 102, 241, 0.25)', onClick: () => navigate('/about') },
        { label: 'Logout', icon: 'logout', gradient: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', shadow: 'rgba(239, 68, 68, 0.25)', onClick: handleLogout, color: '#ef4444' }
      ];

      return (
        <div style={{ background: '#f8fafc', paddingBottom: '20px' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Account</h2>
          </div>

          {/* Top User VIP Card */}
          <div style={{ 
            background: 'linear-gradient(135deg, #f0fdf4 0%, #e8f5e9 100%)', 
            borderRadius: '20px', 
            padding: '24px 20px', 
            border: '1px solid rgba(22, 163, 74, 0.1)', 
            boxShadow: '0 8px 30px rgba(22, 163, 74, 0.04)',
            marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  background: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  flexShrink: 0
                }}>
                  <LogoIcon size={36} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b', margin: '0 0 2px 0' }}>{displayPhone}</h3>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>UID: {user?._id?.substring(18) || 'Member'}</span>
                </div>
              </div>
              

            </div>

            {/* Sub-Metrics Grid */}
            <div className="stats-grid" style={{ marginBottom: '20px' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '15px', color: '#1e293b', fontWeight: 800 }}>₹{stats.totalRecharge?.toFixed(2) || '0.00'}</strong>
                <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>Recharge wallet</span>
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '15px', color: '#1e293b', fontWeight: 800 }}>₹{stats.availableBalance?.toFixed(2) || '0.00'}</strong>
                <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>Balance wallet</span>
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '15px', color: '#16a34a', fontWeight: 800 }}>₹{stats.totalEarnings?.toFixed(2) || '0.00'}</strong>
                <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>Total assets</span>
              </div>
            </div>

            {/* Quick Actions (Recharge / Withdraw) */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => navigate('/recharge')}
                style={{ 
                  flex: 1, 
                  background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '12px', 
                  padding: '12px', 
                  fontWeight: 700, 
                  fontSize: '12px', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(22, 163, 74, 0.15)'
                }}
              >
                <ButtonSpecificIcon name="recharge" size={16} color="#ffffff" /> Recharge
              </button>
              <button 
                onClick={() => navigate('/withdraw')}
                style={{ 
                  flex: 1, 
                  background: 'white', 
                  color: '#16a34a', 
                  border: '1.5px solid #16a34a', 
                  borderRadius: '12px', 
                  padding: '12px', 
                  fontWeight: 700, 
                  fontSize: '12px', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <ButtonSpecificIcon name="withdraw" size={16} color="#16a34a" /> Withdraw
              </button>
            </div>
          </div>

          {/* Stats Card Grid */}
          <div style={{ 
            background: 'white', 
            borderRadius: '20px', 
            padding: '20px 16px', 
            boxShadow: '0 4px 20px rgba(0,0,0,0.01)', 
            border: '1px solid #e2e8f0',
            marginBottom: '20px'
          }}>
            <div className="stats-grid">
              <div>
                <strong style={{ display: 'block', fontSize: '14px', color: '#1e293b', fontWeight: 800 }}>₹{stats.totalRecharge?.toFixed(2) || '0.00'}</strong>
                <span style={{ display: 'block', fontSize: '9px', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>Total recharge</span>
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '14px', color: '#1e293b', fontWeight: 800 }}>₹{stats.totalWithdrawals?.toFixed(2) || '0.00'}</strong>
                <span style={{ display: 'block', fontSize: '9px', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>Total withdraw</span>
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '14px', color: '#16a34a', fontWeight: 800 }}>₹{stats.totalEarnings?.toFixed(2) || '0.00'}</strong>
                <span style={{ display: 'block', fontSize: '9px', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>Total assets</span>
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '14px', color: '#1e293b', fontWeight: 800 }}>₹{(stats.todayIncome || 0).toFixed(2)}</strong>
                <span style={{ display: 'block', fontSize: '9px', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>Today's income</span>
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '14px', color: '#1e293b', fontWeight: 800 }}>₹{(stats.teamIncome || 0).toFixed(2)}</strong>
                <span style={{ display: 'block', fontSize: '9px', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>Team income</span>
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '14px', color: '#16a34a', fontWeight: 800 }}>₹{stats.totalEarnings?.toFixed(2) || '0.00'}</strong>
                <span style={{ display: 'block', fontSize: '9px', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>Total income</span>
              </div>
            </div>
          </div>

          {/* Links Menu List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {menuItems.map(item => (
              <button 
                key={item.label}
                onClick={item.onClick}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  padding: '14px 16px', 
                  background: 'white', 
                  border: 'none', 
                  borderRadius: '16px', 
                  boxShadow: '0 4px 15px rgba(0,0,0,0.01)', 
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'all 0.2s ease',
                  border: '1px solid rgba(226, 232, 240, 0.5)'
                }}
                className="profile-menu-item"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span style={{ 
                    width: '38px', 
                    height: '38px', 
                    borderRadius: '50%', 
                    background: item.gradient, 
                    color: 'white', 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    boxShadow: `0 4px 10px ${item.shadow}`
                  }}>
                    <ButtonSpecificIcon name={item.icon} size={18} color="#ffffff" />
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: item.color || '#334155' }}>{item.label}</span>
                </div>
                <span style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 700 }}>&gt;</span>
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (activePanel === 'services') {
      return (
        <div style={{ background: 'white', borderRadius: '20px', padding: '24px 20px', marginBottom: '18px', border: '1px solid #e2e8f0', boxShadow: '0 8px 30px rgba(0,0,0,0.02)' }}>
          <h3 style={{ color: '#16a34a', fontSize: '18px', fontWeight: 800, margin: '0 0 16px 0' }}>🛠️ Customer Services</h3>
          <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5, margin: '0 0 16px 0' }}>Need help? Reach out to our official customer support teams:</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <a 
              href="https://t.me/+neK1dYGhSNw5NjRl" 
              target="_blank" 
              rel="noreferrer" 
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: '#e0f2fe', borderRadius: '12px', textDecoration: 'none', color: '#0369a1', fontWeight: 700, fontSize: '13px' }}
            >
              <ButtonSpecificIcon name="telegram" size={16} color="#0369a1" /> Telegram Channel
            </a>
            <a 
              href="https://t.me/Growmoreagent" 
              target="_blank" 
              rel="noreferrer" 
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: '#e0f2fe', borderRadius: '12px', textDecoration: 'none', color: '#0369a1', fontWeight: 700, fontSize: '13px' }}
            >
              <ButtonSpecificIcon name="telegram" size={16} color="#0369a1" /> Telegram Agent
            </a>
          </div>
        </div>
      );
    }

    if (activePanel === 'myproduct') {
      return (
        <div style={{ background: 'white', borderRadius: '20px', padding: '24px 20px', marginBottom: '18px', border: '1px solid #e2e8f0', boxShadow: '0 8px 30px rgba(0,0,0,0.02)' }}>
          <h3 style={{ color: '#16a34a', fontSize: '18px', fontWeight: 800, margin: '0 0 16px 0' }}>My Products</h3>
          {investmentsLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[1, 2].map(n => (
                <div key={n} className="loading-skeleton" style={{ height: '80px', width: '100%', borderRadius: '16px' }}></div>
              ))}
            </div>
          ) : investments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: '#64748b' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🛍️</div>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>No products purchased yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {investments.map((inv, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px', fontSize: '14px', color: '#1e293b', fontWeight: 700 }}>{inv.planName || 'Investment Plan'}</h4>
                    <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Invested: <strong style={{ color: '#1e293b' }}>₹{inv.amount || 0}</strong></p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Daily income: <strong style={{ color: '#16a34a' }}>₹{inv.dailyIncome || 0}</strong></p>
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <span style={{ fontSize: '10px', background: '#d1fae5', color: '#065f46', padding: '4px 10px', borderRadius: '12px', fontWeight: 800 }}>ACTIVE</span>
                    <span style={{ display: 'block', fontSize: '10px', color: '#94a3b8' }}>{(inv.daysLeft !== undefined ? inv.daysLeft : inv.duration)} Days left</span>
                    <button
                      onClick={() => handleClaim(inv.planId, inv.investmentId)}
                      disabled={inv.claimedToday}
                      style={{
                        marginTop: '4px',
                        padding: '6px 14px',
                        borderRadius: '8px',
                        border: 'none',
                        color: 'white',
                        background: inv.claimedToday 
                          ? '#94a3b8' 
                          : 'linear-gradient(135deg, #16a34a, #15803d)',
                        fontWeight: 700,
                        fontSize: '11px',
                        cursor: inv.claimedToday ? 'not-allowed' : 'pointer',
                        boxShadow: inv.claimedToday ? 'none' : '0 4px 10px rgba(22, 163, 74, 0.2)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {inv.claimedToday ? 'CLAIMED' : 'CLAIM'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (activePanel === 'transactions') {
      return (
        <div style={{ background: 'white', borderRadius: '20px', padding: '24px 20px', marginBottom: '18px', border: '1px solid #e2e8f0', boxShadow: '0 8px 30px rgba(0,0,0,0.02)' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
            <button 
              onClick={() => openPanel('profile')} 
              style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '14px', color: '#64748b', fontWeight: 800 }}
            >
              ←
            </button>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#1e293b' }}>Transactions List</h3>
          </div>
          
          {recentTransactions.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#64748b', fontSize: '13px', padding: '20px' }}>No transactions recorded.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentTransactions.map((tx, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: '13px', color: '#1e293b', textTransform: 'capitalize' }}>
                      {(tx.type === 'invest' || (tx.type === 'withdrawal' && tx.description?.toLowerCase().includes('investment'))) 
                        ? 'Invest' 
                        : tx.type?.replace('_', ' ')}
                    </strong>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>{new Date(tx.createdAt).toLocaleString()}</span>
                  </div>
                  <strong style={{ fontSize: '14px', fontWeight: 800, color: (tx.type === 'withdrawal' || tx.type === 'invest') ? '#ef4444' : '#16a34a' }}>
                    {(tx.type === 'withdrawal' || tx.type === 'invest') ? '-' : '+'}{'₹'}{tx.amount}
                  </strong>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (activePanel === 'recharge_records') {
      return (
        <div style={{ background: 'white', borderRadius: '20px', padding: '24px 20px', marginBottom: '18px', border: '1px solid #e2e8f0', boxShadow: '0 8px 30px rgba(0,0,0,0.02)' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
            <button 
              onClick={() => openPanel('profile')} 
              style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '14px', color: '#64748b', fontWeight: 800 }}
            >
              ←
            </button>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#1e293b' }}>Recharge Records</h3>
          </div>

          {recentTransactions.filter(tx => tx.type === 'recharge').length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: '#64748b' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}></div>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>No recharge records found.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentTransactions.filter(tx => tx.type === 'recharge').map((tx, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: '13px', color: '#1e293b' }}>₹{tx.amount.toFixed(2)}</strong>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '2px', wordBreak: 'break-all' }}>Recharge ID: {tx._id}</span>
                    <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginTop: '2px', wordBreak: 'break-all' }}>Ref: {tx.reference || 'N/A'}</span>
                    <span style={{ fontSize: '10px', color: '#64748b', display: 'block', marginTop: '2px' }}>{new Date(tx.createdAt).toLocaleString()}</span>
                  </div>
                  <span style={{
                    padding: '6px 12px',
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
              ))}
            </div>
          )}
        </div>
      );
    }

    if (activePanel === 'withdraw_records') {
      return (
        <div style={{ background: 'white', borderRadius: '20px', padding: '24px 20px', marginBottom: '18px', border: '1px solid #e2e8f0', boxShadow: '0 8px 30px rgba(0,0,0,0.02)' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
            <button 
              onClick={() => openPanel('profile')} 
              style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '14px', color: '#64748b', fontWeight: 800 }}
            >
              ←
            </button>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#1e293b' }}>Withdrawal Records</h3>
          </div>

          {recentTransactions.filter(tx => tx.type === 'withdrawal' && !tx.description?.toLowerCase().includes('investment')).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: '#64748b' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}></div>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>No withdrawal records found.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentTransactions.filter(tx => tx.type === 'withdrawal' && !tx.description?.toLowerCase().includes('investment')).map((tx, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: '13px', color: '#1e293b' }}>₹{tx.amount.toFixed(2)}</strong>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '2px', wordBreak: 'break-all' }}>Withdrawal ID: {tx._id}</span>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '2px', wordBreak: 'break-all' }}>{tx.description || 'Withdrawal'}</span>
                    <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block', marginTop: '2px' }}>{new Date(tx.createdAt).toLocaleString()}</span>
                  </div>
                  <span style={{
                    padding: '6px 12px',
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
              ))}
            </div>
          )}
        </div>
      );
    }

    if (activePanel === 'gift') {
      return (
        <div style={{ background: 'white', borderRadius: '20px', padding: '24px 20px', marginBottom: '18px', border: '1px solid #e2e8f0', boxShadow: '0 8px 30px rgba(0,0,0,0.02)' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
            <button 
              onClick={() => openPanel('profile')} 
              style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '14px', color: '#64748b', fontWeight: 800 }}
            >
              ←
            </button>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#1e293b' }}>Redeem Gift Code</h3>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ 
              display: 'inline-flex', 
              width: '56px', 
              height: '56px', 
              borderRadius: '50%', 
              background: 'white', 
              alignItems: 'center', 
              justifyContent: 'center', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
              border: '1.5px solid #f1f5f9',
              marginBottom: '14px' 
            }}>
              <ButtonSpecificIcon name="bonus" size={32} color="#16a34a" />
            </div>
            <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#64748b' }}>Enter your gift card reward code below to claim instant bonus cash:</p>
          </div>

          <form onSubmit={async (e) => {
            e.preventDefault();
            if (!giftCodeInput.trim()) return;
            try {
              const token = sessionStorage.getItem('gm_token');
              const res = await axios.post(`${API_URL}/gift/redeem`, { 
                code: giftCodeInput 
              }, {
                headers: { Authorization: `Bearer ${token}` }
              });
              if (res.data.success) {
                setSuccessMessage(res.data.message);
                setRewardDetail({
                  amount: res.data.rewardAmount,
                  type: res.data.rewardType,
                  label: res.data.rewardLabel
                });
                setShowSuccessModal(true);
                loadStats();
              }
            } catch (err) {
              showToast('❌ ' + (err.response?.data?.message || 'Invalid Gift Code'));
            }
            setGiftCodeInput('');
          }}>
            <div style={{ marginBottom: '20px' }}>
              <input 
                type="text" 
                style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #cbd5e1', borderRadius: '12px', fontSize: '14px', textAlign: 'center', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', outline: 'none' }} 
                value={giftCodeInput} 
                onChange={e => setGiftCodeInput(e.target.value)} 
                required 
                placeholder="ENTER GIFT CODE" 
              />
            </div>
            <button type="submit" style={{ width: '100%', border: 'none', borderRadius: '12px', background: 'linear-gradient(135deg, #16a34a, #15803d)', color: 'white', padding: '12px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)' }}>
              Redeem Gift Code
            </button>
          </form>

          {/* Live Redemption Records Ticker */}
          <LiveRedemptionRecords />
        </div>
      );
    }

    if (activePanel === 'task') {
      const totalEarnedRewards = promotionTasks.filter(t => t.claimed).reduce((sum, t) => sum + t.reward, 0);

      return (
        <div style={{ padding: '0 4px 20px' }}>
          {/* Header Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #14532d, #064e3b)',
            borderRadius: '24px',
            padding: '24px 20px',
            color: 'white',
            marginBottom: '20px',
            boxShadow: '0 10px 25px -5px rgba(6, 78, 59, 0.3)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', right: '-10px', top: '-10px', fontSize: '120px', opacity: 0.1, pointerEvents: 'none' }}>🏆</div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🎖️</span> Promotion Tasks
            </h3>
            <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.5 }}>
              Invite active team members to complete milestones and earn cash rewards instantly!
            </p>
          </div>

          {/* Stats Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
            <div style={{ background: 'white', borderRadius: '18px', padding: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9', textAlign: 'center' }}>
              <span style={{ fontSize: '22px', display: 'block', marginBottom: '4px' }}>👥</span>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>Active Referrals</span>
              <strong style={{ fontSize: '18px', color: '#064e3b', marginTop: '2px', display: 'block' }}>{activeReferralCount} members</strong>
            </div>
            <div style={{ background: 'white', borderRadius: '18px', padding: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9', textAlign: 'center' }}>
              <span style={{ fontSize: '22px', display: 'block', marginBottom: '4px' }}>🪙</span>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>Total Earned</span>
              <strong style={{ fontSize: '18px', color: '#16a34a', marginTop: '2px', display: 'block' }}>₹{totalEarnedRewards}</strong>
            </div>
          </div>

          {/* Tasks List */}
          <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b', marginBottom: '12px', paddingLeft: '4px' }}>Milestone Rewards</h4>
          
          {tasksLoading ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
              <div style={{ width: '30px', height: '30px', border: '3px solid #f1f5f9', borderTop: '3px solid #16a34a', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }}></div>
              <p style={{ fontSize: '12px', fontWeight: 600, margin: 0 }}>Syncing active referral metrics...</p>
            </div>
          ) : promotionTasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', background: 'white', borderRadius: '20px', color: '#94a3b8', border: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>⚡</span>
              <p style={{ fontSize: '12px', fontWeight: 600, margin: 0 }}>Initializing milestone tracks...</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {promotionTasks.map((t) => {
                const isClaimed = t.claimed;
                const isCompleted = activeReferralCount >= t.requiredMembers;
                const pct = Math.min(100, (activeReferralCount / t.requiredMembers) * 100);

                return (
                  <div 
                    key={t._id} 
                    style={{
                      background: 'white',
                      borderRadius: '20px',
                      padding: '16px',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
                      border: '1px solid #f1f5f9',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      position: 'relative'
                    }}
                  >
                    {/* Top Row: Icon, Title, Reward */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '20px' }}>🎁</span>
                        <div>
                          <strong style={{ fontSize: '13px', color: '#1e293b', display: 'block' }}>{t.taskTitle}</strong>
                          <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '1px' }}>
                            Progress: {activeReferralCount}/{t.requiredMembers} active
                          </span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Reward</span>
                        <strong style={{ fontSize: '14px', color: '#16a34a', display: 'block', marginTop: '1px' }}>₹{t.reward}</strong>
                      </div>
                    </div>

                    {/* Progress Bar container */}
                    <div style={{ width: '100%' }}>
                      <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: isClaimed ? '#cbd5e1' : 'linear-gradient(90deg, #10b981, #059669)', borderRadius: '4px', transition: 'width 0.4s ease' }}></div>
                      </div>
                    </div>

                    {/* Bottom Action Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: isClaimed ? '#64748b' : isCompleted ? '#16a34a' : '#f59e0b',
                        background: isClaimed ? '#f1f5f9' : isCompleted ? '#d1fae5' : '#fef3c7',
                        padding: '3px 8px',
                        borderRadius: '20px'
                      }}>
                        {isClaimed ? '✓ Claimed' : isCompleted ? 'Completed' : 'In Progress'}
                      </span>

                      {isClaimed ? (
                        <button disabled style={{ background: '#f1f5f9', color: '#94a3b8', border: 'none', padding: '8px 14px', borderRadius: '10px', fontSize: '11px', fontWeight: 700, cursor: 'not-allowed' }}>
                          Claimed
                        </button>
                      ) : isCompleted ? (
                        <button 
                          onClick={() => handleClaimMilestone(t._id)} 
                          style={{
                            background: 'linear-gradient(135deg, #16a34a, #15803d)',
                            color: 'white',
                            border: 'none',
                            padding: '8px 14px',
                            borderRadius: '10px',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)',
                            animation: 'pulse 2s infinite'
                          }}
                        >
                          CLAIM NOW
                        </button>
                      ) : (
                        <button disabled style={{ background: '#f8fafc', color: '#cbd5e1', border: '1px solid #f1f5f9', padding: '8px 14px', borderRadius: '10px', fontSize: '11px', fontWeight: 700, cursor: 'not-allowed' }}>
                          Locked
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Success / Confetti Claim Popup Modal */}
          {showConfetti && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '20px' }}>
              <div style={{ background: 'white', borderRadius: '24px', padding: '30px', maxWidth: '360px', width: '100%', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                <span style={{ fontSize: '64px', display: 'block', marginBottom: '16px', animation: 'bounce 1s infinite' }}>🎉</span>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#064e3b', margin: '0 0 8px 0' }}>Reward Claimed!</h3>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 20px 0', lineHeight: 1.5 }}>
                  Congratulations! <strong>₹{claimedRewardAmount}</strong> bonus reward has been successfully added to your wallet balance.
                </p>
                <button 
                  onClick={() => setShowConfetti(false)}
                  style={{
                    width: '100%',
                    border: 'none',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #16a34a, #15803d)',
                    color: 'white',
                    padding: '12px',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(22, 163, 74, 0.3)'
                  }}
                >
                  Great!
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (activePanel === 'plans') {
      return (
        <div style={{ padding: '0 4px 18px' }}>
          {plansLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[1, 2, 3].map(n => (
                <div key={n} className="loading-skeleton" style={{ height: '94px', width: '100%', borderRadius: '18px' }}></div>
              ))}
            </div>
          ) : plans.length === 0 ? (
            <p style={{ textAlign: 'center', fontSize: '14px', color: '#64748b', padding: '20px' }}>No plans available at this time.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {plans.map((plan) => (
                <div 
                  key={plan._id} 
                  className="modern-clean-card"
                  onClick={() => navigate(`/plans/${plan._id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Left: Image container */}
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

                  {/* Right: Plan Details */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>{plan.name}</h4>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                      <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>⏱️ {plan.duration} Days</span>
                      <span style={{ color: '#cbd5e1' }}>|</span>
                      <span style={{ color: '#16a34a', fontWeight: 700 }}>₹{plan.price}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: '#64748b' }}>
                      <span>Daily: <strong style={{ color: '#16a34a' }}>₹{plan.dailyIncome}</strong></span>
                      <span style={{ color: '#cbd5e1' }}>|</span>
                      <span>Total: <strong style={{ color: '#1e293b' }}>₹{(plan.dailyIncome * plan.duration).toFixed(0)}</strong></span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: '6px' }}>
                      <button 
                        onClick={(e) => { e.stopPropagation(); navigate(`/plans/${plan._id}`); }} 
                        style={{ 
                          background: 'linear-gradient(135deg, #16a34a, #15803d)', 
                          color: 'white', 
                          border: 'none', 
                          padding: '6px 18px', 
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
              ))}
            </div>
          )}
        </div>
      );
    }

    return null;
  };



  if (!stats) return null;

  const displayBalance = stats.availableBalance?.toFixed(2) || '0.00';

  return (
    <div style={{ minHeight: '100vh', background: '#fcfdfa', color: '#213014', paddingBottom: '90px', fontFamily: 'Arial, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
        
        html, body {
          margin: 0;
          padding: 0;
          width: 100%;
          overflow-x: hidden !important;
          background-color: #fcfdfa;
          -webkit-text-size-adjust: 100%;
          touch-action: manipulation;
        }

        #root {
          width: 100%;
          overflow-x: hidden !important;
        }

        * {
          font-family: 'Poppins', sans-serif !important;
          box-sizing: border-box;
        }

        .auth-card {
          background: white;
          border-radius: 20px;
          padding: 35px 28px;
          width: 100%;
          box-shadow: 0 20px 60px rgba(0,0,0,0.25);
          box-sizing: border-box;
          transition: all 0.3s ease;
        }

        @media (max-width: 480px) {
          .auth-card {
            padding: 24px 16px !important;
            border-radius: 16px !important;
            box-shadow: 0 10px 30px rgba(0,0,0,0.15) !important;
          }
        }

        .stats-grid {
          display: grid !important;
          grid-template-columns: repeat(3, 1fr) !important;
          row-gap: 16px !important;
          column-gap: 8px !important;
          text-align: center !important;
        }

        @media (max-width: 375px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            row-gap: 12px !important;
          }
        }

        .action-btn-circle {
          transition: transform 0.2s ease;
        }
        .action-btn-circle:hover {
          transform: translateY(-2px);
        }
        .action-btn-circle:hover .action-btn-circle-icon {
          box-shadow: 0 10px 25px rgba(22, 163, 74, 0.3) !important;
        }
        
        .bottom-nav-btn {
          transition: all 0.2s ease;
        }
        .bottom-nav-btn:hover {
          background: rgba(74, 130, 17, 0.05) !important;
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
        
        .stat-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .stat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.05) !important;
        }
        
        .daily-signin-btn {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        .daily-signin-btn::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -60%;
          width: 30%;
          height: 200%;
          background: rgba(255, 255, 255, 0.2);
          transform: rotate(30deg);
        }
        .daily-signin-btn:hover::after {
          left: 120%;
        }
        .daily-signin-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(234, 88, 12, 0.35) !important;
        }

        @keyframes pulse {
          0% { transform: scale(0.9); opacity: 0.5; box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.7); }
          70% { transform: scale(1.1); opacity: 1; box-shadow: 0 0 0 8px rgba(74, 222, 128, 0); }
          100% { transform: scale(0.9); opacity: 0.5; box-shadow: 0 0 0 0 rgba(74, 222, 128, 0); }
        }
        @keyframes confetti-fall {
          0% { transform: translateY(-50px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(450px) rotate(360deg); opacity: 0; }
        }
        .confetti-piece {
          position: absolute;
          width: 8px;
          height: 12px;
          opacity: 0.8;
          z-index: 10002;
          animation: confetti-fall 2.5s ease-out infinite;
        }
        @keyframes slideUp {
          from { transform: translateY(50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
      
      {toast && <div style={{ position: 'fixed', top: '18px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(8px)', color: '#ffffff', padding: '12px 24px', borderRadius: '30px', zIndex: 10000, fontSize: '13.5px', fontWeight: 600, boxShadow: '0 12px 30px rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.15)', whiteSpace: 'nowrap', textAlign: 'center', animation: 'fadeIn 0.25s ease' }}>{toast}</div>}

      {/* Gift Redemption Success Modal with Confetti */}
      {showSuccessModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10005, padding: '20px' }}>
          
          {/* Confetti pieces */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', pointerEvents: 'none' }}>
            {Array.from({ length: 35 }).map((_, i) => {
              const left = Math.floor(Math.random() * 100) + '%';
              const delay = (Math.random() * 2).toFixed(2) + 's';
              const duration = (2 + Math.random() * 2).toFixed(2) + 's';
              const colors = ['#ffd700', '#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6'];
              const background = colors[Math.floor(Math.random() * colors.length)];
              return (
                <div 
                  key={i} 
                  className="confetti-piece" 
                  style={{ 
                    left, 
                    animationDelay: delay, 
                    animationDuration: duration, 
                    background 
                  }} 
                />
              );
            })}
          </div>

          <div style={{ background: 'white', borderRadius: '24px', padding: '30px 24px', width: '100%', maxWidth: '380px', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', border: '1px solid rgba(226, 237, 207, 0.4)', animation: 'slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)', zIndex: 10006, boxSizing: 'border-box' }}>
            <div style={{ fontSize: '60px', marginBottom: '16px', display: 'inline-block', animation: 'pulse 1.5s infinite' }}>🎉</div>
            <h3 style={{ margin: '0 0 10px 0', color: '#15803d', fontSize: '20px', fontWeight: 800 }}>Congratulations!</h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>
              {successMessage}
            </p>
            
            <div style={{ background: '#f0fdf4', border: '1px dashed #16a34a', borderRadius: '16px', padding: '14px', marginBottom: '24px' }}>
              <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Credited Reward</span>
              <strong style={{ display: 'block', fontSize: '20px', color: '#15803d', fontWeight: 800, marginTop: '4px' }}>
                {rewardDetail.label || 'Bonus'}
              </strong>
            </div>

            <button 
              onClick={() => setShowSuccessModal(false)}
              style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #16a34a, #15803d)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)' }}
            >
              Awesome
            </button>
          </div>
        </div>
      )}
      
      <div style={{ 
        background: 'linear-gradient(135deg, #15803d 0%, #14532d 100%)', 
        color: 'white', 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        padding: '30px 16px 45px', 
        fontSize: '22px', 
        fontWeight: 900, 
        letterSpacing: '2px', 
        textTransform: 'uppercase', 
        boxShadow: '0 4px 25px rgba(20, 83, 45, 0.15)',
        borderBottomLeftRadius: '24px',
        borderBottomRightRadius: '24px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '50%',
          width: '36px',
          height: '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
          flexShrink: 0
        }}>
          <LogoIcon size={24} />
        </div>
        <span>GrowMore</span>
      </div>
      
      <main style={{ maxWidth: '520px', margin: '-24px auto 0', padding: '0 16px', zIndex: 5, position: 'relative' }}>
        {isHomeActive && (
          <>
            <section style={{ 
              background: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)', 
              minHeight: '140px', 
              borderRadius: '24px', 
              padding: '20px 24px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              overflow: 'hidden', 
              boxShadow: '0 15px 35px rgba(2, 44, 34, 0.3)',
              border: '1px solid rgba(255,255,255,0.08)',
              position: 'relative'
            }}>
              <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(74, 222, 128, 0.08)', filter: 'blur(30px)' }} />
              
              {/* Circular Logo Symbol Badge */}
              <div style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
                flexShrink: 0
              }}>
                <LogoIcon size={48} />
              </div>

              {/* Text Information Panel */}
              <div style={{ maxWidth: '280px', textAlign: 'right', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span style={{ color: '#4ade80', fontWeight: 800, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '4px' }}>
                  Grow today, greater tomorrow
                </span>
                <h2 style={{ color: 'white', fontSize: '20px', fontWeight: 800, margin: '0 0 6px 0', lineHeight: 1.2 }}>
                  Welcome, {user?.fullName || 'Member'}
                </h2>


                {user?.role === 'admin' && (
                  <button 
                    onClick={() => navigate('/admin/dashboard')} 
                    style={{ 
                      background: '#fbbf24', 
                      color: '#1e293b', 
                      border: 'none', 
                      borderRadius: '20px', 
                      padding: '6px 14px', 
                      fontSize: '11px', 
                      fontWeight: 800, 
                      cursor: 'pointer', 
                      marginTop: '8px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      boxShadow: '0 4px 12px rgba(251, 191, 36, 0.35)',
                      transition: 'transform 0.2s ease'
                    }}
                    onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                    onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                  >
                    Admin Panel
                  </button>
                )}
              </div>
            </section>

            <section style={{ background: 'white', borderRadius: '18px', padding: '24px 12px', margin: '20px 0', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid rgba(226, 237, 207, 0.4)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', rowGap: '20px', columnGap: '8px' }}>
                {actionButtons.map((action) => (
                  <button key={action.label} onClick={action.onClick} className="action-btn-circle" style={{ border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="action-btn-circle-icon" style={{ width: '58px', height: '58px', borderRadius: '50%', background: action.gradient, color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px', boxShadow: `0 6px 15px ${action.shadow}`, transition: 'all 0.3s ease' }}>
                      <ButtonSpecificIcon name={action.label} size={24} color="#ffffff" />
                    </span>
                    <span style={{ display: 'block', minHeight: '18px', color: '#475569', fontSize: '12px', fontWeight: 600 }}>{action.label}</span>
                  </button>
                ))}
              </div>
            </section>

            <button onClick={claimBonus} className="daily-signin-btn" style={{ width: '100%', border: 'none', borderRadius: '14px', background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)', color: 'white', padding: '16px 20px', marginBottom: '20px', cursor: bonusClaimed ? 'default' : 'pointer', boxShadow: '0 8px 25px rgba(234, 88, 12, 0.25)', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ display: 'block', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.9, marginBottom: '2px' }}>Welcome Bonus</span>
                <span style={{ display: 'block', fontSize: '20px', fontWeight: 700 }}>{bonusClaimed ? 'Welcome bonus claimed' : 'Claim signup bonus (Rs 50)'}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ display: 'block', fontSize: '28px', lineHeight: 1 }}>🎁</span>
                <span style={{ display: 'block', fontSize: '10px', opacity: 0.8, marginTop: '4px' }}>{bonusClaimed ? 'Claimed' : 'Tap to claim'}</span>
              </div>
            </button>


          </>
        )}

        {renderPanel()}

        {isHomeActive && (
          <>
            <h3 style={{ color: '#1e293b', fontSize: '18px', fontWeight: 700, margin: '24px 0 14px' }}>Latest News</h3>
            
            {/* Premium Interactive Plans Catalogue Billboard */}
            <div style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              borderRadius: '24px',
              padding: '24px',
              border: '2px solid rgba(22, 163, 74, 0.25)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.35)',
              color: 'white',
              marginBottom: '30px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Decorative Glow */}
              <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '120px', height: '120px', borderRadius: '50%', background: '#16a34a', opacity: 0.15, filter: 'blur(40px)' }}></div>
              
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px', marginBottom: '20px' }}>
                <LogoIcon size={38} />
                <div style={{ textAlign: 'left' }}>
                  <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: '#22c55e', letterSpacing: '1px' }}>GROWMORE</h4>
                  <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Investment Plans Catalog</span>
                </div>
              </div>

              {/* Plans Table/Grid */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {plans && plans.length > 0 ? (
                  plans.map((p) => (
                    <div 
                      key={p._id} 
                      style={{ 
                        background: 'rgba(255, 255, 255, 0.03)', 
                        border: '1px solid rgba(255, 255, 255, 0.06)', 
                        borderRadius: '16px', 
                        padding: '14px 18px', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        transition: 'transform 0.2s ease',
                        cursor: 'pointer'
                      }}
                      className="catalogue-item"
                    >
                      <div>
                        <strong style={{ fontSize: '14px', color: '#f8fafc', display: 'block' }}>{p.name}</strong>
                        <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginTop: '2px' }}>Period: {p.duration} Days</span>
                      </div>
                      
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                          <span style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '10px' }}>
                            Daily ₹{p.dailyIncome?.toFixed(2)}
                          </span>
                          <strong style={{ fontSize: '15px', color: '#ffffff' }}>₹{p.price}</strong>
                        </div>
                        <span style={{ fontSize: '11px', color: '#22c55e', fontWeight: 600, display: 'block', marginTop: '4px' }}>
                          Total Return: ₹{(p.dailyIncome * p.duration).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', textAlign: 'center' }}>No active plans available.</p>
                )}
              </div>

              {/* Footer text */}
              <div style={{ textAlign: 'center', fontSize: '10px', color: '#64748b', marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px' }}>
                * Guaranteed double claims refund eligible on verified channels. Grow responsibly.
              </div>
            </div>
          </>
        )}
      </main>

      {/* Modals Overlay */}
      {activeModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '24px', padding: '28px 24px', width: '100%', maxWidth: '440px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', maxHeight: '80vh', overflowY: 'auto', border: '1px solid rgba(226, 237, 207, 0.4)' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#1e293b' }}>
                {activeModal === 'transactions' && 'Transactions List'}
                {activeModal === 'bank' && '💳 Bank Details'}
                {activeModal === 'recharge_records' && 'Recharge Records'}
                {activeModal === 'withdraw_records' && 'Withdrawal Records'}
                {activeModal === 'gift' && '🎁 Redeem Gift Code'}
                {activeModal === 'support_channels' && '🎧 Customer Service'}
                {activeModal === 'about_us' && '📖 About GrowMore'}
              </h3>
              <button 
                onClick={() => setActiveModal(null)} 
                style={{ background: '#f1f5f9', border: 'none', width: '30px', height: '30px', borderRadius: '50%', color: '#64748b', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ✕
              </button>
            </div>



            {/* Bank Details Modal Content */}
            {activeModal === 'bank' && (
              <form onSubmit={async (e) => {
                e.preventDefault();
                if (bankDetailsSaved) return;
                try {
                  const token = sessionStorage.getItem('gm_token');
                  const res = await axios.post(`${API_URL}/bank/save`, {
                    accountHolderName: bankDetailsInput.holderName,
                    bankName: bankDetailsInput.bankName,
                    accountNumber: bankDetailsInput.accountNumber,
                    ifscCode: bankDetailsInput.ifsc,
                    upiId: bankDetailsInput.upiId
                  }, {
                    headers: { Authorization: `Bearer ${token}` }
                  });
                  if (res.data.success) {
                    showToast('✅ Bank Details Saved!');
                    setBankDetailsSaved(true);
                    loadBankDetails();
                    setActiveModal(null);
                  }
                } catch (err) {
                  showToast('❌ ' + (err.response?.data?.message || 'Failed to save bank details'));
                }
              }}>
                {bankDetailsSaved && (
                  <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '12px', padding: '12px', fontSize: '11px', color: '#b45309', marginBottom: '14px', lineHeight: 1.4 }}>
                    🔒 <strong>Locked:</strong> Bank details can only be added once. Contact customer support if you need to update them.
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>Account Holder Name</label>
                    <input type="text" disabled={bankDetailsSaved} style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '13px', background: bankDetailsSaved ? '#f8fafc' : 'white', color: bankDetailsSaved ? '#64748b' : '#1e293b' }} value={bankDetailsInput.holderName} onChange={e => setBankDetailsInput({...bankDetailsInput, holderName: e.target.value})} required placeholder="Enter holder name" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>Bank Name</label>
                    <input type="text" disabled={bankDetailsSaved} style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '13px', background: bankDetailsSaved ? '#f8fafc' : 'white', color: bankDetailsSaved ? '#64748b' : '#1e293b' }} value={bankDetailsInput.bankName} onChange={e => setBankDetailsInput({...bankDetailsInput, bankName: e.target.value})} required placeholder="e.g. SBI, HDFC" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>Account Number</label>
                    <input type="text" disabled={bankDetailsSaved} style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '13px', background: bankDetailsSaved ? '#f8fafc' : 'white', color: bankDetailsSaved ? '#64748b' : '#1e293b' }} value={bankDetailsInput.accountNumber} onChange={e => setBankDetailsInput({...bankDetailsInput, accountNumber: e.target.value})} required placeholder="Enter account number" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>IFSC Code</label>
                    <input type="text" disabled={bankDetailsSaved} style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '13px', background: bankDetailsSaved ? '#f8fafc' : 'white', color: bankDetailsSaved ? '#64748b' : '#1e293b' }} value={bankDetailsInput.ifsc} onChange={e => setBankDetailsInput({...bankDetailsInput, ifsc: e.target.value})} required placeholder="Enter IFSC code" />
                  </div>
                </div>

                {!bankDetailsSaved ? (
                  <button type="submit" style={{ width: '100%', border: 'none', borderRadius: '12px', background: 'linear-gradient(135deg, #16a34a, #15803d)', color: 'white', padding: '12px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
                    Save Bank Details
                  </button>
                ) : (
                  <div style={{ textAlign: 'center', fontSize: '12px', color: '#047857', fontWeight: 700, padding: '12px', background: '#d1fae5', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
                    🔒 Bank Details Saved
                  </div>
                )}
                </form>
              )
            }



            {/* Support Channels Modal Content */}
            {activeModal === 'support_channels' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b', textAlign: 'center' }}>Need assistance? Connect with us via our official support channels:</p>
                <a 
                  href="https://t.me/+neK1dYGhSNw5NjRl" 
                  target="_blank" 
                  rel="noreferrer" 
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', background: '#e0f2fe', borderRadius: '12px', textDecoration: 'none', color: '#0369a1', fontWeight: 700, fontSize: '14px' }}
                >
                  <ButtonSpecificIcon name="telegram" size={18} color="#0369a1" /> Telegram Support Channel
                </a>
                <a 
                  href="https://t.me/Growmoreagent" 
                  target="_blank" 
                  rel="noreferrer" 
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', background: '#e0f2fe', borderRadius: '12px', textDecoration: 'none', color: '#0369a1', fontWeight: 700, fontSize: '14px' }}
                >
                  <ButtonSpecificIcon name="telegram" size={18} color="#0369a1" /> Telegram Agent
                </a>
              </div>
            )}

            {/* About Us Modal Content */}
            {activeModal === 'about_us' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', lineHeight: 1.6 }}>
                <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '40px' }}>🌱</span>
                  <h4 style={{ margin: '8px 0 2px 0', fontSize: '18px', fontWeight: 800, color: '#16a34a' }}>GrowMore</h4>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Grow Today, Greater Tomorrow</span>
                </div>
                
                <p style={{ margin: 0, fontSize: '12px', color: '#475569' }}>
                  Welcome to <strong>GrowMore</strong>, a premier investment and digital reward ecosystem built to help you grow your wealth securely and efficiently.
                </p>

                <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '14px', border: '1px solid #e2e8f0' }}>
                  <strong style={{ fontSize: '12px', color: '#0f172a', display: 'block', marginBottom: '6px' }}>💡 How to Get Started:</strong>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '11px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <li><strong>Purchase Products:</strong> Visit the Product tab to buy yield-generating assets that credit daily rewards to your wallet.</li>
                    <li><strong>Daily Income Claim:</strong> Log in every day to claim your product yield from the Dashboard. Missed claims default to ₹0.</li>
                    <li><strong>Milestone Tasks:</strong> Invite active members using your referral code to unlock milestone cash rewards.</li>
                    <li><strong>Recharge:</strong> Top up your wallet using instant deep-linked UPI payments. Proofs are validated securely within 6 hours.</li>
                    <li><strong>Withdrawals:</strong> Withdraw your earnings directly to your saved bank account quickly and securely.</li>
                  </ul>
                </div>

                <div style={{ background: '#f0fdf4', borderRadius: '12px', padding: '12px', border: '1px solid rgba(22, 163, 74, 0.15)', textAlign: 'center' }}>
                  <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 700 }}>Thank you for choosing GrowMore to build your financial future!</span>
                </div>
              </div>
            )}


          </div>
        </div>
      )}

      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', maxWidth: '520px', margin: '0 auto', boxShadow: '0 -8px 30px rgba(0,0,0,0.08)', borderRadius: '24px 24px 0 0', border: '1px solid rgba(226, 237, 207, 0.4)', overflow: 'hidden', zIndex: 1000 }}>
        {[['Home', () => openPanel('home')], ['Product', () => openPanel('plans')], ['My Product', () => openPanel('myproduct')], ['Team', () => openPanel('invite')], ['Profile', () => openPanel('profile')]].map(([label, onClick]) => {
          const isActive = (label === 'Home' && isHomeActive) || (label === 'Product' && activePanel === 'plans') || (label === 'My Product' && activePanel === 'myproduct') || (label === 'Team' && activePanel === 'invite') || (label === 'Profile' && activePanel === 'profile');
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
              <ButtonSpecificIcon name={label === 'Product' ? 'plans' : label === 'My Product' ? 'myproduct' : label} size={20} color={isActive ? '#4a8211' : '#8c98a4'} />
              <span style={{ fontSize: '11px', fontWeight: isActive ? 700 : 500 }}>{label}</span>
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#4a8211', visibility: isActive ? 'visible' : 'hidden' }}></span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

// Ticker component that dynamically adds fake redemption records with random phone numbers
const LiveRedemptionRecords = () => {
  const [records, setRecords] = useState([
    { phone: '740****874', amount: '523' },
    { phone: '976****373', amount: '785' },
    { phone: '980****171', amount: '415' },
    { phone: '700****981', amount: '622' },
    { phone: '812****432', amount: '315' },
    { phone: '944****605', amount: '810' },
    { phone: '770****192', amount: '495' }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const prefix = ['982', '740', '976', '980', '700', '812', '944', '770', '630', '900', '888', '950', '822', '911', '720'][Math.floor(Math.random() * 15)];
      const suffix = Math.floor(100 + Math.random() * 900);
      const randomPhone = `${prefix}****${suffix}`;
      const randomAmount = Math.floor(100 + Math.random() * 800).toString();
      
      setRecords(prev => [
        { phone: randomPhone, amount: randomAmount },
        ...prev.slice(0, 20)
      ]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ marginTop: '24px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
      <div style={{ maxHeight: '340px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
        {records.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9', animation: idx === 0 ? 'slideIn 0.3s ease-out' : 'none' }}>
            <span style={{ fontSize: '13px', color: '#475569', fontWeight: 600 }}>{item.phone}</span>
            <span style={{ fontSize: '11px', background: '#f0fdf4', color: '#16a34a', padding: '4px 10px', borderRadius: '12px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
              +₹{item.amount}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Dynamic, interactive Tree Visualizer component
const TreeVisualizer = ({ teamList, userId }) => {
  // Group team members by level
  const levels = { 1: [], 2: [], 3: [], 4: [], 5: [] };
  teamList.forEach(m => {
    if (m.level <= 5) {
      levels[m.level].push(m);
    }
  });

  const [expandedLevel, setExpandedLevel] = useState(1);

  return (
    <div style={{ padding: '10px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Root Leader Node */}
      <div style={{
        background: 'linear-gradient(135deg, #16a34a, #15803d)',
        color: 'white',
        borderRadius: '16px',
        padding: '12px 20px',
        fontWeight: 'bold',
        fontSize: '13px',
        boxShadow: '0 4px 15px rgba(22,163,74,0.2)',
        textAlign: 'center',
        position: 'relative',
        zIndex: 2
      }}>
        👑 You (Leader)
      </div>

      {/* Connectors */}
      <div style={{ width: '2px', height: '24px', background: '#cbd5e1', position: 'relative', zIndex: 1 }} />

      {/* Level Select Toggles */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', zIndex: 2, overflowX: 'auto', width: '100%', paddingBottom: '4px' }}>
        {[1, 2, 3, 4, 5].map(lvl => (
          <button
            key={lvl}
            onClick={() => setExpandedLevel(lvl)}
            style={{
              padding: '6px 10px',
              border: expandedLevel === lvl ? '1.5px solid #16a34a' : '1.5px solid #e2e8f0',
              background: expandedLevel === lvl ? '#f0fdf4' : 'white',
              color: expandedLevel === lvl ? '#15803d' : '#64748b',
              fontSize: '11px',
              fontWeight: 700,
              borderRadius: '8px',
              cursor: 'pointer',
              flexShrink: 0
            }}
          >
            Lvl {lvl} ({levels[lvl].length})
          </button>
        ))}
      </div>

      {/* Nodes List */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {levels[expandedLevel].length === 0 ? (
          <p style={{ textAlign: 'center', fontSize: '12px', color: '#94a3b8', margin: '10px 0' }}>No members in Level {expandedLevel} yet.</p>
        ) : (
          levels[expandedLevel].map((item, idx) => (
            <div
              key={idx}
              style={{
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                padding: '12px 14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 2px 10px rgba(0,0,0,0.01)',
                animation: 'slideIn 0.2s ease-out'
              }}
            >
              <div>
                <strong style={{ fontSize: '13px', color: '#1e293b', display: 'block' }}>{item.fullName}</strong>
                <span style={{ fontSize: '11px', color: '#64748b' }}>📞 {item.phone}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{
                  background: item.status === 'Active' ? '#d1fae5' : '#f1f5f9',
                  color: item.status === 'Active' ? '#065f46' : '#64748b',
                  fontSize: '10px',
                  fontWeight: 800,
                  padding: '3px 8px',
                  borderRadius: '12px',
                  textTransform: 'uppercase'
                }}>
                  {item.status}
                </span>
                <span style={{ display: 'block', fontSize: '11px', color: '#16a34a', fontWeight: 700, marginTop: '4px' }}>
                  +₹{item.totalIncome} Earned
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// State variables for MobileDashboard
const MobileDashboardWrapper = () => {
  const [requests, setRequests] = useState([]);
  // Just a shell wrapper to align MobileDashboard variables
  return <MobileDashboard requests={requests} setRequests={setRequests} />;
};

function App() {
  return (
    <AuthProvider>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
        
        html, body {
          margin: 0;
          padding: 0;
          width: 100%;
          overflow-x: hidden !important;
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #e0f2fe 100%) fixed;
          -webkit-text-size-adjust: 100%;
          touch-action: manipulation;
        }

        #root {
          width: 100%;
          overflow-x: hidden !important;
        }

        * {
          font-family: 'Poppins', sans-serif !important;
          box-sizing: border-box;
        }

        .auth-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 24px;
          padding: 35px 28px;
          width: 100%;
          box-shadow: 0 20px 50px rgba(16, 185, 129, 0.15);
          box-sizing: border-box;
          border-top: 4px solid #16a34a;
          transition: all 0.3s ease;
        }

        @media (max-width: 480px) {
          .auth-card {
            padding: 24px 16px !important;
            border-radius: 16px !important;
            box-shadow: 0 10px 30px rgba(0,0,0,0.15) !important;
          }
        }

        .stats-grid {
          display: grid !important;
          grid-template-columns: repeat(3, 1fr) !important;
          row-gap: 16px !important;
          column-gap: 8px !important;
          text-align: center !important;
        }

        @media (max-width: 375px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            row-gap: 12px !important;
          }
        }

        .action-btn-circle {
          transition: transform 0.2s ease;
        }
        .action-btn-circle:hover {
          transform: translateY(-2px);
        }
        .action-btn-circle:hover .action-btn-circle-icon {
          box-shadow: 0 10px 25px rgba(22, 163, 74, 0.3) !important;
        }
        
        .bottom-nav-btn {
          transition: all 0.2s ease;
        }
        .bottom-nav-btn:hover {
          background: rgba(74, 130, 17, 0.05) !important;
        }
        
        .stat-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .stat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.05) !important;
        }
        
        .daily-signin-btn {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        .daily-signin-btn::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -60%;
          width: 30%;
          height: 200%;
          background: rgba(255, 255, 255, 0.2);
          transform: rotate(30deg);
        }
        .daily-signin-btn:hover::after {
          left: 120%;
        }
        .daily-signin-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(234, 88, 12, 0.35) !important;
        }

        @keyframes pulse {
          0% { transform: scale(0.9); opacity: 0.5; box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.7); }
          70% { transform: scale(1.1); opacity: 1; box-shadow: 0 0 0 8px rgba(74, 222, 128, 0); }
          100% { transform: scale(0.9); opacity: 0.5; box-shadow: 0 0 0 0 rgba(74, 222, 128, 0); }
        }
        @keyframes confetti-fall {
          0% { transform: translateY(-50px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(450px) rotate(360deg); opacity: 0; }
        }
        .confetti-piece {
          position: absolute;
          width: 8px;
          height: 12px;
          opacity: 0.8;
          z-index: 10002;
          animation: confetti-fall 2.5s ease-out infinite;
        }
        @keyframes slideUp {
          from { transform: translateY(50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
      <Routes>
        <Route path="/plans" element={
          <ProtectedRoute>
            <Navigate to="/dashboard#plans" replace />
          </ProtectedRoute>
        } />
        <Route path="/plans/:id" element={
          <ProtectedRoute>
            <PlanDetail />
          </ProtectedRoute>
        } />
        <Route path="/recharge" element={
          <ProtectedRoute>
            <Recharge />
          </ProtectedRoute>
        } />
        <Route path="/withdraw" element={
          <ProtectedRoute>
            <Withdraw />
          </ProtectedRoute>
        } />
        <Route path="/recharge/history" element={
          <ProtectedRoute>
            <RechargeHistory />
          </ProtectedRoute>
        } />
        <Route path="/withdraw/history" element={
          <ProtectedRoute>
            <WithdrawHistory />
          </ProtectedRoute>
        } />
        <Route path="/about" element={
          <ProtectedRoute>
            <AboutPage />
          </ProtectedRoute>
        } />

        <Route path="/admin/dashboard" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />

        <Route path="/" element={<Navigate to="/register" />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><MobileDashboardWrapper /></ProtectedRoute>} />
      </Routes>
    </AuthProvider>
  );
}

const Root = () => (
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

export default Root;
