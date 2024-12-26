import React, { useState } from 'react';
import { ClinicianInfo } from '../App';
import { Tooltip } from '@mui/material';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';
import { SocialCommunicationProfile } from './SocialCommunicationProfile';

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

interface DomainDescription {
    title: string;
    description: string;
}

const domainDescriptions: Record<string, DomainDescription> = {
    socialReciprocity: {
        title: "Social Reciprocity",
        description: "Ability to engage in back-and-forth social interactions"
    },
    nonVerbalCommunication: {
        title: "Non-verbal",
        description: "Use and understanding of gestures and expressions"
    },
    relationships: {
        title: "Relationships",
        description: "Building and maintaining relationships"
    },
    emotionalRegulation: {
        title: "Emotional Regulation",
        description: "Managing and expressing emotions"
    },
    adaptiveFunctioning: {
        title: "Adaptive Functioning",
        description: "Daily living skills and independence"
    }
};

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

// Add this interface for the social communication data
interface SocialCommunicationData {
  socialReciprocity: { value: number };
  nonVerbalCommunication: { value: number };
  relationships: { value: number };
  emotionalRegulation: { value: number };
  adaptiveFunctioning: { value: number };
}

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

    const [socialData, setSocialData] = useState<SocialCommunicationData>({
        socialReciprocity: { value: 3 },
        nonVerbalCommunication: { value: 3 },
        relationships: { value: 3 },
        emotionalRegulation: { value: 3 },
        adaptiveFunctioning: { value: 3 }
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

    // Add handler for updating values
    const handleDomainChange = (domain: keyof SocialCommunicationData, value: number) => {
        setSocialData(prev => ({
            ...prev,
            [domain]: { value }
        }));
    };

    // Convert data for radar chart
    const radarData = Object.entries(socialData).map(([key, data]) => ({
        domain: key,
        value: 6 - data.value,
        fullMark: 5
    }));

    return (
        <div className={`form-container ${isEnabled ? 'active' : ''}`}>
            <div className="form-content">
                <div className="tabs-section">
                    <button className="tab active">Milestones</button>
                    <button className="tab">Sensory</button>
                    <button className="tab">Behavioral</button>
                </div>
                
                <SocialCommunicationProfile />
                
                {/* Rest of your form content */}
            </div>
        </div>
    );
}; 