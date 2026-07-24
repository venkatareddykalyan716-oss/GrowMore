import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../App';
import { authAPI } from '../services/api';
import api from '../services/api';
import Logo from './Logo';

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register, isAuthenticated } = useAuth();

  // Step state: 1 = Phone Input, 2 = OTP Code, 3 = Account Info, 4 = Success
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [captchaData, setCaptchaData] = useState({ id: '', text: '' });

  // OTP Verification States
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [shakeError, setShakeError] = useState(false);
  const [successAnimation, setSuccessAnimation] = useState(false);
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);

  const inputRefs = useRef([]);

  const [formData, setFormData] = useState({
    phone: '',
    countryCode: '+91',
    fullName: '',
    password: '',
    confirmPassword: '',
    inviteCode: searchParams.get('inviteCode') || '',
    securityQuestion: '',
    securityAnswer: '',
    captchaInput: ''
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (currentStep === 3) {
      loadCaptcha();
    }
  }, [currentStep]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const loadCaptcha = async () => {
    try {
      const response = await authAPI.getCaptcha();
      setCaptchaData({
        id: response.data.captchaId,
        text: response.data.captchaText
      });
    } catch (err) {
      console.error('❌ Failed to load captcha:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSendOtp = async (isResend = false) => {
    const phoneRegex = /^[6-9][0-9]{9}$/;
    if (!formData.phone || !phoneRegex.test(formData.phone.trim())) {
      setError('Invalid Phone Number');
      setShakeError(true);
      setTimeout(() => setShakeError(false), 500);
      return;
    }

    setSendingOtp(true);
    setError('');

    try {
      const response = await api.post(isResend ? '/auth/resend-otp' : '/auth/send-otp', {
        phone: formData.phone
      });

      if (response.data.success) {
        setOtpSent(true);
        setCurrentStep(2);
        setResendTimer(60);
      }
    } catch (err) {
      console.error('❌ OTP send failed:', err);
      const errMsg = err.response?.data?.message || 'SMS Sending Failed';
      setError(errMsg);
      setShakeError(true);
      setTimeout(() => setShakeError(false), 500);
    } finally {
      setSendingOtp(false);
    }
  };

  const handleOtpChange = (value, idx) => {
    const cleaned = value.replace(/[^0-9]/g, '');
    if (!cleaned) return;

    const newOtp = [...otpCode];
    newOtp[idx] = cleaned.charAt(0);
    setOtpCode(newOtp);

    if (idx < 5) {
      inputRefs.current[idx + 1].focus();
    } else {
      const fullOtp = newOtp.join('');
      if (fullOtp.length === 6) {
        verifyOtpCode(fullOtp);
      }
    }
  };

  const handleOtpKeyDown = (e, idx) => {
    if (e.key === 'Backspace') {
      if (!otpCode[idx] && idx > 0) {
        const newOtp = [...otpCode];
        newOtp[idx - 1] = '';
        setOtpCode(newOtp);
        inputRefs.current[idx - 1].focus();
      } else {
        const newOtp = [...otpCode];
        newOtp[idx] = '';
        setOtpCode(newOtp);
      }
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (pastedData.length === 6) {
      const newOtp = pastedData.split('');
      setOtpCode(newOtp);
      verifyOtpCode(pastedData);
    }
  };

  const verifyOtpCode = async (codeToVerify) => {
    setVerifyingOtp(true);
    setError('');
    setShakeError(false);

    try {
      const response = await api.post('/auth/verify-otp', {
        phone: formData.phone,
        otp: codeToVerify
      });

      if (response.data.success) {
        setOtpVerified(true);
        setSuccessAnimation(true);
        setTimeout(() => {
          setSuccessAnimation(false);
          setCurrentStep(3);
        }, 1500);
      }
    } catch (err) {
      console.error('❌ OTP Verification failed:', err);
      const errMsg = err.response?.data?.message || 'OTP Incorrect';
      setError(errMsg);
      setShakeError(true);
      setTimeout(() => setShakeError(false), 500);
    } finally {
      setVerifyingOtp(false);
    }
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
    
    try {
      const result = await register({
        ...submitData,
        captchaId: captchaData.id,
        captchaInput: formData.captchaInput
      });

      if (result.success) {
        setCurrentStep(4);
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } else {
        setError(result.message || 'Registration failed');
        loadCaptcha();
        setFormData({ ...formData, captchaInput: '' });
      }
    } catch (err) {
      console.error('❌ Registration error:', err);
      setError('Network error. Check if backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const countryCodes = [
    { code: '+91', name: 'India 🇮🇳' }
  ];

  const steps = [
    { num: 1, label: 'Phone' },
    { num: 2, label: 'OTP' },
    { num: 3, label: 'Details' },
    { num: 4, label: 'Success' }
  ];

  const progressWidth = `${((currentStep - 1) / 3) * 100}%`;

  return (
    <div className="auth-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', padding: '20px' }}>
      <style>{`
        .register-card-glass {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(16px);
          border-radius: 20px;
          padding: 30px 24px;
          box-shadow: 0 10px 30px rgba(22, 163, 74, 0.08);
          border: 1px solid rgba(226, 237, 207, 0.5);
          width: 100%;
          max-width: 440px;
          transition: all 0.3s ease;
        }
        .steps-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 35px;
          position: relative;
          padding: 0 10px;
        }
        .steps-line {
          position: absolute;
          top: 15px;
          left: 20px;
          right: 20px;
          height: 3px;
          background: #e2e8f0;
          z-index: 1;
        }
        .steps-line-progress {
          height: 100%;
          background: #16a34a;
          transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .step-node {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: white;
          border: 2px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 800;
          color: #94a3b8;
          z-index: 2;
          transition: all 0.3s ease;
          position: relative;
        }
        .step-node.active {
          border-color: #16a34a;
          background: #16a34a;
          color: white;
          box-shadow: 0 4px 12px rgba(22, 163, 74, 0.25);
        }
        .step-node.completed {
          border-color: #16a34a;
          background: #16a34a;
          color: white;
        }
        .step-label {
          position: absolute;
          top: 36px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          white-space: nowrap;
          color: #94a3b8;
        }
        .step-node.active .step-label,
        .step-node.completed .step-label {
          color: #16a34a;
        }
        .otp-box {
          width: 42px;
          height: 52px;
          border-radius: 12px;
          border: 2px solid #cbd5e1;
          text-align: center;
          font-size: 22px;
          font-weight: 700;
          color: #1e293b;
          background: white;
          transition: all 0.15s ease;
        }
        .otp-box:focus {
          border-color: #16a34a;
          outline: none;
          box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.15);
        }
        .shake {
          animation: shake 0.4s ease;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }
        .check-icon {
          width: 80px;
          height: 80px;
          position: relative;
          border-radius: 50%;
          border: 4px solid #16a34a;
          margin: 0 auto;
        }
        .icon-line {
          height: 5px;
          background-color: #16a34a;
          display: block;
          border-radius: 2px;
          position: absolute;
          z-index: 10;
        }
        .icon-line.line-tip {
          top: 46px;
          left: 19px;
          width: 25px;
          transform: rotate(45deg);
          animation: icon-line-tip 0.6s ease;
        }
        .icon-line.line-long {
          top: 38px;
          right: 8px;
          width: 47px;
          transform: rotate(-45deg);
          animation: icon-line-long 0.6s ease;
        }
        @keyframes icon-line-tip {
          0% { width: 0; left: 1px; top: 19px; }
          100% { width: 25px; left: 19px; top: 46px; }
        }
        @keyframes icon-line-long {
          0% { width: 0; right: 46px; top: 54px; }
          100% { width: 47px; right: 8px; top: 38px; }
        }
        .spinner {
          width: 20px;
          height: 20px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s ease-in-out infinite;
          display: inline-block;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div className={`register-card-glass ${shakeError ? 'shake' : ''}`}>
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <Logo size="small" showText={false} />
          <h1 style={{ color: '#16a34a', fontSize: '24px', fontWeight: 800, margin: '8px 0 2px 0' }}>GrowMore</h1>
          <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>Create your account</p>
        </div>

        {/* Steps Progress Bar */}
        <div className="steps-container">
          <div className="steps-line">
            <div className="steps-line-progress" style={{ width: progressWidth }}></div>
          </div>
          {steps.map(step => {
            const isActive = currentStep === step.num;
            const isCompleted = currentStep > step.num;
            return (
              <div 
                key={step.num} 
                className={`step-node ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
              >
                {isCompleted ? '✓' : step.num}
                <span className="step-label">{step.label}</span>
              </div>
            );
          })}
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', color: '#ef4444', padding: '12px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, marginBottom: '20px', textAlign: 'center' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Step 1: Phone Entry */}
        {currentStep === 1 && (
          <div>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Phone Number</label>
              <div className="input-group" style={{ display: 'flex', gap: '8px' }}>
                <select
                  style={{ width: '80px', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '12px', fontSize: '14px', fontWeight: 600, color: '#1e293b', background: '#f8fafc' }}
                  name="countryCode"
                  value={formData.countryCode}
                  onChange={handleChange}
                >
                  {countryCodes.map(c => (
                    <option key={c.code} value={c.code}>{c.code}</option>
                  ))}
                </select>
                <input
                  type="tel"
                  name="phone"
                  style={{ flex: 1, padding: '12px 16px', border: '1px solid #cbd5e1', borderRadius: '12px', fontSize: '14px', color: '#1e293b' }}
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  maxLength="10"
                  required
                />
              </div>
            </div>

            <button 
              onClick={() => handleSendOtp(false)}
              disabled={sendingOtp}
              style={{ width: '100%', border: 'none', borderRadius: '12px', background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)', color: 'white', padding: '14px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(22, 163, 74, 0.2)' }}
            >
              {sendingOtp ? <span className="spinner"></span> : 'Send OTP'}
            </button>
          </div>
        )}

        {/* Step 2: OTP Entry */}
        {currentStep === 2 && (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '13px', color: '#475569', marginBottom: '15px' }}>
              We sent a 6-digit OTP code to <strong style={{ color: '#1e293b' }}>{formData.countryCode} {formData.phone}</strong>
            </p>

            {successAnimation ? (
              <div style={{ padding: '20px 0' }}>
                <div className="check-icon" style={{ marginBottom: '15px' }}>
                  <span className="icon-line line-tip"></span>
                  <span className="icon-line line-long"></span>
                </div>
                <strong style={{ color: '#16a34a', display: 'block', fontSize: '15px' }}>OTP Verified Successfully!</strong>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', margin: '20px 0' }}>
                  {otpCode.map((val, idx) => (
                    <input
                      key={idx}
                      ref={el => inputRefs.current[idx] = el}
                      type="text"
                      pattern="[0-9]*"
                      inputMode="numeric"
                      maxLength="1"
                      className="otp-box"
                      value={val}
                      onChange={e => handleOtpChange(e.target.value, idx)}
                      onKeyDown={e => handleOtpKeyDown(e, idx)}
                      onPaste={handleOtpPaste}
                    />
                  ))}
                </div>

                <button 
                  onClick={() => verifyOtpCode(otpCode.join(''))}
                  disabled={verifyingOtp || otpCode.join('').length !== 6}
                  style={{ width: '100%', border: 'none', borderRadius: '12px', background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)', color: 'white', padding: '14px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', marginBottom: '16px' }}
                >
                  {verifyingOtp ? <span className="spinner"></span> : 'Verify OTP'}
                </button>

                <div style={{ fontSize: '13px', color: '#64748b' }}>
                  {resendTimer > 0 ? (
                    <span>Resend OTP in {resendTimer}s</span>
                  ) : (
                    <button 
                      onClick={() => handleSendOtp(true)}
                      style={{ background: 'none', border: 'none', color: '#16a34a', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 3: Registration Info Details */}
        {currentStep === 3 && (
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>Phone Number</label>
              <input
                type="text"
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '13px', color: '#64748b', background: '#f1f5f9' }}
                value={`${formData.countryCode} ${formData.phone}`}
                disabled
              />
            </div>

            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>Full Name (Optional)</label>
              <input
                type="text"
                name="fullName"
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '13px', color: '#1e293b' }}
                placeholder="Enter your name"
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>Password</label>
              <input
                type="password"
                name="password"
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '13px', color: '#1e293b' }}
                placeholder="Enter password (min 6 chars)"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="6"
              />
            </div>

            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '13px', color: '#1e293b' }}
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength="6"
              />
            </div>

            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>Invitation Code</label>
              <input
                type="text"
                name="inviteCode"
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '13px', color: '#1e293b' }}
                placeholder="Enter invitation code"
                value={formData.inviteCode}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>Security Question</label>
              <select
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '13px', color: '#1e293b', background: 'white' }}
                name="securityQuestion"
                value={formData.securityQuestion}
                onChange={handleChange}
                required
              >
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

            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>Answer</label>
              <input
                type="text"
                name="securityAnswer"
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '13px', color: '#1e293b' }}
                placeholder="Enter your answer"
                value={formData.securityAnswer}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>Captcha</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  name="captchaInput"
                  style={{ flex: 1, padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '13px', color: '#1e293b' }}
                  placeholder="Enter captcha"
                  value={formData.captchaInput}
                  onChange={handleChange}
                  required
                  maxLength="5"
                />
                <div 
                  onClick={loadCaptcha}
                  style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px', fontSize: '14px', fontWeight: 700, color: '#16a34a', letterSpacing: '2px', cursor: 'pointer', userSelect: 'none' }}
                  title="Click to refresh"
                >
                  {captchaData.text || '------'}
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              style={{ width: '100%', border: 'none', borderRadius: '12px', background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)', color: 'white', padding: '14px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(22, 163, 74, 0.2)' }}
            >
              {loading ? <span className="spinner"></span> : 'Join GrowMore'}
            </button>
          </form>
        )}

        {/* Step 4: Success */}
        {currentStep === 4 && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div className="check-icon" style={{ marginBottom: '20px' }}>
              <span className="icon-line line-tip"></span>
              <span className="icon-line line-long"></span>
            </div>
            <h2 style={{ color: '#16a34a', fontSize: '20px', fontWeight: 800, margin: '15px 0 8px 0' }}>Registration Successful! 🎉</h2>
            <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>
              Welcome to GrowMore! Your account is created. Redirecting to your dashboard...
            </p>
          </div>
        )}

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px', color: '#64748b' }}>
          Already have a GrowMore account? <a href="/login" style={{ color: '#16a34a', fontWeight: 700, textDecoration: 'none' }}>Login</a>
        </div>
      </div>
    </div>
  );
};

export default Register;
