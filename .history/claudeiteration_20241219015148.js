// API Configuration
const API_KEY = PropertiesService.getScriptProperties().getProperty('ANTHROPIC_API_KEY');
const CLAUDE_MODEL = "claude-3-5-sonnet-20241022";
const ANTHROPIC_VERSION = "2023-06-01";
const SPREADSHEET_ID = '1Ap9HfUWhE-ed1zIMT2QGf02yhZt7wiawKeFkDz8dcnA';
const MAX_TOKENS = 8192;  // Claude 3.5 Sonnet's maximum output tokens
const LOGS_FOLDER_ID = PropertiesService.getScriptProperties().getProperty('1GOFrL5mOdknr8LNgQr0FCM_OiDEvVseI') || '';
const LOGS_FOLDER_URL = 'https://drive.google.com/drive/folders/1GOFrL5mOdknr8LNgQr0FCM_OiDEvVseI';
const MAX_RETRIES = 3;
const CLEANUP_DAYS = 7;

// Cache management
let assessmentDataCache = {};

function clearAssessmentCache() {
  assessmentDataCache = {};
}

function getCachedAssessmentData(ss, chataId) {
  const cache = CacheService.getScriptCache();
  const cacheKey = `assessment_data_${chataId}`;
  
  // Try to get from cache
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    Logger.log('Using cached assessment data for ' + chataId);
    return JSON.parse(cachedData);
  }
  
  // If not in cache, retrieve and cache the data
  Logger.log('Retrieving and caching assessment data for ' + chataId);
  const r1Data = getR1Data(ss, chataId);
  const r2Data = getR2Data(ss, chataId);
  const r3Data = getR3Data(ss, chataId);
  
  const assessmentData = {
    r1: {
      ...r1Data,
      chataId: chataId // Ensure CHATA ID is included in the data
    },
    r2: r2Data,
    r3: r3Data
  };
  
  // Cache for 6 hours (21600 seconds)
  cache.put(cacheKey, JSON.stringify(assessmentData), 21600);
  
  return assessmentData;
}

function getR1Data(ss, chataId) {
  Logger.log('\n--- Getting R1 Data ---');
  const sheet = ss.getSheetByName('CHATA_Data');
  if (!sheet) {
    Logger.log('ERROR: CHATA_Data sheet not found');
    return null;
  }
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  const chataIdIndex = headers.indexOf('CHATA_ID');
  if (chataIdIndex === -1) {
    Logger.log('ERROR: CHATA_ID column not found');
    return null;
  }
  
  const row = data.find(row => row[chataIdIndex].toString() === chataId.toString());
  if (!row) {
    Logger.log('ERROR: No data found for CHATA ID:', chataId);
    return null;
  }

  const getValue = (columnName) => {
    const index = headers.indexOf(columnName);
    if (index === -1) {
      Logger.log(`Column not found: ${columnName}`);
      return null;
    }
    return row[index];
  };

  return {
    title: "R1 Assessment (Parent Questionnaire)",
    scores: {
      total: getValue('Total_Score/100'),
      severity: getValue('Severity_Indicator'),
      social_communication: getValue('Social_Communication_Score/25'),
      rrb: getValue('RRB_Score/25'),
      sensory: getValue('Sensory_Sensitivities_Score/25'),
      developmental_history: getValue('Developmental_History_Score/25')
    },
    dimensions: {
      social_communication: {
        total: getValue('Social_Communication_Score/25'),
        sub_dimensions: {
          joint_attention: getValue('SC_Joint_Attention/10'),
          social_reciprocity: getValue('SC_Social_Reciprocity/10'),
          nonverbal_communication: getValue('SC_Nonverbal_Communication/10')
        }
      },
      rrb: {
        total: getValue('RRB_Score/25'),
        sub_dimensions: {
          stereotyped_behaviors: getValue('RRB_Stereotyped_Behaviors/10'),
          insistence_on_sameness: getValue('RRB_Insistence_on_Sameness/10'),
          restricted_interests: getValue('RRB_Restricted_Interests/10')
        }
      },
      sensory: {
        total: getValue('Sensory_Sensitivities_Score/25'),
        sub_dimensions: {
          hyper_reactivity: getValue('Sensory_Hyper_Reactivity/10'),
          hypo_reactivity: getValue('Sensory_Hypo_Reactivity/10'),
          unusual_interests: getValue('Sensory_Unusual_Interests/10')
        }
      },
      developmental_history: {
        total: getValue('Developmental_History_Score/25'),
        sub_dimensions: {
          language: getValue('DH_Language_Development/10'),
          motor: getValue('DH_Motor_Skills/10'),
          cognitive: getValue('DH_Cognitive_Abilities/10')
        }
      }
    },
    notes: {
      parent_concerns: getValue('Parent_Concerns'),
      clinician_notes: getValue('Clinician_Notes')
    }
  };
}

function getR2Data(ss, chataId) {
  Logger.log('\n--- Getting R2 Data ---');
  const sheet = ss.getSheetByName('ADOS_Data');
  if (!sheet) {
    Logger.log('ERROR: ADOS_Data sheet not found');
    return null;
  }
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  const chataIdIndex = headers.indexOf('CHATA_ID');
  if (chataIdIndex === -1) {
    Logger.log('ERROR: CHATA_ID column not found');
    return null;
  }
  
  const row = data.find(row => row[chataIdIndex].toString() === chataId.toString());
  if (!row) {
    Logger.log('ERROR: No data found for CHATA ID:', chataId);
    return null;
  }

  const getValue = (columnName) => {
    const index = headers.indexOf(columnName);
    if (index === -1) {
      Logger.log(`Column not found: ${columnName}`);
      return null;
    }
    return row[index];
  };

  return {
    title: "R2 Assessment (ADOS Observation)",
    scores: {
      total: getValue('ADOS_Total_Score/21'),
      ados_percent: getValue('ADOS_Percent')
    },
    dimensions: {
      social_communication: {
        sub_dimensions: {
          social_speech: getValue('ADOS_Social_Speech/3'),
          eye_contact: getValue('ADOS_Eye_Contact/3'),
          gesture_use: getValue('ADOS_Gesture_Use/3')
        }
      },
      rrb: {
        sub_dimensions: {
          repetitive_play: getValue('ADOS_Repetitive_Play/3'),
          repetitive_movements: getValue('ADOS_Repetitive_Movements/3')
        }
      },
      sensory: {
        sub_dimensions: {
          sensory_exploration: getValue('ADOS_Sensory_Exploration/3')
        }
      }
    },
    clinical_notes: getValue('Clinician_Notes'),
    diagnostic_impression: getValue('ADOS_Diagnostic_Impression')
  };
}

function getR3Data(ss, chataId) {
  Logger.log('\n--- Getting R3 Data ---');
  const sheet = ss.getSheetByName('R3_Form');
  if (!sheet) {
    Logger.log('ERROR: R3_Form sheet not found');
    return null;
  }
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  const chataIdIndex = headers.indexOf('chata_id');
  if (chataIdIndex === -1) {
    Logger.log('ERROR: chata_id column not found');
    return null;
  }
  
  const row = data.find(row => row[chataIdIndex].toString() === chataId.toString());
  if (!row) {
    Logger.log('ERROR: No data found for CHATA ID:', chataId);
    return null;
  }

  const getValue = (columnName) => {
    const index = headers.indexOf(columnName);
    if (index === -1) {
      Logger.log(`Column not found: ${columnName}`);
      return null;
    }
    return row[index];
  };

  const cleanText = (text) => {
    if (!text) return "";
    return text
      .replace(/[X]+$/gm, "") // Remove trailing X's
      .replace(/• -/g, "•") // Standardize bullet points
      .replace(/\n+/g, "\n") // Remove extra newlines
      .trim();
  };

  return {
    clinical_observations: cleanText(getValue('observations')),
    strengths: cleanText(getValue('strengths')),
    support_areas: cleanText(getValue('supportareas')),
    recommendations: cleanText(getValue('recommendations')),
    referrals: cleanText(getValue('referrals'))
  };
}

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
      
      // Log usage information
      if (result.usage) {
        Logger.log('Token Usage:', JSON.stringify(result.usage));
      }
      
      return result.content[0].text;

    } catch (error) {
      lastError = error;
      
      // If it's the last attempt, throw the error
      if (attempt === maxRetries - 1) {
        throw lastError;
      }
      
      // For other errors, retry with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      Logger.log(`Error on attempt ${attempt + 1}/${maxRetries}. Retrying in ${delay/1000} seconds...`);
      Logger.log('Error details:', error.message);
      Utilities.sleep(delay);
    }
  }

  throw lastError;
}

