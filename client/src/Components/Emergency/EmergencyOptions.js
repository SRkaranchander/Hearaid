import React from 'react';
import { EMERGENCY_OPTIONS } from './emergencyData';
import ClickSpark from '../animations/ClickSpark';

export default function EmergencyOptions({ onSelectOption }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
      {EMERGENCY_OPTIONS.map((option) => (
        <ClickSpark key={option.id} style={{ display: 'block', width: '100%' }}>
          <button
            onClick={() => onSelectOption(option)}
            style={{
              width: '100%',
              textAlign: 'left',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              padding: '16px 20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: 'var(--glass-shadow)',
              color: 'var(--text-primary)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.borderColor = option.color;
              e.currentTarget.style.boxShadow = `0 8px 24px -4px ${option.color}33`;
              e.currentTarget.style.background = 'var(--bg-surface-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'var(--border-light)';
              e.currentTarget.style.boxShadow = 'var(--glass-shadow)';
              e.currentTarget.style.background = 'var(--bg-surface)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  background: `${option.color}18`,
                  border: `1px solid ${option.color}30`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.6rem',
                  flexShrink: 0
                }}
              >
                {option.icon}
              </div>
              <div>
                <h4
                  style={{
                    margin: 0,
                    fontSize: '1.15rem',
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: '700',
                    color: 'var(--text-primary)'
                  }}
                >
                  {option.title}
                </h4>
                <p
                  style={{
                    margin: '4px 0 0 0',
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)',
                    fontFamily: "'Outfit', sans-serif"
                  }}
                >
                  {option.description}
                </p>
              </div>
            </div>

            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'var(--bg-surface-hover)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-cyan)',
                fontSize: '0.9rem',
                flexShrink: 0
              }}
            >
              ➔
            </div>
          </button>
        </ClickSpark>
      ))}
    </div>
  );
}
