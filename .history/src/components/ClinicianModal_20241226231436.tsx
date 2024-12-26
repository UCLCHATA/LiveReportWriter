import React, { useState } from 'react';
import { ClinicianInfo } from '../App';

interface ClinicianModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (info: ClinicianInfo) => void;
}

export const ClinicianModal: React.FC<ClinicianModalProps> = ({ show, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email) {
      alert('Please fill in all fields');
      return;
    }
    
    if (!email.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }
    
    onSubmit({ name, email });
    setName('');
    setEmail('');
  };

  if (!show) return null;

  return (
    <>
      <div className="modal-backdrop active" onClick={onClose} />
      <div className="modal-container active">
        <div className="modal-content">
          <h3>Enter Clinician Details</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="clinician-name">Clinician's Name</label>
              <input
                type="text"
                id="clinician-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="clinician-email">Clinician's Email</label>
              <input
                type="email"
                id="clinician-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="button-group">
              <button type="submit" className="submit-button">
                Start Report
              </button>
              <button type="button" className="cancel-button" onClick={onClose}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}; 