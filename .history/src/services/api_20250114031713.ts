// Apps Script URLs
export const APPS_SCRIPT_URLS = {
    template: 'https://script.google.com/macros/s/AKfycbwYyyaje5rAmTXvE3ApMPjp8qwKCBWMFA1WxOoV2s_Dy4FohDb6siAMutybl1A2QTGDIQ/exec',
    analysis: 'https://script.google.com/macros/s/AKfycby2ykbSfpqB5TwkZEFd57TdUJfCpe7SSSz0Ct30tcSo-8l5ButjAbM527luEGvHI7JD/exec',
    report: 'https://script.google.com/macros/s/AKfycby99LABGexgJxnuuBjFJytq8mwy3xqX9_OjUlXsYTNDtpZSzlMBbXwokPt8ZNgYWVE/exec',
    formHandler: 'YOUR_FORM_HANDLER_SCRIPT_URL' // Replace this with your deployed form handler URL
};

export interface ChataData {
    id: string;
    name: string;
    r1Url: string | null;
    r2Url: string | null;
}

export async function fetchChataData(): Promise<ChataData[]> {
    const response = await fetch(`${APPS_SCRIPT_URLS.formHandler}?action=getAll`);
    if (!response.ok) {
        throw new Error('Failed to fetch CHATA data');
    }
    const json = await response.json();
    return json.data
        .filter((row: any) => row.chataId && row.chataId !== "CHATA_ID")
        .map((row: any) => ({
            id: row.chataId,
            name: row.childName || '',
            r1Url: row['r1Generated (pdf)'] || null,
            r2Url: row['r2Generated (pdf)'] || null
        }));
}

export async function submitFormData(formData: any) {
    const response = await fetch(APPS_SCRIPT_URLS.formHandler, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            r3Form: {
                ...formData,
                chartImage: formData.chartImage || null
            }
        })
    });
    
    if (!response.ok) {
        throw new Error('Form submission failed');
    }
    return response.json();
} 