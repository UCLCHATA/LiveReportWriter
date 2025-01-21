import React, { useState } from 'react';

type ClinicianInfo = {
  name: string;
  email: string;
};

type ClinicianModalProps = {
  isOpen: boolean;
  onSubmit: (info: ClinicianInfo) => void;
  onCancel: () => void;
};

export const ClinicianModal: React.FC<ClinicianModalProps> = ({
  isOpen,
  onSubmit,
  onCancel,
}) => {
  const [clinicianInfo, setClinicianInfo] = useState<ClinicianInfo>({
    name: '',
    email: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (clinicianInfo.name && clinicianInfo.email) {
      onSubmit(clinicianInfo);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-backdrop active">
        <div className="modal-container active">
          <h2>Enter Clinician Details</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="clinician-name">Name</label>
              <input
                id="clinician-name"
                type="text"
                value={clinicianInfo.name}
                onChange={(e) =>
                  setClinicianInfo((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="clinician-email">Email</label>
              <input
                id="clinician-email"
                type="email"
                value={clinicianInfo.email}
                onChange={(e) =>
                  setClinicianInfo((prev) => ({ ...prev, email: e.target.value }))
                }
                required
              />
            </div>
            <div className="button-group">
              <button type="button" className="cancel-button" onClick={onCancel}>
                Cancel
              </button>
              <button type="submit" className="submit-button">
                Start Assessment
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}; 