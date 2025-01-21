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

// Utility functions
function formatDateWithOrdinal(date) {
  if (!date) return 'N/A';
  
  const d = new Date(date);
  const day = d.getDate();
  const month = d.toLocaleString('en-US', { month: 'long' });
  const year = d.getFullYear();
  
  const ordinal = (day) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return "st";
      case 2: return "nd";
      case 3: return "rd";
      default: return "th";
    }
  };

  return `${day}${ordinal(day)} ${month} ${year}`;
}

function extractDocIdFromUrl(url) {
  if (!url) throw new Error('URL is undefined or empty');
  const match = url.match(/\/d\/(.*?)(\/|$)/);
  return match ? match[1] : null;
}

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

// Function to read JSON data from R3_Form
function getFormData(chataId) {
  Logger.log(`Getting form data for CHATA_ID: ${chataId}`);
  
  const ss = getSpreadsheet();
  const r3Sheet = ss.getSheetByName(CONFIG.sheets.R3);
  if (!r3Sheet) throw new Error('R3_Form sheet not found');

  const data = r3Sheet.getDataRange().getValues();
  const headers = data[0];
  const chataIdIndex = headers.indexOf('chata_id');
  
  const row = data.find(row => row[chataIdIndex] === chataId);
  if (!row) throw new Error(`No data found for CHATA_ID: ${chataId}`);

  // Create JSON object from row data
  const formData = {};
  headers.forEach((header, index) => {
    formData[header] = row[index];
  });

  return formData;
}

// Function to read placeholder mapping
function getPlaceholderMap() {
  Logger.log('Reading placeholder mapping...');
  
  const ss = getSpreadsheet();
  const mapSheet = ss.getSheetByName(CONFIG.sheets.Placeholders);
  if (!mapSheet) throw new Error('Placeholders_Map sheet not found');

  const data = mapSheet.getDataRange().getValues();
  const headers = data[0];
  const placeholders = {};

  // Convert sheet data to structured placeholder map
  data.slice(1).forEach(row => {
    const id = row[headers.indexOf('ID')];
    if (id) {
      placeholders[id] = {
        description: row[headers.indexOf('Description')] || '',
        wordCount: row[headers.indexOf('Word_Count')] || '',
        category: row[headers.indexOf('Category')] || '',
        context: row[headers.indexOf('Context')] || '',
        customPrompt: row[headers.indexOf('Custom_Prompt')] || ''
      };
    }
  });

  return placeholders;
}

// Function to create template copy
function createTemplateCopy(chataId) {
  Logger.log(`Creating template copy for CHATA_ID: ${chataId}`);
  
  try {
    const templateDoc = DriveApp.getFileById(CONFIG.templateId);
    const newFileName = `${chataId}_R3_Report_${new Date().toISOString().split('T')[0]}`;
    const docCopy = templateDoc.makeCopy(newFileName, DriveApp.getFolderById(CONFIG.wordDocsFolderId));
    
    // Set sharing permissions to "Anyone with the link can view"
    docCopy.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    Logger.log('Document sharing permissions set to "Anyone with the link can view"');
    
    return {
      success: true,
      docId: docCopy.getId(),
      docUrl: docCopy.getUrl()
    };
  } catch (error) {
    Logger.log(`Error creating template copy: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

// Function to construct LLM prompt
function constructPrompt(formData, placeholderMap) {
  Logger.log('Constructing LLM prompt...');

  const systemPrompt = `You are a clinical psychologist at an NHS clinic in London, specializing in autism assessment reports.
Your task is to generate content for specific placeholders in a diagnostic report using the provided assessment data.

CRITICAL REQUIREMENTS:
1. Generate content for EACH placeholder after carefully reviewing the assessment data
2. Use clear, professional language suitable for clinical reports
3. Base all content on the provided assessment data
4. Use "your child" consistently throughout the report
5. Include specific examples and observations from the assessment
6. Ensure content fits naturally in context and flows grammatically
7. Focus on patterns, preferences, and strengths
8. Describe differences neutrally and respectfully
9. Connect observations to support recommendations

DO NOT:
- Skip any placeholders
- Use deficit-based language
- Make assumptions without evidence
- Use technical jargon without explanation
- Break sentence flow for mid-sentence placeholders

Format your response using:
##PLACEHOLDER_ID##
[Content that fits the context and word count]
##END##

Add ##COMPLETE## when all placeholders are done.`;

  const userPrompt = {
    task: "Generate content for autism assessment report placeholders",
    assessment_data: formData,
    placeholders: placeholderMap,
    requirements: {
      format: "##PLACEHOLDER_ID##\n[Content]\n##END##",
      style: "Professional clinical writing",
      perspective: "Use 'your child' consistently",
      tone: "Neurodiversity-affirming, strength-based",
      evidence: "Reference specific observations and examples"
    }
  };

  return {
    systemPrompt,
    userPrompt: JSON.stringify(userPrompt, null, 2)
  };
}

// Function to call Claude API
async function callClaudeAPI(messages, systemPrompt = null, temperature = 0.7) {
  if (!API_KEY) {
    throw new Error('ANTHROPIC_API_KEY not found in script properties');
  }

  const maxRetries = 3;
  const baseDelay = 2000; // Start with 2 seconds
  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const url = 'https://api.anthropic.com/v1/messages';
      
      const options = {
        method: 'post',
        headers: {
          'x-api-key': API_KEY,
          'anthropic-version': ANTHROPIC_VERSION,
          'anthropic-beta': 'max-tokens-3-5-sonnet-2024-07-15',
          'content-type': 'application/json'
        },
        payload: JSON.stringify({
          model: CLAUDE_MODEL,
          max_tokens: MAX_TOKENS,
          messages: messages,
          system: systemPrompt,
          temperature: temperature
        }),
        muteHttpExceptions: true
      };

      const response = UrlFetchApp.fetch(url, options);
      const responseCode = response.getResponseCode();
      const responseText = response.getContentText();
      
      if (responseCode !== 200) {
        Logger.log(`API Error (Attempt ${attempt + 1}/${maxRetries}):`, responseText);
        const error = JSON.parse(responseText).error;
        
        // If it's an overload error, retry with exponential backoff
        if (responseCode === 529) {
          lastError = new Error(`Claude API error (${responseCode}): ${error.message}`);
          const delay = baseDelay * Math.pow(2, attempt); // Exponential backoff
          Logger.log(`Overloaded. Retrying in ${delay/1000} seconds...`);
          Utilities.sleep(delay);
          continue;
        }
        
        throw new Error(`Claude API error (${responseCode}): ${error.message}`);
      }

      const result = JSON.parse(responseText);
      return result.content[0].text;

    } catch (error) {
      lastError = error;
      if (attempt === maxRetries - 1) throw lastError;
      
      const delay = baseDelay * Math.pow(2, attempt);
      Logger.log(`API call failed (Attempt ${attempt + 1}/${maxRetries}). Retrying in ${delay/1000} seconds...`);
      Utilities.sleep(delay);
    }
  }
}

