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
  const logs = [];
  
  try {
    // Log start of test
    Logger.log('[START] Beginning prompt generation test');
    
    // 1. Get spreadsheet
    Logger.log('[Step 1] Getting spreadsheet...');
    let ss;
    try {
      ss = getSpreadsheet();
      Logger.log('[Success] Got spreadsheet');
    } catch (e) {
      Logger.log('[FAIL] Failed to get spreadsheet:', {
        error: e.message,
        stack: e.stack,
        properties: PropertiesService.getScriptProperties().getProperties()
      });
      throw e;
    }
    
    // 2. Initialize logs sheet
    Logger.log('[Step 2] Initializing logs sheet...');
    let logsSheet;
    try {
      // Check if logs sheet already exists
      logsSheet = ss.getSheetByName('Test_Logs');
      if (!logsSheet) {
        logsSheet = ss.insertSheet('Test_Logs');
        const headers = [
          'Timestamp',
          'Test ID',
          'Operation',
          'Section',
          'Content',
          'Details',
          'Document URL'
        ];
        logsSheet.getRange(1, 1, 1, headers.length).setValues([headers])
          .setBackground('#4a86e8')
          .setFontColor('white')
          .setFontWeight('bold');
        
        // Set column widths
        logsSheet.setColumnWidths(1, 1, 180); // Timestamp
        logsSheet.setColumnWidths(2, 1, 120); // Test ID
        logsSheet.setColumnWidths(3, 1, 150); // Operation
        logsSheet.setColumnWidths(4, 1, 150); // Section
        logsSheet.setColumnWidths(5, 1, 300); // Content
        logsSheet.setColumnWidths(6, 1, 300); // Details
        logsSheet.setColumnWidths(7, 1, 250); // Document URL
      }
      Logger.log('[Success] Initialized logs sheet');
    } catch (e) {
      Logger.log('[FAIL] Failed to initialize logs sheet:', {
        error: e.message,
        stack: e.stack,
        sheetNames: ss.getSheets().map(s => s.getName())
      });
      throw e;
    }
    
    // 3. Get test CHATA ID
    Logger.log('[Step 3] Getting test CHATA ID...');
    const testChataId = PropertiesService.getScriptProperties().getProperty('TEST_CHATA_ID');
    Logger.log('[Info] Test CHATA ID state:', {
      hasTestId: !!testChataId,
      value: testChataId
    });
    
    if (!testChataId) {
      throw new Error('TEST_CHATA_ID not found in script properties. Please run setup() first.');
    }
    
    // 4. Get comprehensive test data
    Logger.log('[Step 4] Preparing test assessment data...');
    const testData = {
      metadata: {
        child_name: "John Smith",
        dob: "2018-05-15",
        age: "5 years 9 months",
        assessment_date: "2024-02-20",
        clinician: "Dr. Sarah Thompson",
        clinic: "CHATA Clinic"
      },
      sensory_profile: {
        radar_data: {
          visual: 85,
          auditory: 78,
          tactile: 65,
          vestibular: 72,
          proprioceptive: 80,
          interoceptive: 70
        },
        observations: {
          visual: "Shows sensitivity to bright lights and visual patterns",
          auditory: "Covers ears with loud or unexpected sounds",
          tactile: "Seeks deep pressure, dislikes light touch",
          vestibular: "Enjoys spinning and swinging activities",
          proprioceptive: "Good awareness of body position",
          interoceptive: "Sometimes struggles to identify physical needs"
        }
      },
      social_communication: {
        radar_data: {
          joint_attention: 65,
          social_reciprocity: 70,
          nonverbal: 75,
          verbal: 80,
          play: 68
        },
        observations: {
          joint_attention: "Inconsistent response to name, limited pointing",
          social_reciprocity: "Can engage but prefers parallel play",
          nonverbal: "Limited use of gestures, good eye contact with family",
          verbal: "Strong vocabulary, some echolalia noted",
          play: "Enjoys structured activities, less flexible in free play"
        }
      },
      restricted_patterns: {
        radar_data: {
          repetitive_behaviors: 75,
          routines: 82,
          special_interests: 90,
          sensory_interests: 85
        },
        observations: {
          repetitive_behaviors: "Hand flapping when excited",
          routines: "Strong preference for predictable schedules",
          special_interests: "Intense interest in dinosaurs and astronomy",
          sensory_interests: "Seeks visual stimulation with spinning objects"
        }
      },
      executive_function: {
        emotional_regulation: {
          score: 72,
          observations: "Can become overwhelmed in busy environments"
        },
        flexibility: {
          score: 68,
          observations: "Struggles with unexpected changes"
        }
      },
      developmental_history: {
        milestones: {
          motor: "Walked at 14 months",
          language: "First words at 12 months",
          social: "Limited babbling and joint attention in infancy"
        },
        concerns: {
          onset: "Parent noticed differences at 18 months",
          progression: "Increasing social differences noted in preschool"
        }
      },
      clinical_assessment: {
        ados_2: {
          score: 12,
          classification: "Autism Spectrum",
          observations: "Qualitative differences in social communication"
        },
        cognitive: {
          score: 110,
          classification: "High Average",
          strengths: "Visual processing, pattern recognition",
          challenges: "Verbal reasoning, social understanding"
        }
      }
    };
    
    Logger.log('[Info] Test data validation:', {
      sections: Object.keys(testData),
      dataPoints: Object.keys(testData).reduce((count, key) => 
        count + Object.keys(testData[key]).length, 0)
    });
    
    // 5. Get comprehensive placeholder mapping
    Logger.log('[Step 5] Preparing placeholder mapping...');
    const placeholderMap = {
      "T001": {
        description: "Technical summary of sensory profile",
        wordCount: 200,
        category: "Technical",
        context: "Clinical assessment section",
        format: "Paragraph with scores"
      },
      "C001": {
        description: "Parent-friendly sensory profile summary",
        wordCount: 150,
        category: "Parent",
        context: "Summary section",
        format: "Bullet points"
      },
      "T002": {
        description: "Technical social communication analysis",
        wordCount: 250,
        category: "Technical",
        context: "Clinical assessment section",
        format: "Paragraph with examples"
      },
      "C002": {
        description: "Parent-friendly social communication summary",
        wordCount: 200,
        category: "Parent",
        context: "Summary section",
        format: "Bullet points"
      }
    };
    
    Logger.log('[Info] Placeholder map validation:', {
      count: Object.keys(placeholderMap).length,
      categories: [...new Set(Object.values(placeholderMap).map(p => p.category))],
      formats: [...new Set(Object.values(placeholderMap).map(p => p.format))]
    });
    
    // 6. Construct production-level prompt
    Logger.log('[Step 6] Constructing test prompt...');
    const systemPrompt = `You are a clinical psychologist writing an autism assessment report.
Your task is to generate content for specific placeholders using structured assessment data.

INPUT FORMAT:
The data includes:
1. Sensory Profile (radar data + observations)
2. Social Communication Profile (radar data + observations)
3. Behavior & Interests Profile (radar data + observations)
4. Milestone Timeline
5. Assessment Results
6. Clinical Observations

WRITING REQUIREMENTS:
1. Generate content for EACH placeholder using appropriate data
2. Use clear, professional language
3. For technical sections (T-series), use clinical terminology
4. For regular sections (C-series), use parent-friendly language
5. Follow specific instructions for each placeholder (bullet vs paragraph)
6. Use "${testData.metadata.child_name}" consistently throughout
7. Focus on patterns rather than scores
8. Use neurodiversity-affirming language

RESPONSE FORMAT:
For each placeholder:
##[PLACEHOLDER_ID]##
[Generated content following specific instructions]
##END##

Add ##GENERATION_COMPLETE## when finished with all placeholders.`;

    const userPrompt = {
      task: "Generate content for autism assessment report placeholders",
      child: testData.metadata,
      assessment_data: testData,
      placeholders: placeholderMap,
      requirements: {
        format: "##PLACEHOLDER_ID##\n[Content]\n##END##",
        style: {
          technical: "Clinical terminology for T-series",
          parent: "Accessible language for C-series"
        },
        perspective: `Use '${testData.metadata.child_name}' consistently`,
        tone: "Neurodiversity-affirming, strength-based",
        evidence: "Reference specific observations and examples"
      }
    };

    // 7. Save prompts and validate
    Logger.log('[Step 7] Saving and validating prompts...');
    const systemPromptDoc = saveDetailedLog('Production_SystemPrompt', systemPrompt, testChataId);
    const userPromptDoc = saveDetailedLog('Production_UserPrompt', JSON.stringify(userPrompt, null, 2), testChataId);
    
    // Log URLs to sheet
    const timestamp = new Date().toISOString();
    logsSheet.insertRowAfter(1);
    logsSheet.getRange(2, 1, 1, 7).setValues([[
      timestamp,
      testChataId,
      'Prompt Generation',
      'System Prompt',
      'Production-level system prompt',
      `Length: ${systemPrompt.length} chars`,
      systemPromptDoc
    ]]);
    
    logsSheet.insertRowAfter(1);
    logsSheet.getRange(2, 1, 1, 7).setValues([[
      timestamp,
      testChataId,
      'Prompt Generation',
      'User Prompt',
      'Production-level user prompt',
      `Length: ${JSON.stringify(userPrompt).length} chars`,
      userPromptDoc
    ]]);
    
    Logger.log('[SUCCESS] Test completed. Generated URLs:', {
      systemPrompt: systemPromptDoc,
      userPrompt: userPromptDoc
    });
    
    return {
      success: true,
      message: 'Production-level prompt generation test completed successfully',
      details: {
        systemPromptUrl: systemPromptDoc,
        userPromptUrl: userPromptDoc,
        systemPromptLength: systemPrompt.length,
        userPromptLength: JSON.stringify(userPrompt).length
      }
    };
    
  } catch (error) {
    Logger.log('[ERROR] Test failed:', {
      message: error.message,
      stack: error.stack
    });
    
    if (logsSheet) {
      const timestamp = new Date().toISOString();
      logsSheet.insertRowAfter(1);
      logsSheet.getRange(2, 1, 1, 6).setValues([[
        timestamp,
        testChataId || 'UNKNOWN',
        'Error',
        'Prompt Generation',
        error.message,
        error.stack
      ]]);
    }
    
    return {
      success: false,
      error: error.message,
      details: {
        stack: error.stack
      }
    };
  }
}

