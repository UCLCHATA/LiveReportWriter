// Configuration
const CONFIG = {
    sheetId: '1LbrvhuUGiL1l7LeV-OQ3vEh4AAcM18KrXB0iDv7jz20',
    templateId: '1FrB47q-LB5T5z1F3sk-j84bwoPM90LOvrN8CJzdwBPQ',
    wordDocsFolderId: '1vlVlkaOiXFSVbbynxUyi6zcg9gNcYJ4D',
    templateVersion: '1.0',
    clinicName: 'CHATA Clinic',
    sheets: {
      R3: 'R3_Form',
      Placeholders: 'Placeholders_Map',
      Logs: 'API_Logs'
    }
};

// API Configuration
const API_KEY = PropertiesService.getScriptProperties().getProperty('ANTHROPIC_API_KEY');
const ANTHROPIC_VERSION = '2023-06-01';
const CLAUDE_MODEL = 'claude-3-sonnet-20240229';
const MAX_TOKENS = 4096;
const MAX_RETRIES = 3;

// ... existing code ...

// Enhanced logging functions
function initializeLogsSheet(ss) {
  Logger.log('Initializing logs sheet...');
  
  let logsSheet = ss.getSheetByName(CONFIG.sheets.Logs);
  if (!logsSheet) {
    logsSheet = ss.insertSheet(CONFIG.sheets.Logs);
    const headers = [
      'Timestamp (IST)',
      'CHATA_ID',
      'Operation',
      'Section',
      'Content',
      'Status/Details'
    ];
    logsSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    logsSheet.getRange('A1:F1')
      .setBackground('#4a86e8')
      .setFontColor('white')
      .setFontWeight('bold');
    
    // Set column widths
    logsSheet.setColumnWidth(1, 180); // Timestamp
    logsSheet.setColumnWidth(2, 120); // CHATA_ID
    logsSheet.setColumnWidth(3, 150); // Operation
    logsSheet.setColumnWidth(4, 150); // Section
    logsSheet.setColumnWidth(5, 500); // Content
    logsSheet.setColumnWidth(6, 250); // Status/Details
    
    logsSheet.setFrozenRows(1);
  }
  return logsSheet;
}

function logToSheet(sheet, operation, section, content, details, chataId) {
  const timestamp = Utilities.formatDate(new Date(), "Asia/Kolkata", "yyyy-MM-dd HH:mm:ss");
  
  let contentToLog = content;
  let statusDetails = details;
  let documentUrl = '';
  
  // Save large content to separate docs
  if (operation.includes('Prompt') || operation.includes('Response')) {
    try {
      const folder = initializeLogsFolder();
      if (folder) {
        const docName = `${chataId}_${operation}_${timestamp.replace(/[: ]/g, '_')}`;
        const doc = DocumentApp.create(docName);
        const body = doc.getBody();
        body.setText(content);
        doc.saveAndClose();
        
        const file = DriveApp.getFileById(doc.getId());
        file.moveTo(folder);
        documentUrl = file.getUrl();
        
        if (operation.includes('Response')) {
          contentToLog = 'Final Response';
          statusDetails = documentUrl;
        } else {
          statusDetails = documentUrl;
        }
      }
    } catch (error) {
      Logger.log(`ERROR creating document: ${error.message}`);
      contentToLog = content.substring(0, 45000) + '... [Content truncated]';
      statusDetails = `Error: ${error.message}`;
    }
  }
  
  const rowData = [timestamp, chataId, operation, section, contentToLog, statusDetails];
  sheet.insertRowAfter(1);
  const range = sheet.getRange(2, 1, 1, rowData.length);
  range.setValues([rowData]);
  range.setWrap(true);
  
  // Color coding for different operations
  const colors = {
    'Prompt Generation': '#e6f3ff',
    'API Call': '#f3ffe6',
    'Response Processing': '#fff2e6',
    'Error': '#ffe6e6'
  };
  
  if (colors[operation]) {
    range.setBackground(colors[operation]);
  }
  
  Logger.log(`Logged operation "${operation}" for CHATA_ID: ${chataId}`);
  return documentUrl || null;
}

// Initialize logs folder
function initializeLogsFolder() {
  try {
    Logger.log('Initializing logs folder...');
    const folderName = 'CHATA_API_Logs';
    
    // Search for existing folder
    const folders = DriveApp.getFoldersByName(folderName);
    if (folders.hasNext()) {
      const folder = folders.next();
      Logger.log('Using existing folder:', folder.getName());
      return folder;
    }
    
    // Create new folder
    const folder = DriveApp.createFolder(folderName);
    Logger.log('Created new folder:', folder.getName());
    return folder;
    
  } catch (error) {
    Logger.log('ERROR: Failed to initialize logs folder:', error.message);
    return null;
  }
}

