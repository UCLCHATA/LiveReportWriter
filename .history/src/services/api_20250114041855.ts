export const R3_FORM_API = 'https://api.sheety.co/d9da852d0370030da19c227582af6f3a/chataLiveData/r3Form';

export async function submitFormData(formData: any) {
    // Simplified test data
    const testData = {
        r3Form: {
            chataId: 'TEST123',
            name: 'Test Entry',
            timestamp: new Date().toISOString()
        }
    };

    console.log('Attempting to submit:', testData);

    const response = await fetch(R3_FORM_API, {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer CHATAI',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(testData)
    });
    
    console.log('Response status:', response.status);
    const responseText = await response.text();
    console.log('Response text:', responseText);
    
    if (!response.ok) {
        throw new Error(`Form submission failed: ${responseText}`);
    }
    
    return JSON.parse(responseText);
} 