async function handleFirstPassResponse(response, sections, assessmentData) {
  Logger.log('\n--- Handling First Pass Response ---');
  
  const allRequired = getAllRequiredPlaceholderIds();
  Logger.log(`Total placeholders to process: ${allRequired.length}`);
  
  let processedResponse = '';
  let currentBatchStart = 0;
  const BATCH_SIZE = 10;
  let attempts = 0;
  const MAX_ATTEMPTS = 5;
  
  // Create initial document and keep it open
  const timestamp = Utilities.formatDate(new Date(), "Asia/Kolkata", "yyyy-MM-dd_HH-mm-ss");
  const chataId = assessmentData?.r1?.chataId || PropertiesService.getScriptProperties().getProperty('TEST_CHATA_ID') || 'CHATA_PENDING';
  const docName = `${chataId}_FirstPass_${timestamp}`;
  const folder = initializeLogsFolder();
  let doc = DocumentApp.create(docName);
  let body = doc.getBody();
  const file = DriveApp.getFileById(doc.getId());
  file.moveTo(folder);
  Logger.log(`Created document for batched responses: ${file.getUrl()}`);
  
  try {
    while (currentBatchStart < allRequired.length && attempts < MAX_ATTEMPTS) {
      const currentBatch = allRequired.slice(currentBatchStart, currentBatchStart + BATCH_SIZE);
      const isFinalBatch = currentBatchStart + BATCH_SIZE >= allRequired.length;
      
      Logger.log(`\nProcessing batch ${Math.floor(currentBatchStart/BATCH_SIZE) + 1} of ${Math.ceil(allRequired.length/BATCH_SIZE)}`);
      Logger.log(`Current batch placeholders: ${currentBatch.join(', ')}`);
      Logger.log(`Is final batch: ${isFinalBatch}`);
      
      // Create batch-specific prompt
      const batchPrompt = [{
        role: "user",
        content: currentBatchStart === 0 ? 
          // First batch prompt
          `Generate detailed content for these ${currentBatch.length} placeholders: ${currentBatch.join(', ')}

Assessment Data:
${JSON.stringify(assessmentData, null, 2)}

Use the exact format:
##PLACEHOLDER_ID##
[Detailed content with specific examples and observations]
##END##

Requirements:
1. Generate content ONLY for the listed placeholders
2. Provide detailed, well-developed content for each placeholder
3. Maintain consistent professional tone
4. Use specific examples from the assessment data

Add ##BATCHCOMPLETE## when this batch is done.
Add ##TASKCOMPLETE## only if this is the final batch (batch ${Math.floor(currentBatchStart/BATCH_SIZE) + 1} of ${Math.ceil(allRequired.length/BATCH_SIZE)}).` :
          // Continuation prompt
          `Continue generating content for the next ${currentBatch.length} placeholders: ${currentBatch.join(', ')}

Previous content for context:
${processedResponse}

Assessment Data:
${JSON.stringify(assessmentData, null, 2)}

Use the exact format:
##PLACEHOLDER_ID##
[Detailed content with specific examples and observations]
##END##

Requirements:
1. Generate content ONLY for these new placeholders: ${currentBatch.join(', ')}
2. Provide detailed, well-developed content
3. Maintain consistent professional tone
4. Use specific examples from the assessment data

Add ##BATCHCOMPLETE## when this batch is done.
Add ##TASKCOMPLETE## only if this is the final batch (batch ${Math.floor(currentBatchStart/BATCH_SIZE) + 1} of ${Math.ceil(allRequired.length/BATCH_SIZE)}).`
      }];

      try {
        Logger.log('Making batch API call...');
        const batchResponse = await callClaudeAPI(
          batchPrompt,
          getFirstPassSystemPrompt(currentBatch, isFinalBatch),
          0.7
        );
        
        Logger.log('Received batch response, validating...');
        Logger.log(`Response includes ##BATCHCOMPLETE##: ${batchResponse.includes('##BATCHCOMPLETE##')}`);
        
        // Extract and validate placeholders in response
        const batchIds = extractPlaceholderIds(batchResponse);
        Logger.log(`Found placeholders in response: ${batchIds.join(', ')}`);
        
        // Validate batch response
        if (!batchResponse.includes('##BATCHCOMPLETE##')) {
          Logger.log('Batch response incomplete (missing ##BATCHCOMPLETE##), retrying...');
          attempts++;
          continue;
        }
        
        const missingFromBatch = currentBatch.filter(id => !batchIds.includes(id));
        if (missingFromBatch.length > 0) {
          Logger.log(`Missing placeholders in batch: ${missingFromBatch.join(', ')}`);
          attempts++;
          continue;
        }
        
        // Store response and append to document
        processedResponse += '\n\n' + batchResponse;
        body.appendParagraph(batchResponse);
        doc.saveAndClose();
        doc = DocumentApp.openById(doc.getId());
        body = doc.getBody();
        
        // Check if all placeholders are complete
        if (batchResponse.includes('##TASKCOMPLETE##')) {
          Logger.log('All placeholders completed successfully');
          
          // Add Final section header
          body.appendParagraph('\n=== FINAL RESPONSE ===\n');
          
          doc.saveAndClose();
          return {
            content: processedResponse,
            docUrl: file.getUrl()
          };
        }
        
        // Move to next batch
        currentBatchStart += BATCH_SIZE;
        attempts = 0; // Reset attempts for next batch
        
      } catch (error) {
        Logger.log(`Batch attempt ${attempts + 1} failed: ${error.message}`);
        Logger.log(`Error details: ${error.stack}`);
        attempts++;
        
        if (attempts === MAX_ATTEMPTS) {
          throw new Error(`Failed to complete batch after ${MAX_ATTEMPTS} attempts. Last error: ${error.message}`);
        }
      }
    }
    
    // Final save and close
    doc.saveAndClose();
    return {
      content: processedResponse,
      docUrl: file.getUrl()
    };
    
  } catch (error) {
    // Ensure document is closed if there's an error
    try {
      doc.saveAndClose();
    } catch (closeError) {
      Logger.log('Error closing document:', closeError.message);
    }
    throw error;
  }
}

// Update the system prompt to handle batched processing
function getFirstPassSystemPrompt(currentBatch, isFinalBatch) {
  return `You are a clinical psychologist writing an autism assessment report.
Your task is to generate detailed content for these specific placeholders: ${currentBatch.join(', ')}

CRITICAL REQUIREMENTS:
1. Generate content for EACH placeholder in the list AFTER reading the assessment data and template context. Template cotext defines how the placeholders are being used.
2. Use clear, professional language
3. Base content on assessment data
4. Use generics like "your child" instead of specifics like name or gender
5. Include specific examples and observations, use assessment data to interpret. R1 data should be reported as "parent reported CHATA questionnaire" and R2 or R3 data as "clinical observations from virtual ADOS"
4. Ensure content fits naturally in context:
   - If placeholder is mid-sentence, content must flow grammatically
   - Avoid standalone paragraphs/stences where content of the placeholder would be part of a sentence
   - Example: For "John displayed {{C026}}. These strengths..."
     GOOD: "John displayed exceptional pattern recognition and strong memory skills"
     BAD: "John displayed Your child demonstrated exceptional pattern recognition. They have strong memory skills."

DO NOT:
- Skip any placeholders or create new placeholders in generated content
- Utilize scores or points directly in generated content
- Use deficit-based language
- Mention scores directly
- Use technical jargon
- Make assumptions without evidence
- Break sentence flow for midsentence placeholders by generating complete sentence content

Add ##BATCHCOMPLETE## when all placeholders in this batch are completed.
${isFinalBatch ? 'This is the final batch, add ##TASKCOMPLETE## after ##BATCHCOMPLETE##.' : 'This is not the final batch, do not add ##TASKCOMPLETE##.'}`;
}

function createFirstPassPrompt(sections, assessmentData, ss) {
  Logger.log('\n=== Creating First Pass Prompt ===');
  
  const firstBatch = getAllRequiredPlaceholderIds().slice(0, 10);
  
  const systemPrompt = getFirstPassSystemPrompt(firstBatch);

  const messages = [{
    role: "user",
    content: `Generate detailed content for the first ${firstBatch.length} placeholders: ${firstBatch.join(', ')}

Assessment Data:
${JSON.stringify(assessmentData, null, 2)}

Template Context:
${getSectionContentsFromG55(ss)}

Required Format Example:
##C001##
Your child demonstrates a unique style of social interaction, characterized by [specific examples from assessment]...
##END##

Generate thorough content for these placeholders and add ##BATCHCOMPLETE## when done.`
  }];

  return {
    systemPrompt,
    messages
  };
}

function createSecondPassPrompt(firstPassContent, assessmentData) {
  Logger.log('\n--- Creating Second Pass Prompt ---');

  const systemPrompt = `You are a senior clinical psychologist reviewing an autism assessment report.
Your task is to identify content that needs revision and propose improvements.

CRITICAL REQUIREMENTS:
1. Revise content for EACH placeholder in the list after reading the assessment data and template context. Template cotext defines how the placeholders are being used. Identify mid-sentence placeholders from here.
1. Review all placeholders for:
   - Clinical accuracy
   - Professional language
   - Evidence-based support (most relevant data is used at the right place, all data is utilized somewhere, no data is overused at too many places)
   - Neurodiversity-affirming language
   - Sensitivity and clarity
   - Grammatical fit within surrounding text
  

2. Use this format for revisions:
   ##REVISE_[PLACEHOLDER_ID]##
   [Improved content]
   ##END##

3. Only revise where significant improvements can be made

4. Ensure content fits naturally in context:
   - If placeholder is mid-sentence, content must flow grammatically
   - Avoid standalone paragraphs where content should be part of a sentence
   - Example: For "John displayed {{C026}}. These strengths..."
     GOOD: "John displayed exceptional pattern recognition and strong memory skills"
     BAD: "John displayed Your child demonstrated exceptional pattern recognition. They have strong memory skills."

DO NOT:
- Revise content that is already accurate and clear
- Change the meaning of clinical observations
- Remove important assessment details
- Use deficit-based language
- Break sentence flow for midsentence placeholders by generating complete sentence content

Add ##REVISIONS_COMPLETE## when finished reviewing all content.`;

  const messages = [{
    role: "user",
    content: `Review this assessment report and propose revisions where needed.

Assessment Data:
${JSON.stringify(assessmentData, null, 2)}

Current Report Content:
${firstPassContent}

Requirements:
1. Review all placeholders thoroughly
2. Identify content needing improvement
3. Propose revisions using:
   ##REVISE_[PLACEHOLDER_ID]##
   [Improved content]
   ##END##
4. Focus on:
   - Clinical accuracy
   - Professional language
   - Evidence-based support
   - Neurodiversity-affirming language
   - Sensitivity and clarity
   - Grammatical fit within surrounding text

Only propose revisions where significant improvements can be made.
Add ##REVISIONS_COMPLETE## when finished.`
  }];

  Logger.log('Created second pass revision prompt');
  return {
    systemPrompt,
    messages
  };
}

// Add new validation functions
function validateFirstPassResponse(response) {
  Logger.log('\n--- Validating First Pass Response ---');
  
  const validationResults = {
    errors: [],
    warnings: [],
    success: false,
    rawResponse: response // Store raw response for debugging
  };

  if (!response) {
    validationResults.errors.push('Empty response received');
    return validationResults;
  }

  // Log raw response for debugging
  Logger.log('Raw response preview:', response.substring(0, 500));
  
  try {
    // Parse JSON response
    let parsedResponse;
    try {
      parsedResponse = typeof response === 'string' ? JSON.parse(response) : response;
      Logger.log('Successfully parsed JSON');
    } catch (e) {
      validationResults.errors.push(`JSON parsing failed: ${e.message}`);
      // Log the response that failed to parse
      Logger.log('Failed to parse response:', response);
      return validationResults;
    }

    // Check structure
    if (!parsedResponse.placeholders || !Array.isArray(parsedResponse.placeholders)) {
      validationResults.errors.push('Missing or invalid placeholders array');
      Logger.log('Invalid response structure:', JSON.stringify(parsedResponse, null, 2));
      return validationResults;
    }

    // Get completed placeholders
    const completedIds = parsedResponse.placeholders.map(p => p.id);
    Logger.log(`Found ${completedIds.length} placeholders: ${completedIds.join(', ')}`);

    // Check required placeholders
    const allRequired = getAllRequiredPlaceholderIds();
    const missingIds = allRequired.filter(id => !completedIds.includes(id));
    if (missingIds.length > 0) {
      validationResults.errors.push(`Missing ${missingIds.length} placeholders: ${missingIds.join(', ')}`);
    }

    // Check content
    parsedResponse.placeholders.forEach(p => {
      if (!p.content || p.content.length < 10) {
        validationResults.warnings.push(`Placeholder ${p.id} has very short content`);
      }
      if (p.content.includes('score') || p.content.includes('points')) {
        validationResults.warnings.push(`Placeholder ${p.id} may contain score references`);
      }
    });

    // Check success signals
    if (!response.includes('##TASKCOMPLETE##')) {
      validationResults.warnings.push('Missing ##TASKCOMPLETE## signal');
    }
    if (!response.includes('##FIRSTPASS_SUCCESS##')) {
      validationResults.warnings.push('Missing ##FIRSTPASS_SUCCESS## signal');
    }

    // Set success if no errors (warnings are okay)
    validationResults.success = validationResults.errors.length === 0;

    // Log validation results
    Logger.log('Validation Results:', JSON.stringify(validationResults, null, 2));

    return validationResults;

  } catch (error) {
    validationResults.errors.push(`Validation error: ${error.message}`);
    Logger.log('Validation failed:', error.stack);
    return validationResults;
  }
}

