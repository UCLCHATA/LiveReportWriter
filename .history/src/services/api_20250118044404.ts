import html2canvas from 'html2canvas';

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
    if (!domain || typeof domain.value === 'undefined') return 'Skipped';
    return `${domain.value}/5`;
}

// Helper to format social communication score
function formatSocialScore(domain: any): string {
    if (!domain || typeof domain.value === 'undefined') return 'Skipped';
    return `${domain.value}/5`;
}

// Helper to format behavior score
function formatBehaviorScore(domain: any): string {
    if (!domain || typeof domain.value === 'undefined') return 'Skipped';
    return `${domain.value}/5`;
}

// Helper to format observations
function formatObservations(observations: string[] | undefined): string {
    if (!observations || !Array.isArray(observations)) return '';
    return observations.filter(obs => obs && typeof obs === 'string').join(', ');
}

// Helper to format sensory scores
function formatSensoryScores(profile: any) {
    if (!profile?.domains) return {};
    const scores: Record<string, string> = {};
    for (const [key, domain] of Object.entries(profile.domains)) {
        scores[key] = formatSensoryScore(domain);
    }
    return scores;
}

// Helper to format social scores
function formatSocialScores(profile: any) {
    if (!profile?.domains) return {};
    const scores: Record<string, string> = {};
    for (const [key, domain] of Object.entries(profile.domains)) {
        scores[key] = formatSocialScore(domain);
    }
    return scores;
}

