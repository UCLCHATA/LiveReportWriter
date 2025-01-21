import React, { useState } from 'react';
import { ClinicianInfo } from '../App';
import { SocialCommunicationProfile } from './SocialCommunicationProfile';
// Import other profiles when ready
// import { SensoryProfile } from './SensoryProfile';
// import { BehavioralProfile } from './BehavioralProfile';

interface AssessmentFormProps {
    isEnabled: boolean;
    clinicianInfo: ClinicianInfo | null;
    onClear: () => void;
}

type TabType = 'milestones' | 'sensory' | 'behavioral';

export const AssessmentForm: React.FC<AssessmentFormProps> = ({ isEnabled, clinicianInfo, onClear }) => {
    const [activeTab, setActiveTab] = useState<TabType>('milestones');

    const renderContent = () => {
        switch (activeTab) {
            case 'milestones':
                return <SocialCommunicationProfile />;
            case 'sensory':
                return <div>Sensory Profile Coming Soon</div>;
            case 'behavioral':
                return <div>Behavioral Profile Coming Soon</div>;
            default:
                return null;
        }
    };

    return (
        <div className={`form-container ${isEnabled ? 'active' : ''}`}>
            <div className="form-content">
                {/* Tabs */}
                <div className="tabs-section">
                    <button 
                        className={`tab ${activeTab === 'milestones' ? 'active' : ''}`}
                        onClick={() => setActiveTab('milestones')}
                    >
                        Milestones
                    </button>
                    <button 
                        className={`tab ${activeTab === 'sensory' ? 'active' : ''}`}
                        onClick={() => setActiveTab('sensory')}
                    >
                        Sensory
                    </button>
                    <button 
                        className={`tab ${activeTab === 'behavioral' ? 'active' : ''}`}
                        onClick={() => setActiveTab('behavioral')}
                    >
                        Behavioral
                    </button>
                </div>

                {/* Dynamic Content */}
                <div className="tab-content">
                    {renderContent()}
                </div>

                {/* Status & Referrals Section */}
                <div className="status-section">
                    {/* ... existing status section code ... */}
                </div>

                {/* Button Group */}
                <div className="button-group">
                    <button className="clear-button" onClick={onClear}>Clear Form</button>
                    <button className="submit-button" onClick={handleSubmit}>Submit Assessment</button>
                </div>
            </div>
        </div>
    );
}; 