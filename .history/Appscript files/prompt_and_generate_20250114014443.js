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

    // Add SECTION_CONTEXT constant at the top with other configurations
    const SECTION_CONTEXT = {
        appendix_technical: {
            style: "clinical",
            content_requirements: [
                "Use DSM-5 criteria references",
                "Include specific scores and observations",
                "Maintain professional terminology"
            ]
        },
        appendix_parent: {
            style: "accessible",
            content_requirements: [
                "Use everyday language",
                "Provide practical examples",
                "Focus on strengths and support"
            ]
        },
        summary_technical: {
            style: "clinical_summary",
            content_requirements: [
                "Synthesize key findings",
                "Reference assessment tools",
                "Link observations to clinical implications"
            ]
        },
        summary_parent: {
            style: "accessible_summary",
            content_requirements: [
                "Highlight key strengths",
                "Explain findings simply",
                "Provide actionable insights"
            ]
        }
    };

    // Add META_REQUIREMENTS constant near other configurations
    const META_REQUIREMENTS = {
        parent_sections: {
            tone: "supportive, accessible",
            language_level: "parent-friendly",
            focus: "practical applications"
        },
        technical_sections: {
            tone: "professional, clinical",
            language_level: "specialist",
            focus: "evidence-based analysis"
        }
    };

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
    
    // Debug log headers
    Logger.log('Sheet headers:', headers);
    
    // The column name in your sheet is 'CHATA_ID', not 'chata_id'
    const chataIdIndex = headers.indexOf('CHATA_ID');
    Logger.log(`CHATA_ID column index: ${chataIdIndex}`);
    
    if (chataIdIndex === -1) {
        throw new Error('CHATA_ID column not found in sheet. Available columns: ' + headers.join(', '));
    }

    // Debug log first few rows
    Logger.log('First few rows of data:');
    data.slice(0, 3).forEach((row, i) => {
        Logger.log(`Row ${i}: CHATA_ID = ${row[chataIdIndex]}`);
    });

    const row = data.find(row => row[chataIdIndex] === chataId);
    if (!row) {
        throw new Error(`No data found for CHATA_ID: ${chataId}. Available IDs: ${data.slice(1).map(r => r[chataIdIndex]).join(', ')}`);
    }

    // Create JSON object from row data
    const formData = {};
    headers.forEach((header, index) => {
        formData[header] = row[index];
    });

    Logger.log('Successfully found and parsed form data');
    return formData;
    }

    // Function to read placeholder mapping
    function getPlaceholderMap() {
    Logger.log('Reading placeholder mapping...');
    
    const ss = getSpreadsheet();
    const mapSheet = ss.getSheetByName(CONFIG.sheets.Placeholders);
    if (!mapSheet) {
        const error = 'Placeholders_Map sheet not found';
        Logger.log(`ERROR: ${error}. Available sheets: ${ss.getSheets().map(s => s.getName()).join(', ')}`);
        throw new Error(error);
    }

    const data = mapSheet.getDataRange().getValues();
    const headers = data[0];
    Logger.log('Placeholder sheet headers:', headers);
    
    // Debug first few rows
    Logger.log('First few rows of placeholder data:');
    data.slice(0, 3).forEach((row, i) => {
        Logger.log(`Row ${i}:`, row);
    });

    const placeholders = {};
    let processedRows = 0;

    // Convert sheet data to structured placeholder map
    data.slice(1).forEach(row => {
        const id = row[headers.indexOf('Placeholder')];
        if (id) {
        placeholders[id] = {
            description: row[headers.indexOf('Writing_Instructions')] || '',
            wordCount: 250, // Default word count
            category: id.startsWith('C') ? 'Parent' : 'Technical',
            context: 'Report section',
            customPrompt: row[headers.indexOf('Writing_Instructions')] || ''
        };
        processedRows++;
        }
    });

    Logger.log(`Processed ${processedRows} placeholder rows`);
    Logger.log('Placeholder IDs found:', Object.keys(placeholders));

    // Save placeholder map for debugging
    const placeholderDoc = saveDetailedLog('Placeholder_Map', JSON.stringify(placeholders, null, 2), 'DEBUG');
    Logger.log(`Saved placeholder map to: ${placeholderDoc}`);

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

    const systemPrompt = `You are a clinical psychologist at CHATA Clinic London, writing an autism assessment report.
    Your task is to generate content for specific placeholders using structured assessment data.

    ASSESSMENT DATA:
    ${JSON.stringify(formData, null, 2)}

    META REQUIREMENTS:
    1. Parent-Focused Sections (C-series):
       - Tone: ${META_REQUIREMENTS.parent_sections.tone}
       - Language Level: ${META_REQUIREMENTS.parent_sections.language_level}
       - Focus: ${META_REQUIREMENTS.parent_sections.focus}
       
    2. Technical Sections (T-series):
       - Tone: ${META_REQUIREMENTS.technical_sections.tone}
       - Language Level: ${META_REQUIREMENTS.technical_sections.language_level}
       - Focus: ${META_REQUIREMENTS.technical_sections.focus}

    SECTION CONTEXT AND REQUIREMENTS:
    ${Object.entries(SECTION_CONTEXT).map(([section, context]) => `
    ${section.toUpperCase()}:
    Style: ${context.style}
    Requirements:
    ${context.content_requirements.map(req => `- ${req}`).join('\n    ')}
    `).join('\n')}

    ASSESSMENT SCALES AND INTERPRETATIONS:

    1. Sensory Profile Scoring (1-5):
    1 - Significantly Under-responsive: Minimal response to sensory input
    2 - Under-responsive: Reduced response to sensory input
    3 - Typical: Age-appropriate sensory responses
    4 - Over-responsive: Heightened sensitivity to sensory input
    5 - Significantly Over-responsive: Intense reactions to sensory input

    2. Social Communication Scoring (1-5):
    1 - Age Appropriate: Skills matching developmental expectations
    2 - Subtle Differences: Minor variations from typical patterns
    3 - Emerging: Developing but inconsistent skills
    4 - Limited: Significant differences from age expectations
    5 - Significantly Limited: Marked differences requiring substantial support

    3. Restricted Patterns Impact (1-5):
    1 - Not Present: No observable impact
    2 - Minimal Impact: Occasional occurrence, minimal effect
    3 - Moderate Impact: Regular occurrence, noticeable effect
    4 - Significant Impact: Frequent occurrence, substantial effect
    5 - Severe Impact: Constant occurrence, major effect on functioning

    INPUT FORMAT:
    The data includes:
    1. Sensory Profile
    - Scores (1-5 scale with specific interpretations):
        1: Significantly Under-responsive
        2: Under-responsive
        3: Typical
        4: Over-responsive
        5: Significantly Over-responsive
    - Domains: Visual, Auditory, Tactile, Vestibular, Proprioceptive, Oral
    - Each domain includes score and detailed observations
    - Consider impact on daily functioning and environmental adaptations

    2. Social Communication Profile
    - Scores (1-5 scale with specific interpretations):
        1: Age Appropriate
        2: Subtle Differences
        3: Emerging
        4: Limited
        5: Significantly Limited
    - Key Areas:
        * Joint Attention: Response to name, pointing, shared interest
        * Social Reciprocity: Turn-taking, social engagement, peer interaction
        * Verbal Communication: Language use, vocabulary, echolalia
        * Nonverbal Communication: Gestures, eye contact, facial expressions
        * Social Understanding: Social cues, empathy, social context
        * Play Skills: Imaginative play, structured vs. unstructured

    3. Restricted Patterns Profile
    - Scores (1-5 scale with specific interpretations):
        1: Not Present
        2: Minimal Impact
        3: Moderate Impact
        4: Significant Impact
        5: Severe Impact
    - Areas of Focus:
        * Repetitive Behaviors: Motor mannerisms, self-stimulatory behaviors
        * Routines & Rituals: Predictability needs, transitions, changes
        * Special Interests: Knowledge depth, conversation patterns
        * Sensory Interests: Sensory seeking/avoidance patterns

    4. Executive Function
    - Emotional Regulation:
        * Overwhelm triggers
        * Coping strategies
        * Environmental impacts
    - Flexibility:
        * Transition management
        * Routine adherence
        * Thinking patterns

    5. Developmental History
    - Milestone Categories:
        * Motor: Gross/fine motor development
        * Language: Early communication patterns
        * Social: Interaction development
        * Play: Play pattern evolution
    - Concern Timeline:
        * Initial observations
        * Progression patterns
        * Environmental impacts

    6. Assessment Results
    - ADOS-2 Components:
        * Social communication patterns
        * Restricted/repetitive behaviors
        * Play and imagination
        * Stereotyped behaviors
    - Sensory Profile:
        * Modality-specific patterns
        * Environmental impacts
        * Support needs

    7. Clinical Insights
    - Observation Focus Areas:
        * Social interaction style
        * Communication patterns
        * Play behaviors
        * Sensory responses
        * Emotional expression
        * Learning approaches
    - Strengths Analysis:
        * Individual capabilities
        * Special interests
        * Learning preferences
        * Positive traits
    - Support Recommendations:
        * Environmental adaptations
        * Communication strategies
        * Learning supports
        * Family resources

    WRITING REQUIREMENTS:
    1. Generate content for EACH placeholder using appropriate data
    2. Use clear, professional language
    3. For technical sections (T-series):
    - Use clinical terminology
    - Include score interpretations
    - Reference assessment tools
    - Maintain professional tone
    - Connect findings to clinical implications
    - Use evidence-based language

    4. For regular sections (C-series):
    - Use parent-friendly language
    - Explain technical terms
    - Focus on real-world examples
    - Maintain supportive tone
    - Emphasize practical strategies
    - Connect to daily life

    5. Follow specific format for each placeholder:
    - Bullet points where specified
    - Paragraph format where required
    - Adhere to word count limits
    - Ensure grammatical flow
    - Use consistent formatting

    6. Use "${formData.Child_Name}" consistently
    7. Focus on patterns rather than just scores
    8. Use neurodiversity-affirming language
    9. Connect observations to support needs

    CRITICAL GUIDELINES:
    1. Base all content on provided data only
    2. Ensure content flows naturally in context
    3. Include specific examples from assessment
    4. Connect findings to recommendations
    5. Maintain professional clinical style
    6. Use strength-based language
    7. Avoid deficit-based terminology
    8. Consider developmental context
    9. Respect individual differences
    10. Maintain clinical accuracy

    FORMAT REQUIREMENTS:
    1. Bullet Points:
    - Start each point with a capital letter
    - End each point with a period
    - Use consistent bullet style
    - Include 3-5 points per section

    2. Paragraphs:
    - Clear topic sentences
    - Logical flow between ideas
    - Clinical evidence integration
    - Conclusion linking to support

    3. Mid-sentence Placeholders:
    - Ensure grammatical continuity
    - Maintain sentence flow
    - Connect ideas smoothly

    RESPONSE FORMAT:
    For each placeholder:
    ##[PLACEHOLDER_ID]##
    [Content following placeholder-specific instructions]
    ##END##

    Add ##GENERATION_COMPLETE## when finished.`;

    const userPrompt = {
        task: "Generate content for specified placeholders",
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
        const contentPattern = /##([A-Z][0-9]{3}(?:-Bullets)?)##([\s\S]*?)##END##/g;
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
    
    // Create hyperlink formula if details is a URL
    let detailsValue = details;
    if (details && details.startsWith('https://docs.google.com/')) {
        detailsValue = `=HYPERLINK("${details}", "View Document")`;
    }
    
    const rowData = [
        timestamp,
        chataId,
        operation,
        section,
        content,
        detailsValue
    ];
    
    sheet.insertRowAfter(1);
    const range = sheet.getRange(2, 1, 1, rowData.length);
    range.setValues([rowData]);
    
    // If it's a URL cell, apply formatting separately
    if (details && details.startsWith('https://docs.google.com/')) {
        const cell = range.getCell(1, 6);
        cell.setFontColor('#1155cc');
        cell.setFontLine('underline');  // Changed from setUnderline to setFontLine
    }
    
    return details;
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

    // Function to chunk placeholders for processing
    function chunkPlaceholders(placeholderMap, chunkSize = 5) {
    const placeholderIds = Object.keys(placeholderMap);
    const chunks = [];
    
    for (let i = 0; i < placeholderIds.length; i += chunkSize) {
        const chunk = {};
        const chunkIds = placeholderIds.slice(i, i + chunkSize);
        chunkIds.forEach(id => {
        chunk[id] = placeholderMap[id];
        });
        chunks.push(chunk);
    }
    
    Logger.log(`Split ${placeholderIds.length} placeholders into ${chunks.length} chunks`);
    return chunks;
    }

    // Function to generate content for a chunk of placeholders
    async function generateChunkContent(chunk, formData, systemPrompt) {
    const chunkPrompt = {
        task: "Generate content for specified placeholders",
        placeholders: chunk,
        requirements: {
        format: "##PLACEHOLDER_ID##\n[Content]\n##END##",
        style: "Professional clinical writing",
        perspective: "Use 'your child' consistently",
        tone: "Neurodiversity-affirming, strength-based",
        evidence: "Reference specific observations and examples"
        }
    };

    Logger.log(`Generating content for ${Object.keys(chunk).length} placeholders`);
    const response = await callClaudeAPI(
        [{ role: 'user', content: JSON.stringify(chunkPrompt, null, 2) }],
        systemPrompt,
        0.7
    );

    return response;
    }

    // Function to populate template with responses
    function populateTemplate(templateDoc, responses) {
    Logger.log('Populating template with responses...');
    const doc = DocumentApp.openById(templateDoc);
    const body = doc.getBody();
    
    // Track replacements for logging
    const replacementLog = [];
    
    responses.forEach(response => {
        const placeholder = `{{${response.id}}}`;
        const searchResult = body.findText(placeholder);
        
        if (searchResult) {
        const element = searchResult.getElement();
        const text = element.asText();
        const start = searchResult.getStartOffset();
        const end = searchResult.getEndOffset();
        
        text.deleteText(start, end);
        text.insertText(start, response.content);
        
        replacementLog.push({
            placeholder: response.id,
            contentLength: response.content.length,
            position: start,
            success: true
        });
        
        Logger.log(`Replaced ${placeholder} with ${response.content.length} chars`);
        } else {
        Logger.log(`Warning: Placeholder ${placeholder} not found in template`);
        replacementLog.push({
            placeholder: response.id,
            error: 'Placeholder not found in template',
            success: false
        });
        }
    });
    
    doc.saveAndClose();
    return replacementLog;
    }

    // Modified generateReport function
    async function generateReport(chataId) {
    // If no chataId provided, try to get TEST_CHATA_ID from script properties
    if (!chataId) {
        chataId = PropertiesService.getScriptProperties().getProperty('TEST_CHATA_ID');
        if (!chataId) {
        throw new Error('No CHATA_ID provided and TEST_CHATA_ID not found in script properties');
        }
        Logger.log(`Using TEST_CHATA_ID: ${chataId}`);
    }
    
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

        // 4. Get placeholder mapping and chunk it
        const placeholderMap = getPlaceholderMap();
        const chunks = chunkPlaceholders(placeholderMap);
        Logger.log(`Processing ${chunks.length} chunks of placeholders`);

        // Save system prompt for debugging
        const systemPrompt = constructPrompt(formData, placeholderMap).systemPrompt;
        const systemPromptDoc = saveDetailedLog(
        'System_Prompt',
        systemPrompt,
        chataId
        );
        logToSheet(logsSheet, 'Prompt Construction', 'System', 'Generated system prompt', systemPromptDoc, chataId);

        // 5. Process each chunk
        const allResponses = [];
        for (let i = 0; i < chunks.length; i++) {
        Logger.log(`Processing chunk ${i + 1}/${chunks.length}`);
        const chunk = chunks[i];
        
        // Save chunk prompt
        const chunkPrompt = constructPrompt(formData, chunk);
        const promptDoc = saveDetailedLog(
            `Chunk_${i + 1}_Prompt`,
            JSON.stringify({
            metadata: {
                chunk: i + 1,
                total_chunks: chunks.length,
                placeholders: Object.keys(chunk)
            },
            prompt: chunkPrompt.userPrompt
            }, null, 2),
            chataId
        );
        logToSheet(logsSheet, 'Chunk Processing', `Chunk ${i + 1}`, 'Generated prompt', promptDoc, chataId);

        // Generate and process chunk content
        const response = await generateChunkContent(chunk, formData, chunkPrompt.systemPrompt);
        const responseDoc = saveDetailedLog(
            `Chunk_${i + 1}_Response`,
            response,
            chataId
        );
        logToSheet(logsSheet, 'Chunk Processing', `Chunk ${i + 1}`, 'Generated content', responseDoc, chataId);

        const processedResponse = processLLMResponse(response);
        if (!processedResponse.success) {
            throw new Error(`Failed to process chunk ${i + 1}: ${processedResponse.error}`);
        }

        allResponses.push(...processedResponse.content);
        }

        // 6. Save combined responses
        const combinedResponse = {
        success: true,
        content: allResponses,
        rawResponse: allResponses.map(r => `##${r.id}##\n${r.content}\n##END##`).join('\n\n')
        };

        const combinedDoc = saveDetailedLog(
        'Combined_Response',
        JSON.stringify(combinedResponse, null, 2),
        chataId
        );
        logToSheet(logsSheet, 'Response Processing', 'All', 'Combined all responses', combinedDoc, chataId);

        // 7. Populate template with responses
        Logger.log('Populating template with responses...');
        const replacementLog = populateTemplate(template.docId, allResponses);
        
        // Save replacement log
        const replacementLogDoc = saveDetailedLog(
        'Replacement_Log',
        JSON.stringify(replacementLog, null, 2),
        chataId
        );
        logToSheet(logsSheet, 'Template Population', 'All', 'Populated template with responses', replacementLogDoc, chataId);

        // 8. Return results
        return {
        success: true,
        templateUrl: template.docUrl,
        generatedContent: combinedResponse.content,
        rawResponse: combinedResponse.rawResponse,
        logs: {
            systemPrompt: systemPromptDoc,
            combinedResponse: combinedDoc,
            replacementLog: replacementLogDoc
        },
        progress: {
            status: 'complete',
            message: 'Report generation successful',
            step: 8,
            totalSteps: 8,
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
            totalSteps: 8,
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
            totalSteps: 8
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
            totalSteps: 8,
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

    // Add test function for single placeholder
    async function testSinglePlaceholder() {
        Logger.log('\n=== Testing Single Placeholder Generation ===');
        
        try {
            // 1. Initialize
            const ss = getSpreadsheet();
            const logsSheet = initializeLogsSheet(ss);
            const testChataId = PropertiesService.getScriptProperties().getProperty('TEST_CHATA_ID');
            
            if (!testChataId) {
                throw new Error('TEST_CHATA_ID not found in script properties');
            }
            
            // 2. Create template copy
            const template = createTemplateCopy(testChataId);
            if (!template.success) throw new Error(`Template creation failed: ${template.error}`);
            Logger.log(`Created template: ${template.docUrl}`);
            logToSheet(logsSheet, 'Template Creation', 'Test', 'Created template document', template.docUrl, testChataId);

            // 3. Get form data
            const formData = getFormData(testChataId);
            Logger.log('Retrieved form data');
            
            // 4. Get single placeholder from Placeholders_Map sheet
            const mapSheet = ss.getSheetByName(CONFIG.sheets.Placeholders);
            const data = mapSheet.getDataRange().getValues();
            const headers = data[0];
            const placeholderCol = headers.indexOf('Placeholder');
            const instructionsCol = headers.indexOf('Writing_Instructions');
            
            // Use C001 as test placeholder
            const testRow = data.find(row => row[placeholderCol] === 'C001');
            if (!testRow) throw new Error('Test placeholder C001 not found in mapping sheet');
            
            const placeholderData = {
                id: testRow[placeholderCol],
                instructions: testRow[instructionsCol]
            };
            Logger.log(`Using placeholder: ${placeholderData.id}`);

            // 5. Construct focused prompt
            const systemPrompt = `You are a clinical psychologist at CHATA Clinic London, writing an autism assessment report.
            Your task is to generate content for a specific placeholder using the provided assessment data.
            
            ASSESSMENT DATA:
            ${JSON.stringify(formData, null, 2)}
            
            WRITING REQUIREMENTS:
            - Use clear, parent-friendly language
            - Focus on practical examples and daily life impact
            - Maintain a supportive, strength-based tone
            - Reference specific observations from the assessment
            - Format response exactly as: ##PLACEHOLDER_ID##\n[Content]\n##END##`;

            const userPrompt = {
                task: "Generate content for placeholder",
                placeholder: placeholderData.id,
                instructions: placeholderData.instructions,
                format: "##PLACEHOLDER_ID##\n[Content]\n##END##"
            };

            // 6. Save prompts for debugging
            const promptDoc = saveDetailedLog(
                'Test_Prompt',
                JSON.stringify({
                    system: systemPrompt,
                    user: userPrompt
                }, null, 2),
                testChataId
            );
            logToSheet(logsSheet, 'Prompt Creation', 'Test', 'Generated test prompt', promptDoc, testChataId);

            // 7. Call API
            Logger.log('Calling Claude API...');
            const response = await callClaudeAPI(
                [{ role: 'user', content: JSON.stringify(userPrompt, null, 2) }],
                systemPrompt,
                0.7
            );

            // 8. Save response
            const responseDoc = saveDetailedLog('Test_Response', response, testChataId);
            logToSheet(logsSheet, 'API Response', 'Test', 'Received API response', responseDoc, testChataId);

            // 9. Process response
            const processedResponse = processLLMResponse(response);
            if (!processedResponse.success) {
                throw new Error(`Failed to process response: ${processedResponse.error}`);
            }

            // 10. Populate template
            const doc = DocumentApp.openById(template.docId);
            const body = doc.getBody();
            
            const placeholder = `{{${placeholderData.id}}}`;
            const searchResult = body.findText(placeholder);
            
            if (!searchResult) {
                throw new Error(`Placeholder ${placeholder} not found in template`);
            }

            const element = searchResult.getElement().asText();
            const start = searchResult.getStartOffset();
            const end = start + placeholder.length;
            
            element.deleteText(start, end - 1);
            element.insertText(start, processedResponse.content[0].content);
            doc.saveAndClose();

            // 11. Log success
            const replacementLog = {
                placeholder: placeholderData.id,
                contentLength: processedResponse.content[0].content.length,
                success: true
            };

            const finalDoc = saveDetailedLog(
                'Test_Result',
                JSON.stringify(replacementLog, null, 2),
                testChataId
            );
            logToSheet(logsSheet, 'Test Complete', 'Test', 'Single placeholder test completed', finalDoc, testChataId);

            return {
                success: true,
                templateUrl: template.docUrl,
                logs: {
                    prompt: promptDoc,
                    response: responseDoc,
                    result: finalDoc
                }
            };

        } catch (error) {
            Logger.log(`Error in test: ${error.message}`);
            if (logsSheet) {
                logToSheet(logsSheet, 'Error', 'Test', error.message, error.stack, testChataId);
            }
            throw error;
        }
    } 