async function testAPIConnection() {
  Logger.log('\n=== Testing Claude API Connection ===');
  const logs = [];
  
  try {
    const ss = getSpreadsheet();
    const logsSheet = initializeLogsSheet(ss);
    const testChataId = PropertiesService.getScriptProperties().getProperty('TEST_CHATA_ID');
    
    logs.push({
      step: 'Initialization',
      state: {
        testChataId: testChataId,
        hasApiKey: !!API_KEY,
        timestamp: new Date().toISOString()
      }
    });
    
    if (!testChataId) {
      const error = 'TEST_CHATA_ID not found in script properties';
      logs.push({
        step: 'Validation',
        error: error,
        state: { scriptProperties: PropertiesService.getScriptProperties().getProperties() }
      });
      throw new Error(error);
    }
    
    if (!API_KEY) {
      const error = 'ANTHROPIC_API_KEY not found in script properties';
      logs.push({
        step: 'Validation',
        error: error,
        state: { hasApiKey: false }
      });
      throw new Error(error);
    }
    
    // Simple test message
    const testMessage = {
      role: 'user',
      content: 'Please respond with "API connection successful" if you receive this message.'
    };
    
    logs.push({
      step: 'Request Preparation',
      state: {
        messageLength: testMessage.content.length,
        timestamp: new Date().toISOString()
      }
    });
    
    Logger.log('[Action] Testing API connection...');
    logToSheet(logsSheet, 'API Test', 'Connection', 'Initiating API test', JSON.stringify({
      status: 'In Progress',
      timestamp: new Date().toISOString(),
      requestDetails: {
        model: CLAUDE_MODEL,
        messageLength: testMessage.content.length
      }
    }), testChataId);
    
    const startTime = new Date();
    const response = await callClaudeAPI([testMessage], 'Test system message', 0.7);
    const endTime = new Date();
    
    logs.push({
      step: 'API Response',
      state: {
        responseLength: response?.length || 0,
        responseTime: endTime - startTime,
        timestamp: endTime.toISOString(),
        success: response?.includes('API connection successful')
      }
    });
    
    if (!response || !response.includes('API connection successful')) {
      const error = 'Unexpected API response format';
      logs.push({
        step: 'Validation',
        error: error,
        state: {
          responsePreview: response?.substring(0, 100),
          expectedPhrase: 'API connection successful',
          actualLength: response?.length
        }
      });
      throw new Error(error);
    }
    
    // Save detailed response log
    const responseDoc = saveDetailedLog('API_Test_Response', JSON.stringify({
      request: testMessage,
      response: response,
      metadata: {
        responseTime: endTime - startTime,
        timestamp: endTime.toISOString(),
        model: CLAUDE_MODEL
      }
    }, null, 2), testChataId);
    
    logToSheet(logsSheet, 'API Test', 'Connection', 'API test completed', JSON.stringify({
      status: 'Success',
      responseTime: endTime - startTime,
      responseLength: response.length,
      detailsUrl: responseDoc
    }), testChataId);
    
    // Log final success state
    logs.push({
      step: 'Completion',
      state: {
        success: true,
        responseTime: endTime - startTime,
        responseSaved: !!responseDoc,
        timestamp: new Date().toISOString()
      }
    });
    
    return {
      success: true,
      message: 'API connection test successful',
      details: {
        response: response,
        responseTime: endTime - startTime,
        responseDoc: responseDoc,
        logs: logs
      }
    };
    
  } catch (error) {
    // Log detailed error state
    logs.push({
      step: 'Error',
      error: {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      },
      state: {
        lastSuccessfulStep: logs[logs.length - 1]?.step,
        errorContext: error.stack?.split('\n')[1]
      }
    });
    
    Logger.log('[ERROR] API connection test failed:', {
      message: error.message,
      context: logs[logs.length - 1],
      stack: error.stack
    });
    
    logToSheet(logsSheet, 'API Test', 'Connection', 'API test failed', JSON.stringify({
      error: error.message,
      stack: error.stack,
      lastSuccessfulStep: logs[logs.length - 1]?.step
    }), testChataId);
    
    return {
      success: false,
      error: error.message,
      details: {
        stack: error.stack,
        logs: logs,
        lastSuccessfulStep: logs[logs.length - 1]?.step
      }
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
  const testLogs = [];
  const results = {
    promptGeneration: null,
    apiConnection: null,
    contentGeneration: null
  };
  
  try {
    // Test prompt generation
    Logger.log('\n[Step 1/3] Testing prompt generation...');
    results.promptGeneration = testPromptGeneration();
    testLogs.push({
      test: 'Prompt Generation',
      result: results.promptGeneration,
      timestamp: new Date().toISOString()
    });
    
    // Test API connection
    Logger.log('\n[Step 2/3] Testing API connection...');
    results.apiConnection = await testAPIConnection();
    testLogs.push({
      test: 'API Connection',
      result: results.apiConnection,
      timestamp: new Date().toISOString()
    });
    
    // Test content generation
    Logger.log('\n[Step 3/3] Testing content generation...');
    results.contentGeneration = await testContentGeneration();
    testLogs.push({
      test: 'Content Generation',
      result: results.contentGeneration,
      timestamp: new Date().toISOString()
    });
    
    // Log detailed results
    Logger.log('\n=== Test Suite Results ===');
    Object.entries(results).forEach(([test, result]) => {
      Logger.log(`[${result.success ? 'PASS' : 'FAIL'}] ${test}:`, {
        success: result.success,
        error: result.error || null,
        details: result.details || {}
      });
    });
    
    // Save comprehensive test report
    const ss = getSpreadsheet();
    const logsSheet = initializeLogsSheet(ss);
    const testChataId = PropertiesService.getScriptProperties().getProperty('TEST_CHATA_ID');
    
    const testReport = {
      timestamp: new Date().toISOString(),
      summary: {
        total: Object.keys(results).length,
        passed: Object.values(results).filter(r => r.success).length,
        failed: Object.values(results).filter(r => !r.success).length
      },
      results: results,
      logs: testLogs
    };
    
    const reportDoc = saveDetailedLog('Test_Suite_Report', JSON.stringify(testReport, null, 2), testChataId);
    
    logToSheet(logsSheet, 'Test Suite', 'All', 'Comprehensive test results', JSON.stringify({
      summary: testReport.summary,
      reportUrl: reportDoc
    }), testChataId);
    
    return {
      success: Object.values(results).every(r => r.success),
      summary: testReport.summary,
      reportUrl: reportDoc,
      results: results,
      logs: testLogs
    };
    
  } catch (error) {
    Logger.log('[ERROR] Test suite failed:', {
      message: error.message,
      stack: error.stack,
      lastTest: testLogs[testLogs.length - 1]?.test
    });
    
    return {
      success: false,
      error: error.message,
      lastCompletedTest: testLogs[testLogs.length - 1]?.test,
      results: results,
      logs: testLogs
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