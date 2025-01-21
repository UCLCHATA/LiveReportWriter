import type { GlobalFormState } from '../types';

// Define all expected Sheety headers and their corresponding data requirements
export const SHEETY_HEADERS = {
    // Clinical Modal Headers
    CLINICIAN: {
        name: 'clinicianName',
        email: 'clinicianEmail',
        clinic: 'clinicName',
        childFirstName: 'childFirstname',
        childLastName: 'childSecondname',
        childAge: 'childAge',
        childGender: 'childGender'
    },
    
    // Assessment Form Headers
    FORM: {
        clinicalObservations: 'clinicalObservations',
        recommendations: 'supportRecommendations',
        differentialDiagnosis: 'differentialDiagnosis',
        supportAreas: 'prioritySupportAreas',
        strengths: 'strengthsAbilities',
        ascStatus: 'ascStatus',
        adhdStatus: 'adhdStatus',
        additionalRemarks: 'additionalRemarks',
        referrals: 'referrals'
    },
    
    // Sensory Profile Headers
    SENSORY: {
        visual: {
            score: 'visualScore',
            observations: 'visualObservations'
        },
        auditory: {
            score: 'auditoryScore',
            observations: 'auditoryObservations'
        },
        tactile: {
            score: 'tactileScore',
            observations: 'tactileObservations'
        },
        vestibular: {
            score: 'vestibularScore',
            observations: 'vestibularObservations'
        },
        proprioceptive: {
            score: 'proprioceptiveScore',
            observations: 'proprioceptiveObservations'
        },
        oral: {
            score: 'oralScore',
            observations: 'oralObservations'
        }
    },
    
    // Social Communication Headers
    SOCIAL: {
        jointAttention: {
            score: 'jointAttentionScore',
            observations: 'jointAttentionObservations'
        },
        nonverbalCommunication: {
            score: 'nonverbalCommunicationScore',
            observations: 'nonverbalCommunicationObservations'
        },
        verbalCommunication: {
            score: 'verbalCommunicationScore',
            observations: 'verbalCommunicationObservations'
        },
        socialUnderstanding: {
            score: 'socialUnderstandingScore',
            observations: 'socialUnderstandingObservations'
        },
        playSkills: {
            score: 'playSkillsScore',
            observations: 'playSkillsObservations'
        },
        peerInteractions: {
            score: 'peerInteractionsScore',
            observations: 'peerInteractionsObservations'
        }
    },
    
    // Behavior Interests Headers
    BEHAVIOR: {
        repetitiveBehaviors: {
            score: 'repetitiveBehaviorsScore',
            observations: 'repetitiveBehaviorsObservations'
        },
        routinesRituals: {
            score: 'routinesRitualsScore',
            observations: 'routinesRitualsObservations'
        },
        specialInterests: {
            score: 'specialInterestsScore',
            observations: 'specialInterestsObservations'
        },
        sensoryInterests: {
            score: 'sensoryInterestsScore',
            observations: 'sensoryInterestsObservations'
        },
        emotionalRegulation: {
            score: 'emotionalRegulationScore',
            observations: 'emotionalRegulationObservations'
        },
        flexibility: {
            score: 'flexibilityScore',
            observations: 'flexibilityObservations'
        }
    },
    
    // Milestone Headers
    MILESTONE: {
        timelineData: 'milestoneTimelineData',
        historyOfConcerns: 'historyOfConcerns'
    },
    
    // Assessment Log Headers
    ASSESSMENT_LOG: {
        data: 'assessmentLogData'
    },
    
    // Image Headers
    IMAGES: {
        milestoneImage: 'Milestone_Image',
        milestoneInclude: 'Image1_Include',
        radarChartImage: 'Combinedradar_Image',
        radarChartInclude: 'Image2_Include'
    }
};

interface ValidationResult {
    isValid: boolean;
    missingFields: string[];
    invalidFormats: string[];
}

// Validate data format for each component
export function validateDataFormat(data: Record<string, any>): ValidationResult {
    const result: ValidationResult = {
        isValid: true,
        missingFields: [],
        invalidFormats: []
    };

    // Helper to check if string is valid JSON
    const isValidJSON = (str: string) => {
        try {
            JSON.parse(str);
            return true;
        } catch {
            return false;
        }
    };

    // Only validate that CHATA ID is present
    if (!data.chataId?.trim()) {
        result.missingFields.push('chataId');
        result.isValid = false;
        return result;
    }

    // All other fields are optional but should be validated for format if present
    const validateOptionalJSON = (field: string) => {
        if (data[field] && !isValidJSON(data[field])) {
            result.invalidFormats.push(field);
        }
    };

    // Validate observation formats if present
    Object.values(SHEETY_HEADERS.SENSORY).forEach(domain => {
        validateOptionalJSON(domain.observations);
    });

    // Set result based on format validation only
    result.isValid = result.invalidFormats.length === 0;
    return result;
}

// Get all required Sheety headers
export function getAllHeaders(): string[] {
    const headers: string[] = [];
    const addHeaders = (obj: any) => {
        if (typeof obj === 'string') {
            headers.push(obj);
        } else if (typeof obj === 'object') {
            Object.values(obj).forEach(value => addHeaders(value));
        }
    };

    Object.values(SHEETY_HEADERS).forEach(group => addHeaders(group));
    return [...new Set(headers)]; // Remove duplicates
} 