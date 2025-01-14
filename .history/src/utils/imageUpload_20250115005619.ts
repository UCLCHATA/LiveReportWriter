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
    console.log(`📤 Starting ${imageType} image upload to Drive...`);
    console.log(`📏 Image data length: ${imageData.length} characters`);
    console.log(`🔑 Using CHATA ID: ${chataId}`);

    // Remove the data:image/png;base64, prefix if present
    const base64Data = imageData.includes('base64,') 
      ? imageData.split('base64,')[1] 
      : imageData;

    const fileName = `${chataId}_${imageType}_${new Date().toISOString()}.png`;
    console.log(`📝 Generated filename: ${fileName}`);
    
    console.log('🌐 Sending request to Apps Script...');
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

    console.log('✨ Apps Script Response:', response.data);

    if (response.data && response.data.fileUrl) {
      console.log(`🎯 Successfully uploaded ${imageType} image to Drive`);
      console.log(`🔗 File URL: ${response.data.fileUrl}`);
      return {
        success: true,
        fileUrl: response.data.fileUrl
      };
    }

    console.error('⚠️ No file URL received from server');
    return {
      success: false,
      error: 'No file URL received from server'
    };

  } catch (error) {
    console.error(`❌ Error uploading ${imageType} image to Drive:`, error);
    if (axios.isAxiosError(error)) {
      console.error('📡 Response data:', error.response?.data);
      console.error('🔍 Status:', error.response?.status);
      console.error('📝 Status Text:', error.response?.statusText);
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

export const testImageUpload = async (element: HTMLElement, chataId: string, type: 'milestone' | 'radar'): Promise<void> => {
  try {
    console.log(`\n🎯 Testing ${type} image upload...`);
    console.log('📍 Element to capture:', element);
    console.log('🔍 Element dimensions:', {
      width: element.offsetWidth,
      height: element.offsetHeight,
      clientWidth: element.clientWidth,
      clientHeight: element.clientHeight
    });
    
    console.log('🎨 Starting html2canvas capture...');
    const canvas = await html2canvas(element, {
      scale: 2,
      logging: true,
      allowTaint: true,
      useCORS: true,
      backgroundColor: '#ffffff',
      onclone: (doc) => {
        console.log('📑 Document cloned for capture');
        const clonedElement = doc.querySelector(element.className);
        if (clonedElement) {
          console.log('✅ Found cloned element');
          console.log('🔍 Cloned element dimensions:', {
            width: (clonedElement as HTMLElement).offsetWidth,
            height: (clonedElement as HTMLElement).offsetHeight
          });
        }
      }
    });
    
    console.log('📐 Canvas dimensions:', {
      width: canvas.width,
      height: canvas.height
    });
    
    const imageData = canvas.toDataURL('image/png');
    console.log(`🖼️ Image captured successfully`);
    console.log(`📏 Base64 image size: ${imageData.length} characters`);
    console.log(`🔍 Image data preview: ${imageData.substring(0, 50)}...`);
    
    // Upload to Drive
    const result = await uploadImageToDrive(imageData, chataId, type);
    
    if (result.success) {
      console.log(`\n✅ ${type} upload completed successfully!`);
      console.log(`🔗 File URL: ${result.fileUrl}`);
    } else {
      console.error(`\n❌ ${type} upload failed: ${result.error}`);
    }
    
  } catch (error) {
    console.error(`\n💥 ${type} test failed:`, error);
    if (error instanceof Error) {
      console.error('⚠️ Error details:', error.message);
      console.error('📚 Stack trace:', error.stack);
    }
  }
}; 