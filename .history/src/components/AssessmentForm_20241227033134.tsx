import React, { useState } from 'react';
import { ClinicianInfo } from '../App';

interface AssessmentFormProps {
    isEnabled: boolean;
    clinicianInfo: ClinicianInfo | null;
    onClear: () => void;
}

interface FormData {
    status: {
        asc: string;
        adhd: string;
    };
    referrals: string[];
    otherReferrals: string;
    observations: string;
    strengths: string;
    priorities: string;
    recommendations: string;
}

const defaultTexts = {
    observations: `• Social engagement patterns
• Communication style
• Response to activities
• Behavioral patterns
• Notable strengths/challenges`,
    strengths: `• Memory (e.g., Strong recall of sequences)
• Visual (e.g., Pattern recognition)
• Physical (e.g., Fine motor skills)`,
    priorities: `• Assessment data patterns
• Family priorities
• School observations
• Clinical judgment`,
    recommendations: `• Strength-based strategies
• Practical implementation
• Home/school alignment
• Family resources`
};

export const AssessmentForm: React.FC<AssessmentFormProps> = ({ isEnabled, clinicianInfo, onClear }) => {
    const [formData, setFormData] = useState<FormData>({
        status: { asc: '', adhd: '' },
        referrals: [],
        otherReferrals: '',
        observations: defaultTexts.observations,
        strengths: defaultTexts.strengths,
        priorities: defaultTexts.priorities,
        recommendations: defaultTexts.recommendations
    });

    const handleTextAreaFocus = (field: keyof typeof defaultTexts) => {
        if (formData[field] === defaultTexts[field]) {
            setFormData(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleTextAreaBlur = (field: keyof typeof defaultTexts) => {
        if (!formData[field].trim()) {
            setFormData(prev => ({ ...prev, [field]: defaultTexts[field] }));
        }
    };

    const handleSubmit = () => {
        if (!isEnabled) {
            alert('Please create a new report first');
            return;
        }

        if (!formData.status.asc || !formData.status.adhd) {
            alert('Please select both ASC and ADHD status');
            return;
        }

        // TODO: Send form data to server
        console.log('Form submitted:', {
            clinician: clinicianInfo,
            ...formData
        });
        alert('Assessment submitted successfully');
        handleClear();
    };

    const handleClear = () => {
        setFormData({
            status: { asc: '', adhd: '' },
            referrals: [],
            otherReferrals: '',
            observations: defaultTexts.observations,
            strengths: defaultTexts.strengths,
            priorities: defaultTexts.priorities,
            recommendations: defaultTexts.recommendations
        });
        onClear();
    };

    const handleReferralChange = (value: string, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            referrals: checked 
                ? [...prev.referrals, value]
                : prev.referrals.filter(r => r !== value)
        }));
    };

    return (
        <div className={`form-container ${isEnabled ? 'active' : ''}`}>
            <div className="form-content">
                {/* Status Section */}
                <div className="status-section">
                    <h4><i className="material-icons">check_circle_outline</i>Status</h4>
                    <div className="status-group">
                        <div className="status-item">
                            <h4>ASC Status</h4>
                            <select 
                                value={formData.status.asc}
                                onChange={e => setFormData(prev => ({
                                    ...prev,
                                    status: { ...prev.status, asc: e.target.value }
                                }))}
                            >
                                <option value="">--</option>
                                <option>ASC confirmed</option>
                                <option>ASC not confirmed</option>
                            </select>
                        </div>
                        
                        <div className="status-item">
                            <h4>ADHD Status</h4>
                            <select 
                                value={formData.status.adhd}
                                onChange={e => setFormData(prev => ({
                                    ...prev,
                                    status: { ...prev.status, adhd: e.target.value }
                                }))}
                            >
                                <option value="">--</option>
                                <option>No concerns identified</option>
                                <option>Assessment recommended</option>
                                <option>Previously confirmed</option>
                                <option>Confirmed during diagnosis</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Professional Referrals */}
                <div className="referrals-section">
                    <h4><i className="material-icons">share</i>Professional Referrals</h4>
                    <div className="referrals-grid">
                        <label>
                            <input 
                                type="checkbox" 
                                checked={formData.referrals.includes('Speech & Language')}
                                onChange={e => handleReferralChange('Speech & Language', e.target.checked)}
                            /> Speech & Language
                        </label>
                        <label>
                            <input 
                                type="checkbox" 
                                checked={formData.referrals.includes('Educational Psychology')}
                                onChange={e => handleReferralChange('Educational Psychology', e.target.checked)}
                            /> Educational Psychology
                        </label>
                        <label>
                            <input 
                                type="checkbox" 
                                checked={formData.referrals.includes('Sleep Support')}
                                onChange={e => handleReferralChange('Sleep Support', e.target.checked)}
                            /> Sleep Support
                        </label>
                        <div className="referral-other-row">
                            <label>
                                <input 
                                    type="checkbox" 
                                    checked={formData.referrals.includes('Other')}
                                    onChange={e => handleReferralChange('Other', e.target.checked)}
                                /> Other
                            </label>
                            <input 
                                type="text" 
                                className="referral-other-input" 
                                placeholder="Specific Remarks"
                                value={formData.otherReferrals}
                                onChange={e => setFormData(prev => ({
                                    ...prev,
                                    otherReferrals: e.target.value
                                }))}
                            />
                        </div>
                    </div>
                </div>

                {/* Text Areas Grid */}
                <div className="middle-sections-grid">
                    <div className="text-box-container clinical">
                        <div className="text-box-header">
                            <i className="material-icons">description</i>
                            <h4>Key Clinical Observations</h4>
                        </div>
                        <textarea 
                            className="text-area"
                            value={formData.observations}
                            onChange={e => setFormData(prev => ({ ...prev, observations: e.target.value }))}
                            onFocus={() => handleTextAreaFocus('observations')}
                            onBlur={() => handleTextAreaBlur('observations')}
                        />
                    </div>

                    <div className="text-box-container strengths">
                        <div className="text-box-header">
                            <i className="material-icons">star</i>
                            <h4>Strengths & Abilities</h4>
                        </div>
                        <textarea 
                            className="text-area"
                            value={formData.strengths}
                            onChange={e => setFormData(prev => ({ ...prev, strengths: e.target.value }))}
                            onFocus={() => handleTextAreaFocus('strengths')}
                            onBlur={() => handleTextAreaBlur('strengths')}
                        />
                    </div>

                    <div className="text-box-container priority">
                        <div className="text-box-header">
                            <i className="material-icons">priority_high</i>
                            <h4>Priority Support Areas</h4>
                        </div>
                        <textarea 
                            className="text-area"
                            value={formData.priorities}
                            onChange={e => setFormData(prev => ({ ...prev, priorities: e.target.value }))}
                            onFocus={() => handleTextAreaFocus('priorities')}
                            onBlur={() => handleTextAreaBlur('priorities')}
                        />
                    </div>

                    <div className="text-box-container support">
                        <div className="text-box-header">
                            <i className="material-icons">support</i>
                            <h4>Support Recommendations</h4>
                        </div>
                        <textarea 
                            className="text-area"
                            value={formData.recommendations}
                            onChange={e => setFormData(prev => ({ ...prev, recommendations: e.target.value }))}
                            onFocus={() => handleTextAreaFocus('recommendations')}
                            onBlur={() => handleTextAreaBlur('recommendations')}
                        />
                    </div>
                </div>

                {/* Button Group */}
                <div className="button-group">
                    <button className="clear-button" onClick={handleClear}>Clear Form</button>
                    <button className="submit-button" onClick={handleSubmit}>Submit Assessment</button>
                </div>
            </div>
        </div>
    );
}; 