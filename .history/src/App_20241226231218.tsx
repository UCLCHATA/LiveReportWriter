import React, { useState } from 'react';
import { Header } from './components/Header';
import { AssessmentForm } from './components/AssessmentForm';
import { MilestoneTracker } from './components/MilestoneTracker';
import { ClinicianModal } from './components/ClinicianModal';
import './styles/main.css';

export interface ClinicianInfo {
  name: string;
  email: string;
}

const App: React.FC = () => {
  const [isFormEnabled, setIsFormEnabled] = useState(false);
  const [chataId, setChataId] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [clinicianInfo, setClinicianInfo] = useState<ClinicianInfo | null>(null);

  const handleStartReport = (info: ClinicianInfo) => {
    setClinicianInfo(info);
    setChataId('CHATA-' + Math.random().toString(36).substr(2, 6).toUpperCase());
    setIsFormEnabled(true);
    setShowModal(false);
  };

  const handleClear = () => {
    setIsFormEnabled(false);
    setChataId('');
    setClinicianInfo(null);
  };

  return (
    <>
      <Header chataId={chataId} />
      
      {!isFormEnabled && (
        <button className="create-report-button" onClick={() => setShowModal(true)}>
          <i className="material-icons">add</i>
          Create New Report
        </button>
      )}

      <main className="main-container">
        <MilestoneTracker />
        <AssessmentForm 
          isEnabled={isFormEnabled}
          clinicianInfo={clinicianInfo}
          onClear={handleClear}
        />
      </main>

      <ClinicianModal 
        show={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleStartReport}
      />

      <footer className="site-footer">
        <div className="footer-content">
          <p>&copy; 2024 CHATA Report Writing Form System</p>
          <p className="contact-text">Need help? Contact uclchata@gmail.com</p>
        </div>
      </footer>
    </>
  );
};

export default App; 