// Function to validate API response
function validateResponse(response, stage) {
  if (!response) {
    throw new Error(`Empty response received from ${stage}`);
  }

  const placeholderPattern = /##[A-Z][0-9]{3}##/g;
  const matches = response.match(placeholderPattern);
  
  if (!matches) {
    throw new Error(`No placeholders found in ${stage} response`);
  }

  matches.forEach(placeholder => {
    const id = placeholder.replace(/##/g, '');
    if (!response.includes(`##${id}##`) || !response.includes('##END##')) {
      throw new Error(`Incomplete format for placeholder ${id} in ${stage} response`);
    }
  });

  return true;
}

// Function to process LLM response
function processLLMResponse(response) {
  Logger.log('Processing LLM response...');
  
  try {
    // Validate response format
    validateResponse(response, 'LLM');
    
    // Extract placeholder content
    const contentMatches = [];
    const contentPattern = /##([A-Z][0-9]{3})##([\s\S]*?)##END##/g;
    let match;
    
    while ((match = contentPattern.exec(response)) !== null) {
      const id = match[1];
      const content = match[2].trim();
      contentMatches.push({ id, content });
      Logger.log(`Found content for ID ${id}, length: ${content.length} chars`);
    }

    if (contentMatches.length === 0) {
      throw new Error('No valid placeholder content found in response');
    }

    return {
      success: true,
      content: contentMatches,
      rawResponse: response
    };

  } catch (error) {
    Logger.log(`Error processing LLM response: ${error.message}`);
    return {
      success: false,
      error: error.message,
      rawResponse: response
    };
  }
}

// Add logging functions
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
    logsSheet.setFrozenRows(1);
  }
  return logsSheet;
}

function logToSheet(sheet, operation, section, content, details, chataId) {
  const timestamp = Utilities.formatDate(new Date(), "Asia/Kolkata", "yyyy-MM-dd HH:mm:ss");
  
  const rowData = [
    timestamp,
    chataId,
    operation,
    section,
    content,
    details
  ];
  
  sheet.insertRowAfter(1);
  sheet.getRange(2, 1, 1, rowData.length).setValues([rowData]);
  
  // If it's a document URL, return it formatted as a hyperlink
  if (details && details.startsWith('https://docs.google.com/')) {
    return details;
  }
  return null;
}

