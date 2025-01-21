import axios from 'axios';
import html2canvas from 'html2canvas';

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwyPz0eonqZ5tsJhoXPirx3xRLbysYx9EHybtRX3lsQC2tFticPG-GJnEW0Ym5aId0A/exec';

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
    console.log('Starting image upload to Drive...');
    console.log('Image data length:', imageData.length);

    // Remove the data:image/png;base64, prefix if present
    const base64Data = imageData.includes('base64,') 
      ? imageData.split('base64,')[1] 
      : imageData;

    const fileName = `${chataId}_${imageType}_${new Date().toISOString()}.png`;
    
    console.log('Sending request to Apps Script...');
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

    console.log('Apps Script Response:', response.data);

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
    if (axios.isAxiosError(error)) {
      console.error('Response data:', error.response?.data);
    }
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
    console.log('Element to capture:', element);
    
    // Capture the image at full quality
    const canvas = await html2canvas(element, {
      scale: 2, // Maintain high resolution
      logging: true,
      allowTaint: true,
      useCORS: true,
      backgroundColor: '#ffffff',
      onclone: (doc) => {
        console.log('Document cloned for capture');
        const clonedElement = doc.querySelector(element.className);
        if (clonedElement) {
          console.log('Found cloned element');
        }
      }
    });
    
    const imageData = canvas.toDataURL('image/png');
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
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Stack trace:', error.stack);
    }
  }
}; 