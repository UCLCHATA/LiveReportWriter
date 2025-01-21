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

// Enhanced logging functions
function initializeLogsFolder() {
  try {
    Logger.log('Initializing logs folder...');
    
    // Get folder ID from script properties
    const scriptProperties = PropertiesService.getScriptProperties();
    const folderId = scriptProperties.getProperty('LOGS_FOLDER_ID');
    
    if (folderId) {
      try {
        const folder = DriveApp.getFolderById(folderId);
        Logger.log('Using existing logs folder:', folder.getName());
        return folder;
      } catch (e) {
        Logger.log('Existing folder ID invalid:', e.message);
      }
    }
    
    // Search for existing folder
    const folders = DriveApp.getFoldersByName('CHATA_API_Logs');
    if (folders.hasNext()) {
      const folder = folders.next();
      Logger.log('Found existing logs folder:', folder.getName());
      scriptProperties.setProperty('LOGS_FOLDER_ID', folder.getId());
      return folder;
    }
    
    // Create new folder
    Logger.log('Creating new logs folder...');
    const folder = DriveApp.createFolder('CHATA_API_Logs');
    scriptProperties.setProperty('LOGS_FOLDER_ID', folder.getId());
    Logger.log('Created new logs folder:', folder.getName());
    return folder;
    
  } catch (error) {
    Logger.log('ERROR: Failed to initialize logs folder:', error.message);
    return null;
  }
}

function saveDetailedLog(operation, content, chataId) {
  try {
    const folder = initializeLogsFolder();
    if (!folder) {
      throw new Error('Could not access logs folder');
    }
    
    const timestamp = Utilities.formatDate(new Date(), "Asia/Kolkata", "yyyy-MM-dd_HH-mm-ss");
    const docName = `${chataId}_${operation}_${timestamp}`;
    
    Logger.log(`Creating detailed log: ${docName}`);
    
    const doc = DocumentApp.create(docName);
    const body = doc.getBody();
    body.setText(content);
    doc.saveAndClose();
    
    const file = DriveApp.getFileById(doc.getId());
    file.moveTo(folder);
    
    return file.getUrl();
    
  } catch (error) {
    Logger.log(`ERROR creating detailed log: ${error.message}`);
    return null;
  }
}

