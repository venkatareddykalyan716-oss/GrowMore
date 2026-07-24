import React from 'react';

const Logo = ({ size = 'medium', showText = false }) => {
  const sizes = {
    small: { width: 80, height: 80 },
    medium: { width: 150, height: 150 },
    large: { width: 250, height: 250 }
  };

  const { width, height } = sizes[size] || sizes.medium;

  return (
    <div className="growmore-logo">
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 400 320" 
        width={width} 
        height={height}
        style={{ display: 'block', margin: '0 auto' }}
      >
        <defs>
          <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#84cc16" />
            <stop offset="50%" stopColor="#65a30d" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
          <linearGradient id="gGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#14532d" />
            <stop offset="100%" stopColor="#166534" />
          </linearGradient>
        </defs>
        
        {/* G circle */}
        <circle cx="200" cy="130" r="80" fill="none" stroke="url(#gGrad)" strokeWidth="14" />
        
        {/* G opening */}
        <path d="M 280 130 L 280 165 L 230 165" fill="none" stroke="url(#gGrad)" strokeWidth="14" strokeLinecap="round" />
        
        {/* Stem */}
        <path d="M 200 210 Q 200 180 200 150" fill="none" stroke="#14532d" strokeWidth="6" strokeLinecap="round" />
        
        {/* Big leaf */}
        <path d="M 200 140 Q 230 80 290 60 Q 280 130 200 140 Z" fill="url(#leafGrad)" />
        <path d="M 200 140 Q 230 110 275 75" fill="none" stroke="#14532d" strokeWidth="2" opacity="0.6" />
        
        {/* Small leaf */}
        <path d="M 200 160 Q 170 130 130 120 Q 145 160 200 160 Z" fill="url(#leafGrad)" />
        <path d="M 200 160 Q 175 145 140 130" fill="none" stroke="#14532d" strokeWidth="1.5" opacity="0.6" />
        
        {/* "Grow More" text - ONLY shown if showText=true */}
        {showText && (
          <text x="200" y="270" fontFamily="Arial" fontSize="48" fontWeight="700" textAnchor="middle">
            <tspan fill="#14532d">Grow</tspan>
            <tspan fill="#22c55e">More</tspan>
          </text>
        )}
        
        {/* NO TAGLINE - REMOVED COMPLETELY! */}
      </svg>
    </div>
  );
};

export default Logo;
