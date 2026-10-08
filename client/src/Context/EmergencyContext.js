import React, { createContext, useState, useContext, useCallback } from 'react';
import { EMERGENCY_OPTIONS } from '../Components/Emergency/emergencyData';

const EmergencyContext = createContext(null);

export function EmergencyProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [alertStatus, setAlertStatus] = useState(null); // null | 'triggered' | 'dismissed'
  const [alertMessage, setAlertMessage] = useState('');
  const [sosGestureEnabled, setSosGestureEnabled] = useState(true);

  const openEmergency = useCallback((optionId = null) => {
    if (optionId) {
      const match = EMERGENCY_OPTIONS.find(o => o.id === optionId);
      setSelectedOption(match || null);
    } else {
      setSelectedOption(null);
    }
    setIsOpen(true);
  }, []);

  const closeEmergency = useCallback(() => {
    setIsOpen(false);
    setSelectedOption(null);
  }, []);

  const selectOption = useCallback((option) => {
    setSelectedOption(option);
  }, []);

  const resetSelection = useCallback(() => {
    setSelectedOption(null);
  }, []);

  const triggerAlert = useCallback((customMsg = null) => {
    const msg = customMsg || (selectedOption ? selectedOption.message : 'I NEED EMERGENCY ASSISTANCE');
    setAlertMessage(msg);
    setAlertStatus('triggered');
  }, [selectedOption]);

  const dismissAlert = useCallback(() => {
    setAlertStatus(null);
    setAlertMessage('');
  }, []);

  const toggleSosGesture = useCallback(() => {
    setSosGestureEnabled(prev => !prev);
  }, []);

  return (
    <EmergencyContext.Provider
      value={{
        isOpen,
        selectedOption,
        alertStatus,
        alertMessage,
        sosGestureEnabled,
        openEmergency,
        closeEmergency,
        selectOption,
        resetSelection,
        triggerAlert,
        dismissAlert,
        toggleSosGesture
      }}
    >
      {children}
    </EmergencyContext.Provider>
  );
}

export function useEmergency() {
  const context = useContext(EmergencyContext);
  if (!context) {
    throw new Error('useEmergency must be used within an EmergencyProvider');
  }
  return context;
}