// Helper to format behavior scores
function formatBehaviorScores(profile: any) {
    if (!profile?.domains) return {};
    const scores: Record<string, string> = {};
    for (const [key, domain] of Object.entries(profile.domains)) {
        scores[key] = formatBehaviorScore(domain);
    }
    return scores;
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

// Helper to format assessment log data
function formatAssessmentLogData(assessmentLog: any): string {
    if (!assessmentLog) return '';
    
    const entries = Object.entries(assessmentLog);
    if (entries.length === 0) return '';

    return entries
        .map(([assessment, data]: [string, any]) => {
            const date = data.date ? new Date(data.date).toISOString().split('T')[0] : 'Date NA';
            const notes = data.notes || '';
            return `${assessment} (${date}): ${notes}`;
        })
        .filter(entry => entry.trim() !== '')
        .join('\n\n');
}

// Constants for image handling
const IMAGE_CONFIG = {
    MAX_SIZE: 45000,     // Maximum 45K character limit
    INITIAL_QUALITY: 0.9, // Start with high quality
    MIN_QUALITY: 0.5,     // Don't go below 50% quality
    QUALITY_STEP: 0.1,    // Reduce by 10% each step
    SCALE: 0.75          // Scale factor for initial size reduction
};

// Helper to generate and process image
export async function generateImage(element: HTMLElement | null): Promise<string | null> {
    if (!element) return null;
    
    let quality = IMAGE_CONFIG.INITIAL_QUALITY;
    let imageData: string | null = null;
    let attempts = 0;
    
    try {
        while (quality >= IMAGE_CONFIG.MIN_QUALITY && attempts < 5) {
            console.log(`[API] Attempt ${attempts + 1}: Generating image with quality: ${quality}`);
            
            const canvas = await html2canvas(element, {
                scale: IMAGE_CONFIG.SCALE,
                useCORS: true,
                logging: false,
                backgroundColor: '#FFFFFF'
            });
            
            imageData = canvas.toDataURL('image/jpeg', quality);
            const size = imageData.length;
            console.log(`[API] Generated image size: ${size} characters (target: ${IMAGE_CONFIG.MAX_SIZE})`);
            
            if (size <= IMAGE_CONFIG.MAX_SIZE) {
                console.log(`[API] ✓ Image size within limit at quality ${quality}`);
                return imageData;
            }
            
            quality -= IMAGE_CONFIG.QUALITY_STEP;
            attempts++;
            console.log(`[API] Image too large (${size} > ${IMAGE_CONFIG.MAX_SIZE}), reducing quality to ${quality}`);
        }
        
        console.error(`[API] Failed to generate image within size limit after ${attempts} attempts`);
        return null;
    } catch (error) {
        console.error('[API] Image generation failed:', error);
        return null;
    }
}

// Helper to format image data with include flag
export function formatImageData(base64Data: string | null, include: boolean = false): string {
    if (!base64Data || !include) {
        return '{{NOT INCLUDE}}';
    }
    return `{{INCLUDE}}${base64Data}`;
}

// Helper to format form data
function formatFormData(formData: any) {
    console.group('📦 Preparing submission data by component:');
    
    // Log the incoming data structure
    console.log('👤 Clinical Information:', {
        clinicName: formData.clinicName,
        clinicianName: formData.clinicianName,
        clinicianEmail: formData.clinicianEmail,
        childInfo: {
            firstName: formData.childFirstname,
            secondName: formData.childSecondname,
            age: formData.childAge,
            gender: formData.childGender
        }
    });

    // Log milestone data before processing
    console.log('📅 Raw Milestone Data:', {
        timelineData: formData.milestoneTimelineData,
        historyOfConcerns: formData.historyOfConcerns
    });

    // Process milestone data to ensure it's wrapped correctly for Sheety
    // but will display as plain text in Google Sheets
    const processedMilestoneData = formData.milestoneTimelineData 
        ? { value: formData.milestoneTimelineData }
        : { value: '' };

    // Return the data as is, wrapped in r3Form object
    return {
        r3Form: {
            ...formData,
            milestoneTimelineData: JSON.stringify(processedMilestoneData),
            status: 'submitted',
            submissionDate: new Date().toISOString()
        }
    };
}

// Submit form data to Sheety
export async function submitFormData(formData: any): Promise<SheetyResponse> {
    try {
        console.log('Starting form submission process...', {
            submittedChataId: formData.chataId,
            urlChataId: new URLSearchParams(window.location.search).get('chataId')
        });
        
        // Validate CHATA ID
        const urlParams = new URLSearchParams(window.location.search);
        const urlChataId = urlParams.get('chataId');
        
        if (!formData.chataId || formData.chataId !== urlChataId) {
            console.error('CHATA ID mismatch:', {
                formChataId: formData.chataId,
                urlChataId: urlChataId
            });
            throw new Error('Invalid CHATA ID');
        }
        
        // Format main form data
        const formattedData = formatFormData(formData);

        // Add image data if included
        if (formData.includeTimelineInReport || formData.milestoneImage?.include) {
            console.log('Processing image data for submission...');
            formattedData.r3Form.milestoneImage = formData.milestoneImage?.data || '{{NOT INCLUDE}}';
            formattedData.r3Form.includeTimelineInReport = true;
        } else {
            console.log('No image data to include in submission');
            formattedData.r3Form.milestoneImage = '{{NOT INCLUDE}}';
            formattedData.r3Form.includeTimelineInReport = false;
        }
        
        // Submit to Sheety
        console.log('Submitting form data to Sheety...');
        const response = await submitToSheety(formattedData);
        console.log('✓ Form data submitted successfully');
        
        return response;
    } catch (error) {
        console.error('Form submission failed:', error);
        throw error;
    }
}

// Helper to submit data to Sheety
async function submitToSheety(data: any): Promise<SheetyResponse> {
      const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

    try {
        const payload = JSON.stringify(data);
        console.log('Making Sheety API request...', {
            url: R3_FORM_API,
            dataSize: payload.length,
            timeout: API_CONFIG.TIMEOUT,
            payloadPreview: payload.substring(0, 200) + '...'
        });

        const response = await fetch(R3_FORM_API, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer CHATAI'
          },
            body: payload,
          signal: controller.signal
        });

        clearTimeout(timeout);
        const responseText = await response.text();
        
        console.log('Sheety API response received:', {
            status: response.status,
            statusText: response.statusText,
            responseSize: responseText.length,
            responsePreview: responseText.substring(0, 200) + '...'
        });

        let jsonResponse;
        try {
          jsonResponse = JSON.parse(responseText);
            if (response.ok) {
                console.log('Sheety API request successful:', {
                    success: true,
                    id: jsonResponse.r3Form?.id,
                    chataId: jsonResponse.r3Form?.chataId,
                    fields: Object.keys(jsonResponse.r3Form || {}).join(', ')
                });
            } else {
                console.error('Sheety API request failed:', {
                    success: false,
                    error: jsonResponse.error,
                    status: response.status,
                    response: responseText
                });
            }
        } catch (e) {
            console.error('Failed to parse Sheety API response:', responseText);
          throw new Error(`Invalid JSON response from Sheety API: ${responseText}`);
        }

        if (!response.ok) {
          throw new Error(`Sheety API submission failed: ${response.status} ${response.statusText}`);
        }

        return jsonResponse;
    } catch (error: any) {
        console.error('Sheety API request failed:', {
            error: error instanceof Error ? error.message : String(error),
            timeout: error.name === 'AbortError' ? 'Request timed out' : undefined
        });
        throw error;
      } finally {
        clearTimeout(timeout);
      }
} 