import React, { useState, useMemo, useEffect } from 'react';
import Select from 'react-select';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import styles from './ClinicianModal.module.css';
import { generateChataId, validateChataId } from '../utils/chataId';
import { formPersistence } from '../services/formPersistence';
import { ChataIdInput } from './ChataIdInput';
import { useFormState } from '../contexts/FormStateContext';

type ClinicianInfo = {
  name: string;
  email: string;
  clinicName: string;
  childName: string;
  childAge: string;
  childGender: string;
  chataId?: string;
};

interface ClinicianModalProps {
  onClose: () => void;
}

interface AgeOption {
  value: string;
  label: string;
}

const generateAgeOptions = () => {
  const options: AgeOption[] = [];
  
  // Add 2-6 years with months
  for (let year = 2; year <= 6; year++) {
    for (let month = 0; month < 12; month++) {
      const totalMonths = year * 12 + month;
      if (totalMonths <= 71) { // Up to 5 years 11 months
        options.push({
          value: totalMonths.toString(),
          label: `${year} year${year > 1 ? 's' : ''}, ${month} month${month !== 1 ? 's' : ''} (${totalMonths} months)`
        });
      }
    }
  }
  
  // Add 6-13 years without months
  for (let year = 6; year <= 13; year++) {
    options.push({
      value: (year * 12).toString(),
      label: `${year} years`
    });
  }
  
  return options;
};

export const ClinicianModal: React.FC<ClinicianModalProps> = ({ onClose }) => {
  const { globalState, setChataId } = useFormState();
  const [chataIdInput, setChataIdInput] = useState('');
  const [chataIdError, setChataIdError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChataIdSubmit = async (chataId: string) => {
    setIsLoading(true);
    try {
      const normalizedId = chataId.toUpperCase().trim();
      if (!validateChataId(normalizedId)) {
        setChataIdError('Invalid CHATA ID format. Please use format: XXX-XXX-123.');
        return;
      }

      // Clear error state since we have a valid form
      setChataIdError('');
      setChataIdInput('');
      
      // Set the CHATA ID in the global state
      await setChataId(normalizedId);
      
      // Close the modal
      onClose();
    } catch (error) {
      console.error('Error submitting CHATA ID:', error);
      setChataIdError('An error occurred while submitting the CHATA ID. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setChataIdInput('');
    setChataIdError('');
    onClose();
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Enter CHATA ID</h2>
        <ChataIdInput
          onSubmit={handleChataIdSubmit}
          error={chataIdError}
          isLoading={isLoading}
        />
        <div className="modal-actions">
          <button onClick={handleCancel} disabled={isLoading}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}; 