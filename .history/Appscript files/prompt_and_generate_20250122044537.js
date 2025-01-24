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

    CRITICAL CONTENT GUIDELINES:
    1. DO NOT reference assessment tools (rating scales, visual graphs, scoring forms) directly in the report
    2. DO translate your clinical ratings into descriptive observations
    3. DO use descriptive patterns from observations as evidence
    4. DO reference specific timeline events and milestones when relevant
    5. Focus on real-world implications and practical support needs
    6. Ensure content flows naturally in context
    7. Include specific examples from assessment
    8. Connect findings to recommendations
    9. Maintain professional clinical style
    10. Use strength-based language
    11. Avoid deficit-based terminology
    12. Consider developmental context
    13. Respect individual differences
    14. Maintain clinical accuracy

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

    Add ##GENERATION_COMPLETE## when finished.
    ADDITIONAL WRITING REQUIREMENTS:
    1. Use natural, flowing narrative
    2. Connect observations to real-world impact
    3. Maintain clinical credibility without jargon
    4. Be neurodiversity-affirming
    5. Focus on patterns and observations, not metrics
    6. Describe support needs based on observed patterns
    7. Use specific examples to illustrate points
    8. Consider developmental context in all descriptions`;

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

// Update the populateTemplate function to use processChunkedImages
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
    
    // Process images if form data is present
    if (responses.formData) {
        processChunkedImages(responses.formData, doc);
    }
    
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

// Function to send error notification
function sendErrorNotification(formData, error) {
    const clinicianEmail = formData[CONFIG.columns.clinicianEmail];
    if (!clinicianEmail) {
        Logger.log('No clinician email found for error notification');
        return;
    }
    
    const childName = `${formData[CONFIG.columns.childFirstName]} ${formData[CONFIG.columns.childSecondName]}`;
    const subject = `Report Generation Error - ${childName}`;
    const body = `Dear ${formData[CONFIG.columns.clinicianName]},

We encountered an error while generating the assessment report for ${childName}.

Error details: ${error}

Our team has been notified and will investigate the issue. We will notify you once the report is successfully generated.

Best regards,
CHATA Clinic Assessment System`;
    
    try {
        MailApp.sendEmail({
            to: clinicianEmail,
            subject: subject,
            body: body
        });
        Logger.log(`Error notification sent to ${clinicianEmail}`);
    } catch (error) {
        Logger.log(`Error sending error notification: ${error.message}`);
    }
}

// Function to setup all triggers
function setupAllTriggers() {
    // Remove existing triggers
    const triggers = ScriptApp.getProjectTriggers();
    triggers.forEach(trigger => ScriptApp.deleteTrigger(trigger));
    
    // Create form submission trigger
    ScriptApp.newTrigger('onFormSubmit')
        .forSpreadsheet(SpreadsheetApp.openById(CONFIG.sheetId))
        .onFormSubmit()
        .create();
    
    // Create time-based trigger for batch processing (every 6 hours)
    ScriptApp.newTrigger('processPendingReports')
        .timeBased()
        .everyHours(6)
        .create();
    
    Logger.log('All triggers setup complete');
}

// Function to handle new form submissions
function onFormSubmit(e) {
    if (!e || !e.range) {
        Logger.log('Invalid event object received');
        return;
    }
    
    try {
        const sheet = e.range.getSheet();
        if (sheet.getName() !== CONFIG.sheets.R3) {
            Logger.log(`Ignoring submission to sheet: ${sheet.getName()}`);
            return;
        }
        
        const row = e.range.getRow();
        const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
        const rowData = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0];
        
        // Create data object from row
        const formData = {};
        headers.forEach((header, index) => {
            formData[header] = rowData[index];
        });
        
        // Get CHATA_ID
        const chataId = formData[CONFIG.columns.chataId];
        if (!chataId) {
            Logger.log('No CHATA_ID found in submission');
            return;
        }
        
        Logger.log(`Processing new submission for CHATA_ID: ${chataId}`);
        
        // Check if already processed
        const processedFlagCol = headers.indexOf(CONFIG.columns.processedFlag) + 1;
        if (processedFlagCol > 0) {
            const processed = sheet.getRange(row, processedFlagCol).getValue();
            if (processed) {
                Logger.log(`Submission already processed for CHATA_ID: ${chataId}`);
                return;
            }
        }
        
        // Generate report
        const result = generateReport(chataId);
        
        // Update status and document URL
        if (result.success) {
            const urlCol = headers.indexOf(CONFIG.columns.documentUrl) + 1;
            if (urlCol > 0) {
                sheet.getRange(row, urlCol).setValue(result.templateUrl);
            }
            if (processedFlagCol > 0) {
                sheet.getRange(row, processedFlagCol).setValue(true);
            }
            
            // Send email notification
            sendEmailNotification(formData, result.templateUrl);
        }
        
        Logger.log(`Processing complete for CHATA_ID: ${chataId}`);
        
    } catch (error) {
        Logger.log(`Error processing submission: ${error.message}`);
        // Could add error notification here if needed
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