function validateSecondPassResponse(response, firstPassContent) {
  Logger.log('\n--- Validating Second Pass Response ---');
  
  const validationResults = {
    errors: [],
    warnings: [],
    success: false
  };

  if (!response) {
    validationResults.errors.push('Empty response received');
    return validationResults;
  }

  try {
    // Check success signals
    if (!response.includes('##TASKCOMPLETE##')) {
      validationResults.warnings.push('Missing ##TASKCOMPLETE## signal');
    }
    if (!response.includes('##SECONDPASS_SUCCESS##')) {
      validationResults.warnings.push('Missing ##SECONDPASS_SUCCESS## signal');
    }

    // Extract placeholders from both responses
    const firstPassIds = extractPlaceholderIds(firstPassContent);
    const secondPassIds = extractPlaceholderIds(response);

    // Check for missing placeholders
    const missingIds = firstPassIds.filter(id => !secondPassIds.includes(id));
    if (missingIds.length > 0) {
      validationResults.errors.push(`Second pass missing placeholders: ${missingIds.join(', ')}`);
    }

    // Check content quality
    secondPassIds.forEach(id => {
      const content = extractPlaceholderContent(response, id);
      if (!content || content.length < 10) {
        validationResults.warnings.push(`Placeholder ${id} has very short content`);
      }
      
      // Compare with first pass
      const firstPassContent = extractPlaceholderContent(firstPassContent, id);
      if (firstPassContent && calculateSimilarity(content, firstPassContent) > 0.9) {
        validationResults.warnings.push(`Placeholder ${id} is too similar to first pass`);
      }
    });

    // Set success if no errors (warnings are okay)
    validationResults.success = validationResults.errors.length === 0;

    return validationResults;
  } catch (error) {
    validationResults.errors.push(`Validation error: ${error.message}`);
    return validationResults;
  }
}

// Add helper functions for score interpretation
function interpretR1Score(domain, score) {
  const interpretations = {
    social_communication: {
      ranges: [
        { max: 8, desc: "Minimal differences in social communication" },
        { max: 16, desc: "Moderate differences in social communication" },
        { max: 25, desc: "Significant differences in social communication" }
      ]
    },
    rrb: {
      ranges: [
        { max: 8, desc: "Few repetitive behaviors or restricted interests" },
        { max: 16, desc: "Moderate presence of repetitive behaviors" },
        { max: 25, desc: "Significant repetitive behaviors and interests" }
      ]
    },
    sensory: {
      ranges: [
        { max: 8, desc: "Minimal sensory differences" },
        { max: 16, desc: "Moderate sensory differences" },
        { max: 25, desc: "Significant sensory differences" }
      ]
    },
    total: {
      ranges: [
        { max: 30, desc: "Minimal differences overall" },
        { max: 60, desc: "Moderate differences overall" },
        { max: 100, desc: "Significant differences overall" }
      ]
    }
  };

  const ranges = interpretations[domain]?.ranges;
  if (!ranges) return "Interpretation not available";

  for (const range of ranges) {
    if (score <= range.max) return range.desc;
  }
  return "Score exceeds expected range";
}

function interpretADOSScore(domain, score) {
  const interpretations = {
    social_speech: [
      "Typical range of social speech and communication",
      "Mild differences in social speech",
      "Moderate differences in social speech",
      "Marked differences in social speech"
    ],
    eye_contact: [
      "Typical range of eye contact",
      "Mild differences in eye contact",
      "Moderate differences in eye contact",
      "Marked differences in eye contact"
    ],
    gesture_use: [
      "Typical use of gestures",
      "Mild differences in gesture use",
      "Moderate differences in gesture use",
      "Marked differences in gesture use"
    ]
  };

  return interpretations[domain]?.[score] || "Score interpretation not available";
}

function getSourcesForPlaceholder(id) {
  const sourceMap = {
    C001: ["R1.social_communication", "R2.social_speech", "R3.observations"],
    C016: ["R3.strengths", "R2.Clinician_Notes"],
    // Add more mappings as needed
  };
  return sourceMap[id] || [];
}

// Add new function for chunked processing
function createChunkedPrompts(sections, assessmentData, chunkSize = 5) {
  const allPlaceholders = Object.values(sections).reduce((acc, section) => {
    if (section.placeholders && Array.isArray(section.placeholders)) {
      return [...acc, ...section.placeholders];
    }
    return acc;
  }, []);

  // Split placeholders into chunks
  const chunks = [];
  for (let i = 0; i < allPlaceholders.length; i += chunkSize) {
    chunks.push(allPlaceholders.slice(i, i + chunkSize));
  }

  // Create prompts for each chunk
  return chunks.map((chunk, index) => {
    const chunkPrompt = {
      systemPrompt: `You are a clinical psychologist at an NHS clinic in London, specializing in autism assessment reports.
Processing chunk ${index + 1} of ${chunks.length}.`,
      messages: [{
        role: "user",
        content: JSON.stringify({
          task: "Generate content for this chunk of placeholders",
          placeholders: chunk.map(p => ({
            id: p.id,
            placeholder_purpose: p.purpose,
            section_info: p.section_info,
            custom_prompt: p.custom_prompt || '',
            word_count: p.word_count
          })),
          assessment_data: assessmentData,
          chunk_info: {
            current: index + 1,
            total: chunks.length
          },
          output_format: `For each placeholder:
##PLACEHOLDER_ID##
[Content that fits grammatically and contextually]
##END##`
        })
      }]
    };

    // Log estimated tokens for this chunk
    const promptJson = JSON.stringify(chunkPrompt.messages[0].content);
    const estimatedTokens = Math.ceil(promptJson.length / 3);
    Logger.log(`Chunk ${index + 1} estimated tokens: ${estimatedTokens}`);

    return chunkPrompt;
  });
}

// Add new function for managing chunked API calls
async function processChunkedPrompts(chunks) {
  const responses = [];
  
  for (let i = 0; i < chunks.length; i++) {
    Logger.log(`Processing chunk ${i + 1} of ${chunks.length}`);
    
    try {
      const response = await callClaudeAPI(
        chunks[i].messages,
        chunks[i].systemPrompt,
        0.7
      );
      responses.push(response);
      
      // Add brief delay between chunks
      if (i < chunks.length - 1) {
        await Utilities.sleep(1000);
      }
    } catch (error) {
      Logger.log(`Error processing chunk ${i + 1}: ${error.message}`);
      throw error;
    }
  }
  
  // Combine all responses
  return responses.join('\n\n');
}

