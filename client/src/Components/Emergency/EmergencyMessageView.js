import React, { useState } from 'react';
import EmergencyAvatarSign from './EmergencyAvatarSign';
import ClickSpark from '../animations/ClickSpark';

export default function EmergencyMessageView({ option, onBack, onSendAlert, onCancel }) {
  const [showSign, setShowSign] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      {/* Category header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-light)',
          paddingBottom: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.8rem' }}>{option.icon}</span>
          <h3
            style={{
              margin: 0,
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '1.35rem',
              fontWeight: '700',
              color: option.color || 'var(--text-primary)'
            }}
          >
            {option.title}
          </h3>
        </div>
        <button
          onClick={onBack}
          style={{
            background: 'var(--bg-surface-hover)',
            border: '1px solid var(--border-light)',
            color: 'var(--text-secondary)',
            borderRadius: 'var(--radius-full)',
            padding: '6px 14px',
            fontSize: '0.85rem',
            fontFamily: "'Outfit', sans-serif",
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          ← Change Option
        </button>
      </div>

      {/* High-visibility Emergency Message Display */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.12), rgba(2, 132, 199, 0.08))',
          border: '2px solid rgba(220, 38, 38, 0.4)',
          borderRadius: 'var(--radius-md)',
          padding: '24px 20px',
          textAlign: 'center',
          boxShadow: '0 8px 30px rgba(220, 38, 38, 0.15)'
        }}
      >
        <span
          style={{
            fontSize: '0.8rem',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            color: '#ef4444',
            fontWeight: '800',
            fontFamily: "'Space Grotesk', sans-serif",
            display: 'block',
            marginBottom: '8px'
          }}
        >
          🚨 Emergency Message
        </span>
        <h2
          style={{
            margin: 0,
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
            fontWeight: '800',
            letterSpacing: '-0.5px',
            color: 'var(--text-primary)',
            lineHeight: '1.25'
          }}
        >
          {option.message}
        </h2>
      </div>

      {/* 3D Avatar Sign Demonstration Section */}
      {showSign && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          <EmergencyAvatarSign phrase={option.message} />
        </div>
      )}

      {/* Action Buttons */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '12px',
          marginTop: '6px'
        }}
      >
        <ClickSpark style={{ display: 'block', width: '100%' }}>
          <button
            onClick={() => setShowSign((prev) => !prev)}
            style={{
              width: '100%',
              padding: '14px 18px',
              background: showSign ? 'var(--gradient-secondary)' : 'var(--bg-surface-hover)',
              color: showSign ? '#ffffff' : 'var(--text-primary)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: '700',
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
              boxShadow: showSign ? 'var(--accent-glow)' : 'none'
            }}
          >
            <span>🤖</span>
            <span>{showSign ? 'Hide Sign' : 'Show Sign'}</span>
          </button>
        </ClickSpark>

        <ClickSpark style={{ display: 'block', width: '100%' }}>
          <button
            onClick={() => onSendAlert(option.message)}
            style={{
              width: '100%',
              padding: '14px 18px',
              background: 'linear-gradient(135deg, #dc2626, #ef4444)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: '700',
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 20px rgba(220, 38, 38, 0.45)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 25px rgba(220, 38, 38, 0.65)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(220, 38, 38, 0.45)';
            }}
          >
            <span>🚨</span>
            <span>Send Alert</span>
          </button>
        </ClickSpark>

        <ClickSpark style={{ display: 'block', width: '100%' }}>
          <button
            onClick={onCancel}
            style={{
              width: '100%',
              padding: '14px 18px',
              background: 'transparent',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: '600',
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-light)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            <span>Cancel</span>
          </button>
        </ClickSpark>
      </div>
    </div>
  );
}