// Test functions
function testPromptGeneration() {
  Logger.log('\n=== Testing Prompt Generation ===');
  
  try {
    const ss = getSpreadsheet();
    const logsSheet = initializeLogsSheet(ss);
    const testChataId = PropertiesService.getScriptProperties().getProperty('TEST_CHATA_ID');
    
    if (!testChataId) {
      throw new Error('TEST_CHATA_ID not found in script properties');
    }
    
    Logger.log(`Testing with CHATA_ID: ${testChataId}`);
    
    // 1. Test form data retrieval
    Logger.log('\nTesting form data retrieval...');
    const formData = getFormData(testChataId);
    logToSheet(logsSheet, 'Test', 'Form Data', 'Retrieved form data', JSON.stringify(formData, null, 2), testChataId);
    
    // 2. Test placeholder map retrieval
    Logger.log('\nTesting placeholder map retrieval...');
    const placeholderMap = getPlaceholderMap();
    logToSheet(logsSheet, 'Test', 'Placeholders', 'Retrieved placeholder map', JSON.stringify(placeholderMap, null, 2), testChataId);
    
    // 3. Test prompt construction
    Logger.log('\nTesting prompt construction...');
    const prompt = constructPrompt(formData, placeholderMap);
    const promptUrl = logToSheet(logsSheet, 'Test', 'Prompt', 'Generated prompt', JSON.stringify(prompt, null, 2), testChataId);
    
    return {
      success: true,
      message: 'Prompt generation test completed successfully',
      details: {
        formData: formData,
        placeholderMap: placeholderMap,
        promptUrl: promptUrl
      }
    };
    
  } catch (error) {
    Logger.log(`Error in prompt generation test: ${error.message}`);
    Logger.log(`Stack trace: ${error.stack}`);
    return {
      success: false,
      error: error.message,
      stack: error.stack
    };
  }
}

function testAPIConnection() {
  Logger.log('\n=== Testing API Connection ===');
  
  try {
    const ss = getSpreadsheet();
    const logsSheet = initializeLogsSheet(ss);
    const testChataId = PropertiesService.getScriptProperties().getProperty('TEST_CHATA_ID');
    
    if (!testChataId) {
      throw new Error('TEST_CHATA_ID not found in script properties');
    }
    
    // Test API with a simple prompt
    const testPrompt = {
      messages: [{
        role: 'user',
        content: 'Please respond with "API test successful"'
      }],
      system: 'You are a test system. Respond exactly as requested.'
    };
    
    Logger.log('Sending test API call...');
    logToSheet(logsSheet, 'Test', 'API', 'Sending test request', JSON.stringify(testPrompt, null, 2), testChataId);
    
    const response = callClaudeAPI(testPrompt.messages, testPrompt.system, 0.7);
    logToSheet(logsSheet, 'Test', 'API', 'Received response', response, testChataId);
    
    return {
      success: true,
      message: 'API connection test completed successfully',
      response: response
    };
    
  } catch (error) {
    Logger.log(`Error in API connection test: ${error.message}`);
    Logger.log(`Stack trace: ${error.stack}`);
    return {
      success: false,
      error: error.message,
      stack: error.stack
    };
  }
}

function testResponseProcessing() {
  Logger.log('\n=== Testing Response Processing ===');
  
  try {
    const ss = getSpreadsheet();
    const logsSheet = initializeLogsSheet(ss);
    const testChataId = PropertiesService.getScriptProperties().getProperty('TEST_CHATA_ID');
    
    if (!testChataId) {
      throw new Error('TEST_CHATA_ID not found in script properties');
    }
    
    // Create a test response with placeholders
    const testResponse = `##A001##
This is a test content for placeholder A001.
##END##
##B002##
This is another test content for placeholder B002.
##END##
##COMPLETE##`;
    
    Logger.log('Processing test response...');
    logToSheet(logsSheet, 'Test', 'Response', 'Processing test response', testResponse, testChataId);
    
    const processed = processLLMResponse(testResponse);
    logToSheet(logsSheet, 'Test', 'Response', 'Processed result', JSON.stringify(processed, null, 2), testChataId);
    
    return {
      success: true,
      message: 'Response processing test completed successfully',
      processed: processed
    };
    
  } catch (error) {
    Logger.log(`Error in response processing test: ${error.message}`);
    Logger.log(`Stack trace: ${error.stack}`);
    return {
      success: false,
      error: error.message,
      stack: error.stack
    };
  }
}

function testEndToEnd() {
  Logger.log('\n=== Starting End-to-End Test ===');
  
  try {
    const testChataId = PropertiesService.getScriptProperties().getProperty('TEST_CHATA_ID');
    if (!testChataId) {
      throw new Error('TEST_CHATA_ID not found in script properties');
    }
    
    // Run full report generation
    const result = generateReport(testChataId);
    
    Logger.log('\nEnd-to-End Test Results:');
    Logger.log(JSON.stringify(result, null, 2));
    
    return result;
    
  } catch (error) {
    Logger.log(`Error in end-to-end test: ${error.message}`);
    Logger.log(`Stack trace: ${error.stack}`);
    return {
      success: false,
      error: error.message,
      stack: error.stack
    };
  }
}

function runAllTests() {
  Logger.log('\n=== Running All Tests ===');
  
  const results = {
    promptGeneration: null,
    apiConnection: null,
    responseProcessing: null,
    endToEnd: null
  };
  
  try {
    // 1. Test prompt generation
    Logger.log('\nRunning prompt generation test...');
    results.promptGeneration = testPromptGeneration();
    
    // 2. Test API connection
    Logger.log('\nRunning API connection test...');
    results.apiConnection = testAPIConnection();
    
    // 3. Test response processing
    Logger.log('\nRunning response processing test...');
    results.responseProcessing = testResponseProcessing();
    
    // 4. Run end-to-end test
    Logger.log('\nRunning end-to-end test...');
    results.endToEnd = testEndToEnd();
    
    return {
      success: true,
      message: 'All tests completed',
      results: results
    };
    
  } catch (error) {
    Logger.log(`Error in test suite: ${error.message}`);
    Logger.log(`Stack trace: ${error.stack}`);
    return {
      success: false,
      error: error.message,
      stack: error.stack,
      results: results
    };
  }
}

// Make test functions globally available
global.testPromptGeneration = testPromptGeneration;
global.testAPIConnection = testAPIConnection;
global.testResponseProcessing = testResponseProcessing;
global.testEndToEnd = testEndToEnd;
global.runAllTests = runAllTests;

// ... rest of existing code ... 