function cleanupOldLogs(daysToKeep = 30) {
  Logger.log('Starting logs cleanup...');
  
  try {
    const folder = initializeLogsFolder();
    if (!folder) {
      throw new Error('Could not access logs folder');
    }
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    Logger.log(`Cleaning up logs older than: ${cutoffDate.toISOString()}`);
    
    const files = folder.getFiles();
    let deletedCount = 0;
    let errorCount = 0;
    
    while (files.hasNext()) {
      const file = files.next();
      if (file.getDateCreated() < cutoffDate) {
        try {
          file.setTrashed(true);
          deletedCount++;
        } catch (e) {
          Logger.log(`Failed to delete file ${file.getName()}: ${e.message}`);
          errorCount++;
        }
      }
    }
    
    Logger.log(`Cleanup completed:
- Deleted files: ${deletedCount}
- Failed deletions: ${errorCount}`);
    
    return {
      success: true,
      deletedCount: deletedCount,
      errorCount: errorCount
    };
    
  } catch (error) {
    Logger.log('ERROR in cleanup:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Enhanced version of initializeLogsSheet
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
    
    const headerRange = logsSheet.getRange(1, 1, 1, headers.length);
    headerRange.setValues([headers]);
    headerRange.setBackground('#4a86e8')
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
    
    // Add folder link if available
    const folder = initializeLogsFolder();
    if (folder) {
      const note = `API Logs\nDetailed logs are saved in: ${folder.getUrl()}`;
      headerRange.getCell(1, 1).setNote(note);
    }
  }
  
  return logsSheet;
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

// Test functions for critical components
function testPromptGeneration() {
  Logger.log('\n=== Testing Prompt Generation ===');
  
  try {
    const ss = getSpreadsheet();
    const logsSheet = initializeLogsSheet(ss);
    const testChataId = PropertiesService.getScriptProperties().getProperty('TEST_CHATA_ID');
    
    if (!testChataId) {
      throw new Error('TEST_CHATA_ID not found in script properties. Please run setup() first.');
    }
    
    Logger.log(`Testing with CHATA_ID: ${testChataId}`);
    
    // Get sample form data
    const sampleFormData = {
      metadata: {
        child_name: "Alex Morgan",
        dob: "2018-05-15",
        age: "5 years 9 months",
        assessment_date: "2024-02-20",
        clinician: "Dr. Sarah Thompson"
      },
      sensory_profile: {
        visual: { score: 85, observations: "Shows sensitivity to bright lights" },
        auditory: { score: 78, observations: "Covers ears with loud sounds" }
      },
      social_communication: {
        joint_attention: "Limited eye contact during interactions",
        social_reciprocity: "Responds inconsistently to social bids"
      }
    };
    
    // Get placeholder mapping
    const placeholderMap = {
      "S001": { description: "Child's sensory profile summary", wordCount: 150 },
      "S002": { description: "Social communication patterns", wordCount: 200 }
    };
    
    Logger.log('Constructing test prompt...');
    const prompt = constructPrompt(sampleFormData, placeholderMap);
    
    if (!prompt || !prompt.systemPrompt || !prompt.userPrompt) {
      throw new Error('Invalid prompt structure generated');
    }
    
    // Log prompt details
    Logger.log('System Prompt Length:', prompt.systemPrompt.length);
    Logger.log('User Prompt Length:', prompt.userPrompt.length);
    
    // Save prompts to logs
    logToSheet(logsSheet, 'Test Prompt', 'System', prompt.systemPrompt, 'Generated for testing', testChataId);
    logToSheet(logsSheet, 'Test Prompt', 'User', prompt.userPrompt, 'Generated for testing', testChataId);
    
    return {
      success: true,
      message: 'Prompt generation test completed successfully',
      details: {
        systemPromptLength: prompt.systemPrompt.length,
        userPromptLength: prompt.userPrompt.length
      }
    };
    
  } catch (error) {
    Logger.log('ERROR in prompt generation test:', error.message);
    Logger.log('Stack trace:', error.stack);
    return {
      success: false,
      error: error.message,
      details: { stack: error.stack }
    };
  }
}

async function testAPIConnection() {
  Logger.log('\n=== Testing Claude API Connection ===');
  
  try {
    const ss = getSpreadsheet();
    const logsSheet = initializeLogsSheet(ss);
    const testChataId = PropertiesService.getScriptProperties().getProperty('TEST_CHATA_ID');
    
    if (!testChataId) {
      throw new Error('TEST_CHATA_ID not found in script properties');
    }
    
    // Simple test message
    const testMessage = {
      role: 'user',
      content: 'Please respond with "API connection successful" if you receive this message.'
    };
    
    Logger.log('Testing API connection...');
    logToSheet(logsSheet, 'API Test', 'Connection', 'Initiating API test', 'In Progress', testChataId);
    
    const response = await callClaudeAPI([testMessage], 'Test system message', 0.7);
    
    if (!response || !response.includes('API connection successful')) {
      throw new Error('Unexpected API response format');
    }
    
    logToSheet(logsSheet, 'API Test', 'Connection', 'API test completed', 'Success', testChataId);
    
    return {
      success: true,
      message: 'API connection test successful',
      response: response
    };
    
  } catch (error) {
    Logger.log('ERROR in API connection test:', error.message);
    Logger.log('Stack trace:', error.stack);
    logToSheet(logsSheet, 'API Test', 'Connection', 'API test failed', error.message, testChataId);
    return {
      success: false,
      error: error.message,
      details: { stack: error.stack }
    };
  }
}

async function testContentGeneration() {
  Logger.log('\n=== Testing Content Generation ===');
  
  try {
    const ss = getSpreadsheet();
    const logsSheet = initializeLogsSheet(ss);
    const testChataId = PropertiesService.getScriptProperties().getProperty('TEST_CHATA_ID');
    
    if (!testChataId) {
      throw new Error('TEST_CHATA_ID not found in script properties');
    }
    
    // Test data
    const testData = {
      placeholder: 'S001',
      description: 'Test placeholder for sensory profile',
      wordCount: 100,
      context: 'Child shows sensitivity to sensory input'
    };
    
    Logger.log('Generating test content...');
    logToSheet(logsSheet, 'Content Test', 'Generation', 'Starting content generation test', 'In Progress', testChataId);
    
    // Construct test prompt
    const prompt = {
      role: 'user',
      content: `Generate content for placeholder ##${testData.placeholder}##
Description: ${testData.description}
Word Count: ${testData.wordCount}
Context: ${testData.context}

Format your response as:
##${testData.placeholder}##
[Content]
##END##`
    };
    
    const response = await callClaudeAPI([prompt], 'Generate a test response for a sensory profile placeholder.', 0.7);
    
    // Validate response format
    if (!response.includes(`##${testData.placeholder}##`) || !response.includes('##END##')) {
      throw new Error('Invalid response format');
    }
    
    logToSheet(logsSheet, 'Content Test', 'Generation', 'Content generation completed', 'Success', testChataId);
    
    return {
      success: true,
      message: 'Content generation test successful',
      response: response
    };
    
  } catch (error) {
    Logger.log('ERROR in content generation test:', error.message);
    Logger.log('Stack trace:', error.stack);
    logToSheet(logsSheet, 'Content Test', 'Generation', 'Content generation failed', error.message, testChataId);
    return {
      success: false,
      error: error.message,
      details: { stack: error.stack }
    };
  }
}

// Main test function to run all tests
async function runAllTests() {
  Logger.log('\n=== Starting Comprehensive Test Suite ===');
  const results = {
    promptGeneration: null,
    apiConnection: null,
    contentGeneration: null
  };
  
  try {
    // Test prompt generation
    Logger.log('\nTesting prompt generation...');
    results.promptGeneration = testPromptGeneration();
    
    // Test API connection
    Logger.log('\nTesting API connection...');
    results.apiConnection = await testAPIConnection();
    
    // Test content generation
    Logger.log('\nTesting content generation...');
    results.contentGeneration = await testContentGeneration();
    
    // Log overall results
    Logger.log('\n=== Test Suite Results ===');
    Object.entries(results).forEach(([test, result]) => {
      Logger.log(`${test}: ${result.success ? 'PASSED' : 'FAILED'}`);
      if (!result.success) {
        Logger.log(`Error: ${result.error}`);
      }
    });
    
    return {
      success: Object.values(results).every(r => r.success),
      results: results
    };
    
  } catch (error) {
    Logger.log('ERROR in test suite:', error.message);
    Logger.log('Stack trace:', error.stack);
    return {
      success: false,
      error: error.message,
      results: results
    };
  }
}

// Helper function to validate response format
function validateResponseFormat(response, placeholder) {
  if (!response) {
    throw new Error('Empty response received');
  }
  
  const pattern = new RegExp(`##${placeholder}##[\\s\\S]*?##END##`);
  if (!pattern.test(response)) {
    throw new Error(`Invalid response format for placeholder ${placeholder}`);
  }
  
  return true;
} 