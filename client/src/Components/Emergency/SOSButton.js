import React from 'react';
import { useEmergency } from '../../Context/EmergencyContext';
import ClickSpark from '../animations/ClickSpark';

export default function SOSButton({ variant = 'navbar', className = '' }) {
  const { openEmergency } = useEmergency();

  if (variant === 'sidebar') {
    return (
      <ClickSpark style={{ display: 'block', width: '100%' }}>
        <button
          onClick={() => openEmergency()}
          aria-label="Emergency SOS Assistance"
          style={{
            width: '100%',
            padding: '12px 18px',
            background: 'linear-gradient(135deg, #dc2626, #ef4444)',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: '700',
            fontSize: '1rem',
            letterSpacing: '0.5px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(220, 38, 38, 0.4)',
            transition: 'all 0.2s ease'
          }}
          className={className}
        >
          <span style={{ fontSize: '1.2rem', animation: 'pulse 1.5s infinite' }}>🆘</span>
          <span>SOS Assistance</span>
        </button>
      </ClickSpark>
    );
  }

  return (
    <ClickSpark>
      <button
        onClick={() => openEmergency()}
        aria-label="Emergency SOS"
        title="Emergency Assistance (SOS)"
        style={{
          background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
          color: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          padding: '8px 18px',
          borderRadius: '9999px',
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: '700',
          fontSize: '0.95rem',
          letterSpacing: '0.5px',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 0 15px rgba(220, 38, 38, 0.45)',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)';
          e.currentTarget.style.boxShadow = '0 0 25px rgba(220, 38, 38, 0.7)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.boxShadow = '0 0 15px rgba(220, 38, 38, 0.45)';
        }}
        className={className}
      >
        <span style={{ display: 'inline-block', transform: 'scale(1.1)' }}>🆘</span>
        <span>SOS</span>
      </button>
    </ClickSpark>
  );
}
