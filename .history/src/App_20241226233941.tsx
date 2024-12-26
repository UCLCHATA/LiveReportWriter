import React, { useState } from 'react';
import { AssessmentForm } from './components/AssessmentForm';
import { ClinicianModal } from './components/ClinicianModal';
import { MilestoneTracker } from './components/MilestoneTracker';

// Temporary URLs until we have local assets
const uclLogo = 'https://upload.wikimedia.org/wikipedia/sco/thumb/d/d1/University_College_London_logo.svg/300px-University_College_London_logo.svg.png';
const nhsLogo = 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/National_Health_Service_%28England%29_logo.svg/371px-National_Health_Service_%28England%29_logo.svg.png';

export interface ClinicianInfo {
  name: string;
  email: string;
}

export const App: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [clinicianInfo, setClinicianInfo] = useState<ClinicianInfo | null>(null);
  const [formEnabled, setFormEnabled] = useState(false);

  const handleStartReport = () => {
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleModalSubmit = (info: ClinicianInfo) => {
    setClinicianInfo(info);
    setFormEnabled(true);
    setShowModal(false);
  };

  const handleClearForm = () => {
    setFormEnabled(false);
    setClinicianInfo(null);
  };

  return (
    <div className="app">
      <header>
        <div className="logo-container">
          <img src={uclLogo} alt="UCL Logo" className="ucl-logo" />
        </div>
        <div className="title-container">
          <h1>CHATA Autism Report Generator</h1>
          {clinicianInfo && (
            <div className="chata-id">
              CHATA ID: {Math.random().toString(36).substring(2, 8).toUpperCase()}
            </div>
          )}
        </div>
        <div className="logo-container">
          <img src={nhsLogo} alt="NHS Logo" className="nhs-logo" />
        </div>
      </header>

      <main>
        <div className="left-panel">
          <MilestoneTracker />
        </div>
        <div className="right-panel">
          {!formEnabled && (
            <div className="overlay">
              <button className="create-report-button" onClick={handleStartReport}>
                Create New Report
              </button>
            </div>
          )}
          <AssessmentForm
            isEnabled={formEnabled}
            clinicianInfo={clinicianInfo}
            onClear={handleClearForm}
          />
        </div>
      </main>

      <footer>
        <div className="footer-content">
          <div className="footer-logos">
            <img src={uclLogo} alt="UCL Logo" className="footer-logo" />
            <img src={nhsLogo} alt="NHS Logo" className="footer-logo" />
          </div>
          <p>© 2024 UCL & NHS. For support contact: support@chata.ucl.ac.uk</p>
        </div>
      </footer>

      <ClinicianModal
        show={showModal}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
      />
    </div>
  );
}; 