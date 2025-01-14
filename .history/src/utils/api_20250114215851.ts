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

      // Convert all keys to camelCase and ensure proper nesting
      const formattedData = {
        r3form: Object.entries(data.r3form).reduce((acc, [key, value]) => {
          // Convert key to camelCase
          const camelKey = key.replace(/([-_][a-z])/g, group =>
            group.toUpperCase().replace('-', '').replace('_', '')
          );
          
          // Handle empty strings and null values
          const formattedValue = value === null || value === undefined ? '' : value;
          
          return {
            ...acc,
            [camelKey]: formattedValue
          };
        }, {})
      };

      // Safe logging that won't throw on undefined
      const safeLogData = {
        url,
        data: {
          r3form: Object.entries(formattedData.r3form || {}).reduce((acc, [key, value]) => ({
            ...acc,
            [key]: typeof value === 'string' && value.length > 100 ? 
              (key.toLowerCase().includes('image') ? '[BASE64_IMAGE]' : `${value.substring(0, 100)}...`) : 
              value
          }), {})
        }
      };

      console.log('Submitting to Sheety:', safeLogData);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer CHATAI'
        },
        body: JSON.stringify(formattedData)
      });

      const responseText = await response.text();
      
      // Log the raw response for debugging
      console.log('Raw Sheety API Response:', responseText);

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
          response: jsonResponse,
          requestData: safeLogData
        });
        throw new Error(`Sheety API submission failed: ${response.status} ${response.statusText} - ${responseText}`);
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