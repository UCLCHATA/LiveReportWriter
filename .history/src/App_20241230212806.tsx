import React, { useState } from 'react';
import { AssessmentCarousel } from './components/AssessmentCarousel';
import { ClinicianModal } from './components/ClinicianModal';
import { AssessmentForm } from './components/AssessmentForm';
import { FormProvider } from './context/FormContext';
import { ClinicianInfo } from './types';
import uclLogo from './assets/ucl-logo.png';
import nhsLogo from './assets/nhs-logo.png';
import './App.css';

export const App: React.FC = () => {
  const [showModal, setShowModal] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const handleClinicianSubmit = (info: ClinicianInfo) => {
    setShowModal(false);
    setShowForm(true);
  };

  return (
    <FormProvider>
      <div className="app">
        <header>
          <div className="logo-container">
            <img src={uclLogo} alt="UCL Logo" className="ucl-logo" />
          </div>
          <div className="title-container">
            <h1>CHATA Assessment Tool</h1>
          </div>
          <div className="logo-container">
            <img src={nhsLogo} alt="NHS Logo" className="nhs-logo" />
          </div>
        </header>

        <main>
          <div className={`left-panel ${showForm ? 'active' : ''}`}>
            <AssessmentCarousel />
          </div>

          <div className={`right-panel ${showForm ? 'active' : ''}`}>
            {!showForm ? (
              <div className="overlay">
                <button className="create-report-button" onClick={() => setShowModal(true)}>
                  Create New Report
                </button>
              </div>
            ) : (
              <div className="form-container active">
                <AssessmentForm onClear={() => {
                  setShowForm(false);
                  setShowModal(true);
                }} />
              </div>
            )}
          </div>
        </main>

        <ClinicianModal
          isOpen={showModal}
          onSubmit={handleClinicianSubmit}
          onCancel={() => setShowModal(false)}
        />
      </div>
    </FormProvider>
  );
}; 