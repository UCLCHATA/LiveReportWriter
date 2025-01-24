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
    },
    columns: {
        // New column mapping based on provided structure
        chataId: 'CHATA_ID',
        clinicName: 'Clinic_Name',
        clinicianName: 'Clinician_Name',
        clinicianEmail: 'Clinician_Email',
        childFirstName: 'Child_FirstName',
        childSecondName: 'Child_SecondName',
        childAge: 'Child_Age',
        childGender: 'Child_Gender',
        // Sensory profile columns
        sensoryScores: {
            visual: 'Visual_Score',
            auditory: 'Auditory_Score',
            tactile: 'Tactile_Score',
            vestibular: 'Vestibular_Score',
            proprioceptive: 'Proprioceptive_Score',
            oral: 'Oral_Score'
        },
        sensoryObservations: {
            visual: 'Visual_Observations',
            auditory: 'Auditory_Observations',
            tactile: 'Tactile_Observations',
            vestibular: 'Vestibular_Observations',
            proprioceptive: 'Proprioceptive_Observations',
            oral: 'Oral_Observations'
        },
        // Social communication columns
        socialCommunication: {
            jointAttention: 'JointAttention_Score',
            nonverbalCommunication: 'NonverbalCommunication_Score',
            verbalCommunication: 'VerbalCommunication_Score',
            socialUnderstanding: 'SocialUnderstanding_Score',
            playSkills: 'PlaySkills_Score',
            peerInteractions: 'PeerInteractions_Score'
        },
        socialCommunicationObservations: {
            jointAttention: 'JointAttention_Observations',
            nonverbalCommunication: 'NonverbalCommunication_Observations',
            verbalCommunication: 'VerbalCommunication_Observations',
            socialUnderstanding: 'SocialUnderstanding_Observations',
            playSkills: 'PlaySkills_Observations',
            peerInteractions: 'PeerInteractions_Observations'
        },
        // Restricted patterns columns
        restrictedPatterns: {
            repetitiveBehaviors: 'RepetitiveBehaviors_Score',
            routinesRituals: 'RoutinesRituals_Score',
            specialInterests: 'SpecialInterests_Score',
            sensoryInterests: 'SensoryInterests_Score'
        },
        restrictedPatternsObservations: {
            repetitiveBehaviors: 'RepetitiveBehaviors_Observations',
            routinesRituals: 'RoutinesRituals_Observations',
            specialInterests: 'SpecialInterests_Observations',
            sensoryInterests: 'SensoryInterests_Observations'
        },
        // Executive function columns
        executiveFunction: {
            emotionalRegulation: 'EmotionalRegulation_Score',
            flexibility: 'Flexibility_Score'
        },
        executiveFunctionObservations: {
            emotionalRegulation: 'EmotionalRegulation_Observations',
            flexibility: 'Flexibility_Observations'
        },
        // Additional data columns
        milestoneData: 'Milestone_Timeline_Data',
        historyOfConcerns: 'History_Of_Concerns',
        assessmentLogData: 'Assessment_Log_Data',
        ascStatus: 'ASC_Status',
        adhdStatus: 'ADHD_Status',
        clinicalObservations: 'Clinical_Observations',
        strengthsAbilities: 'Strengths_Abilities',
        prioritySupportAreas: 'Priority_Support_Areas',
        supportRecommendations: 'Support_Recommendations',
        referrals: 'Referrals',
        additionalRemarks: 'Additional_Remarks',
        differentialDiagnosis: 'Differential_Diagnosis',
        // Status tracking
        processedFlag: 'Report_Generated',
        documentUrl: 'Report_URL'
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

// Add CONTENT_GUIDELINES constant
const CONTENT_GUIDELINES = {
    critical: [
        "DO NOT reference UI elements (charts, sliders, forms) in the content",
        "DO NOT use numerical scores in the narrative",
        "DO use descriptive patterns from observations as evidence",
        "DO reference specific timeline events and milestones when relevant",
        "Focus on real-world implications and practical support needs"
    ],
    interpretation: {
        sensory_processing: {
            "Significantly Under-responsive": "Describe minimal responses to sensory experiences",
            "Under-responsive": "Note reduced engagement with sensory input",
            "Typical": "Describe age-appropriate sensory responses",
            "Over-responsive": "Highlight heightened sensitivity patterns",
            "Significantly Over-responsive": "Emphasize intense sensory experiences"
        },
        social_communication: {
            "Age Appropriate": "Describe skills matching developmental expectations",
            "Subtle Differences": "Note minor variations from typical patterns",
            "Emerging": "Highlight developing but inconsistent skills",
            "Limited": "Describe significant differences from expectations",
            "Significantly Limited": "Emphasize marked differences needing support"
        },
        restricted_patterns: {
            "Not Present": "Note absence of impact",
            "Minimal Impact": "Describe occasional occurrences",
            "Moderate Impact": "Highlight regular patterns",
            "Significant Impact": "Emphasize frequent occurrences",
            "Severe Impact": "Describe constant presence"
        }
    },
    evidence_based: {
        observation_sources: [
            "Developmental timeline events",
            "Behavioral patterns",
            "Environmental impacts",
            "Daily life examples",
            "Parent-reported experiences",
            "Clinical observations"
        ],
        pattern_analysis: [
            "Connect related observations",
            "Identify recurring themes",
            "Link patterns to support needs",
            "Consider environmental factors",
            "Note developmental progression"
        ]
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

// Function to process score value
function processScoreValue(value) {
    if (!value || value.trim() === '') return 'Skipped';
    
    // Check for "0 out of 5" pattern
    const zeroPattern = /0 out of 5/i;
    if (zeroPattern.test(value)) {
        return 'Skipped';
    }
    
    return value;
}

// Function to get form data from R3_Form
function getFormData(chataId) {
    Logger.log(`Getting form data for CHATA_ID: ${chataId}`);
    
    const ss = getSpreadsheet();
    const r3Sheet = ss.getSheetByName(CONFIG.sheets.R3);
    if (!r3Sheet) throw new Error('R3_Form sheet not found');

    const data = r3Sheet.getDataRange().getValues();
    const headers = data[0];
    
    Logger.log('Sheet headers:', headers);
    
    const chataIdIndex = headers.indexOf(CONFIG.columns.chataId);
    Logger.log(`CHATA_ID column index: ${chataIdIndex}`);
    
    if (chataIdIndex === -1) {
        throw new Error('CHATA_ID column not found in sheet. Available columns: ' + headers.join(', '));
    }

    const row = data.find(row => row[chataIdIndex] === chataId);
    if (!row) {
        throw new Error(`No data found for CHATA_ID: ${chataId}. Available IDs: ${data.slice(1).map(r => r[chataIdIndex]).join(', ')}`);
    }

    // Create structured data object
    const formData = {
        chataId: row[headers.indexOf(CONFIG.columns.chataId)],
        clinicName: row[headers.indexOf(CONFIG.columns.clinicName)],
        clinicianName: row[headers.indexOf(CONFIG.columns.clinicianName)],
        clinicianEmail: row[headers.indexOf(CONFIG.columns.clinicianEmail)],
        childInfo: {
            firstName: row[headers.indexOf(CONFIG.columns.childFirstName)],
            secondName: row[headers.indexOf(CONFIG.columns.childSecondName)],
            age: row[headers.indexOf(CONFIG.columns.childAge)],
            gender: row[headers.indexOf(CONFIG.columns.childGender)]
        },
        sensoryProfile: {
            scores: {},
            observations: {}
        },
        socialCommunication: {
            scores: {},
            observations: {}
        },
        restrictedPatterns: {
            scores: {},
            observations: {}
        },
        executiveFunction: {
            scores: {},
            observations: {}
        },
        additionalData: {}
    };

    // Populate sensory profile data
    Object.entries(CONFIG.columns.sensoryScores).forEach(([key, column]) => {
        formData.sensoryProfile.scores[key] = processScoreValue(row[headers.indexOf(column)]);
    });
    Object.entries(CONFIG.columns.sensoryObservations).forEach(([key, column]) => {
        formData.sensoryProfile.observations[key] = row[headers.indexOf(column)];
    });

    // Populate social communication data
    Object.entries(CONFIG.columns.socialCommunication).forEach(([key, column]) => {
        formData.socialCommunication.scores[key] = processScoreValue(row[headers.indexOf(column)]);
    });
    Object.entries(CONFIG.columns.socialCommunicationObservations).forEach(([key, column]) => {
        formData.socialCommunication.observations[key] = row[headers.indexOf(column)];
    });

    // Populate restricted patterns data
    Object.entries(CONFIG.columns.restrictedPatterns).forEach(([key, column]) => {
        formData.restrictedPatterns.scores[key] = processScoreValue(row[headers.indexOf(column)]);
    });
    Object.entries(CONFIG.columns.restrictedPatternsObservations).forEach(([key, column]) => {
        formData.restrictedPatterns.observations[key] = row[headers.indexOf(column)];
    });

    // Populate executive function data
    Object.entries(CONFIG.columns.executiveFunction).forEach(([key, column]) => {
        formData.executiveFunction.scores[key] = processScoreValue(row[headers.indexOf(column)]);
    });
    Object.entries(CONFIG.columns.executiveFunctionObservations).forEach(([key, column]) => {
        formData.executiveFunction.observations[key] = row[headers.indexOf(column)];
    });

    // Populate additional data
    const additionalFields = [
        'milestoneData',
        'historyOfConcerns',
        'assessmentLogData',
        'ascStatus',
        'adhdStatus',
        'clinicalObservations',
        'strengthsAbilities',
        'prioritySupportAreas',
        'supportRecommendations',
        'referrals',
        'additionalRemarks',
        'differentialDiagnosis'
    ];

    additionalFields.forEach(field => {
        const value = row[headers.indexOf(CONFIG.columns[field])];
        // Parse JSON fields if they contain JSON data
        if (field === 'milestoneData' || field === 'assessmentLogData') {
            try {
                formData.additionalData[field] = value ? JSON.parse(value) : null;
            } catch (e) {
                formData.additionalData[field] = value;
            }
        } else {
            formData.additionalData[field] = value;
        }
    });

    Logger.log('Successfully parsed form data');
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
    Your task is to generate content for specific placeholders using ONLY the structured assessment data provided.

    CRITICAL CONTENT RULES:
    1. OBJECTIVITY:
       - Use ONLY information provided in the assessment data
       - DO NOT create or infer observations not present in the data
       - DO NOT embellish or add hypothetical scenarios
       - Maintain clinical accuracy while being accessible
       - If data is missing for a section, acknowledge the limitation

    2. TECHNICAL vs PARENT-FRIENDLY SECTIONS:
       Technical Sections (T-series):
       - Use precise clinical terminology
       - Reference specific DSM-5 criteria
       - Include detailed assessment interpretations
       - Maintain professional clinical tone
       - Integrate quantitative data appropriately
       
       Parent Sections (C-series):
       - Translate clinical terms into accessible language
       - Focus on observed patterns without mentioning scores
       - Use natural, descriptive language
       - Avoid clinical jargon
       - Connect observations to daily life impact

    3. LANGUAGE AND STRUCTURE:
       - Minimize use of "your child" - instead vary language naturally:
         Instead of: "Your child shows strong visual skills"
         Use: "John demonstrates strong visual skills" or "Observations indicate strong visual processing"
       - Use clear topic sentences
       - Maintain consistent formatting
       - Ensure logical flow between paragraphs
       - Use bullet points consistently

    4. INTEGRATION REQUIREMENTS:
       - Link observations directly to recommendations
       - Connect assessment data to support strategies
       - Ensure recommendations align with observed needs
       - Maintain clear connections between sections
       - Reference specific examples from the assessment data

    5. CONTENT TRANSFORMATION:
       Technical to Parent-Friendly Examples:
       Technical: "Demonstrates significant deficits in joint attention behaviors (ADOS-2 score 3)"
       Parent: "John finds it challenging to share attention and interests with others during activities"

       Technical: "Exhibits stereotyped motor movements during periods of emotional dysregulation"
       Parent: "When feeling overwhelmed, John may rock or move his body to help stay calm"

    6. SECTION-SPECIFIC GUIDELINES:
       Appendix Technical:
       - Include DSM-5 criteria analysis
       - Reference specific assessment tools
       - Detail interpretation methodology
       - Maintain clinical terminology
       
       Summary Parent:
       - Focus on strengths and patterns
       - Describe real-world implications
       - Use accessible examples
       - Avoid clinical terms

    7. DATA INTEGRATION RULES:
       - Only reference observations documented in the assessment
       - Use provided scores to inform descriptions without stating numbers
       - Integrate sensory profile data into relevant sections
       - Connect developmental history to current presentation
       - Link assessment findings to recommendations

    CRITICAL REMINDERS:
    1. Stay strictly within provided assessment data
    2. Maintain clear technical/parent section distinctions
    3. Ensure recommendations link directly to observations
    4. Use varied, natural language instead of repetitive phrases
    5. Keep formatting consistent within sections

    [Previous prompt content continues...]`;

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
            // Clean up the content - remove [Content] marker and any surrounding whitespace
            let content = match[2]
                .replace(/\[Content\]/g, '')  // Remove [Content] marker
                .replace(/^\s+|\s+$/g, '')    // Trim whitespace
                .replace(/\n{3,}/g, '\n\n');  // Normalize multiple newlines
            
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

// Add after the utility functions
function processChunkedImages(formData, doc) {
    const imageTypes = ['Milestone_Image', 'CombinedGraph_Image'];
    
    imageTypes.forEach(imageType => {
        // Find all chunks for this image type
        const chunkKeys = Object.keys(formData)
            .filter(key => key.startsWith(`${imageType}_Chunk_`))
            .sort((a, b) => {
                const numA = parseInt(a.split('_').pop());
                const numB = parseInt(b.split('_').pop());
                return numA - numB;
            });

        if (chunkKeys.length === 0) {
            Logger.log(`No chunks found for ${imageType}`);
            return;
        }

        // Process first chunk to get metadata
        const firstChunk = formData[chunkKeys[0]];
        const [includeFlag, chunkIndex, totalChunks, ...dataParts] = firstChunk.split('|');
        const shouldInclude = includeFlag === '{{Include}}';

        if (!shouldInclude) {
            Logger.log(`${imageType} marked as Not-Include`);
            return;
        }

        // Combine all chunks
        let base64Data = '';
        chunkKeys.forEach(key => {
            const chunk = formData[key];
            const chunkData = chunk.split('|').slice(3).join('|');
            base64Data += chunkData;
        });

        try {
            // Convert base64 to blob
            const imageBlob = Utilities.newBlob(Utilities.base64Decode(base64Data), 'image/png');
            
            // Insert at the end of the document
            doc.appendParagraph(`${imageType}:`);
            doc.appendImage(imageBlob);
            doc.appendParagraph('');
            
            Logger.log(`Successfully inserted ${imageType}`);
        } catch (error) {
            Logger.log(`Error inserting ${imageType}: ${error.message}`);
        }
    });
}

// Function to populate template with responses
function populateTemplate(templateDoc, responses) {
    Logger.log('Populating template with responses...');
    const doc = DocumentApp.openById(templateDoc);
    const body = doc.getBody();
    
    // Track replacements for logging
    const replacementLog = [];
    
    // First, handle LLM responses
    responses.forEach(response => {
        const id = response.id;
        let content = response.content;
        Logger.log(`\nProcessing content for ID: ${id}`);
        
        // Special handling for bullet point placeholders
        if (id.endsWith('-Bullets')) {
            content = content.split('\n').map(line => {
                if (line.trim().startsWith('-')) {
                    // Convert "- " to actual bullet point
                    return line.replace(/^-\s+/, '• ');
                }
                return line;
            }).join('\n');
        }
        
        // Clean up content
        content = content
            .replace(/\\n/g, '\n')
            .replace(/\\"/g, '"')
            .replace(/\\t/g, ' ')
            .replace(/\\\\/g, '')
            .replace(/\*\*(.*?)\*\*/g, '$1')
            .replace(/\*(.*?)\*/g, '$1')
            .replace(/_(.*?)_/g, '$1')
            .replace(/`(.*?)`/g, '$1')
            .replace(/\[(.*?)\]/g, '$1')
            .replace(/["']([^"']+)["']/g, '$1')
            .replace(/"([^"]+)"/g, '$1')
            .replace(/\s+/g, ' ')
            .replace(/\n\s*\n\s*\n/g, '\n\n')
            .replace(/^\s+|\s+$/g, '')
            .replace(/\s*\.\s*/g, '. ')
            .replace(/\s*,\s*/g, ', ')
            .replace(/\s+\./g, '.')
            .replace(/\s+,/g, ',')
            .replace(/\s+;/g, ';')
            .replace(/\(\s+/g, '(')
            .replace(/\s+\)/g, ')')
            .trim();
        
        // Replace placeholder
        const exactPattern = `{{${id}}}`;
        const range = body.findText(exactPattern);
        
        if (range) {
            try {
                const element = range.getElement();
                const startOffset = range.getStartOffset();
                const endOffsetInclusive = range.getEndOffsetInclusive();
                
                const textElement = element.asText();
                textElement.deleteText(startOffset, endOffsetInclusive);
                const insertedText = textElement.insertText(startOffset, content);
                
                // Apply consistent formatting
                insertedText.setFontFamily('Arial')
                          .setFontSize(11)
                          .setBold(false)
                          .setItalic(false)
                          .setUnderline(false);
                
                Logger.log(`Successfully replaced "${exactPattern}"`);
                replacementLog.push({
                    id: id,
                    success: true,
                    position: startOffset,
                    contentLength: content.length
                });
            } catch (e) {
                Logger.log(`Error during replacement: ${e.message}`);
                replacementLog.push({
                    id: id,
                    success: false,
                    error: e.message
                });
            }
        }
    });
    
    // Now handle specific placeholders from sheet data
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName(CONFIG.sheets.R3);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const firstRow = data[1]; // First data row
    
    const specificReplacements = {
        'Clinic_Name': firstRow[headers.indexOf(CONFIG.columns.clinicName)],
        'Child_Name': `${firstRow[headers.indexOf(CONFIG.columns.childFirstName)]} ${firstRow[headers.indexOf(CONFIG.columns.childSecondName)]}`,
        'PARENT_NAME': firstRow[headers.indexOf(CONFIG.columns.childSecondName)],
        'Age': firstRow[headers.indexOf(CONFIG.columns.childAge)],
        'Clinician_Name': firstRow[headers.indexOf(CONFIG.columns.clinicianName)]
    };
    
    // Replace specific placeholders
    Object.entries(specificReplacements).forEach(([key, value]) => {
        if (!value) {
            Logger.log(`Warning: No value found for ${key}`);
            return;
        }
        
        const pattern = `{{${key}}}`;
        let range;
        while ((range = body.findText(pattern)) !== null) {
            try {
                const element = range.getElement();
                const startOffset = range.getStartOffset();
                const endOffsetInclusive = range.getEndOffsetInclusive();
                
                const textElement = element.asText();
                textElement.deleteText(startOffset, endOffsetInclusive);
                textElement.insertText(startOffset, value);
                
                Logger.log(`Successfully replaced "${pattern}" with "${value}"`);
                replacementLog.push({
                    id: key,
                    success: true,
                    value: value
                });
            } catch (e) {
                Logger.log(`Error replacing ${pattern}: ${e.message}`);
                replacementLog.push({
                    id: key,
                    success: false,
                    error: e.message
                });
            }
        }
    });
    
    // Finally, replace all instances of "John" with Child_Name
    const childName = specificReplacements['Child_Name'];
    if (childName) {
        let range;
        while ((range = body.findText('John')) !== null) {
            try {
                const element = range.getElement();
                const startOffset = range.getStartOffset();
                const endOffsetInclusive = range.getEndOffsetInclusive();
                
                const textElement = element.asText();
                textElement.deleteText(startOffset, endOffsetInclusive);
                textElement.insertText(startOffset, childName);
                
                Logger.log(`Replaced "John" with "${childName}"`);
            } catch (e) {
                Logger.log(`Error replacing "John": ${e.message}`);
            }
        }
    }
    
    doc.saveAndClose();
    
    // Log replacement summary
    const successful = replacementLog.filter(r => r.success).length;
    const failed = replacementLog.filter(r => !r.success).length;
    Logger.log(`\nReplacement Summary:
    - Total replacements attempted: ${replacementLog.length}
    - Successful: ${successful}
    - Failed: ${failed}`);
    
    return replacementLog;
}

// Function to compile detailed error logs
function compileErrorLogs(error, formData, additionalLogs = []) {
    const timestamp = new Date().toISOString();
    const childName = `${formData[CONFIG.columns.childFirstName]} ${formData[CONFIG.columns.childSecondName]}`;
    
    let logContent = `ERROR REPORT - ${timestamp}\n`;
    logContent += `=================================\n\n`;
    
    // Basic Information
    logContent += `BASIC INFORMATION:\n`;
    logContent += `-----------------\n`;
    logContent += `Child: ${childName}\n`;
    logContent += `CHATA ID: ${formData[CONFIG.columns.chataId]}\n`;
    logContent += `Clinician: ${formData[CONFIG.columns.clinicianName]}\n`;
    logContent += `Timestamp: ${timestamp}\n\n`;
    
    // Error Details
    logContent += `ERROR DETAILS:\n`;
    logContent += `-------------\n`;
    logContent += `Message: ${error.message || error}\n`;
    if (error.stack) {
        logContent += `Stack Trace:\n${error.stack}\n`;
    }
    logContent += `\n`;
    
    // System State
    logContent += `SYSTEM STATE:\n`;
    logContent += `-------------\n`;
    logContent += `Script Version: ${CONFIG.templateVersion}\n`;
    logContent += `Running User: ${Session.getEffectiveUser().getEmail()}\n\n`;
    
    // Recent Logs
    logContent += `RECENT LOGS:\n`;
    logContent += `-----------\n`;
    additionalLogs.forEach(log => {
        logContent += `${log}\n`;
    });
    
    // Create PDF
    const doc = DocumentApp.create(`Error_Report_${formData[CONFIG.columns.chataId]}_${timestamp}`);
    const body = doc.getBody();
    body.setText(logContent);
    doc.saveAndClose();
    
    // Convert to PDF
    const pdf = DriveApp.getFileById(doc.getId()).getAs('application/pdf');
    DriveApp.getFileById(doc.getId()).setTrashed(true);  // Clean up the temporary doc
    
    return pdf;
}

// Updated sendErrorNotification function
function sendErrorNotification(formData, error, additionalLogs = []) {
    const clinicianEmail = formData[CONFIG.columns.clinicianEmail];
    if (!clinicianEmail) {
        Logger.log('No clinician email found for error notification');
        return;
    }
    
    const childName = `${formData[CONFIG.columns.childFirstName]} ${formData[CONFIG.columns.childSecondName]}`;
    const subject = `Report Generation Error - ${childName}`;
    const body = `Dear ${formData[CONFIG.columns.clinicianName]},

We encountered an error while generating the assessment report for ${childName}.

Error Summary: ${error.message || error}

A detailed error report has been attached to this email as a PDF. This report includes:
- Complete error details and stack trace
- System state information
- Recent operation logs
- Troubleshooting context

Our team has been notified and will investigate the issue. We will notify you once the report is successfully generated.

Best regards,
CHATA Clinic Assessment System`;
    
    try {
        // Compile detailed logs and create PDF
        const errorLogsPdf = compileErrorLogs(error, formData, additionalLogs);
        
        // Send email with attachment
        MailApp.sendEmail({
            to: clinicianEmail,
            subject: subject,
            body: body,
            attachments: [errorLogsPdf]
        });
        
        Logger.log(`Error notification with logs sent to ${clinicianEmail}`);
    } catch (emailError) {
        Logger.log(`Error sending error notification: ${emailError.message}`);
        // Try sending without attachment if PDF creation fails
        MailApp.sendEmail({
            to: clinicianEmail,
            subject: subject + ' (Log Attachment Failed)',
            body: body + '\n\nNote: Error log attachment failed to generate. Support team has been notified.'
        });
    }
}

// Modified generateReport function
async function generateReport(chataId) {
    const logs = [];
    const logCapture = (message) => {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] ${message}`;
        logs.push(logMessage);
        Logger.log(logMessage);
    };
    
    try {
        logCapture(`Starting report generation for CHATA_ID: ${chataId}`);
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

            // 6. Populate template with responses
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
                generatedContent: allResponses,
                rawResponse: allResponses.map(r => `##${r.id}##\n${r.content}\n##END##`).join('\n\n'),
                logs: {
                    systemPrompt: systemPromptDoc,
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
            logCapture(`Error in generateReport: ${error.message}`);
            logCapture(`Stack trace: ${error.stack}`);
            
            // Get form data for error notification
            try {
                const formData = getFormData(chataId);
                sendErrorNotification(formData, error, logs);
            } catch (dataError) {
                logCapture(`Failed to get form data for error notification: ${dataError.message}`);
                // Create minimal form data for error notification
                const minimalFormData = {
                    [CONFIG.columns.chataId]: chataId,
                    [CONFIG.columns.clinicianEmail]: Session.getEffectiveUser().getEmail(),
                    [CONFIG.columns.clinicianName]: 'Clinician',
                    [CONFIG.columns.childFirstName]: 'Unknown',
                    [CONFIG.columns.childSecondName]: 'Child'
                };
                sendErrorNotification(minimalFormData, error, logs);
            }
            
            return {
                success: false,
                error: error.message,
                logs: logs,
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
    } catch (error) {
        logCapture(`Error in generateReport: ${error.message}`);
        logCapture(`Stack trace: ${error.stack}`);
        
        // Get form data for error notification
        try {
            const formData = getFormData(chataId);
            sendErrorNotification(formData, error, logs);
        } catch (dataError) {
            logCapture(`Failed to get form data for error notification: ${dataError.message}`);
            // Create minimal form data for error notification
            const minimalFormData = {
                [CONFIG.columns.chataId]: chataId,
                [CONFIG.columns.clinicianEmail]: Session.getEffectiveUser().getEmail(),
                [CONFIG.columns.clinicianName]: 'Clinician',
                [CONFIG.columns.childFirstName]: 'Unknown',
                [CONFIG.columns.childSecondName]: 'Child'
            };
            sendErrorNotification(minimalFormData, error, logs);
        }
        
        return {
            success: false,
            error: error.message,
            logs: logs,
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

// Function to process pending reports in batch
function processPendingReports() {
    try {
        Logger.log('Starting batch processing of pending reports...');
        
        const ss = getSpreadsheet();
        const sheet = ss.getSheetByName(CONFIG.sheets.R3);
        if (!sheet) {
            throw new Error('R3_Form sheet not found');
        }
        
        const data = sheet.getDataRange().getValues();
        const headers = data[0];
        
        // Get column indices
        const chataIdCol = headers.indexOf(CONFIG.columns.chataId);
        const processedFlagCol = headers.indexOf(CONFIG.columns.processedFlag);
        const documentUrlCol = headers.indexOf(CONFIG.columns.documentUrl);
        
        if (chataIdCol === -1 || processedFlagCol === -1 || documentUrlCol === -1) {
            throw new Error('Required columns not found in sheet');
        }
        
        // Find unprocessed rows
        const pendingRows = [];
        data.forEach((row, index) => {
            if (index === 0) return; // Skip header row
            
            const chataId = row[chataIdCol];
            const processed = row[processedFlagCol];
            const hasUrl = row[documentUrlCol];
            
            if (chataId && !processed && !hasUrl) {
                pendingRows.push({
                    rowIndex: index + 1,
                    chataId: chataId,
                    data: row
                });
            }
        });
        
        Logger.log(`Found ${pendingRows.length} pending reports to process`);
        
        // Process each pending row
        const results = pendingRows.map(pending => {
            try {
                Logger.log(`Processing report for CHATA_ID: ${pending.chataId}`);
                
                // Create form data object
                const formData = {};
                headers.forEach((header, index) => {
                    formData[header] = pending.data[index];
                });
                
                // Generate report
                const result = generateReport(pending.chataId);
                
                // Update sheet with results
                if (result.success) {
                    sheet.getRange(pending.rowIndex, documentUrlCol + 1).setValue(result.templateUrl);
                    sheet.getRange(pending.rowIndex, processedFlagCol + 1).setValue(true);
                    
                    // Send notification
                    sendEmailNotification(formData, result.templateUrl);
                    
                    return {
                        chataId: pending.chataId,
                        success: true,
                        documentUrl: result.templateUrl
                    };
                } else {
                    // Handle failure
                    sendErrorNotification(formData, result.error);
                    return {
                        chataId: pending.chataId,
                        success: false,
                        error: result.error
                    };
                }
            } catch (error) {
                Logger.log(`Error processing CHATA_ID ${pending.chataId}: ${error.message}`);
                return {
                    chataId: pending.chataId,
                    success: false,
                    error: error.message
                };
            }
        });
        
        // Log summary
        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;
        
        Logger.log(`Batch processing completed:
        - Total processed: ${results.length}
        - Successful: ${successful}
        - Failed: ${failed}`);
        
        return {
            success: true,
            processed: results.length,
            successful: successful,
            failed: failed,
            details: results
        };
        
    } catch (error) {
        Logger.log(`Error in batch processing: ${error.message}`);
        return {
            success: false,
            error: error.message
        };
    }
}

// Function to send email notification
function sendEmailNotification(formData, documentUrl) {
    const clinicianEmail = formData[CONFIG.columns.clinicianEmail];
    if (!clinicianEmail) {
        Logger.log('No clinician email found for notification');
        return;
    }
    
    const childName = `${formData[CONFIG.columns.childFirstName]} ${formData[CONFIG.columns.childSecondName]}`;
    const subject = `Assessment Report Ready - ${childName}`;
    const body = `Dear ${formData[CONFIG.columns.clinicianName]},

The assessment report for ${childName} has been generated and is ready for your review.

You can access the report here: ${documentUrl}

To edit the report, you have two options:

1. Make a copy in your Google Drive:
   - Open the link above
   - Click "File" in the top menu
   - Select "Make a copy"
   - The copy will be saved to your Google Drive and you can edit it freely

2. Download as Microsoft Word:
   - Open the link above
   - Click "File" in the top menu
   - Select "Download"
   - Choose "Microsoft Word (.docx)"
   - Open the downloaded file in Microsoft Word to edit

Please choose the option that works best for your workflow. The original document will remain unchanged as a reference.

Best regards,
CHATA Clinic Assessment System`;
    
    try {
        MailApp.sendEmail({
            to: clinicianEmail,
            subject: subject,
            body: body
        });
        Logger.log(`Notification email sent to ${clinicianEmail}`);
    } catch (error) {
        Logger.log(`Error sending notification email: ${error.message}`);
    }
}

// Test functions
function testSetup() {
    try {
        Logger.log('Starting setup test...');
        
        // 1. Run setup
        setup();
        Logger.log('Basic setup complete');
        
        // 2. Setup triggers
        setupAllTriggers();
        Logger.log('Triggers setup complete');
        
        // 3. Verify spreadsheet access
        const ss = getSpreadsheet();
        const sheets = ss.getSheets().map(s => s.getName());
        Logger.log('Available sheets:', sheets);
        
        // 4. Verify required sheets exist
        const requiredSheets = Object.values(CONFIG.sheets);
        const missingSheets = requiredSheets.filter(name => !sheets.includes(name));
        
        if (missingSheets.length > 0) {
            throw new Error(`Missing required sheets: ${missingSheets.join(', ')}`);
        }
        
        // 5. Verify column structure
        const r3Sheet = ss.getSheetByName(CONFIG.sheets.R3);
        const headers = r3Sheet.getRange(1, 1, 1, r3Sheet.getLastColumn()).getValues()[0];
        
        // Check required columns
        const requiredColumns = [
            CONFIG.columns.chataId,
            CONFIG.columns.clinicianEmail,
            CONFIG.columns.processedFlag,
            CONFIG.columns.documentUrl
        ];
        
        const missingColumns = requiredColumns.filter(col => !headers.includes(col));
        if (missingColumns.length > 0) {
            throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
        }
        
        Logger.log('Setup test completed successfully');
        return {
            success: true,
            sheets: sheets,
            columns: headers
        };
        
    } catch (error) {
        Logger.log(`Setup test failed: ${error.message}`);
        return {
            success: false,
            error: error.message
        };
    }
}

// Function to ensure required columns exist
function ensureRequiredColumns() {
    try {
        Logger.log('Checking required columns...');
        
        const ss = getSpreadsheet();
        const sheet = ss.getSheetByName(CONFIG.sheets.R3);
        if (!sheet) {
            throw new Error('R3_Form sheet not found');
        }
        
        // Get current headers
        const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
        Logger.log('Current headers:', headers);
        
        // Define required columns
        const requiredColumns = [
            CONFIG.columns.chataId,
            CONFIG.columns.processedFlag,
            CONFIG.columns.documentUrl,
            CONFIG.columns.clinicianEmail,
            CONFIG.columns.clinicianName,
            CONFIG.columns.childFirstName,
            CONFIG.columns.childSecondName
        ];
        
        // Check which columns are missing
        const missingColumns = requiredColumns.filter(col => !headers.includes(col));
        
        if (missingColumns.length > 0) {
            Logger.log(`Adding missing columns: ${missingColumns.join(', ')}`);
            
            // Add missing columns
            missingColumns.forEach(column => {
                const lastCol = sheet.getLastColumn();
                sheet.getRange(1, lastCol + 1).setValue(column);
            });
            
            Logger.log('Added missing columns successfully');
        } else {
            Logger.log('All required columns are present');
        }
        
        return {
            success: true,
            addedColumns: missingColumns
        };
        
    } catch (error) {
        Logger.log(`Error ensuring required columns: ${error.message}`);
        return {
            success: false,
            error: error.message
        };
    }
}

// Update testBatchProcessing to ensure columns exist
function testBatchProcessing() {
    try {
        Logger.log('Starting batch processing test...');
        
        // Ensure required columns exist
        const columnsResult = ensureRequiredColumns();
        if (!columnsResult.success) {
            throw new Error(`Failed to ensure required columns: ${columnsResult.error}`);
        }
        
        // 1. Get test data
        const ss = getSpreadsheet();
        const sheet = ss.getSheetByName(CONFIG.sheets.R3);
        const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
        
        // 2. Create test row
        const testData = {
            [CONFIG.columns.chataId]: `TEST-${new Date().getTime()}`,
            [CONFIG.columns.clinicName]: 'Test Clinic',
            [CONFIG.columns.clinicianName]: 'Test Clinician',
            [CONFIG.columns.clinicianEmail]: Session.getEffectiveUser().getEmail(),
            [CONFIG.columns.childFirstName]: 'Test',
            [CONFIG.columns.childSecondName]: 'Child',
            [CONFIG.columns.childAge]: '5',
            [CONFIG.columns.childGender]: 'male',
            [CONFIG.columns.processedFlag]: false,  // Explicitly set to false
            [CONFIG.columns.documentUrl]: ''  // Empty string for document URL
        };
        
        // Add test scores
        Object.values(CONFIG.columns.sensoryScores).forEach(col => {
            testData[col] = 'Typical, 3 out of 5 on the 5 point scale';
        });
        
        Object.values(CONFIG.columns.socialCommunication).forEach(col => {
            testData[col] = 'Age Appropriate, 1 out of 5 on the 5 point scale';
        });
        
        // Create row data
        const rowData = headers.map(header => testData[header] || '');
        sheet.appendRow(rowData);
        
        Logger.log('Test row added:', testData[CONFIG.columns.chataId]);
        
        // 3. Run batch processing
        const result = processPendingReports();
        
        Logger.log('Batch processing result:', result);
        
        // 4. Verify results
        if (result.success && result.processed > 0) {
            Logger.log('Batch processing test completed successfully');
            return {
                success: true,
                testId: testData[CONFIG.columns.chataId],
                result: result
            };
        } else {
            throw new Error('Batch processing did not process any rows');
        }
        
    } catch (error) {
        Logger.log(`Batch processing test failed: ${error.message}`);
        return {
            success: false,
            error: error.message
        };
    }
}

function testEmailNotification() {
    try {
        Logger.log('Starting email notification test...');
        
        const testData = {
            [CONFIG.columns.clinicianEmail]: Session.getEffectiveUser().getEmail(),
            [CONFIG.columns.clinicianName]: 'Test Clinician',
            [CONFIG.columns.childFirstName]: 'Test',
            [CONFIG.columns.childSecondName]: 'Child'
        };
        
        // Test success notification
        sendEmailNotification(testData, 'https://example.com/test-doc');
        
        // Test error notification
        sendErrorNotification(testData, 'Test error message');
        
        Logger.log('Email notification test completed successfully');
        return {
            success: true,
            testEmail: testData[CONFIG.columns.clinicianEmail]
        };
        
    } catch (error) {
        Logger.log(`Email notification test failed: ${error.message}`);
        return {
            success: false,
            error: error.message
        };
    }
}

function runAllTests() {
    Logger.log('\n=== Starting all tests ===\n');
    
    const results = {
        setup: testSetup(),
        batchProcessing: testBatchProcessing(),
        emailNotification: testEmailNotification()
    };
    
    Logger.log('\n=== Test Results ===');
    Object.entries(results).forEach(([test, result]) => {
        Logger.log(`${test}: ${result.success ? 'PASSED' : 'FAILED'}`);
        if (!result.success) {
            Logger.log(`Error: ${result.error}`);
        }
    });
    
    return results;
}

// Function to convert Google Doc to Word
function convertToWord(docId) {
    try {
        const doc = DriveApp.getFileById(docId);
        // Use the export method with the correct MIME type
        const blob = doc.getBlob().getAs('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        const wordFile = DriveApp.createFile(blob);
        wordFile.setName(doc.getName() + '.docx');
        
        // Move to same folder as original
        const folder = doc.getParents().next();
        folder.addFile(wordFile);
        DriveApp.getRootFolder().removeFile(wordFile);
        
        Logger.log('Successfully converted document to Word format');
        
        return {
            success: true,
            wordFileId: wordFile.getId(),
            wordFileUrl: wordFile.getUrl()
        };
    } catch (error) {
        Logger.log(`Error converting to Word: ${error.message}`);
        return {
            success: false,
            error: error.message
        };
    }
}

// Function to set file sharing permissions
function setFilePermissions(fileId, email) {
    try {
        const file = DriveApp.getFileById(fileId);
        
        // Set document to anyone with link can view
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        
        // Grant edit access to specific email
        file.addEditor(email);
        
        return {
            success: true,
            viewUrl: file.getUrl(),
            email: email
        };
    } catch (error) {
        Logger.log(`Error setting permissions: ${error.message}`);
        return {
            success: false,
            error: error.message
        };
    }
}

// Test function for document processing and email
function testDocumentProcessing() {
    try {
        Logger.log('Starting document processing test...');
        
        // Get email from first data row
        const ss = getSpreadsheet();
        const sheet = ss.getSheetByName(CONFIG.sheets.R3);
        const data = sheet.getDataRange().getValues();
        const headers = data[0];
        const firstRow = data[1]; // First data row
        
        const emailCol = headers.indexOf(CONFIG.columns.clinicianEmail);
        if (emailCol === -1 || !firstRow) {
            throw new Error('Could not find clinician email in first row');
        }
        
        const testEmail = firstRow[emailCol];
        if (!testEmail) {
            throw new Error('No email found in first row');
        }
        
        // 1. Create test document
        const doc = DocumentApp.create('Test_Report_' + new Date().getTime());
        const body = doc.getBody();
        body.appendParagraph('This is a test report document.');
        doc.saveAndClose();
        
        Logger.log('Test document created:', doc.getId());
        
        // 2. Set permissions
        const gdocPermissions = setFilePermissions(doc.getId(), testEmail);
        
        if (!gdocPermissions.success) {
            throw new Error('Failed to set permissions');
        }
        
        // 3. Send test email
        const emailBody = `
Test Report Document:

Google Doc (View and Edit): ${gdocPermissions.viewUrl}

This is a test email.`;
        
        MailApp.sendEmail({
            to: testEmail,
            subject: 'Test Report Document',
            body: emailBody
        });
        
        Logger.log('Test email sent to:', testEmail);
        
        return {
            success: true,
            gdocUrl: gdocPermissions.viewUrl,
            testEmail: testEmail
        };
        
    } catch (error) {
        Logger.log(`Document processing test failed: ${error.message}`);
        return {
            success: false,
            error: error.message
        };
    }
}

// Function to test template population with existing LLM responses
function testTemplateWithExistingResponse() {
    Logger.log('\n=== Starting template test with existing LLM response ===');
    
    try {
        // 1. Create template copy
        const template = createTemplateCopy('TEST-EXISTING-RESPONSE');
        if (!template.success) throw new Error(`Template creation failed: ${template.error}`);
        Logger.log(`Created template: ${template.docUrl}`);

        // 2. Get content from existing response document
        const existingResponseUrl = 'https://docs.google.com/document/d/16klQuhf3t4UOLTzSI7EBLh13Y42z3aKCKTUwNyOyqMY/edit';
        const responseDoc = DocumentApp.openByUrl(existingResponseUrl);
        const responseContent = responseDoc.getBody().getText();
        Logger.log('Retrieved existing response content');

        // 3. Process the response content
        const processedResponse = processLLMResponse(responseContent);
        if (!processedResponse.success) {
            throw new Error(`Failed to process response: ${processedResponse.error}`);
        }
        Logger.log(`Processed ${processedResponse.content.length} placeholder responses`);

        // 4. Populate template
        Logger.log('Populating template with responses...');
        const replacementLog = populateTemplate(template.docId, processedResponse.content);
        
        // Log replacement summary
        const successful = replacementLog.filter(r => r.success).length;
        const failed = replacementLog.filter(r => !r.success).length;
        Logger.log(`\nReplacement Summary:
        - Total attempted: ${replacementLog.length}
        - Successful: ${successful}
        - Failed: ${failed}`);

        // 5. Send test email
        const testEmail = 'koshtub.vohra@gmail.com';
        const emailBody = `
Dear Test User,

A test report has been generated using existing LLM responses.

You can access the report here: ${template.docUrl}

Replacement Summary:
- Total placeholders attempted: ${replacementLog.length}
- Successfully replaced: ${successful}
- Failed replacements: ${failed}

This is a test email to verify the template population and email notification system.

Best regards,
CHATA System Test`;

        MailApp.sendEmail({
            to: testEmail,
            subject: 'Test Report - Template Population',
            body: emailBody
        });
        Logger.log(`Test email sent to ${testEmail}`);

        return {
            success: true,
            templateUrl: template.docUrl,
            replacements: {
                total: replacementLog.length,
                successful,
                failed
            },
            emailSent: true,
            testEmail
        };

    } catch (error) {
        Logger.log(`Test failed: ${error.message}`);
        return {
            success: false,
            error: error.message
        };
    }
} 