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
    
    // Format referrals as comma-separated string
    const referrals = Object.entries(formData.referrals || {})
        .filter(([_, value]) => value)
        .map(([key]) => key)
        .join(', ');

    // Get assessment data
    const sensoryProfile = formData.assessments?.sensoryProfile || {};
    const socialCommunication = formData.assessments?.socialCommunication || {};
    const behaviorInterests = formData.assessments?.behaviorInterests || {};
    const milestones = formData.assessments?.milestones?.milestones || [];
    const assessmentLog = formData.assessments?.assessmentLog || {};

    return {
        r3Form: {
            chataId: formData.chataId || '',
            name: formData.clinician?.childFirstName + ' ' + formData.clinician?.childLastName || '',
            timestamp,
            asc: formData.ascStatus || '',
            adhd: formData.adhdStatus || '',
            observations: formData.clinicalObservations || '',
            strengths: formData.strengths || '',
            supportareas: formData.priorityAreas || '',
            recommendations: formData.recommendations || '',
            referrals,
            remarks: formData.remarks || '',
            differentialDiagnosis: formData.differentialDiagnosis || '',
            developmentalConcerns: formData.developmentalConcerns || '',
            medicalHistory: formData.medicalHistory || '',
            familyHistory: formData.familyHistory || '',
            
            // Assessment data
            sensoryProfile: JSON.stringify(sensoryProfile),
            socialCommunication: JSON.stringify(socialCommunication),
            behaviorInterests: JSON.stringify(behaviorInterests),
            milestoneTimelineData: JSON.stringify(milestones),
            assessmentLogData: JSON.stringify(assessmentLog),
            
            // Status
            status: 'submitted',
            submissionDate: new Date().toISOString()
        }
    };
}

// Submit form data to Sheety
export async function submitFormData(formData: any): Promise<SheetyResponse> {
    try {
        const formDataToSubmit = formatFormData(formData);
        
        // Log the formatted data for debugging
        console.log('Formatted form data:', formDataToSubmit);
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