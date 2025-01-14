export const SHEETY_API_ID = 'd9da852d0370030da19c227582af6f3a';
export const SHEETY_PROJECT = 'chataLiveData';
export const SHEETY_BASE_URL = `https://api.sheety.co/${SHEETY_API_ID}/${SHEETY_PROJECT}`;
export const ALL_URL_API = `${SHEETY_BASE_URL}/allUrl`;
export const R3_FORM_API = `${SHEETY_BASE_URL}/r3Form`;

// Add Sheety API key from environment variable
export const SHEETY_API_KEY = import.meta.env.VITE_SHEETY_API_KEY;

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
    const response = await fetch(ALL_URL_API);
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
    // Include the chart image in the form data if it exists
    const formDataToSubmit = {
        r3Form: {
            ...formData,
            chartImage: formData.chartImage || null
        }
    };

    const headers: Record<string, string> = {
        'Content-Type': 'application/json'
    };

    // Add authorization if API key is available
    if (SHEETY_API_KEY) {
        headers['Authorization'] = `Bearer ${SHEETY_API_KEY}`;
    }

    const response = await fetch(R3_FORM_API, {
        method: 'POST', // This will append to a new row
        headers,
        body: JSON.stringify(formDataToSubmit)
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Form submission failed: ${errorText}`);
    }
    
    return response.json();
} 