// Add token counting function
async function countTokens(messages, systemPrompt = null) {
  const url = 'https://api.anthropic.com/v1/messages/count_tokens';
  
  const options = {
    method: 'post',
    headers: {
      'x-api-key': API_KEY,
      'anthropic-version': ANTHROPIC_VERSION,
      'content-type': 'application/json'
    },
    payload: JSON.stringify({
      model: CLAUDE_MODEL,
      messages: messages,
      system: systemPrompt
    }),
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(url, options);
  const result = JSON.parse(response.getContentText());
  return result.input_tokens;
}

function processSection(row, headers) {
  try {
    const sectionInfo = row[headers.indexOf('Section in Template')];
    if (!sectionInfo) {
      return null;
    }

    const placeholderText = row[headers.indexOf('Placeholders')];
    // Only process if it's an LLM placeholder
    if (!placeholderText || !placeholderText.includes('LLM_GENERATE')) {
      return null;
    }

    // Create section object
    const section = {
      number: sectionInfo.split(':')[0].trim(),
      name: sectionInfo.split(':')[1]?.trim() || '',
      content: row[headers.indexOf('Section Content')] || '',
      customPrompt: row[headers.indexOf('Custom Prompt')] || '',
      placeholders: []
    };

    // Enhanced placeholder object - simplified
    const placeholder = {
      id: row[headers.indexOf('ID')],
      purpose: placeholderText
        .replace('{LLM_GENERATE:', '')
        .replace('}', '')
        .replace(/\s+/g, ' ')
        .trim(),
      section_info: sectionInfo,
      custom_prompt: row[headers.indexOf('Custom Prompt')] || '',
      word_count: row[headers.indexOf('Word Count')] || ''
    };

    section.placeholders.push(placeholder);
    return section;
  } catch (error) {
    Logger.log('Error in processSection:', error.message);
    return null;
  }
}

function getSectionContentsFromG55(ss) {
  if (!ss) {
    Logger.log('ERROR: No spreadsheet object provided');
    throw new Error('No spreadsheet object provided to getSectionContentsFromG55');
  }

  try {
    const sheet = ss.getSheetByName('R3_Data Mapping');
    if (!sheet) {
      Logger.log('ERROR: R3_Data Mapping sheet not found');
      throw new Error('R3_Data Mapping sheet not found');
    }
    
    const range = sheet.getRange('G55');
    if (!range) {
      Logger.log('ERROR: Could not access cell G55');
      throw new Error('Could not access cell G55');
    }

    const sectionContents = range.getValue();
    
    if (!sectionContents) {
      Logger.log('WARNING: Empty content in G55');
      return '';
    }
    
    Logger.log('Retrieved section content from G55:', 
      `Length: ${sectionContents.length}, ` +
      `Preview: ${sectionContents.substring(0, 100)}...`
    );
    
    return sectionContents;
  } catch (error) {
    Logger.log('Error getting section contents:', error.message);
    Logger.log('Stack trace:', error.stack);
    throw error;
  }
}

function initializeLogsSheet(ss) {
  let logsSheet = ss.getSheetByName('API_Logs');
  const headers = [
    'Timestamp (IST)', 
    'CHATA_ID',
    'Operation', 
    'Content',
    'Status/Details'
  ];
  
  // Create sheet if it doesn't exist
  if (!logsSheet) {
    Logger.log('Creating new API_Logs sheet');
    logsSheet = ss.insertSheet('API_Logs');
    // Set up headers for new sheet
    logsSheet.getRange('A1:E1').setValues([headers]);
    logsSheet.getRange('A1:E1')
      .setBackground('#4a86e8')
      .setFontColor('white')
      .setFontWeight('bold');
  } else {
    // For existing sheet, check and update headers if needed
    const currentHeaders = logsSheet.getRange('A1:E1').getValues()[0];
    const needsHeaderUpdate = headers.some((header, index) => header !== currentHeaders[index]);
    
    if (needsHeaderUpdate) {
      Logger.log('Updating API_Logs headers to maintain consistency');
      logsSheet.getRange('A1:E1').setValues([headers]);
      logsSheet.getRange('A1:E1')
        .setBackground('#4a86e8')
        .setFontColor('white')
        .setFontWeight('bold');
    }
  }
  
  // Always ensure correct column widths
  logsSheet.setColumnWidth(1, 180); // Timestamp
  logsSheet.setColumnWidth(2, 120); // CHATA_ID
  logsSheet.setColumnWidth(3, 150); // Operation
  logsSheet.setColumnWidth(4, 500); // Content
  logsSheet.setColumnWidth(5, 250); // Status/Details
  
  // Always ensure frozen header row
  logsSheet.setFrozenRows(1);
  
  // Add/update folder link to sheet
  const note = `API Logs\nDocs are saved in: ${LOGS_FOLDER_URL}`;
  logsSheet.getRange('A1').setNote(note);
  
  return logsSheet;
}

function logToSheet(sheet, operation, section, details, content, chataId) {
  const istTime = Utilities.formatDate(new Date(), "Asia/Kolkata", "yyyy-MM-dd HH:mm:ss");
  
  let contentToLog = content;
  let statusDetails = details;
  let documentUrl = '';
  
  // Always save API prompts and responses to docs
  if (operation.includes('Prompt') || operation.includes('Response')) {
    try {
      const folder = initializeLogsFolder();
      if (folder) {
        const timestamp = Utilities.formatDate(new Date(), "Asia/Kolkata", "yyyy-MM-dd_HH-mm-ss");
        const docName = `${chataId}_${operation}_${timestamp}`;
        Logger.log(`Creating document: ${docName} in folder ${folder.getName()}`);
        
        const doc = DocumentApp.create(docName);
        const body = doc.getBody();
        body.setText(content);
        doc.saveAndClose();
        
        // Move doc to logs folder
        const file = DriveApp.getFileById(doc.getId());
        file.moveTo(folder);
        documentUrl = file.getUrl();
        Logger.log(`Document created and moved: ${documentUrl}`);
        
        // For responses, set content to "Final Response" and put URL in Status/Details
        if (operation.includes('Response')) {
          contentToLog = 'Final Response';
          statusDetails = documentUrl;
        } else {
          // For prompts, keep content as is and put URL in Status/Details
          statusDetails = documentUrl;
        }
      }
    } catch (error) {
      Logger.log(`ERROR creating document: ${error.message}`);
      contentToLog = content.substring(0, 45000) + '... [Content truncated]';
      statusDetails = `Error: ${error.message}`;
    }
  }
  
  // Log to spreadsheet with CHATA_ID in correct position
  const row = [istTime, chataId, operation, contentToLog, statusDetails];
  const nextRow = sheet.getLastRow() + 1;
  const range = sheet.getRange(nextRow, 1, 1, 5);
  range.setValues([row]);
  range.setWrap(true);
  
  // Color coding
  const colors = {
    'First Pass Prompt': '#e6f3ff',
    'First Pass Response': '#f3ffe6',
    'Second Pass Prompt': '#fff2e6',
    'Second Pass Response': '#e6fff2',
    'Error': '#ffe6e6'
  };
  
  if (colors[operation]) {
    range.setBackground(colors[operation]);
  }
  
  Logger.log(`Logged operation "${operation}" for CHATA_ID: ${chataId}`);
  return documentUrl;
}

function updateSheet(ss, placeholderId, prompt, response) {
  Logger.log('\n--- Updating Sheet for ' + placeholderId + ' ---');
  
  const sheet = ss.getSheetByName('R3_Data Mapping');
  if (!sheet) {
    Logger.log('ERROR: R3_Data Mapping sheet not found');
    return;
  }
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  // Find column indices
  const idIndex = headers.indexOf('ID');
  const promptIndex = headers.indexOf('Prompt4LLM');
  const responseIndex = headers.indexOf('LLMresponse');
  
  Logger.log('Headers:', headers.join(', '));
  Logger.log('Updating row ' + (data.findIndex(row => row[idIndex] === placeholderId) + 1) + 
             ', columns: Prompt4LLM(' + promptIndex + '), LLMresponse(' + responseIndex + ')');
  
  // Find the row with matching placeholder ID
  const rowIndex = data.findIndex(row => row[idIndex] === placeholderId);
  if (rowIndex === -1) {
    Logger.log('ERROR: Row not found for placeholder ID: ' + placeholderId);
    return;
  }
  
  // Update the cells
  sheet.getRange(rowIndex + 1, promptIndex + 1).setValue(JSON.stringify(prompt));
  sheet.getRange(rowIndex + 1, responseIndex + 1).setValue(response);
  
  Logger.log('Sheet updated successfully');
}

async function processPlaceholders(ss, mappingData, headers, chataId) {
  let logsSheet;
  try {
    logsSheet = initializeLogsSheet(ss);
    Logger.log('Initialized logs sheet');

    // Create sections object first
    const sections = {};
    mappingData.forEach((row, index) => {
      if (index === 0) return;
      const section = processSection(row, headers);
      if (section) {
        if (!sections[section.number]) {
          sections[section.number] = section;
        } else {
          sections[section.number].placeholders = [
            ...(sections[section.number].placeholders || []),
            ...(section.placeholders || [])
          ];
        }
      }
    });

    Logger.log(`Processed ${Object.keys(sections).length} sections`);

    // Get assessment data
    const assessmentData = getCachedAssessmentData(ss, chataId);
    if (!assessmentData) {
      throw new Error('Failed to retrieve assessment data');
    }

    // First Pass
    const firstPassPromptData = createFirstPassPrompt(sections, assessmentData, ss);
    const tokenCount = await countTokens(firstPassPromptData.messages, firstPassPromptData.systemPrompt);
    Logger.log(`First pass token count: ${tokenCount}`);

    // Log initial prompt
    logToSheet(logsSheet, 'First Pass Prompt', 'All', 'Initial Prompt Structure', JSON.stringify(firstPassPromptData, null, 2), chataId);

    // Process first pass in batches
    Logger.log('\n=== Starting First Pass Batch Processing ===');
    const firstPassResult = await handleFirstPassResponse(
      firstPassPromptData.messages[0].content,
      sections,
      assessmentData
    );

    // Log completion of first pass
    logToSheet(logsSheet, 'First Pass Response', 'All', 'Batched Processing Complete', `Document URL: ${firstPassResult.docUrl}`, chataId);

    // Create second pass prompt with the complete first pass content
    const secondPassPromptData = createSecondPassPrompt(firstPassResult.content, assessmentData);
    Logger.log('Created second pass prompt');

    const secondPassTokenCount = await countTokens(secondPassPromptData.messages, secondPassPromptData.systemPrompt);
    Logger.log(`Second pass token count: ${secondPassTokenCount}`);

    // Log second pass prompt
    logToSheet(logsSheet, 'Second Pass Prompt', 'All', 'Prompt Structure', JSON.stringify(secondPassPromptData, null, 2), chataId);

    // Make second pass API call
    const secondPassResponse = await callClaudeAPI(
      secondPassPromptData.messages,
      secondPassPromptData.systemPrompt,
      0.3
    );

    // Handle second pass response
    const processedSecondPass = await handleSecondPassResponse(
      secondPassResponse,
      firstPassResult,
      assessmentData
    );

    // Save final response
    const secondResponseDocUrl = logToSheet(
      logsSheet,
      'Second Pass Response',
      'All',
      'Final Response',
      processedSecondPass.content,
      chataId
    );

    return {
      success: true,
      message: 'API processing completed successfully',
      firstPassUrl: firstPassResult.docUrl,
      secondPassUrl: secondResponseDocUrl
    };

  } catch (error) {
    if (logsSheet) {
      logToSheet(logsSheet, 'Error', 'Process', error.message, error.stack, chataId);
    }
    Logger.log('Error in processPlaceholders:', error.message);
    Logger.log('Stack trace:', error.stack);
    throw error;
  }
}

function createUnifiedPrompt(sections, ss, chataId) {
  Logger.log('\n=== Creating Unified Prompt ===');
  Logger.log(`CHATA ID: ${chataId}`);

  try {
    // Get cached assessment data
    Logger.log('\nGetting assessment data...');
    const assessmentData = getCachedAssessmentData(ss, chataId);
    if (!assessmentData) {
      Logger.log('ERROR: Failed to retrieve assessment data');
      return null;
    }

    // Create the unified prompt structure
    Logger.log('\nBuilding prompt structure...');
    const prompt = {
      core_context: {
        role: "You are a clinical psychologist at an NHS clinic in London. Generate content for an autism diagnostic report using the provided assessment data.",
        task: "Replace placeholders in the report with evidence-based content that describes the child's traits, strengths, and support needs.",
        guidelines: [
          "Use assessment evidence to describe the child's traits without quantifying scores",
          "Write in clear, professional clinical language",
          "Focus on patterns and preferences",
          "Describe differences neutrally",
          "Connect support recommendations to observations",
          "Use 'your child' consistently",
          "Write final text without placeholders"
        ],
        output_format: `For each placeholder:
##PLACEHOLDER_ID##
[Replacement text]
##END##`
      },
      placeholders: Object.values(sections).flatMap(section => 
        section.placeholders.map(p => ({
          id: p.id,
          purpose: p.purpose,
          section_info: p.section_info,
          custom_prompt: p.custom_prompt,
          word_count: p.word_count
        }))
      ),
      assessment_data: assessmentData
    };

    Logger.log('Placeholders to process:');
    prompt.placeholders.forEach(p => {
      Logger.log(`  ${p.id} (${p.section_info}): ${p.purpose.substring(0, 50)}...`);
    });

    return prompt;
  } catch (error) {
    Logger.log(`ERROR in createUnifiedPrompt: ${error.message}`);
    Logger.log(`Stack trace: ${error.stack}`);
    return null;
  }
}

function validatePromptStructure(prompt) {
  if (!prompt.core_context || 
      !prompt.core_context.role || 
      !prompt.core_context.task || 
      !prompt.core_context.guidelines ||
      !prompt.core_context.output_format) {
    Logger.log('ERROR: Missing or invalid core_context in prompt');
    return false;
  }

  if (!prompt.placeholders || !Array.isArray(prompt.placeholders) || prompt.placeholders.length === 0) {
    Logger.log('ERROR: Missing or invalid placeholders array');
    return false;
  }

  if (!prompt.assessment_data) {
    Logger.log('ERROR: Missing assessment data');
    return false;
  }

  return true;
}

// Main execution function
async function main() {
  Logger.log('Notice');
  
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    Logger.log(`Connected to spreadsheet: ${ss.getName()}`);
    
    const mappingSheet = ss.getSheetByName('R3_Data Mapping');
    if (!mappingSheet) {
      throw new Error('R3_Data Mapping sheet not found');
    }
    
    const mappingData = mappingSheet.getDataRange().getValues();
    const headers = mappingData[0];
    Logger.log(`Found mapping sheet headers: ${headers.join(', ')}`);
    
    const chataId = getCHATA_ID();
    if (!chataId) {
      throw new Error('No CHATA_ID provided');
    }
    Logger.log(`Processing for CHATA_ID: ${chataId}`);

    // Initialize logs sheet early for error logging
    const logsSheet = initializeLogsSheet(ss);
    
    try {
      const result = await processPlaceholders(ss, mappingData, headers, chataId);
      Logger.log('\n=== Content Generation Complete ===');
      Logger.log('Results:', JSON.stringify(result, null, 2));
      return result;
    } catch (processError) {
      // Log detailed process error
      Logger.log('ERROR in content generation:', processError.message);
      Logger.log('Stack trace:', processError.stack);
      
      // Log to sheet with details
      const documentUrl = logToSheet(logsSheet, 'Error', 'Process', 
        `Content generation failed: ${processError.message}`,
        processError.stack,
        chataId
      );
      
      throw processError;
    }
  } catch (error) {
    Logger.log(`Error in main execution: ${error.message}`);
    Logger.log(`Stack trace: ${error.stack}`);
    
    // Try to log to sheet if available
    try {
      const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
      const logsSheet = ss.getSheetByName('API_Logs');
      if (logsSheet) {
        const documentUrl = logToSheet(logsSheet, 'Error', 'Main', 
          `Execution failed: ${error.message}`,
          error.stack,
          chataId
        );
      }
    } catch (logError) {
      Logger.log('Failed to log error to sheet:', logError.message);
    }
    
    throw error;
  }
}

