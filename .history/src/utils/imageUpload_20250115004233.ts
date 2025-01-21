import axios from 'axios';

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzYt6e1TjdUtv0HzhAD9Je8UePfBlLh4NbO2Nkf_sMHwQZ01q_uywrqMw3oe5lQgm31/exec';

interface ImageUploadResponse {
  success: boolean;
  fileUrl?: string;
  error?: string;
}

export const uploadImageToDrive = async (
  imageData: string,
  chataId: string,
  imageType: 'milestone' | 'radar'
): Promise<ImageUploadResponse> => {
  try {
    // Remove the data:image/png;base64, prefix if present
    const base64Data = imageData.includes('base64,') 
      ? imageData.split('base64,')[1] 
      : imageData;

    const fileName = `${chataId}_${imageType}_${new Date().toISOString()}`;
    
    const response = await axios.post(
      APPS_SCRIPT_URL,
      {
        image: base64Data,
        fileName,
        chataId
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data && response.data.fileUrl) {
      return {
        success: true,
        fileUrl: response.data.fileUrl
      };
    }

    return {
      success: false,
      error: 'No file URL received from server'
    };

  } catch (error) {
    console.error('Error uploading image to Drive:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Test function
export const testImageUpload = async (element: HTMLElement, chataId: string, type: 'milestone' | 'radar'): Promise<void> => {
  try {
    console.log(`Testing image upload for ${type}...`);
    
    // Capture the image
    const canvas = await html2canvas(element, {
      scale: 1,
      logging: true,
      allowTaint: true,
      useCORS: true,
      backgroundColor: '#ffffff'
    });
    
    const imageData = canvas.toDataURL('image/png', 0.8);
    console.log(`Image captured successfully. Size: ${imageData.length} characters`);
    
    // Upload to Drive
    const result = await uploadImageToDrive(imageData, chataId, type);
    
    if (result.success) {
      console.log(`✅ Upload successful! File URL: ${result.fileUrl}`);
    } else {
      console.error(`❌ Upload failed: ${result.error}`);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}; 