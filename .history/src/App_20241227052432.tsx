import React, { useState } from 'react';
import { AssessmentCarousel } from './components/AssessmentCarousel';
import { AssessmentForm } from './components/AssessmentForm';
import { ClinicianModal } from './components/ClinicianModal';
import uclLogo from './assets/ucl-logo.png';
import nhsLogo from './assets/nhs-logo.png';

type ClinicianInfo = {
  name: string;
  email: string;
};

export const App: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [clinicianInfo, setClinicianInfo] = useState<ClinicianInfo | null>(null);
  const [chataId, setChataId] = useState<string>('');

  const handleCreateReport = () => {
    setShowModal(true);
  };

  const handleClinicianSubmit = (info: ClinicianInfo) => {
    setClinicianInfo(info);
    setShowModal(false);
    setShowForm(true);
    // Generate CHATA ID using clinician's name and timestamp
    const timestamp = new Date().getTime();
    const id = `CHATA-${info.name.substring(0, 3).toUpperCase()}-${timestamp.toString().slice(-6)}`;
    setChataId(id);
  };

  const handleClearForm = () => {
    setShowForm(false);
    setClinicianInfo(null);
    setChataId('');
  };

  return (
    <div className="app">
      <header>
        <div className="logo-container">
          <img src={uclLogo} alt="UCL Logo" className="ucl-logo" />
        </div>
        <div className="title-container">
          <h1>CHATA Autism Report Generator</h1>
          {chataId && <div className="chata-id">{chataId}</div>}
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
              <button className="create-report-button" onClick={handleCreateReport}>
                Create New Report
              </button>
            </div>
          ) : (
            <div className="form-container active">
              <AssessmentForm onClear={handleClearForm} />
            </div>
          )}
        </div>
      </main>

      <footer>
        <div className="footer-content">
          <div className="footer-logos">
            <img src={uclLogo} alt="UCL Logo" className="ucl-logo" />
            <img src={nhsLogo} alt="NHS Logo" className="nhs-logo" />
          </div>
          <div>© 2024 UCL & NHS. For support contact: uclchata@gmail.com</div>
        </div>
      </footer>

      <ClinicianModal
        isOpen={showModal}
        onSubmit={handleClinicianSubmit}
        onCancel={() => setShowModal(false)}
      />
    </div>
  );
}; 