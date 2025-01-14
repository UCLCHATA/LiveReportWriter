// Configuration
const CONFIG = {
  sheetId: '1LbrvhuUGiL1l7LeV-OQ3vEh4AAcM18KrXB0iDv7jz20',
  sheets: {
    R3: 'R3_Form'
  }
};

// Function to get spreadsheet
function getSpreadsheet() {
  const scriptProperties = PropertiesService.getScriptProperties();
  const spreadsheetId = scriptProperties.getProperty('SPREADSHEET_ID') || CONFIG.sheetId;
  if (!spreadsheetId) {
    throw new Error('Spreadsheet ID not found. Please run setup() first.');
  }
  return SpreadsheetApp.openById(spreadsheetId);
}

// Setup function
function setup() {
  const scriptProperties = PropertiesService.getScriptProperties();
  scriptProperties.setProperty('SPREADSHEET_ID', CONFIG.sheetId);
  Logger.log('Setup complete. Script properties initialized.');
  return 'Setup complete';
}

// Function to save form data to R3_Form sheet
function saveFormData(formData) {
  Logger.log('Saving form data to R3_Form sheet...');
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.sheets.R3);
  
  if (!sheet) {
    throw new Error('R3_Form sheet not found');
  }

  // Get headers
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  // Create row data matching header order
  const rowData = headers.map(header => {
    switch(header.toString().toLowerCase()) {
      case 'timestamp':
        return new Date().toISOString();
      case 'chata_id':
        return formData.chataId;
      case 'name':
        return formData.name;
      case 'asc':
        return formData.asc;
      case 'adhd':
        return formData.adhd;
      case 'observations':
        return formData.observations;
      case 'strengths':
        return formData.strengths;
      case 'supportareas':
        return formData.supportareas;
      case 'recommendations':
        return formData.recommendations;
      case 'referrals':
        return formData.referrals;
      case 'remarks':
        return formData.remarks || '';
      case 'differential':
        return formData.differential || '';
      default:
        return '';
    }
  });

  // Insert data in new row
  sheet.insertRowAfter(1);
  const range = sheet.getRange(2, 1, 1, rowData.length);
  range.setValues([rowData]);

  return {
    success: true,
    message: 'Form data saved successfully'
  };
}

// Handle POST requests for form submissions
function doPost(e) {
  try {
    // Parse the POST data
    const postData = JSON.parse(e.postData.contents);
    const formData = postData.r3Form;

    if (!formData || !formData.chataId) {
      throw new Error('Invalid form data: missing required fields');
    }

    // Save to sheet
    const result = saveFormData(formData);

    // Return success response
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('Error in doPost:', error.message);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.message
    }))
    .setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle GET requests for testing
function doGet(e) {
  try {
    // Handle test requests
    if (e?.parameter?.test === 'true') {
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'Form handler endpoint is working'
      }))
      .setMimeType(ContentService.MimeType.JSON);
    }

    throw new Error('Invalid request: Only POST requests are supported for form submission');
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.message
    }))
    .setMimeType(ContentService.MimeType.JSON);
  }
} 