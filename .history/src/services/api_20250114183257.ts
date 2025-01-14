export const SHEETY_API_ID = 'd9da852d0370030da19c227582af6f3a';
export const SHEETY_PROJECT = 'chataLiveData';
export const SHEETY_BASE_URL = `https://api.sheety.co/${SHEETY_API_ID}/${SHEETY_PROJECT}`;
export const ALL_URL_API = `${SHEETY_BASE_URL}/allUrl`;
export const R3_FORM_API = `${SHEETY_BASE_URL}/r3Form`;

export const APPS_SCRIPT_URLS = {
    template: 'https://script.google.com/macros/s/AKfycbwYyyaje5rAmTXvE3ApMPjp8qwKCBWMFA1WxOoV2s_Dy4FohDb6siAMutybl1A2QTGDIQ/exec',
    analysis: 'https://script.google.com/macros/s/AKfycby2ykbSfpqB5TwkZEFd57TdUJfCpe7SSSz0Ct30tcSo-8l5ButjAbM527luEGvHI7JD/exec',
    report: 'https://script.google.com/macros/s/AKfycby99LABGexgJxnuuBjFJytq8mwy3xqX9_OjUlXsYTNDtpZSzlMBbXwokPt8ZNgYWVE/exec'
};

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

export async function submitFormData(formData: any) {
    // Format the data according to Sheety's column naming convention
    const formDataToSubmit = {
        r3Form: {
            chataId: formData.chataId,
            name: formData.name,
            timestamp: formData.timestamp,
            asc: formData.ascStatus,
            adhd: formData.adhdStatus,
            observations: formData.clinicalObservations,
            strengths: formData.strengths,
            supportAreas: formData.priorityAreas,
            recommendations: formData.recommendations,
            referrals: Object.entries(formData.referrals)
                .filter(([_, value]) => value)
                .map(([key]) => key)
                .join(', '),
            remarks: formData.remarks || '',
            differential: formData.differentialDiagnosis || '',
            milestones: JSON.stringify(formData.milestones?.map((milestone: { 
                id: string; 
                title: string; 
                category: string; 
                expectedAge: number; 
                actualAge?: number; 
                status: string; 
            }) => ({
                id: milestone.id,
                title: milestone.title,
                category: milestone.category,
                expectedAge: milestone.expectedAge,
                actualAge: milestone.actualAge,
                status: milestone.status,
                difference: milestone.actualAge !== undefined ? milestone.actualAge - milestone.expectedAge : null
            })) || []),
            milestoneHistory: formData.milestoneHistory || '',
            radarChartImage: formData.radarChartImage || '',
            timelineImage: formData.timelineImage || ''
        }
    };

    const response = await fetch(R3_FORM_API, {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer CHATAI',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formDataToSubmit)
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Form submission failed: ${errorText}`);
    }
    
    return response.json();
}

export async function submitToSheetyAPI(url: string, data: any) {
    // Ensure milestone data is properly formatted
    if (data.r3Form && data.r3Form.Milestone_Timeline_Data) {
        // Log the milestone data being sent
        console.log('Sending milestone data:', data.r3Form.Milestone_Timeline_Data);
    }

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
        console.error('Sheety API error:', {
            status: response.status,
            statusText: response.statusText,
            error: errorText,
            sentData: {
                ...data,
                r3Form: {
                    ...data.r3Form,
                    milestoneImage: data.r3Form.milestoneImage ? '[BASE64_IMAGE]' : '',
                    combinedGraphImage: data.r3Form.combinedGraphImage ? '[BASE64_IMAGE]' : ''
                }
            }
        });
        throw new Error(`Sheety API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

export const makeAppsScriptCall = async (url: string, chataId?: string): Promise<AppsScriptResponse> => {
  return new Promise((resolve, reject) => {
    const callbackName = 'callback_' + Math.round(100000 * Math.random());
    let timeoutId: number;

    // Create callback function
    (window as any)[callbackName] = function(response: AppsScriptResponse) {
      // Clear timeout
      if (timeoutId) clearTimeout(timeoutId);
      
      // Clean up
      document.head.removeChild(script);
      delete (window as any)[callbackName];
      
      // Handle response
      if (response.success) {
        resolve(response);
      } else {
        reject(new Error(response.error || 'Unknown error'));
      }
    };

    // Create script element
    const script = document.createElement('script');
    script.src = `${url}?callback=${callbackName}&chataId=${encodeURIComponent(chataId || '')}`;
    
    // Add error handling
    script.onerror = () => {
      if (timeoutId) clearTimeout(timeoutId);
      document.head.removeChild(script);
      delete (window as any)[callbackName];
      reject(new Error('Script load failed'));
    };

    // Set timeout
    timeoutId = window.setTimeout(() => {
      document.head.removeChild(script);
      delete (window as any)[callbackName];
      reject(new Error('Request timed out'));
    }, 180000); // 3 minutes timeout

    // Add script to document
    document.head.appendChild(script);
    console.log(`Making Apps Script call to: ${script.src}`);
  });
}; 