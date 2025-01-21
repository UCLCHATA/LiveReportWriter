interface AppsScriptResponse {
  success: boolean;
  error?: string;
  documentUrl?: string;
  emailStatus?: string;
  progress?: {
    details: {
      documentUrl?: string;
      emailStatus: {
        sent: boolean;
        recipientEmail?: string;
        error?: string;
      };
    };
  };
}

interface SheetyResponse {
  r3Form?: {
    chataId: string;
    timestamp: string;
    [key: string]: any;
  };
  error?: string;
}

interface SheetyFormData {
  r3form: {
    milestoneImage?: string;
    combinedGraphImage?: string;
    [key: string]: any;
  };
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  retries: number = MAX_RETRIES,
  delay: number = RETRY_DELAY
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    
    console.log(`Retrying... Attempts remaining: ${retries}`);
    await wait(delay);
    
    return retryWithBackoff(fn, retries - 1, delay * 2);
  }
};

export const submitToSheetyAPI = async (url: string, data: any): Promise<SheetyResponse> => {
  const submitFn = async () => {
    try {
      // Ensure data is properly formatted for Sheety
      if (!data.r3form) {
        console.error('Invalid data structure: missing r3form root property');
        throw new Error('Data must be wrapped in r3form object');
      }

      // Convert all keys to camelCase
      const formattedData: SheetyFormData = {
        r3form: Object.entries(data.r3form).reduce((acc, [key, value]) => {
          const camelKey = key.replace(/([-_][a-z])/g, group =>
            group.toUpperCase().replace('-', '').replace('_', '')
          );
          return {
            ...acc,
            [camelKey]: value
          };
        }, {})
      };

      // Log the formatted data (excluding large base64 strings)
      const logData = {
        url,
        data: {
          r3form: {
            ...formattedData.r3form,
            // Safely handle potentially undefined image data
            milestoneImage: formattedData.r3form?.milestoneImage ? '[BASE64_IMAGE]' : null,
            combinedGraphImage: formattedData.r3form?.combinedGraphImage ? '[BASE64_IMAGE]' : null,
            // Include some key fields for debugging
            chataId: formattedData.r3form?.chataId || '',
            timestamp: formattedData.r3form?.timestamp || '',
          }
        }
      };
      
      console.log('Submitting to Sheety:', logData);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer CHATAI'
        },
        body: JSON.stringify(formattedData)
      });

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
        throw new Error(`Sheety API submission failed: ${response.status} ${response.statusText} - ${responseText}`);
      }

      // Validate response format
      if (!jsonResponse.r3form) {
        console.error('Invalid Sheety API response format:', jsonResponse);
        throw new Error('Invalid response format from Sheety API');
      }

      return jsonResponse;
    } catch (error) {
      console.error('Sheety API submission error:', error);
      throw error;
    }
  };

  return retryWithBackoff(submitFn);
};

export const makeAppsScriptCall = async (url: string, chataId?: string): Promise<AppsScriptResponse> => {
  const callFn = async () => {
    if (!chataId) {
      throw new Error('CHATA ID is required');
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ chataId })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  };

  try {
    return await retryWithBackoff(callFn);
  } catch (error) {
    console.error('Apps Script call failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}; 