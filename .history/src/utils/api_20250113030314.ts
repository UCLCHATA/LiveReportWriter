interface AppsScriptResponse {
  success: boolean;
  error?: string;
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

export const makeAppsScriptCall = async (url: string, chataId?: string): Promise<AppsScriptResponse> => {
  try {
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
  } catch (error) {
    console.error('Apps Script call failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}; 