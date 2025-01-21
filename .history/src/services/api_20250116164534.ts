// Sheety API configuration
export const SHEETY_API_ID = 'd9da852d0370030da19c227582af6f3a';
export const SHEETY_PROJECT = 'chataLiveData';
export const SHEETY_BASE_URL = `https://api.sheety.co/${SHEETY_API_ID}/${SHEETY_PROJECT}`;
export const R3_FORM_API = `${SHEETY_BASE_URL}/r3Form`;

// API Configuration
export const API_CONFIG = {
  MAX_RETRIES: 3,
  BASE_DELAY: 1000,
  TIMEOUT: 30000,
  MAX_CHUNK_SIZE: 32000 // 32KB for Sheety's limits
};

// Enhanced error types for better error handling
export interface ApiError extends Error {
  code?: string;
  status?: number;
}

interface SheetyResponse {
  success: boolean;
  error?: string;
  r3Form?: {
    id: string;
    chataId: string;
    timestamp: string;
    [key: string]: any;
  };
}

// Helper to format sensory score
function formatSensoryScore(domain: any): string {
    if (!domain?.value) return 'Skipped';
    const score = domain.value;
    const label = domain.label || '';
    return `${label} ${score}/5`;
}

// Helper to format social communication score
function formatSocialScore(domain: any): string {
    if (!domain?.value) return 'Skipped';
    const score = domain.value;
    const label = domain.label || '';
    return `${label} ${score}/5`;
}

// Helper to format behavior score
function formatBehaviorScore(domain: any): string {
    if (!domain?.value) return 'Skipped';
    const score = domain.value;
    const label = domain.label || '';
    return `${label} ${score}/5`;
}

// Helper to format milestone data
function formatMilestoneData(milestones: any[]): string {
    if (!Array.isArray(milestones)) return '';

    const categories = {
        COMMUNICATION: [
            { name: 'Babbling', expected: 6 },
            { name: 'Name response', expected: 9 },
            { name: 'Points to show', expected: 12 },
            { name: 'First words', expected: 12 },
            { name: 'Combines words', expected: 24 }
        ],
        MOTOR: [
            { name: 'Head control', expected: 3 },
            { name: 'Reaches & grasps', expected: 5 },
            { name: 'Independent sitting', expected: 8 },
            { name: 'Independent walking', expected: 12 },
            { name: 'Climbs & runs', expected: 18 }
        ],
        SOCIAL: [
            { name: 'Social smile', expected: 2 },
            { name: 'Eye contact', expected: 3 },
            { name: 'Imitation', expected: 9 },
            { name: 'Pretend play', expected: 18 },
            { name: 'Interactive play', expected: 24 }
        ],
        CONCERNS: [
            { name: 'Rigid play patterns', expected: 0 },
            { name: 'Limited social engagement', expected: 0 },
            { name: 'Sensory seeking/avoiding', expected: 0 }
        ]
    };

    const formatMilestoneStatus = (milestone: any, expectedMonth: number) => {
        if (!milestone || !milestone.achievedAge) return `Expected ${expectedMonth}m (Not yet achieved)`;
        
        const achievedAge = milestone.achievedAge;
        const delay = achievedAge - expectedMonth;
        
        if (delay === 0) return `Expected ${expectedMonth}m (Achieved on time)`;
        if (delay > 0) return `Expected ${expectedMonth}m (Delayed by ${delay} months)`;
        return `Expected ${expectedMonth}m (Advanced by ${Math.abs(delay)} months)`;
    };

    const formatConcern = (concern: any) => {
        return concern && concern.isPresent ? 'Present' : 'Not Present';
    };

    let output = '';

    // Format developmental milestones
    for (const [category, milestoneList] of Object.entries(categories)) {
        output += `=== ${category} ===\n`;
        
        for (const item of milestoneList) {
            const milestone = milestones.find(m => m.name === item.name);
            
            if (category === 'CONCERNS') {
                output += `${item.name}: ${formatConcern(milestone)}\n`;
            } else {
                output += `${item.name}: ${formatMilestoneStatus(milestone, item.expected)}\n`;
            }
        }
        output += '\n';
    }

    return output.trim();
}

