import React, { useState } from 'react';
import { AssessmentForm } from './components/AssessmentForm';
import { ClinicianModal } from './components/ClinicianModal';

export interface ClinicianInfo {
  name: string;
  role: string;
  organization: string;
}

export const App = () => {
  const [isFormEnabled, setIsFormEnabled] = useState(false);
  const [clinicianInfo, setClinicianInfo] = useState<ClinicianInfo | null>(null);

  const handleStartAssessment = () => {
    setIsFormEnabled(true);
  };

  const handleClearForm = () => {
    setIsFormEnabled(false);
    setClinicianInfo(null);
  };

  return (
    <div className="main-container">
      <header className="header">
        <img src="/ucl-logo.png" alt="UCL Logo" className="ucl-logo" />
        <h1>CHATA Autism Report Generator</h1>
        <img src="/nhs-logo.png" alt="NHS Logo" className="nhs-logo" />
      </header>

      {!isFormEnabled ? (
        <div className="start-container">
          <button 
            className="create-report-button"
            onClick={handleStartAssessment}
          >
            Create New Report
          </button>
        </div>
      ) : (
        <>
          <ClinicianModal 
            isOpen={isFormEnabled && !clinicianInfo} 
            onSubmit={setClinicianInfo} 
          />
          <AssessmentForm 
            isEnabled={isFormEnabled && !!clinicianInfo}
            clinicianInfo={clinicianInfo}
            onClear={handleClearForm}
          />
        </>
      )}

      <footer className="footer">
        <p>© 2024 UCL & NHS. For support contact: uclchata@gmail.com</p>
      </footer>
    </div>
  );
}; 