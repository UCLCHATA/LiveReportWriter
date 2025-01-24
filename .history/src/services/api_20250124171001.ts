import html2canvas from 'html2canvas';

// Sheety API configuration
export const SHEETY_API_ID = import.meta.env.VITE_SHEETY_API_ID;
export const SHEETY_PROJECT = 'chataLiveData';
export const SHEETY_BASE_URL = `https://api.sheety.co/${SHEETY_API_ID}/${SHEETY_PROJECT}`;
export const R3_FORM_API = `${SHEETY_BASE_URL}/r3Form`;

export interface ChataData {
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
            const error = new Error('Invalid CHATA ID');
            alert('Submission Error: Invalid CHATA ID. Please check and try again.');
            throw error;
        }
        
        // Format main form data
        const formattedData = formatFormData(formData);
        console.log('Main form data formatted successfully. Payload:', {
            chataId: formattedData.r3Form.chataId,
            clinicianInfo: {
                name: formattedData.r3Form.clinicianName,
                email: formattedData.r3Form.clinicianEmail,
                clinic: formattedData.r3Form.clinicName
            },
            childInfo: {
                firstName: formattedData.r3Form.childFirstname,
                lastName: formattedData.r3Form.childSecondname,
                age: formattedData.r3Form.childAge,
                gender: formattedData.r3Form.childGender
            }
        });
        
        // Submit main form data
        console.log('Submitting main form data to Sheety...');
        const mainResponse = await submitToSheetyAPI(R3_FORM_API, formattedData);
        console.log('✓ Main form data submitted successfully:', {
            responseId: mainResponse.r3Form?.id,
            chataId: mainResponse.r3Form?.chataId,
            timestamp: mainResponse.r3Form?.timestamp
        });
        
        // If images are included, submit them separately
        if (formData.includeImages) {
            console.log('Processing image submissions...', {
                milestoneIncluded: formData.milestoneImage?.include,
                radarChartIncluded: formData.radarChartImage?.include
            });
            
            // Submit milestone image if included
            if (formData.milestoneImage?.include) {
                console.log('Submitting milestone timeline image...', {
                    chataId: formData.chataId,
                    chunk1Length: formData.milestoneImage.chunk1?.length || 0,
                    chunk2Length: formData.milestoneImage.chunk2?.length || 0,
                    chunk3Length: formData.milestoneImage.chunk3?.length || 0
                });
                const milestoneImageData = {
                    r3Form: {
                        chataId: formData.chataId,
                        milestoneImageChunk1: formData.milestoneImage.chunk1,
                        milestoneImageChunk2: formData.milestoneImage.chunk2,
                        milestoneImageChunk3: formData.milestoneImage.chunk3
                    }
                };
                await submitToSheetyAPI(R3_FORM_API, milestoneImageData);
                console.log('✓ Milestone timeline image submitted successfully');
            } else {
                console.log('Milestone timeline image submission skipped (not included)');
            }
            
            // Submit radar chart image if included
            if (formData.radarChartImage?.include) {
                console.log('Submitting combined radar chart image...', {
                    chataId: formData.chataId,
                    chunk1Length: formData.radarChartImage.chunk1?.length || 0,
                    chunk2Length: formData.radarChartImage.chunk2?.length || 0,
                    chunk3Length: formData.radarChartImage.chunk3?.length || 0
                });
                const radarChartImageData = {
                    r3Form: {
                        chataId: formData.chataId,
                        combinedGraphImageChunk1: formData.radarChartImage.chunk1,
                        combinedGraphImageChunk2: formData.radarChartImage.chunk2,
                        combinedGraphImageChunk3: formData.radarChartImage.chunk3
                    }
                };
                await submitToSheetyAPI(R3_FORM_API, radarChartImageData);
                console.log('✓ Combined radar chart image submitted successfully');
            } else {
                console.log('Combined radar chart image submission skipped (not included)');
            }
            
            console.log('✓ All image submissions completed');
        } else {
            console.log('Image submissions skipped (includeImages flag is false)');
        }
        
        console.log('✓ Form submission process completed successfully');
        alert('✓ Form submitted successfully! Your report will be generated and emailed to you shortly.');
        return mainResponse;
    } catch (error) {
        console.error('Form submission failed:', {
            error: error instanceof Error ? error.message : String(error),
            code: error instanceof Error ? (error as ApiError).code : undefined,
            status: error instanceof Error ? (error as ApiError).status : undefined
        });
        const apiError: ApiError = error instanceof Error ? error : new Error(String(error));
        apiError.code = 'FORM_SUBMISSION_FAILED';
        alert(`❌ Form submission failed: ${apiError.message}\nPlease try again or contact support if the problem persists.`);
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
      // Ensure data is properly formatted for Sheety
      if (!data.r3Form) {
        console.error('Invalid data structure: missing r3Form root property');
        throw new Error('Data must be wrapped in r3Form object');
      }

      // Check if this is a chunk submission
      const isChunk = data.r3Form.total_chunks !== undefined;
      
      // Format the data appropriately
      const formattedData = {
        r3Form: Object.entries(data.r3Form).reduce((acc, [key, value]) => {
          // Handle empty strings and null values
          const formattedValue = value === null || value === undefined ? '' : value;
          return {
            ...acc,
            [key]: formattedValue
          };
        }, {} as Record<string, any>)
      };

      // Log the request (masking sensitive data)
      const logSafeData = {
        ...formattedData,
        r3Form: {
          ...formattedData.r3Form,
          // Mask any base64 image data in the log
          ...Object.entries(formattedData.r3Form).reduce((acc, [key, value]) => ({
            ...acc,
            [key]: typeof value === 'string' && value.length > 1000 ? '[BASE64_DATA]' : value
          }), {})
        }
      };

      console.log('Sheety API Request:', {
        url,
        method: 'POST',
        isChunk,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer CHATAI'
        },
        body: logSafeData
      });

      // Make the request with a timeout
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000); // 30 second timeout

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
        console.log('Raw Sheety API Response:', responseText);

        let jsonResponse;
        try {
          jsonResponse = JSON.parse(responseText);
          console.log('Parsed Sheety API Response:', jsonResponse);
        } catch (e) {
          console.error('Failed to parse Sheety API response:', {
            responseText,
            error: e instanceof Error ? e.message : 'Unknown error'
          });
          throw new Error(`Invalid JSON response from Sheety API: ${responseText}`);
        }

        if (!response.ok) {
          // Special handling for payload too large errors
          if (response.status === 413) {
            throw new Error('Payload too large. Please reduce the size of the data being sent.');
          }
          
          console.error('Sheety API Error:', {
            status: response.status,
            statusText: response.statusText,
            response: jsonResponse,
            requestData: logSafeData
          });
          throw new Error(`Sheety API submission failed: ${response.status} ${response.statusText}`);
        }

        // Log successful submission details
        console.log('Sheety API Success:', {
          status: response.status,
          rowId: jsonResponse?.r3Form?.id,
          isChunk,
          response: jsonResponse
        });

        return jsonResponse;
      } finally {
        clearTimeout(timeout);
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timed out after 30 seconds');
      }
      console.error('Sheety API submission error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  };

  return retryWithBackoff(submitFn);
};

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

    // Process history of concerns data similarly
    const processedHistoryData = formData.historyOfConcerns
        ? { value: formData.historyOfConcerns }
        : { value: '' };

    // Return the data as is, wrapped in r3Form object
    return {
        r3Form: {
            ...formData,
            milestoneTimelineData: JSON.stringify(processedMilestoneData),
            historyOfConcerns: JSON.stringify(processedHistoryData),
            status: 'submitted',
            submissionDate: new Date().toISOString()
        }
    };
}
