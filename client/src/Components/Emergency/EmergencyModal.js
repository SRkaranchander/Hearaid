import React, { useEffect } from 'react';
import { useEmergency } from '../../Context/EmergencyContext';
import EmergencyOptions from './EmergencyOptions';
import EmergencyMessageView from './EmergencyMessageView';
import ClickSpark from '../animations/ClickSpark';

export default function EmergencyModal() {
  const {
    isOpen,
    selectedOption,
    alertStatus,
    alertMessage,
    closeEmergency,
    selectOption,
    resetSelection,
    triggerAlert,
    dismissAlert
  } = useEmergency();

  // Keyboard shortcut: Escape to close or back
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        if (alertStatus) {
          dismissAlert();
        } else if (selectedOption) {
          resetSelection();
        } else {
          closeEmergency();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, alertStatus, selectedOption, dismissAlert, resetSelection, closeEmergency]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="emergency-title"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(3, 7, 18, 0.75)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        overflowY: 'auto',
        animation: 'fadeIn 0.25s ease'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeEmergency();
      }}
    >
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '580px',
          maxHeight: '90vh',
          overflowY: 'auto',
          margin: 'auto',
          padding: '28px',
          border: '1px solid rgba(220, 38, 38, 0.3)',
          boxShadow: '0 25px 60px -15px rgba(220, 38, 38, 0.25), var(--glass-shadow)',
          position: 'relative'
        }}
      >
        {/* Header bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: '20px',
            borderBottom: '1px solid var(--border-light)',
            paddingBottom: '16px'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.4rem', animation: 'pulse 1.5s infinite' }}>🆘</span>
              <h2
                id="emergency-title"
                style={{
                  margin: 0,
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '1.5rem',
                  fontWeight: '800',
                  color: 'var(--text-primary)'
                }}
              >
                Emergency Assistance
              </h2>
            </div>
            <p
              style={{
                margin: '6px 0 0 0',
                fontSize: '0.95rem',
                color: 'var(--text-secondary)',
                fontFamily: "'Outfit', sans-serif"
              }}
            >
              {selectedOption ? 'Review your emergency broadcast details' : 'Choose what help you need'}
            </p>
          </div>

          <ClickSpark>
            <button
              onClick={closeEmergency}
              aria-label="Close emergency modal"
              style={{
                background: 'var(--bg-surface-hover)',
                border: '1px solid var(--border-light)',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text-secondary)',
                fontSize: '1.1rem',
                transition: 'all 0.2s ease'
              }}
            >
              ✕
            </button>
          </ClickSpark>
        </div>

        {/* Prototype Alert Triggered Banner */}
        {alertStatus === 'triggered' && (
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.2), rgba(249, 115, 22, 0.15))',
              border: '2px solid #ef4444',
              borderRadius: 'var(--radius-md)',
              padding: '20px',
              marginBottom: '20px',
              textAlign: 'center',
              animation: 'slideUpFade 0.3s ease'
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🚨</div>
            <h3
              style={{
                margin: '0 0 6px 0',
                fontFamily: "'Space Grotesk', sans-serif",
                color: '#ef4444',
                fontSize: '1.3rem',
                fontWeight: '800'
              }}
            >
              Emergency Alert Triggered
            </h3>
            <p
              style={{
                margin: '0 0 14px 0',
                fontFamily: "'Outfit', sans-serif",
                fontSize: '1rem',
                color: 'var(--text-primary)',
                fontWeight: '600'
              }}
            >
              Your emergency message is ready.
            </p>
            <div
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 14px',
                fontSize: '0.9rem',
                color: 'var(--text-secondary)',
                marginBottom: '14px'
              }}
            >
              <strong>Broadcast Message:</strong> "{alertMessage}"
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 14px 0' }}>
              ℹ️ <em>Prototype Note: Safe demonstration mode active. Real emergency contacts and dispatch APIs can be integrated here.</em>
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={dismissAlert}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-light)',
                  color: 'var(--text-primary)',
                  padding: '8px 18px',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                Dismiss Alert
              </button>
              <button
                onClick={closeEmergency}
                style={{
                  background: 'var(--gradient-primary)',
                  border: 'none',
                  color: '#ffffff',
                  padding: '8px 18px',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                Return to HearAid
              </button>
            </div>
          </div>
        )}

        {/* Modal Content */}
        {!alertStatus && (
          <>
            {selectedOption ? (
              <EmergencyMessageView
                option={selectedOption}
                onBack={resetSelection}
                onSendAlert={(msg) => triggerAlert(msg)}
                onCancel={closeEmergency}
              />
            ) : (
              <EmergencyOptions onSelectOption={(opt) => selectOption(opt)} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
