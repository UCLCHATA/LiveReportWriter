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
        additionalRemarks: 'additionalRemarks'
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
        milestoneImage: {
            chunk1: 'milestoneImageChunk1',
            chunk2: 'milestoneImageChunk2',
            chunk3: 'milestoneImageChunk3'
        },
        radarChart: {
            chunk1: 'combinedGraphImageChunk1',
            chunk2: 'combinedGraphImageChunk2',
            chunk3: 'combinedGraphImageChunk3'
        }
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

    // Validate Clinical Modal Data
    Object.values(SHEETY_HEADERS.CLINICIAN).forEach(field => {
        if (!data[field]) {
            result.missingFields.push(field);
        }
    });

    // Validate Assessment Form Data (truncate to 100 chars)
    Object.values(SHEETY_HEADERS.FORM).forEach(field => {
        if (!data[field]) {
            result.missingFields.push(field);
        }
    });

    // Validate Profile Data
    const validateProfile = (headerGroup: Record<string, { score: string; observations: string }>) => {
        Object.values(headerGroup).forEach(domain => {
            if (!data[domain.score] || !data[domain.observations]) {
                result.missingFields.push(domain.score);
            }
            if (data[domain.observations] && !isValidJSON(data[domain.observations])) {
                result.invalidFormats.push(domain.observations);
            }
        });
    };

    validateProfile(SHEETY_HEADERS.SENSORY);
    validateProfile(SHEETY_HEADERS.SOCIAL);
    validateProfile(SHEETY_HEADERS.BEHAVIOR);

    // Validate Milestone Data
    if (!data[SHEETY_HEADERS.MILESTONE.timelineData] || 
        !isValidJSON(data[SHEETY_HEADERS.MILESTONE.timelineData])) {
        result.invalidFormats.push(SHEETY_HEADERS.MILESTONE.timelineData);
    }

    // Validate Assessment Log
    if (!data[SHEETY_HEADERS.ASSESSMENT_LOG.data] || 
        !isValidJSON(data[SHEETY_HEADERS.ASSESSMENT_LOG.data])) {
        result.invalidFormats.push(SHEETY_HEADERS.ASSESSMENT_LOG.data);
    }

    // Validate Image Data
    if (data.includeImages) {
        const validateImageChunks = (imageType: Record<string, string>) => {
            Object.values(imageType).forEach(chunk => {
                if (!data[chunk] || data[chunk] === '{{NOT INCLUDE}}') {
                    result.missingFields.push(chunk);
                }
            });
        };

        if (data.milestoneImage?.include) {
            validateImageChunks(SHEETY_HEADERS.IMAGES.milestoneImage);
        }
        if (data.radarChartImage?.include) {
            validateImageChunks(SHEETY_HEADERS.IMAGES.radarChart);
        }
    }

    result.isValid = result.missingFields.length === 0 && result.invalidFormats.length === 0;
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