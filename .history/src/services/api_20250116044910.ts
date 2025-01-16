export const SHEETY_API_ID = 'd9da852d0370030da19c227582af6f3a';
export const SHEETY_PROJECT = 'chataLiveData';
export const SHEETY_BASE_URL = `https://api.sheety.co/${SHEETY_API_ID}/${SHEETY_PROJECT}`;
export const ALL_URL_API = `${SHEETY_BASE_URL}/allUrl`;
export const R3_FORM_API = `${SHEETY_BASE_URL}/r3Form`;

// Constants for API configuration
const API_CONFIG = {
  MAX_RETRIES: 3,
  BASE_DELAY: 1000,
  TIMEOUT: 30000,
  MAX_CHUNK_SIZE: 500000, // 500KB per chunk
  BEARER_TOKEN: 'CHATAI'
};

// Enhanced error types for better error handling
export interface ApiError extends Error {
  code?: string;
  status?: number;
  details?: any;
}

export interface ChataData {
    id: string;
    name: string;
    r1Url: string | null;
    r2Url: string | null;
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
    const json = await response.json();
    return json.allUrl
        .filter((row: any) => row.chataId && row.chataId !== "CHATA_ID")
        .map((row: any) => ({
            id: row.chataId,
            name: row.childName || '',
            r1Url: row['r1Generated (pdf)'] || null,
            r2Url: row['r2Generated (pdf)'] || null
        }));
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

// Enhanced submitFormData with chunk handling
export async function submitFormData(formData: any) {
    try {
        // Check for large data that needs chunking
        const needsChunking = hasLargeData(formData);
        
        if (needsChunking) {
            return await submitFormDataInChunks(formData);
        }
        
        return await submitFormDataDirect(formData);
    } catch (error) {
        const apiError: ApiError = error instanceof Error ? error : new Error(String(error));
        apiError.code = 'FORM_SUBMISSION_FAILED';
        throw apiError;
    }
}

// Helper to check if data needs chunking
function hasLargeData(formData: any): boolean {
    const dataSize = new TextEncoder().encode(JSON.stringify(formData)).length;
    return dataSize > API_CONFIG.MAX_CHUNK_SIZE;
}

// Submit form data in chunks for large payloads
async function submitFormDataInChunks(formData: any): Promise<SheetyResponse> {
    const chunks = splitIntoChunks(formData);
    const results: SheetyResponse[] = [];

    for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const chunkMetadata: ChunkMetadata = {
            total_chunks: chunks.length,
            chunk_index: i,
            image_type: getImageType(chunk)
        };

        const result = await retryWithBackoff(
            () => submitToSheetyAPI(R3_FORM_API, {
                r3Form: {
                    ...chunk,
                    ...chunkMetadata
                }
            }),
            {
                onRetry: (attempt, error) => {
                    console.warn(`Chunk ${i + 1}/${chunks.length} failed, retrying...`, error);
                }
            }
        );
        
        results.push(result);
    }

    // Return the first chunk's response as the main response
    return results[0];
}

// Helper to split data into chunks
function splitIntoChunks(formData: any): any[] {
    const chunks: any[] = [];
    const baseData = { ...formData };
    
    // Handle large images separately
    if (baseData.radarChartImage) {
        chunks.push({ ...baseData, radarChartImage: baseData.radarChartImage });
        delete baseData.radarChartImage;
    }
    
    if (baseData.timelineImage) {
        chunks.push({ ...baseData, timelineImage: baseData.timelineImage });
        delete baseData.timelineImage;
    }
    
    // Add remaining data as the first chunk
    chunks.unshift(baseData);
    
    return chunks;
}

// Helper to determine image type
function getImageType(chunk: any): string {
    if (chunk.radarChartImage) return 'radar';
    if (chunk.timelineImage) return 'timeline';
    return 'base';
}

// Direct submission for small payloads
async function submitFormDataDirect(formData: any): Promise<SheetyResponse> {
    const formDataToSubmit = formatFormData(formData);
    
    return await retryWithBackoff(
        () => submitToSheetyAPI(R3_FORM_API, formDataToSubmit)
    );
}

// Helper to format form data
function formatFormData(formData: any) {
    return {
        r3Form: {
            chataId: formData.chataId,
            name: formData.name,
            timestamp: formData.timestamp || new Date().toISOString(),
            asc: formData.ascStatus,
            adhd: formData.adhdStatus,
            observations: formData.clinicalObservations,
            strengths: formData.strengths,
            supportAreas: formData.priorityAreas,
            recommendations: formData.recommendations,
            referrals: formatReferrals(formData.referrals),
            remarks: formData.remarks || '',
            differential: formData.differentialDiagnosis || '',
            milestones: formatMilestones(formData.milestones),
            milestoneHistory: formData.milestoneHistory || '',
            radarChartImage: formData.radarChartImage || '',
            timelineImage: formData.timelineImage || '',
            status: 'submitted', // Add status field to trigger Google Sheet
            submissionDate: new Date().toISOString() // Add submission date for tracking
        }
    };
}

// Helper to format referrals
function formatReferrals(referrals: Record<string, boolean>): string {
    return Object.entries(referrals)
        .filter(([_, value]) => value)
        .map(([key]) => key)
        .join(', ');
}

// Helper to format milestones
function formatMilestones(milestones?: any[]): string {
    if (!milestones?.length) return '[]';
    
    return JSON.stringify(milestones.map(milestone => ({
        id: milestone.id,
        title: milestone.title,
        category: milestone.category,
        expectedAge: milestone.expectedAge,
        actualAge: milestone.actualAge,
        status: milestone.status,
        difference: milestone.actualAge !== undefined ? milestone.actualAge - milestone.expectedAge : null
    })));
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