import React, { useState, useEffect } from 'react';
import Logo from './Logo';

const WelcomeModal = ({ onClose }) => {
  const [seconds, setSeconds] = useState(5);

  useEffect(() => {
    if (seconds > 0) {
      const timer = setTimeout(() => setSeconds(seconds - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [seconds]);

  return (
    <div className="modal-overlay active">
      <div className="modal">
        <div className="modal-header">
          <Logo size="medium" showText={false} />
          <h2>Welcome to GrowMore</h2>
          <p className="tagline">🌱 Grow Today, Greater Tomorrow 🌱</p>
        </div>
        <div className="modal-body">
          <p>
            <strong>GrowMore</strong> is a leading referral-based growth 
            platform founded to empower individuals across India to grow 
            their network and earn rewards.
          </p>
          <p>
            So far, we have helped more than <strong>500,000+ people</strong> 
            across 21 states in India to earn additional income through our 
            trusted platform.
          </p>
          <p>
            A person can have only one account on GrowMore. 
            Members must be 18 years or older to join this platform.
          </p>
          <p style={{ textAlign: 'center', marginTop: '15px' }}>
            ❤️ Join <strong>GrowMore</strong>, ordinary people can also 
            realize their dreams ❤️
          </p>
        </div>
        <div className="modal-footer">
          <button 
            className="modal-btn" 
            onClick={onClose}
            disabled={seconds > 0}
          >
            {seconds > 0 ? `Please wait... ${seconds}s` : 'OK'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;
