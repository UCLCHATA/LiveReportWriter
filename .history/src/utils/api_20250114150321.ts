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
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer CHATAI'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Sheety API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Sheety API submission failed: ${errorText}`);
    }

    const jsonResponse = await response.json();
    
    // Validate response format
    if (!jsonResponse.r3Form || !jsonResponse.r3Form.chataId || !jsonResponse.r3Form.timestamp) {
      console.error('Invalid Sheety API response format:', jsonResponse);
      throw new Error('Invalid response format from Sheety API');
    }

    return jsonResponse;
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