// Main function to process report generation
async function generateReport(chataId) {
  Logger.log(`\n=== Starting report generation for CHATA_ID: ${chataId} ===`);
  
  const ss = getSpreadsheet();
  const logsSheet = initializeLogsSheet(ss);
  
  try {
    // 1. Create template copy
    const template = createTemplateCopy(chataId);
    if (!template.success) throw new Error(`Template creation failed: ${template.error}`);
    Logger.log(`Created template: ${template.docUrl}`);
    logToSheet(logsSheet, 'Template Creation', 'All', 'Created template document', template.docUrl, chataId);

    // 2. Get form data
    const formData = getFormData(chataId);
    Logger.log('Retrieved form data');
    logToSheet(logsSheet, 'Data Retrieval', 'Form Data', 'Retrieved assessment data', 'Success', chataId);

    // 3. Get placeholder mapping
    const placeholderMap = getPlaceholderMap();
    Logger.log(`Loaded ${Object.keys(placeholderMap).length} placeholders`);
    logToSheet(logsSheet, 'Data Retrieval', 'Placeholders', `Loaded ${Object.keys(placeholderMap).length} placeholders`, 'Success', chataId);

    // 4. Construct prompt
    const prompt = constructPrompt(formData, placeholderMap);
    Logger.log('Constructed LLM prompt');
    logToSheet(logsSheet, 'Prompt Construction', 'All', 'Created LLM prompt', JSON.stringify(prompt), chataId);

    // 5. Call LLM API
    Logger.log('Calling Claude API...');
    logToSheet(logsSheet, 'API Call', 'All', 'Initiating API call', 'In Progress', chataId);
    const llmResponse = await callClaudeAPI(
      [{ role: 'user', content: prompt.userPrompt }],
      prompt.systemPrompt,
      0.7
    );
    logToSheet(logsSheet, 'API Call', 'All', 'API call completed', 'Success', chataId);

    // 6. Process response
    const processedResponse = processLLMResponse(llmResponse);
    if (!processedResponse.success) {
      const error = `Failed to process LLM response: ${processedResponse.error}`;
      logToSheet(logsSheet, 'Response Processing', 'All', 'Processing failed', error, chataId);
      throw new Error(error);
    }
    logToSheet(logsSheet, 'Response Processing', 'All', 'Processed LLM response', 'Success', chataId);

    // 7. Log final response
    const responseUrl = logToSheet(
      logsSheet,
      'Final Response',
      'All',
      'Generated content',
      template.docUrl,
      chataId
    );

    // 8. Return results with progress info
    return {
      success: true,
      templateUrl: template.docUrl,
      generatedContent: processedResponse.content,
      rawResponse: processedResponse.rawResponse,
      progress: {
        status: 'complete',
        message: 'Report generation successful',
        step: 7,
        totalSteps: 7,
        details: {
          documentUrl: template.docUrl,
          timestamp: new Date().toISOString()
        }
      }
    };

  } catch (error) {
    Logger.log(`Error in generateReport: ${error.message}`);
    logToSheet(logsSheet, 'Error', 'Process', error.message, error.stack, chataId);
    return {
      success: false,
      error: error.message,
      progress: {
        status: 'error',
        message: error.message,
        step: 0,
        totalSteps: 7,
        details: {
          timestamp: new Date().toISOString(),
          stack: error.stack
        }
      }
    };
  }
}

// Comprehensive test functions
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

// Main test function to run all tests
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

// Web app endpoint
function doGet(e) {
  const callback = e?.parameter?.callback || 'callback';
  const chataId = e?.parameter?.chataId || 
                  PropertiesService.getScriptProperties().getProperty('TEST_CHATA_ID');
  
  if (!chataId) {
    return createJSONPResponse(callback, {
      success: false,
      error: 'No CHATA_ID provided',
      progress: {
        status: 'error',
        message: 'Missing CHATA_ID',
        step: 0,
        totalSteps: 7
      }
    });
  }

  try {
    // Handle test requests
    if (e?.parameter?.test === 'true') {
      const ss = getSpreadsheet();
      const logsSheet = initializeLogsSheet(ss);
      logToSheet(logsSheet, 'Test', 'All', 'Test request received', 'Success', chataId);
      
      return createJSONPResponse(callback, {
        success: true,
        message: 'Report generation endpoint is working',
        progress: {
          status: 'complete',
          message: 'Test successful',
          step: 1,
          totalSteps: 1
        }
      });
    }

    const result = generateReport(chataId);
    return createJSONPResponse(callback, result);
    
  } catch (error) {
    return createJSONPResponse(callback, {
      success: false,
      error: error.message,
      progress: {
        status: 'error',
        message: error.message,
        step: 0,
        totalSteps: 7,
        details: {
          timestamp: new Date().toISOString(),
          stack: error.stack
        }
      }
    });
  }
}

// Helper function for JSONP responses
function createJSONPResponse(callback, data) {
  const jsonData = JSON.stringify(data);
  const output = `${callback}(${jsonData});`;
  return ContentService.createTextOutput(output)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
} 