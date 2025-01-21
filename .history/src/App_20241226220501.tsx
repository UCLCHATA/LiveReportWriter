import React, { useState } from 'react';
import Header from './components/Header';
import MilestoneTracker from './components/MilestoneTracker';
import Form from './components/Form';
import Footer from './components/Footer';
import ClinicianModal from './components/ClinicianModal';
import { ClinicianInfo } from './components/types';

const App: React.FC = () => {
  const [isFormEnabled, setIsFormEnabled] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [clinicianInfo, setClinicianInfo] = useState<ClinicianInfo | null>(null);

  const handleStartReport = (info: ClinicianInfo) => {
    setClinicianInfo(info);
    setIsFormEnabled(true);
    setShowModal(false);
  };

  const handleClear = () => {
    setIsFormEnabled(false);
    setClinicianInfo(null);
  };

  return (
    <>
      <Header />
      <main className="main-container">
        <div className="assessment-container">
          <MilestoneTracker />
          {!isFormEnabled && (
            <button 
              className="create-report-button"
              onClick={() => setShowModal(true)}
            >
              <i className="material-icons">add</i>
              Create New Report
            </button>
          )}
        </div>
        <Form 
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
      <Footer />
    </>
  );
};

export default App; 