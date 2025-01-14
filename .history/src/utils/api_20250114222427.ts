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
      if (!data.r3Form) {
        console.error('Invalid data structure: missing r3Form root property');
        throw new Error('Data must be wrapped in r3Form object');
      }

      // Keep the data as is, without converting keys
      const formattedData = {
        r3Form: Object.entries(data.r3Form).reduce((acc, [key, value]) => {
          // Handle empty strings and null values
          const formattedValue = value === null || value === undefined ? '' : value;
          
          return {
            ...acc,
            [key]: formattedValue
          };
        }, {})
      };

      // Log the exact request being sent
      console.log('Sheety API Request:', {
        url,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer CHATAI'
        },
        body: {
          ...formattedData,
          r3Form: {
            ...formattedData.r3Form,
            Milestone_Image: formattedData.r3Form.Milestone_Image ? '[BASE64_IMAGE]' : '',
            CombinedGraph_Image: formattedData.r3Form.CombinedGraph_Image ? '[BASE64_IMAGE]' : ''
          }
        }
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer CHATAI'
        },
        body: JSON.stringify(formattedData)
      });

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
        console.error('Sheety API Error:', {
          status: response.status,
          statusText: response.statusText,
          response: jsonResponse,
          requestData: {
            ...formattedData,
            r3Form: {
              ...formattedData.r3Form,
              Milestone_Image: '[BASE64_IMAGE]',
              CombinedGraph_Image: '[BASE64_IMAGE]'
            }
          }
        });
        throw new Error(`Sheety API submission failed: ${response.status} ${response.statusText} - ${JSON.stringify(jsonResponse)}`);
      }

      // Log successful submission details
      console.log('Sheety API Success:', {
        status: response.status,
        rowId: jsonResponse?.r3Form?.id,
        response: jsonResponse
      });

      return jsonResponse;
    } catch (error) {
      console.error('Sheety API submission error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
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