// Sheety API configuration
export const SHEETY_API_ID = 'd9da852d0370030da19c227582af6f3a';
export const SHEETY_PROJECT = 'chataLiveData';
export const SHEETY_BASE_URL = `https://api.sheety.co/${SHEETY_API_ID}/${SHEETY_PROJECT}`;
export const R3_FORM_API = `${SHEETY_BASE_URL}/r3Form`;

// API Configuration
export const API_CONFIG = {
  MAX_RETRIES: 3,
  BASE_DELAY: 1000,
  TIMEOUT: 30000
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

// Enhanced retry logic with exponential backoff
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    baseDelay?: number;
    onRetry?: (attempt: number, error: Error) => void;
  } = {}
): Promise<T> => {
  const { maxRetries = API_CONFIG.MAX_RETRIES, baseDelay = API_CONFIG.BASE_DELAY, onRetry } = options;
  let lastError: Error;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      
      if (attempt === maxRetries - 1) {
        const apiError: ApiError = lastError;
        apiError.code = 'MAX_RETRIES_EXCEEDED';
        throw apiError;
      }
      
      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
      onRetry?.(attempt, lastError);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
};

// Helper to format form data
function formatFormData(formData: any) {
    // Get current timestamp if not provided
    const timestamp = formData.timestamp || new Date().toISOString();
    
    // Extract sensory profile data
    const sensoryProfile = formData.assessments?.sensoryProfile?.domains || {};
    const socialProfile = formData.assessments?.socialCommunication?.domains || {};
    const behaviorProfile = formData.assessments?.behaviorInterests?.domains || {};

    return {
        r3Form: {
            timestamp,
            chataId: formData.chataId || '',
            clinicName: formData.clinician?.clinicName || '',
            clinicianName: formData.clinician?.name || '',
            clinicianEmail: formData.clinician?.email || '',
            childFirstname: formData.clinician?.childFirstName || '',
            childSecondname: formData.clinician?.childLastName || '',
            childAge: formData.clinician?.childAge || '',
            childGender: formData.clinician?.childGender || '',
            
            // Sensory Profile
            visualScore: sensoryProfile.visual?.value || 0,
            visualObservations: sensoryProfile.visual?.observations?.join(', ') || '',
            auditoryScore: sensoryProfile.auditory?.value || 0,
            auditoryObservations: sensoryProfile.auditory?.observations?.join(', ') || '',
            tactileScore: sensoryProfile.tactile?.value || 0,
            tactileObservations: sensoryProfile.tactile?.observations?.join(', ') || '',
            vestibularScore: sensoryProfile.vestibular?.value || 0,
            vestibularObservations: sensoryProfile.vestibular?.observations?.join(', ') || '',
            proprioceptiveScore: sensoryProfile.proprioceptive?.value || 0,
            proprioceptiveObservations: sensoryProfile.proprioceptive?.observations?.join(', ') || '',
            oralScore: sensoryProfile.oral?.value || 0,
            oralObservations: sensoryProfile.oral?.observations?.join(', ') || '',
            
            // Social Communication Profile
            jointAttentionScore: socialProfile.jointAttention?.value || 0,
            jointAttentionObservations: socialProfile.jointAttention?.observations?.join(', ') || '',
            nonverbalCommunicationScore: socialProfile.nonverbalCommunication?.value || 0,
            nonverbalCommunicationObservations: socialProfile.nonverbalCommunication?.observations?.join(', ') || '',
            verbalCommunicationScore: socialProfile.verbalCommunication?.value || 0,
            verbalCommunicationObservations: socialProfile.verbalCommunication?.observations?.join(', ') || '',
            socialUnderstandingScore: socialProfile.socialUnderstanding?.value || 0,
            socialUnderstandingObservations: socialProfile.socialUnderstanding?.observations?.join(', ') || '',
            playSkillsScore: socialProfile.playSkills?.value || 0,
            playSkillsObservations: socialProfile.playSkills?.observations?.join(', ') || '',
            peerInteractionsScore: socialProfile.peerInteractions?.value || 0,
            peerInteractionsObservations: socialProfile.peerInteractions?.observations?.join(', ') || '',
            
            // Behavior Interests Profile
            repetitiveBehaviorsScore: behaviorProfile.repetitiveBehaviors?.value || 0,
            repetitiveBehaviorsObservations: behaviorProfile.repetitiveBehaviors?.observations?.join(', ') || '',
            routinesRitualsScore: behaviorProfile.routinesRituals?.value || 0,
            routinesRitualsObservations: behaviorProfile.routinesRituals?.observations?.join(', ') || '',
            specialInterestsScore: behaviorProfile.specialInterests?.value || 0,
            specialInterestsObservations: behaviorProfile.specialInterests?.observations?.join(', ') || '',
            sensoryInterestsScore: behaviorProfile.sensoryInterests?.value || 0,
            sensoryInterestsObservations: behaviorProfile.sensoryInterests?.observations?.join(', ') || '',
            emotionalRegulationScore: behaviorProfile.emotionalRegulation?.value || 0,
            emotionalRegulationObservations: behaviorProfile.emotionalRegulation?.observations?.join(', ') || '',
            flexibilityScore: behaviorProfile.flexibility?.value || 0,
            flexibilityObservations: behaviorProfile.flexibility?.observations?.join(', ') || '',
            
            // Timeline and History
            milestoneTimelineData: formData.milestoneTimelineData || '',
            historyOfConcerns: formData.historyOfConcerns || '',
            assessmentLogData: formData.assessmentLogData || '',
            
            // Clinical Assessment
            ascStatus: formData.ascStatus || '',
            adhdStatus: formData.adhdStatus || '',
            clinicalObservations: formData.clinicalObservations || '',
            strengthsAbilities: formData.strengths || '',
            prioritySupportAreas: formData.priorityAreas || '',
            supportRecommendations: formData.recommendations || '',
            referrals: formatReferrals(formData.referrals),
            additionalRemarks: formData.remarks || '',
            differentialDiagnosis: formData.differentialDiagnosis || '',
            
            // Images
            milestoneImageChunk1: formData.milestoneImage?.chunk1 || '',
            milestoneImageChunk2: formData.milestoneImage?.chunk2 || '',
            milestoneImageChunk3: formData.milestoneImage?.chunk3 || '',
            combinedGraphImageChunk1: formData.radarChartImage?.chunk1 || '',
            combinedGraphImageChunk2: formData.radarChartImage?.chunk2 || '',
            combinedGraphImageChunk3: formData.radarChartImage?.chunk3 || '',
            
            // Status
            status: 'submitted',
            submissionDate: new Date().toISOString()
        }
    };
}

// Helper to format referrals
function formatReferrals(referrals: Record<string, boolean>): string {
    if (!referrals || typeof referrals !== 'object') return '';
    return Object.entries(referrals)
        .filter(([_, value]) => value)
        .map(([key]) => key)
        .join(', ');
}

// Submit form data to Sheety
export async function submitFormData(formData: any): Promise<SheetyResponse> {
    try {
        const formDataToSubmit = formatFormData(formData);
        
        // Log the formatted data for debugging
        console.log('Submitting to Sheety:', {
            url: R3_FORM_API,
            data: formDataToSubmit
        });

        const submitFn = async () => {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

            try {
                const response = await fetch(R3_FORM_API, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer CHATAI'
                    },
                    body: JSON.stringify(formDataToSubmit),
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

        return retryWithBackoff(submitFn);
    } catch (error) {
        const apiError: ApiError = error instanceof Error ? error : new Error(String(error));
        apiError.code = 'FORM_SUBMISSION_FAILED';
        throw apiError;
    }
} 