// Utility function to validate API responses
function validateAPIResponse(response, operation) {
  if (!response) {
    throw new Error(`Empty response received from ${operation}`);
  }
  
  try {
    if (typeof response === 'string') {
      // Check if response contains expected markers
      if (!response.includes('##') || !response.includes('##END##')) {
        throw new Error(`Invalid response format from ${operation}`);
      }
    }
    return true;
  } catch (error) {
    Logger.log(`ERROR: Failed to validate ${operation} response:`, error.message);
    throw error;
  }
}

// Add validation for first pass response
function validateFirstPassResponse(response) {
  Logger.log('\n--- Validating First Pass Response ---');
  
  const validationResults = {
    errors: [],
    warnings: [],
    success: false,
    rawResponse: response // Store raw response for debugging
  };

  if (!response) {
    validationResults.errors.push('Empty response received');
    return validationResults;
  }

  // Log raw response for debugging
  Logger.log('Raw response preview:', response.substring(0, 500));
  
  try {
    // Parse JSON response
    let parsedResponse;
    try {
      parsedResponse = typeof response === 'string' ? JSON.parse(response) : response;
      Logger.log('Successfully parsed JSON');
    } catch (e) {
      validationResults.errors.push(`JSON parsing failed: ${e.message}`);
      // Log the response that failed to parse
      Logger.log('Failed to parse response:', response);
      return validationResults;
    }

    // Check structure
    if (!parsedResponse.placeholders || !Array.isArray(parsedResponse.placeholders)) {
      validationResults.errors.push('Missing or invalid placeholders array');
      Logger.log('Invalid response structure:', JSON.stringify(parsedResponse, null, 2));
      return validationResults;
    }

    // Get completed placeholders
    const completedIds = parsedResponse.placeholders.map(p => p.id);
    Logger.log(`Found ${completedIds.length} placeholders: ${completedIds.join(', ')}`);

    // Check required placeholders
    const allRequired = getAllRequiredPlaceholderIds();
    const missingIds = allRequired.filter(id => !completedIds.includes(id));
    if (missingIds.length > 0) {
      validationResults.errors.push(`Missing ${missingIds.length} placeholders: ${missingIds.join(', ')}`);
    }

    // Check content
    parsedResponse.placeholders.forEach(p => {
      if (!p.content || p.content.length < 10) {
        validationResults.warnings.push(`Placeholder ${p.id} has very short content`);
      }
      if (p.content.includes('score') || p.content.includes('points')) {
        validationResults.warnings.push(`Placeholder ${p.id} may contain score references`);
      }
    });

    // Check success signals
    if (!response.includes('##TASKCOMPLETE##')) {
      validationResults.warnings.push('Missing ##TASKCOMPLETE## signal');
    }
    if (!response.includes('##FIRSTPASS_SUCCESS##')) {
      validationResults.warnings.push('Missing ##FIRSTPASS_SUCCESS## signal');
    }

    // Set success if no errors (warnings are okay)
    validationResults.success = validationResults.errors.length === 0;

    // Log validation results
    Logger.log('Validation Results:', JSON.stringify(validationResults, null, 2));

    return validationResults;

  } catch (error) {
    validationResults.errors.push(`Validation error: ${error.message}`);
    Logger.log('Validation failed:', error.stack);
    return validationResults;
  }
}

// Extract both content and evidence for a placeholder
function extractPlaceholderContent(response, placeholderId) {
  const contentPattern = new RegExp(`##${placeholderId}##\\s*([\\s\\S]*?)##END##`);
  const evidencePattern = new RegExp(`##EVIDENCE_${placeholderId}##\\s*([\\s\\S]*?)##EVIDENCE_END##`);
  
  const contentMatch = response.match(contentPattern);
  const evidenceMatch = response.match(evidencePattern);
  
  return {
    content: contentMatch ? contentMatch[1].trim() : null,
    evidence: evidenceMatch ? evidenceMatch[1].trim() : null
  };
}

// Entry point - this is what Google Apps Script will call
function doGet(e) {
  try {
    // Get callback name from request parameters
    const callback = e?.parameter?.callback || 'callback';
    
    // Get CHATA_ID directly from webhook parameters
    const chataId = e?.parameter?.chataId;
    
    if (!chataId) {
      return createJSONPResponse(callback, {
        success: false,
        error: 'No CHATA_ID provided in webhook call',
        stage: 'initialization',
        progress: {
          status: 'error',
          message: 'Missing CHATA_ID',
          step: 0,
          totalSteps: 4
        }
      });
    }
    
    Logger.log(`Processing analysis for CHATA_ID: ${chataId}`);
    
    // Handle test requests
    if (e?.parameter?.test === 'true') {
      // Initialize logs sheet and log test operation
      const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
      const logsSheet = initializeLogsSheet(ss);
      logToSheet(logsSheet, 'Test', 'All', 'Test request received', 'Test successful', chataId);
      
      return createJSONPResponse(callback, {
        success: true,
        message: 'Analysis endpoint is working',
        stage: 'test',
        progress: {
          status: 'complete',
          message: 'Test successful',
          step: 1,
          totalSteps: 1
        }
      });
    }
    
    // Process analysis with the provided CHATA_ID
    const result = processAnalysis(chataId);
    
    if (!result.success) {
      Logger.log(`Analysis error: ${result.error}`);
      return createJSONPResponse(callback, {
        success: false,
        error: result.error,
        stage: 'analysis',
        progress: {
          status: 'error',
          message: result.error,
          step: result.step || 0,
          totalSteps: 4,
          details: result.details || {}
        }
      });
    }
    
    return createJSONPResponse(callback, {
      success: true,
      message: 'Analysis complete',
      stage: 'analysis',
      progress: {
        status: 'complete',
        message: 'Report generation successful',
        step: 4,
        totalSteps: 4,
        details: {
          firstPassUrl: result.firstPassUrl,
          secondPassUrl: result.secondPassUrl,
          timestamp: new Date().toISOString()
        }
      }
    });
    
  } catch (error) {
    Logger.log(`Error in doGet: ${error.message}`);
    return createJSONPResponse(callback || 'callback', {
      success: false,
      error: error.message,
      stage: 'error',
      progress: {
        status: 'error',
        message: error.message,
        step: 0,
        totalSteps: 4,
        details: {
          timestamp: new Date().toISOString(),
          stack: error.stack
        }
      }
    });
  }
}