// Helper to format form data
function formatFormData(formData: any) {
    // Get current timestamp if not provided
    const timestamp = formData.timestamp || new Date().toISOString();
    
    // Extract profile data
    const sensoryProfile = formData.assessments?.sensoryProfile?.domains || {};
    const socialProfile = formData.assessments?.socialCommunication?.domains || {};
    const behaviorProfile = formData.assessments?.behaviorInterests?.domains || {};

    // Format referrals
    const referrals = Object.entries(formData.referrals || {})
        .filter(([_, value]) => value)
        .map(([key]) => key)
        .join(', ');

    // Format milestone data using the new formatter
    const milestoneData = formData.assessments?.milestones?.milestones || [];
    const formattedMilestoneData = formatMilestoneData(milestoneData);

    // Format assessment log data
    const assessmentLogData = formData.assessmentLogData || 
        JSON.stringify(formData.assessments?.assessmentLog || {});

    return {
        r3Form: {
            // Timestamp and Clinician Info
            timestamp,
            chataId: formData.chataId || formData.clinician?.chataId || '',
            clinicName: formData.clinician?.clinicName || '',
            clinicianName: formData.clinician?.name || '',
            clinicianEmail: formData.clinician?.email || '',
            childFirstname: formData.clinician?.childFirstName || '',
            childSecondname: formData.clinician?.childLastName || '',
            childAge: formData.clinician?.childAge || '',
            childGender: formData.clinician?.childGender || '',
            
            // Sensory Profile
            visualScore: formatSensoryScore(sensoryProfile.visual),
            visualObservations: sensoryProfile.visual?.observations?.join(', ') || '',
            auditoryScore: formatSensoryScore(sensoryProfile.auditory),
            auditoryObservations: sensoryProfile.auditory?.observations?.join(', ') || '',
            tactileScore: formatSensoryScore(sensoryProfile.tactile),
            tactileObservations: sensoryProfile.tactile?.observations?.join(', ') || '',
            vestibularScore: formatSensoryScore(sensoryProfile.vestibular),
            vestibularObservations: sensoryProfile.vestibular?.observations?.join(', ') || '',
            proprioceptiveScore: formatSensoryScore(sensoryProfile.proprioceptive),
            proprioceptiveObservations: sensoryProfile.proprioceptive?.observations?.join(', ') || '',
            oralScore: formatSensoryScore(sensoryProfile.oral),
            oralObservations: sensoryProfile.oral?.observations?.join(', ') || '',
            
            // Social Communication Profile
            jointAttentionScore: formatSocialScore(socialProfile.jointAttention),
            jointAttentionObservations: socialProfile.jointAttention?.observations?.join(', ') || '',
            nonverbalCommunicationScore: formatSocialScore(socialProfile.nonverbalCommunication),
            nonverbalCommunicationObservations: socialProfile.nonverbalCommunication?.observations?.join(', ') || '',
            verbalCommunicationScore: formatSocialScore(socialProfile.verbalCommunication),
            verbalCommunicationObservations: socialProfile.verbalCommunication?.observations?.join(', ') || '',
            socialUnderstandingScore: formatSocialScore(socialProfile.socialUnderstanding),
            socialUnderstandingObservations: socialProfile.socialUnderstanding?.observations?.join(', ') || '',
            playSkillsScore: formatSocialScore(socialProfile.playSkills),
            playSkillsObservations: socialProfile.playSkills?.observations?.join(', ') || '',
            peerInteractionsScore: formatSocialScore(socialProfile.peerInteractions),
            peerInteractionsObservations: socialProfile.peerInteractions?.observations?.join(', ') || '',
            
            // Behavior Interests Profile
            repetitiveBehaviorsScore: formatBehaviorScore(behaviorProfile.repetitiveBehaviors),
            repetitiveBehaviorsObservations: behaviorProfile.repetitiveBehaviors?.observations?.join(', ') || '',
            routinesRitualsScore: formatBehaviorScore(behaviorProfile.routinesRituals),
            routinesRitualsObservations: behaviorProfile.routinesRituals?.observations?.join(', ') || '',
            specialInterestsScore: formatBehaviorScore(behaviorProfile.specialInterests),
            specialInterestsObservations: behaviorProfile.specialInterests?.observations?.join(', ') || '',
            sensoryInterestsScore: formatBehaviorScore(behaviorProfile.sensoryInterests),
            sensoryInterestsObservations: behaviorProfile.sensoryInterests?.observations?.join(', ') || '',
            emotionalRegulationScore: formatBehaviorScore(behaviorProfile.emotionalRegulation),
            emotionalRegulationObservations: behaviorProfile.emotionalRegulation?.observations?.join(', ') || '',
            flexibilityScore: formatBehaviorScore(behaviorProfile.flexibility),
            flexibilityObservations: behaviorProfile.flexibility?.observations?.join(', ') || '',
            
            // Timeline and History
            milestoneTimelineData: formattedMilestoneData,
            historyOfConcerns: formData.historyOfConcerns || '',
            assessmentLogData: assessmentLogData,
            
            // Clinical Assessment
            ascStatus: formData.ascStatus || '',
            adhdStatus: formData.adhdStatus || '',
            clinicalObservations: formData.clinicalObservations || '',
            strengthsAbilities: formData.strengths || '',
            prioritySupportAreas: formData.priorityAreas || '',
            supportRecommendations: formData.recommendations || '',
            referrals,
            additionalRemarks: formData.remarks || '',
            differentialDiagnosis: formData.differentialDiagnosis || '',
            
            // Images (only if include flag is true)
            ...(formData.includeImages ? {
                milestoneImageChunk1: formData.milestoneImage?.chunk1 || '',
                milestoneImageChunk2: formData.milestoneImage?.chunk2 || '',
                milestoneImageChunk3: formData.milestoneImage?.chunk3 || '',
                combinedGraphImageChunk1: formData.radarChartImage?.chunk1 || '',
                combinedGraphImageChunk2: formData.radarChartImage?.chunk2 || '',
                combinedGraphImageChunk3: formData.radarChartImage?.chunk3 || ''
            } : {
                milestoneImageChunk1: '{{NOT INCLUDE}}',
                milestoneImageChunk2: '{{NOT INCLUDE}}',
                milestoneImageChunk3: '{{NOT INCLUDE}}',
                combinedGraphImageChunk1: '{{NOT INCLUDE}}',
                combinedGraphImageChunk2: '{{NOT INCLUDE}}',
                combinedGraphImageChunk3: '{{NOT INCLUDE}}'
            }),
            
            // Status
            status: 'submitted',
            submissionDate: new Date().toISOString()
        }
    };
}

