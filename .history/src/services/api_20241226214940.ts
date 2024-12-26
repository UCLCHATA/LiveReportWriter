export const SHEETY_API_ID = 'd9da852d0370030da19c227582af6f3a';
export const SHEETY_PROJECT = 'chata';
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
    const response = await fetch(R3_FORM_API, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ r3Form: formData })
    });
    
    if (!response.ok) {
        throw new Error('Form submission failed');
    }
    return response.json();
} 