// Add helper function for JSONP responses
function createJSONPResponse(callback, data) {
  const jsonData = JSON.stringify(data);
  const output = callback ? `${callback}(${jsonData})` : jsonData;
  
  return ContentService.createTextOutput(output)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

// For manual testing
function test() {
  return main().then(() => {
    Logger.log('Test complete');
  }).catch(error => {
    Logger.log('Test error:', error);
  });
}

// Add after the existing API configuration
function logSectionDetails(sections) {
  Logger.log('\n--- Section Details ---');
  
  if (!sections || Object.keys(sections).length === 0) {
    Logger.log('No sections found');
    return;
  }
  
  Object.entries(sections).forEach(([number, section]) => {
    Logger.log(`\nSection ${number}: ${section.name}`);
    Logger.log(`Content: ${section.content ? 'Present' : 'Empty'}`);
    Logger.log(`Custom Prompt: ${section.customPrompt ? 'Present' : 'Empty'}`);
    Logger.log('Placeholders:');
    
    if (!section.placeholders || section.placeholders.length === 0) {
      Logger.log('  No placeholders in this section');
    } else {
      section.placeholders.forEach(p => {
        Logger.log(`  - ID: ${p.id}`);
        Logger.log(`    Text: ${p.placeholder}`);
        Logger.log(`    Word Count: ${p.wordCount}`);
      });
    }
  });
  
  const totalPlaceholders = Object.values(sections)
    .reduce((acc, s) => acc + (s.placeholders?.length || 0), 0);
  Logger.log(`\nTotal Sections: ${Object.keys(sections).length}`);
  Logger.log(`Total Placeholders: ${totalPlaceholders}`);
}

// Add to processPlaceholders before making API calls
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

// Add after API configuration
const ADOS_CRITERIA = {
  ADOS_Social_Speech: {
    criteria: [
      {
        score: 0,
        description: "Typical range of social speech",
        examples: ["Engages in reciprocal conversation", "Uses varied intonation", "Appropriate social chat"]
      },
      {
        score: 1,
        description: "Mild differences in social speech",
        examples: ["Occasional one-sided conversations", "Some repetitive speech", "Limited social chat"]
      },
      {
        score: 2,
        description: "Moderate differences in social speech",
        examples: ["Frequently one-sided", "Regular repetitive speech", "Minimal social chat"]
      },
      {
        score: 3,
        description: "Marked differences in social speech",
        examples: ["Consistently one-sided", "Highly repetitive speech", "No social chat"]
      }
    ]
  },
  ADOS_Eye_Contact: {
    criteria: [
      {
        score: 0,
        description: "Typical range of eye contact",
        examples: ["Consistently uses eye contact to communicate", "Appropriate duration", "Natural integration"]
      },
      {
        score: 1,
        description: "Mild differences in eye contact",
        examples: ["Occasionally inconsistent", "Sometimes brief", "Some integration"]
      },
      {
        score: 2,
        description: "Moderate differences in eye contact",
        examples: ["Frequently inconsistent", "Often brief", "Limited integration"]
      },
      {
        score: 3,
        description: "Marked differences in eye contact",
        examples: ["Rarely uses eye contact", "Very brief when present", "No integration"]
      }
    ]
  }
};

function getADOSDescription(dimension, score) {
  const criteria = ADOS_CRITERIA[`ADOS_${dimension}`]?.criteria;
  if (!criteria || !criteria[score]) {
    return "Description not available";
  }
  return criteria[score].description;
}

function formatR2Dimension(dimension, name) {
  if (!dimension) return {
    score: 'N/A',
    description: 'Not assessed',
    observations: []
  };
  
  const criteria = ADOS_CRITERIA[`ADOS_${name}`]?.criteria[dimension];
  return {
    score: dimension || 'N/A',
    description: criteria?.description || 'Not assessed',
    observations: criteria?.examples || []
  };
}

// Add after ADOS_CRITERIA
const CHATA_QUESTIONS = {
  Social_Communication_Score: {
    questions: [
      "Does your child chat and have conversations with you just to be sociable?",
      "Does your child ever share their interest or excitement in something with you?",
      "Does your child like to join in the excitement of a social occasion?",
      "Does your child ever actively try to comfort you if you are feeling sad or hurt?"
    ],
    maxScore: 25,
    interpretation: {
      "0-8": "Minimal social communication challenges",
      "9-16": "Moderate social communication challenges",
      "17-25": "Significant social communication challenges"
    }
  },
  SC_Joint_Attention: {
    questions: [
      "If you point at something across the room, does your child look at it?",
      "Does your child point with one finger to show you something interesting?",
      "If you turn your head to look at something, does your child look around to see what you are looking at?"
    ],
    maxScore: 10,
    interpretation: {
      "0-3": "Strong joint attention skills",
      "4-7": "Emerging joint attention skills",
      "8-10": "Limited joint attention skills"
    }
  },
  SC_Social_Reciprocity: {
    questions: [
      "Does your child respond when you call his or her name?",
      "When you smile at your child, does he or she smile back at you?",
      "Does your child try to get you to watch him or her?"
    ],
    maxScore: 10,
    interpretation: {
      "0-3": "Strong social reciprocity",
      "4-7": "Variable social reciprocity",
      "8-10": "Limited social reciprocity"
    }
  }
};

// Add after CHATA_QUESTIONS
const PLACEHOLDERS = {
  C001: {
    description: "Social Communication",
    word_count: "100-150",
    category: "observations",
    sources: ["R1.Social_Communication_Score", "R2.ADOS_Social_Speech", "R3.observations"]
  },
  C017: {
    description: "Development Opportunities",
    word_count: "75-100",
    category: "development",
    sources: ["R3.Priority_Support_Areas", "R3.Support_Recommendations"]
  },
  C016: {
    description: "Key Strengths",
    word_count: "30-50",
    category: "strengths",
    sources: ["R3.strengths", "R2.Clinician_Notes"]
  },
  C018: {
    description: "Communication Patterns",
    word_count: "150-200",
    category: "communication",
    sources: ["R1.SC_Social_Reciprocity", "R2.ADOS_Social_Speech", "R2.ADOS_Eye_Contact", "R3.observations"]
  },
  C019: {
    description: "Cognitive Style",
    word_count: "100-150",
    category: "cognitive",
    sources: ["R1.DH_Cognitive_Abilities", "R2.Clinician_Notes", "R3.observations"]
  },
  C020: {
    description: "Learning Strategies",
    word_count: "50-75",
    category: "learning",
    sources: ["R3.recommendations"]
  },
  C015: {
    description: "Sensory Profile",
    word_count: "100-150",
    category: "sensory",
    sources: ["R1.Sensory_Sensitivities_Score", "R2.ADOS_Sensory_Exploration", "R3.observations"]
  },
  C021: {
    description: "Sensory Profile Detailed",
    word_count: "150-200",
    category: "sensory",
    sources: ["R1.Sensory_Hyper_Reactivity", "R1.Sensory_Hypo_Reactivity", "R3.observations"]
  },
  C022: {
    description: "Emotional Expression",
    word_count: "100-150",
    category: "emotional",
    sources: ["R2.ADOS_Social_Speech", "R3.observations"]
  },
  C014: {
    description: "Interests and Routines",
    word_count: "100-150",
    category: "interests",
    sources: ["R1.RRB_Score", "R2.ADOS_Repetitive_Play", "R3.observations"]
  },
  C023: {
    description: "Interest-Based Skills",
    word_count: "50-75",
    category: "interests",
    sources: ["R1.RRB_Restricted_Interests", "R3.observations"]
  },
  C024: {
    description: "Daily Living Skills",
    word_count: "100-150",
    category: "daily_living",
    sources: ["R1.DH_Motor_Skills", "R3.observations"]
  },
  C025: {
    description: "ADOS Positive Observations",
    word_count: "50-75",
    category: "observations",
    sources: ["R2.ADOS_Social_Speech", "R2.ADOS_Eye_Contact", "R2.Clinician_Notes"]
  },
  C026: {
    description: "List 2-3 key strengths from assessment data",
    word_count: "50-75",
    category: "strengths",
    sources: ["R1.Social_Communication_Score", "R2.ADOS_Social_Speech", "R2.Clinician_Notes", "R3.strengths"]
  }
};

function interpretScore(score, category) {
  if (!CHATA_QUESTIONS[category]) {
    return "Interpretation not available";
  }

  const ranges = CHATA_QUESTIONS[category].interpretation;
  for (const range in ranges) {
    const [min, max] = range.split('-').map(Number);
    if (score >= min && score <= max) {
      return ranges[range];
    }
  }
  return "Score out of range";
}

function formatAssessmentData(data) {
  return {
    r1: {
      scores: data.r1.scores,
      dimensions: Object.entries(data.r1.dimensions).reduce((acc, [key, dim]) => {
        acc[key] = {
          total: dim.total,
          sub_scores: Object.entries(dim.sub_dimensions).reduce((subAcc, [subKey, score]) => {
            subAcc[subKey] = {
              score: score,
              interpretation: interpretScore(score, subKey)
            };
            return subAcc;
          }, {})
        };
        return acc;
      }, {}),
      notes: data.r1.notes
    },
    r2: {
      scores: data.r2.scores,
      dimensions: data.r2.dimensions,
      clinical_notes: data.r2.clinical_notes,
      diagnostic_impression: data.r2.diagnostic_impression
    },
    r3: data.r3
  };
}

function handleAPIResponse(response, operation) {
  if (!response) {
    throw new Error(`Empty response received from ${operation}`);
  }

  try {
    validateResponse(response, operation);
    return response;
  } catch (error) {
    Logger.log(`ERROR: Failed to handle ${operation} response:`, error.message);
    throw error;
  }
}

function validatePlaceholderCompleteness(sections, response) {
  const expectedPlaceholders = new Set(
    Object.values(sections)
      .flatMap(section => section.placeholders)
      .map(p => p.id)
  );

  const foundPlaceholders = new Set(
    (response.match(/##[A-Z][0-9]{3}##/g) || [])
      .map(p => p.replace(/##/g, ''))
  );

  const missing = [...expectedPlaceholders].filter(id => !foundPlaceholders.has(id));
  const extra = [...foundPlaceholders].filter(id => !expectedPlaceholders.has(id));

  if (missing.length > 0) {
    Logger.log('Missing placeholders:', missing.join(', '));
    return false;
  }

  if (extra.length > 0) {
    Logger.log('WARNING: Extra placeholders found:', extra.join(', '));
  }

  return true;
}

const ASSESSMENT_CONTEXT = {
  r1: {
    max_scores: {
      total: 100,
      social_communication: 25,
      rrb: 25,
      sensory: 25,
      developmental_history: 25
    },
    sample_questions: {
      social_communication: [
        "How does your child share attention and interest?",
        "How does your child engage in social interactions?",
        "Does your child respond to their name?",
        "How does your child participate in back-and-forth conversation?"
      ],
      rrb: [
        "What are your child's strongest interests?",
        "How does your child handle changes in routine?",
        "Are there specific movements or actions your child repeats?",
        "How does your child respond to changes in their environment?"
      ],
      sensory: [
        "How does your child respond to different sensory experiences?",
        "What sensory experiences does your child seek or avoid?",
        "How does your child react to loud noises or bright lights?",
        "Are there specific textures or sensations your child prefers?"
      ],
      developmental_history: [
        "How does your child communicate their needs?",
        "What are your child's daily living skills like?",
        "How does your child approach learning new things?",
        "What motor skills has your child developed?"
      ]
    }
  },
  r2: {
    observation_areas: {
      social_communication: {
        scoring: "0-3 scale",
        aspects: [
          "Social speech and chat",
          "Eye contact quality",
          "Facial expressions",
          "Gesture use",
          "Social engagement"
        ],
        interpretation: {
          0: "Typical range - naturally integrated",
          1: "Mild differences - occasionally inconsistent",
          2: "Moderate differences - frequently inconsistent",
          3: "Marked differences - rarely or minimally present"
        }
      },
      rrb: {
        scoring: "0-3 scale",
        aspects: [
          "Repetitive movements",
          "Repetitive use of objects",
          "Ritualized patterns",
          "Restricted interests"
        ]
      },
      play: {
        scoring: "0-3 scale",
        aspects: [
          "Imaginative play",
          "Social play",
          "Object use in play"
        ]
      }
    },
    clinical_focus: [
      "Quality of social engagement",
      "Communication patterns",
      "Play and imagination",
      "Repetitive behaviors",
      "Sensory responses"
    ]
  },
  r3: {
    assessment_areas: {
      observations: [
        "Social interaction style",
        "Communication patterns",
        "Play behaviors",
        "Sensory responses",
        "Emotional expression",
        "Learning approaches"
      ],
      strengths: [
        "Individual capabilities",
        "Special interests",
        "Learning preferences",
        "Positive traits"
      ],
      support_needs: [
        "Communication support",
        "Social interaction",
        "Sensory considerations",
        "Learning adaptations"
      ],
      recommendations: [
        "Environmental adaptations",
        "Communication strategies",
        "Learning supports",
        "Family resources"
      ]
    },
    data_collection: {
      methods: [
        "Direct observation",
        "Parent interview",
        "Structured activities",
        "Natural interactions"
      ],
      contexts: [
        "Clinical setting",
        "Play-based assessment",
        "Structured tasks",
        "Social interactions"
      ]
    }
  }
};

// Add cleanup function
function cleanupOldLogs() {
  const folder = DriveApp.getFolderById(LOGS_FOLDER_ID);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - CLEANUP_DAYS);
  
  const files = folder.getFiles();
  while (files.hasNext()) {
    const file = files.next();
    if (file.getDateCreated() < cutoff) {
      file.setTrashed(true);
    }
  }
}

// Add retry mechanism
async function callAPIWithRetry(prompt, operation) {
  let lastError;
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      return await callClaudeAPI(prompt);
    } catch (error) {
      lastError = error;
      Logger.log(`Attempt ${i + 1} failed: ${error.message}`);
      await Utilities.sleep(1000 * (i + 1)); // Exponential backoff
    }
  }
  throw lastError;
}

// Add progress tracking
function updateProgress(logsSheet, current, total) {
  const progress = Math.round((current / total) * 100);
  logsSheet.getRange('A1').setNote(`Progress: ${progress}%`);
}

// Add second pass validation
function validateSecondPassContent(content, firstPassContent) {
  // Ensure all placeholders from first pass are present
  const firstPassIds = (firstPassContent.match(/##[A-Z][0-9]{3}##/g) || [])
    .map(p => p.replace(/##/g, ''));
  
  const secondPassIds = (content.match(/##[A-Z][0-9]{3}##/g) || [])
    .map(p => p.replace(/##/g, ''));
  
  const missing = firstPassIds.filter(id => !secondPassIds.includes(id));
  if (missing.length > 0) {
    throw new Error(`Second pass missing placeholders: ${missing.join(', ')}`);
  }
  
  return true;
}

// Add function to check/create logs folder
function initializeLogsFolder() {
  try {
    Logger.log('Initializing logs folder...');
    
    // First try to use the folder ID from script properties
    if (LOGS_FOLDER_ID) {
      try {
        const folder = DriveApp.getFolderById(LOGS_FOLDER_ID);
        Logger.log('Using existing folder:', folder.getName());
        return folder;
      } catch (e) {
        Logger.log('Existing folder ID invalid:', e.message);
      }
    }
    
    // Search for existing folder by name
    const folders = DriveApp.getFoldersByName('CHATA_API_Logs');
    if (folders.hasNext()) {
      const folder = folders.next();
      Logger.log('Found existing folder:', folder.getName());
      // Update script properties with found folder ID
      PropertiesService.getScriptProperties().setProperty('LOGS_FOLDER_ID', folder.getId());
      return folder;
    }
    
    // Create new folder only if none exists
    Logger.log('Creating new logs folder...');
    const folder = DriveApp.createFolder('CHATA_API_Logs');
    PropertiesService.getScriptProperties().setProperty('LOGS_FOLDER_ID', folder.getId());
    Logger.log('Created new folder:', folder.getName());
    return folder;
    
  } catch (error) {
    Logger.log('ERROR: Failed to initialize logs folder:', error.message);
    return null;
  }
}

// Token estimation for context management
function estimateTokenCount(prompt) {
  const promptJson = JSON.stringify(prompt);
  return Math.ceil(promptJson.length / 3);  // Conservative estimation
}

// Get CHATA_ID from either script properties or UI parameters
function getCHATA_ID(e) {
  // First try to get from script properties (for testing)
  const testChataId = PropertiesService.getScriptProperties().getProperty('TEST_CHATA_ID');
  if (testChataId) {
    Logger.log('Using TEST_CHATA_ID from script properties:', testChataId);
    return testChataId;
  }
  
  // Then try to get from UI parameters
  if (e && e.parameter && e.parameter.chataId) {
    Logger.log('Using CHATA_ID from UI parameters:', e.parameter.chataId);
    return e.parameter.chataId;
  }
  
  // If neither source is available, throw an error
  throw new Error('No CHATA_ID provided. Must be set in script properties for testing or provided via UI parameters.');
}

function validateSecondPassResponse(response, firstPassContent) {
  if (!response) {
    throw new Error('Empty response from second pass');
  }
  
  try {
    const parsedResponse = JSON.parse(response);
    return parsedResponse.placeholders && Array.isArray(parsedResponse.placeholders);
  } catch (e) {
    Logger.log('Second pass response not valid JSON');
    return false;
  }
}

// Helper function to calculate text similarity
function calculateSimilarity(text1, text2) {
  const words1 = text1.toLowerCase().split(/\s+/);
  const words2 = text2.toLowerCase().split(/\s+/);
  
  const intersection = words1.filter(word => words2.includes(word));
  const union = [...new Set([...words1, ...words2])];
  
  return intersection.length / union.length;
}

// Utility functions for placeholder handling
function getAllRequiredPlaceholderIds() {
  return [
    'C001', 'C026', 'C017', 'C016', 'P016', 'C025', 'P017', 'C018', 'C019', 'C020',
    'C015', 'C021', 'C022', 'C014', 'C023', 'P018', 'C024',
    'R005', 'R007', 'R008', 'R006', 'R009', 'R010', 'R011', 'R012', 'R013', 'R014', 'R015',
    'T001', 'T002', 'T003', 'T004', 'T005', 'T006', 'T007', 'T008', 'T009', 'T010', 'T011', 'T012', 'T013', 'T014'
  ];
}

function extractPlaceholderIds(response) {
  const matches = response.match(/##([A-Z][0-9]{3})##/g) || [];
  return [...new Set(matches.map(match => match.replace(/##/g, '')))];
}

function splitIntoChunks(sections, maxTokens) {
  const chunks = [];
  let currentChunk = {};
  let currentTokens = 0;

  Object.entries(sections).forEach(([number, section]) => {
    const sectionTokens = estimateTokenCount(section);
    if (currentTokens + sectionTokens > maxTokens && Object.keys(currentChunk).length > 0) {
      chunks.push(currentChunk);
      currentChunk = {};
      currentTokens = 0;
    }
    currentChunk[number] = section;
    currentTokens += sectionTokens;
  });

  if (Object.keys(currentChunk).length > 0) {
    chunks.push(currentChunk);
  }

  return chunks;
}

function estimateTokenCount(obj) {
  return Math.ceil(JSON.stringify(obj).length / 3);
}

function saveToDoc(content, operation) {
  const timestamp = Utilities.formatDate(new Date(), "Asia/Kolkata", "yyyy-MM-dd_HH-mm-ss");
  const docName = `CHATA_${operation}_${timestamp}`;
  
  const folder = initializeLogsFolder();
  if (!folder) {
    throw new Error('Failed to initialize logs folder');
  }
  
  const doc = DocumentApp.create(docName);
  const body = doc.getBody();
  body.setText(content);
  doc.saveAndClose();
  
  const file = DriveApp.getFileById(doc.getId());
  file.moveTo(folder);
  
  return file.getUrl();
}

// Add after the utility functions

async function handleSecondPassResponse(response, firstPassResult, assessmentData) {
  Logger.log('\n--- Handling Second Pass Response ---');
  
  try {
    // Open the first pass document
    const doc = DocumentApp.openById(firstPassResult.docUrl.match(/[-\w]{25,}/)[0]);
    const body = doc.getBody();
    
    // Create revision prompt
    const revisionPrompt = [{
      role: "user",
      content: `As a senior clinical psychologist, review this assessment report and propose revisions where needed.

Assessment Data for Reference:
${JSON.stringify(assessmentData, null, 2)}

Current Report Content:
${firstPassResult.content}

Task:
1. Review the content thoroughly
2. Identify entries that need revision for:
   - Clinical accuracy
   - Professional language
   - Evidence-based support
   - Neurodiversity-affirming language
   - Sensitivity and clarity
3. For each revision, use this format:
   ##REVISE_[PLACEHOLDER_ID]##
   [Revised content with improvements]
   ##END##

Only create revisions where significant improvements can be made.
Add ##REVISIONS_COMPLETE## when finished.

Guidelines:
- Focus on accuracy and clarity
- Use neurodiversity-affirming language
- Maintain "your child" references
- Ensure evidence-based descriptions
- Keep professional tone`
    }];

    const systemPrompt = `You are a senior clinical psychologist reviewing an autism assessment report.
Your task is to identify and revise content that could be improved for accuracy, clarity, or sensitivity.
Use neurodiversity-affirming language and maintain clinical professionalism.
Only propose revisions where significant improvements can be made.`;

    Logger.log('Making revision API call...');
    const revisionResponse = await callClaudeAPI(
      revisionPrompt,
      systemPrompt,
      0.3
    );
    
    Logger.log('Received revision response');
    Logger.log(`Response includes ##REVISIONS_COMPLETE##: ${revisionResponse.includes('##REVISIONS_COMPLETE##')}`);
    
    // Append revisions to the document
    body.appendParagraph('\n\n=== REVISIONS ===\n');
    body.appendParagraph(revisionResponse);
    
    // Rename the document to indicate it's final
    const newName = doc.getName().replace('FirstPass', 'FinalResponse');
    doc.setName(newName);
    
    // Save and close
    doc.saveAndClose();
    
    return {
      content: firstPassResult.content + '\n\n' + revisionResponse,
      docUrl: firstPassResult.docUrl
    };
    
  } catch (error) {
    Logger.log(`Second pass revision failed: ${error.message}`);
    Logger.log(`Error details: ${error.stack}`);
    throw error;
  }
}

// Helper function to extract revision IDs
function extractRevisionIds(response) {
  const matches = response.match(/##REVISE_([A-Z][0-9]{3})##/g) || [];
  return [...new Set(matches.map(match => match.replace(/##REVISE_/, '').replace(/##/, '')))];
}

// Update createSecondPassPrompt for the new revision approach
function createSecondPassPrompt(firstPassContent, assessmentData) {
  Logger.log('\n--- Creating Second Pass Prompt ---');

  const systemPrompt = `You are a senior clinical psychologist reviewing an autism assessment report.
Your task is to identify content that needs revision and propose improvements.

CRITICAL REQUIREMENTS:
1. Review all placeholders for:
   - Clinical accuracy
   - Professional language
   - Evidence-based support
   - Neurodiversity-affirming language
   - Sensitivity and clarity
   - Grammatical fit within surrounding text

2. Use this format for revisions:
   ##REVISE_[PLACEHOLDER_ID]##
   [Improved content]
   ##END##

3. Only revise where significant improvements can be made

4. Ensure content fits naturally in context:
   - If placeholder is mid-sentence, content must flow grammatically
   - Avoid standalone paragraphs where content should be part of a sentence
   - Example: For "Profile shows {{C026}}. These strengths..."
     GOOD: "exceptional pattern recognition and strong memory skills"
     BAD: "Your child shows exceptional pattern recognition. They have strong memory skills."

DO NOT:
- Revise content that is already accurate and clear
- Change the meaning of clinical observations
- Remove important assessment details
- Use deficit-based language
- Break sentence flow with standalone paragraphs

Add ##REVISIONS_COMPLETE## when finished reviewing all content.`;

  const messages = [{
    role: "user",
    content: `Review this assessment report and propose revisions where needed.

Assessment Data:
${JSON.stringify(assessmentData, null, 2)}

Current Report Content:
${firstPassContent}

Requirements:
1. Review all placeholders thoroughly
2. Identify content needing improvement
3. Propose revisions using:
   ##REVISE_[PLACEHOLDER_ID]##
   [Improved content]
   ##END##
4. Focus on:
   - Clinical accuracy
   - Professional language
   - Evidence-based support
   - Neurodiversity-affirming language
   - Sensitivity and clarity
   - Grammatical fit within surrounding text

Only propose revisions where significant improvements can be made.
Add ##REVISIONS_COMPLETE## when finished.`
  }];

  Logger.log('Created second pass revision prompt');
  return {
    systemPrompt,
    messages
  };
}

async function testSecondPass(firstPassDocUrl) {
  Logger.log('\n--- Testing Second Pass Processing ---');
  
  try {
    // Open the existing first pass document
    const doc = DocumentApp.openById(firstPassDocUrl.match(/[-\w]{25,}/)[0]);
    const firstPassContent = doc.getBody().getText();
    const assessmentData = getCachedAssessmentData(SpreadsheetApp.openById(SPREADSHEET_ID), 'CHATA001');
    
    // Process revisions in batches, similar to first pass
    let processedResponse = '';
    let currentBatchStart = 0;
    const BATCH_SIZE = 10;
    let attempts = 0;
    const MAX_ATTEMPTS = 5;
    
    const allPlaceholders = getAllRequiredPlaceholderIds();
    Logger.log(`Total placeholders to review: ${allPlaceholders.length}`);
    
    // Get placeholder details for word count validation
    const placeholderDetails = {
      C001: { wordCount: "100-150", category: "observations" },
      C017: { wordCount: "75-100", category: "development" },
      C016: { wordCount: "30-50", category: "strengths" },
      C018: { wordCount: "150-200", category: "communication" },
      C019: { wordCount: "100-150", category: "cognitive" },
      C020: { wordCount: "50-75", category: "learning" },
      C015: { wordCount: "100-150", category: "sensory" },
      C021: { wordCount: "150-200", category: "sensory" },
      C022: { wordCount: "100-150", category: "emotional" },
      C014: { wordCount: "100-150", category: "interests" },
      C023: { wordCount: "50-75", category: "interests" },
      C024: { wordCount: "100-150", category: "daily_living" },
      C025: { wordCount: "50-75", category: "observations" },
      C026: { wordCount: "50-75", category: "strengths" }
    };
    
    while (currentBatchStart < allPlaceholders.length && attempts < MAX_ATTEMPTS) {
      const currentBatch = allPlaceholders.slice(currentBatchStart, currentBatchStart + BATCH_SIZE);
      const isFinalBatch = currentBatchStart + BATCH_SIZE >= allPlaceholders.length;
      
      Logger.log(`\nProcessing revision batch ${Math.floor(currentBatchStart/BATCH_SIZE) + 1} of ${Math.ceil(allPlaceholders.length/BATCH_SIZE)}`);
      Logger.log(`Current batch placeholders: ${currentBatch.join(', ')}`);
      Logger.log(`Is final batch: ${isFinalBatch}`);
      
      // Create batch-specific revision prompt
      const batchPrompt = [{
        role: "user",
        content: `Review and propose revisions for these placeholders: ${currentBatch.join(', ')}

First Pass Content:
${firstPassContent}

Assessment Data:
${JSON.stringify(assessmentData, null, 2)}

Word Count Requirements for Current Batch:
${currentBatch.map(id => placeholderDetails[id] ? 
  `${id}: ${placeholderDetails[id].wordCount} words (${placeholderDetails[id].category})` : 
  `${id}: standard length`).join('\n')}

Task:
1. Review the content for these specific placeholders
2. For each placeholder that needs improvement, check:
   - Word count matches requirements
   - Clinical accuracy aligns with assessment data
   - Language is neurodiversity-affirming
   - Professional tone is maintained
   - Evidence from assessment data is properly referenced
   - "Your child" references are consistent

3. If improvements are needed, use this format:
   ##REVISE_[PLACEHOLDER_ID]##
   [Improved content that meets word count and quality requirements]
   ##END##

4. Only create revisions where significant improvements can be made.

Writing Guidelines:
- Stay within specified word count ranges
- Use specific examples from assessment data
- Maintain "your child" perspective consistently
- Focus on patterns and preferences, not deficits
- Connect observations to support recommendations
- Use clear, professional clinical language
- Describe differences neutrally and respectfully

Add ##BATCHCOMPLETE## when this batch is reviewed.
Add ##REVISIONSCOMPLETE## only if this is the final batch (batch ${Math.floor(currentBatchStart/BATCH_SIZE) + 1} of ${Math.ceil(allPlaceholders.length/BATCH_SIZE)}).`
      }];

      try {
        Logger.log('Making batch revision API call...');
        const batchResponse = await callClaudeAPI(
          batchPrompt,
          getSecondPassSystemPrompt(currentBatch, isFinalBatch, placeholderDetails),
          0.3
        );
        
        Logger.log('Received batch response, validating...');
        Logger.log(`Response includes ##BATCHCOMPLETE##: ${batchResponse.includes('##BATCHCOMPLETE##')}`);
        
        // Store response and append to document
        processedResponse += '\n\n' + batchResponse;
        doc.getBody().appendParagraph('\n=== REVISIONS ===\n' + batchResponse);
        
        // Check if revisions are complete
        if (batchResponse.includes('##REVISIONSCOMPLETE##')) {
          Logger.log('All revisions completed successfully');
          
          // Rename document to indicate it's final
          const newName = doc.getName().replace('FirstPass', 'FinalResponse');
          doc.setName(newName);
          doc.saveAndClose();
          
          return {
            content: firstPassContent + '\n\n' + processedResponse,
            docUrl: firstPassDocUrl
          };
        }
        
        // Move to next batch
        currentBatchStart += BATCH_SIZE;
        attempts = 0; // Reset attempts for next batch
        
      } catch (error) {
        Logger.log(`Batch attempt ${attempts + 1} failed: ${error.message}`);
        Logger.log(`Error details: ${error.stack}`);
        attempts++;
        
        if (attempts === MAX_ATTEMPTS) {
          doc.saveAndClose();
          throw new Error(`Failed to complete batch after ${MAX_ATTEMPTS} attempts. Last error: ${error.message}`);
        }
      }
    }
    
    // Final save
    doc.saveAndClose();
    return {
      content: firstPassContent + '\n\n' + processedResponse,
      docUrl: firstPassDocUrl
    };
    
  } catch (error) {
    Logger.log(`Second pass test failed: ${error.message}`);
    Logger.log(`Error details: ${error.stack}`);
    throw error;
  }
}

// Helper function for second pass system prompt
function getSecondPassSystemPrompt(currentBatch, isFinalBatch, placeholderDetails) {
  return `You are a senior clinical psychologist reviewing an autism assessment report.
Your task is to identify content that needs revision and propose improvements.

CRITICAL REQUIREMENTS:
1. Review these specific placeholders: ${currentBatch.map(id => 
    `${id} (${placeholderDetails[id]?.wordCount || 'standard'} words)`).join(', ')}

2. For each placeholder, ensure:
   - Word count matches specified range
   - Clinical accuracy aligns with assessment data
   - Language is neurodiversity-affirming
   - Professional tone is maintained
   - Evidence is properly referenced
   - "Your child" perspective is consistent

3. Look for opportunities to improve:
   - Clinical accuracy and evidence-based content
   - Professional and sensitive language
   - Neurodiversity-affirming perspective
   - Clear and specific examples
   - Balanced observations
   - Support recommendations

4. Use ##REVISE_[PLACEHOLDER_ID]## format for revisions that:
   - Meet word count requirements
   - Enhance clinical accuracy
   - Improve language and tone
   - Better reference assessment data
   - Maintain consistent perspective

DO NOT:
- Revise content that already meets requirements
- Change accurate clinical observations
- Remove important assessment details
- Use deficit-based language
- Exceed word count limits
- Alter evidence-based conclusions

Add ##BATCHCOMPLETE## when this batch is reviewed.
${isFinalBatch ? 'This is the final batch, add ##REVISIONSCOMPLETE## after ##BATCHCOMPLETE##.' : 'This is not the final batch, do not add ##REVISIONSCOMPLETE##.'}`;}

// Test function to run second pass only
function testSecondPassOnly() {
  const firstPassDocUrl = 'https://docs.google.com/document/d/1_jfN_MAWxo8gmKJMirN40_9qoG-4-PV0A0mxGjOasro/edit?usp=drivesdk';
  return testSecondPass(firstPassDocUrl).then(() => {
    Logger.log('Second pass test complete');
  }).catch(error => {
    Logger.log('Second pass test error:', error);
  });
}

function processAnalysis(chataId) {
  try {
    Logger.log(`Starting analysis for CHATA_ID: ${chataId}`);
    
    // Get spreadsheet
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const mappingSheet = ss.getSheetByName('R3_Data Mapping');
    if (!mappingSheet) {
      throw new Error('R3_Data Mapping sheet not found');
    }
    
    const mappingData = mappingSheet.getDataRange().getValues();
    const headers = mappingData[0];
    
    // Process placeholders and generate content
    return processPlaceholders(ss, mappingData, headers, chataId).then(result => {
      return {
        success: true,
        firstPassUrl: result.firstPassUrl,
        secondPassUrl: result.secondPassUrl,
        step: 4,
        totalSteps: 4,
        message: 'Analysis completed successfully'
      };
    });
    
  } catch (error) {
    Logger.log(`Analysis failed: ${error.message}`);
    return {
      success: false,
      error: error.message,
      step: 0,
      details: {
        timestamp: new Date().toISOString(),
        stack: error.stack
      }
    };
  }
}

// Add helper function to get CHATA_ID
function getCHATA_ID() {
  let chataId = PropertiesService.getScriptProperties().getProperty('TEST_CHATA_ID');
  if (!chataId) {
    // Try to get from API_Logs sheet
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const logsSheet = ss.getSheetByName('API_Logs');
    if (logsSheet) {
      const lastRow = logsSheet.getLastRow();
      if (lastRow > 1) {
        const lastChataId = logsSheet.getRange(lastRow, 2).getValue();
        if (lastChataId && lastChataId !== 'CHATA_PENDING') {
          chataId = lastChataId;
          PropertiesService.getScriptProperties().setProperty('TEST_CHATA_ID', chataId);
        }
      }
    }
  }
  return chataId || 'CHATA_PENDING';
}