// Submit form data to Sheety
export async function submitFormData(formData: any): Promise<SheetyResponse> {
    try {
        const formattedData = formatFormData(formData);
        
        // Log the formatted data for debugging
        console.log('Formatted form data:', formattedData);
        console.log('Submitting to Sheety:', {
            url: R3_FORM_API,
            data: formattedData
        });

        const submitFn = async () => {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

            try {
                const response = await fetch(R3_FORM_API, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${SHEETY_API_ID}`
                    },
                    body: JSON.stringify(formattedData),
                    signal: controller.signal
                });

                clearTimeout(timeout);

                const responseText = await response.text();
                console.log('Sheety response:', responseText);

                let jsonResponse;
                try {
                    jsonResponse = JSON.parse(responseText);
                } catch (e) {
                    throw new Error(`Invalid JSON response from Sheety API: ${responseText}`);
                }

                if (!response.ok) {
                    throw new Error(`Sheety API submission failed: ${response.status} ${response.statusText}`);
                }

                return jsonResponse;
            } finally {
                clearTimeout(timeout);
            }
        };

        return await submitFn();
    } catch (error) {
        const apiError: ApiError = error instanceof Error ? error : new Error(String(error));
        apiError.code = 'FORM_SUBMISSION_FAILED';
        throw apiError;
    }
} 