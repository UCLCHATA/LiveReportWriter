import html2canvas from 'html2canvas';

// Sheety API configuration
export const SHEETY_API_ID = import.meta.env.VITE_SHEETY_API_ID;
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

export interface ChataData {
  id: string;
  chataId: string;
  timestamp: string;
  [key: string]: any;
}

export async function fetchChataData(): Promise<ChataData[]> {
  const response = await fetch(ALL_URL_API, {
    headers: {
      'Authorization': 'Bearer CHATAI'
    }
  });
  if (!response.ok) {
    throw new Error('Failed to fetch CHATA data');
  }
  return response.json();
}

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
    
    // Submit main form data
    console.log('Submitting main form data to Sheety...');
    const mainResponse = await submitToSheetyAPI(R3_FORM_API, formattedData);
    
    console.log('✓ Form submission process completed successfully');
    return mainResponse;
  } catch (error) {
    console.error('Form submission failed:', {
      error: error instanceof Error ? error.message : String(error),
      code: error instanceof Error ? (error as ApiError).code : undefined,
      status: error instanceof Error ? (error as ApiError).status : undefined
    });
    const apiError: ApiError = error instanceof Error ? error : new Error(String(error));
    apiError.code = 'FORM_SUBMISSION_FAILED';
    throw apiError;
  }
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

interface ChunkMetadata {
  total_chunks: number;
  chunk_index: number;
  image_type: string;
}

const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt === maxRetries - 1) throw lastError;
      
      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
};

export const submitToSheetyAPI = async (url: string, data: any): Promise<SheetyResponse> => {
  const submitFn = async () => {
    try {
      if (!data.r3Form) {
        console.error('Invalid data structure: missing r3Form root property');
        throw new Error('Data must be wrapped in r3Form object');
      }

      // Ensure all keys are in snake_case
      const formattedData = {
        r3Form: Object.entries(data.r3Form).reduce((acc, [key, value]) => {
          const snakeCaseKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
          return {
            ...acc,
            [snakeCaseKey]: value === null || value === undefined ? '' : value
          };
        }, {} as Record<string, any>)
      };

      // Make the request
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer CHATAI'
          },
          body: JSON.stringify(formattedData),
          signal: controller.signal
        });

        clearTimeout(timeout);
        const responseText = await response.text();
        
        let jsonResponse;
        try {
          jsonResponse = JSON.parse(responseText);
        } catch (e) {
          console.error('Failed to parse Sheety API response:', responseText);
          throw new Error(`Invalid JSON response from Sheety API: ${responseText}`);
        }

        if (!response.ok) {
          console.error('Sheety API Error:', {
            status: response.status,
            statusText: response.statusText,
            response: jsonResponse
          });
          throw new Error(`Sheety API submission failed: ${response.status} ${response.statusText}`);
        }

        return jsonResponse;
      } finally {
        clearTimeout(timeout);
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timed out after 30 seconds');
      }
      throw error;
    }
  };

  return retryWithBackoff(submitFn);
};

// Helper functions for formatting scores and observations
function formatSensoryScore(domain: any): string {
  if (!domain || typeof domain.value === 'undefined') return 'Skipped';
  return `${domain.value}/5`;
}

function formatSocialScore(domain: any): string {
  if (!domain || typeof domain.value === 'undefined') return 'Skipped';
  return `${domain.value}/5`;
}

function formatBehaviorScore(domain: any): string {
  if (!domain || typeof domain.value === 'undefined') return 'Skipped';
  return `${domain.value}/5`;
}

function formatObservations(observations: string[] | undefined): string {
  if (!observations || !Array.isArray(observations)) return '';
  return observations.filter(obs => obs && typeof obs === 'string').join(', ');
}

function formatSensoryScores(profile: any) {
  if (!profile?.domains) return {};
  const scores: Record<string, string> = {};
  for (const [key, domain] of Object.entries(profile.domains)) {
    scores[key] = formatSensoryScore(domain);
  }
  return scores;
}

function formatSocialScores(profile: any) {
  if (!profile?.domains) return {};
  const scores: Record<string, string> = {};
  for (const [key, domain] of Object.entries(profile.domains)) {
    scores[key] = formatSocialScore(domain);
  }
  return scores;
}

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
  MAX_CHUNK_SIZE: 40000, // Target size for chunks
  CHUNK_LIMIT: 45000,    // Size limit before chunking
  NUM_CHUNKS: 3          // Number of chunks to split into
};

// Helper to generate and process image
async function generateImage(element: HTMLElement | null): Promise<string | null> {
  if (!element) return null;
  
  try {
    const canvas = await html2canvas(element, {
      scale: 0.75, // Reduce size
      useCORS: true,
      logging: false
    });
    
    return canvas.toDataURL('image/jpeg', 0.7); // Use JPEG with 70% quality
  } catch (error) {
    console.error('Image generation failed:', error);
    return null;
  }
}

// Helper to chunk image data
function chunkImageData(base64Data: string): { chunk1: string, chunk2: string, chunk3: string } {
  if (!base64Data) {
    return {
      chunk1: '{{NOT INCLUDE}}',
      chunk2: '{{NOT INCLUDE}}',
      chunk3: '{{NOT INCLUDE}}'
    };
  }

  const chunkSize = Math.ceil(base64Data.length / IMAGE_CONFIG.NUM_CHUNKS);
  return {
    chunk1: base64Data.slice(0, chunkSize),
    chunk2: base64Data.slice(chunkSize, chunkSize * 2),
    chunk3: base64Data.slice(chunkSize * 2)
  };
}

// Helper to format form data
function formatFormData(formData: any) {
  // Helper to convert camelCase to snake_case for column names
  const toSnakeCase = (str: string) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

  // Ensure all keys are properly formatted for Sheety columns
  const formattedData = {
    r3Form: {
      chata_id: formData.chataId,
      timestamp: new Date().toISOString(),
      clinician_name: formData.clinicianName,
      clinician_email: formData.clinicianEmail,
      clinic_name: formData.clinicName,
      child_firstname: formData.childFirstname,
      child_secondname: formData.childSecondname,
      child_age: formData.childAge,
      child_gender: formData.childGender,
      clinical_observations: formData.clinicalObservations,
      strengths: formData.strengths,
      priority_areas: formData.priorityAreas,
      recommendations: formData.recommendations,
      referrals: Array.isArray(formData.referrals) ? formData.referrals.join(', ') : formData.referrals,
      remarks: formData.remarks || '',
      differential_diagnosis: formData.differentialDiagnosis || '',
      milestone_timeline_data: formData.milestoneTimelineData ? JSON.stringify(formData.milestoneTimelineData) : '',
      history_of_concerns: formData.historyOfConcerns ? JSON.stringify(formData.historyOfConcerns) : '',
      status: 'submitted',
      submission_date: new Date().toISOString()
    }
  };

  console.log('Formatted data for Sheety submission:', {
    chataId: formattedData.r3Form.chata_id,
    timestamp: formattedData.r3Form.timestamp,
    columnNames: Object.keys(formattedData.r3Form)
  });

  return formattedData;
}
