# R3 Assessment Platform

## Overview

R3 Assessment Platform is a comprehensive clinical assessment and report generation system designed to help clinicians evaluate and track developmental progress in children. The platform consists of two main components:

1. **Web Application**: A React-based frontend for clinicians to input assessment data across multiple domains including sensory processing, social communication, behavior, and developmental milestones.
2. **Report Generation System**: An automated system using Google Apps Script and Anthropic's Claude 3.5 Sonnet to generate detailed clinical reports from assessment data.

## Tech Stack & Dependencies

### Core Technologies

- **Frontend**: React 19 with TypeScript
- **State Management**: Custom hooks with React Context
- **Styling**: CSS Modules
- **API Integration**: Sheety API
- **Data Storage**: Google Sheets (via Sheety)
- **Authentication**: Bearer token-based
- **Image Processing**: html2canvas for chart/timeline captures
- **Build Tool**: Vite
- **Package Manager**: npm
- **Deployment**: GitHub Pages

### Key Dependencies

- **UI Components**:

  - `@radix-ui/react-icons`: UI icons
  - `lucide-react`: Additional icon set
  - `react-select`: Enhanced select inputs
  - `framer-motion`: Animation library
  - `canvas-confetti`: Visual effects
- **Rich Text Editing**:

  - `@tiptap/react`: Rich text editor
  - `@tiptap/starter-kit`: Core editor features
  - `@tiptap/extension-placeholder`: Editor placeholders
- **Data Visualization**:

  - `recharts`: Chart generation
  - `vis-timeline`: Timeline visualization
- **Drag and Drop**:

  - `@dnd-kit/core`: Core DnD functionality
  - `@dnd-kit/sortable`: Sortable list functionality
  - `react-draggable`: Draggable components
- **HTTP Client**:

  - `axios`: API requests
- **Development Tools**:

  - `typescript`: Type safety
  - `eslint`: Code linting
  - `vite`: Build and development
  - `postcss`: CSS processing
  - `autoprefixer`: CSS vendor prefixing

## System Architecture

### 1. Frontend Web Application

- **Framework**: React 19 with TypeScript
- **State Management**: Custom hooks with React Context
- **Styling**: CSS Modules
- **Build Tool**: Vite
- **Deployment**: GitHub Pages

### 2. Data Storage & Integration

- **Primary Storage**: Google Sheets (via Sheety API)
- **Document Storage**: Google Drive (for report templates and generated reports)
- **API Layer**: Sheety API for web app to spreadsheet communication

### 3. Report Generation System

- **Runtime Environment**: Google Apps Script
- **LLM Integration**: Anthropic's Claude 3.5 Sonnet
- **Template System**: Google Docs with placeholder-based content injection
- **Email Notifications**: Automated via Google Apps Script

## Required Accounts & Services

### 1. Google Workspace

- **Purpose**: Spreadsheet storage, Apps Script runtime, document management
- **Account Type**: Google Workspace Business Standard or higher
- **Cost**: Starting at £9.80/user/month
- **Setup Required**:
  - Google Sheets access
  - Google Drive folder structure
  - Google Apps Script deployment
  - Service account configuration

### 2. Sheety API

- **Purpose**: RESTful API interface for Google Sheets
- **Plan Required**: Pro Plan
- **Cost**: $10/month
- **Setup Required**:
  - API project creation
  - Authentication token generation
  - CORS configuration
  - Rate limit monitoring

### 3. Anthropic Claude API

- **Purpose**: LLM-powered report generation
- **Model**: Claude 3.5 Sonnet
- **Cost**: Approximately £0.50 per report
- **Setup Required**:
  - API key generation
  - Usage monitoring
  - Rate limit configuration

### 4. GitHub (Optional for deployment)

- **Purpose**: Code hosting and static site deployment
- **Plan**: Free tier sufficient
- **Setup Required**:
  - Repository creation
  - GitHub Pages configuration
  - Deployment workflow setup

## Workflow

### 1. Assessment Data Collection

1. Clinician logs into web application
2. Completes assessment form across multiple domains:
   - Sensory Profile
   - Social Communication
   - Behavior and Interests
   - Milestone Tracking
3. Data is validated and submitted to Sheety API
4. Sheety API updates Google Sheet with new assessment data

### 2. Report Generation Process

1. Google Apps Script detects new row in spreadsheet
2. Extracts assessment data and prepares for processing
3. Calls Claude API with structured prompt and assessment data
4. Processes LLM response and extracts content for each section
5. Creates copy of report template
6. Populates template with generated content
7. Saves completed report to Google Drive
8. Sends email notification to clinician

### 3. Report Review & Delivery

1. Clinician receives email with report link
2. Reviews generated report
3. Makes any necessary adjustments
4. Finalizes report for client delivery

## Technical Components

### Assessment Domains

#### 1. Sensory Profile Assessment

Evaluates sensory processing patterns aligned with DSM-5 Criterion B.4 ("Hyper- or hyporeactivity to sensory input") and ICF categories b156 (Perceptual functions) and b235-b270 (Sensory functions).

Components:

- **Visual Processing** (DSM-5 B.4):

  - Light sensitivity and visual attention
  - Pattern recognition and visual tracking
  - Visual-spatial processing
  - Figure-ground discrimination
  - DSM-5 Indicators:
    - Hyper-responsiveness to visual stimuli
    - Visual avoidance behaviors
    - Unusual visual interests
    - Visual seeking behaviors
  - ICF: b210 Seeing functions
- **Auditory Processing** (DSM-5 B.4):

  - Sound sensitivity and discrimination
  - Auditory filtering and attention
  - Sound localization
  - DSM-5 Indicators:
    - Adverse response to specific sounds
    - Sound seeking behaviors
    - Unusual auditory interests
    - Sound avoidance patterns
  - ICF: b230 Hearing functions
- **Tactile Processing** (DSM-5 B.4):

  - Touch sensitivity and discrimination
  - Texture processing
  - Pressure awareness
  - DSM-5 Indicators:
    - Tactile defensiveness
    - Unusual tactile interests
    - Seeking/avoiding touch
    - Texture sensitivities
  - ICF: b265 Touch function
- **Vestibular Processing** (DSM-5 B.4):

  - Balance and motion processing
  - Gravitational security
  - Movement planning
  - DSM-5 Indicators:
    - Movement seeking/avoiding
    - Unusual postural responses
    - Motion sensitivities
    - Balance patterns
  - ICF: b235 Vestibular functions
- **Proprioceptive Processing** (DSM-5 B.4):

  - Body awareness and position
  - Force modulation
  - Motor planning
  - DSM-5 Indicators:
    - Body awareness difficulties
    - Unusual body positioning
    - Force regulation issues
    - Movement patterns
  - ICF: b260 Proprioceptive function

Scale Interpretation (DSM-5 Severity Levels):

- **Significantly Under-responsive** (Level 3): "Requiring very substantial support"

  - Minimal registration or response to sensory input
  - Significant impact on daily functioning
  - Requires intensive intervention
- **Under-responsive** (Level 2): "Requiring substantial support"

  - Reduced awareness or delayed response
  - Notable impact on daily activities
  - Needs consistent support
- **Typical** (Level 1): "Requiring support"

  - Age-appropriate sensory processing
  - Minimal impact on functioning
  - May need situational support
- **Over-responsive** (Level 2): "Requiring substantial support"

  - Heightened sensitivity or quick response
  - Significant impact on participation
  - Needs regular intervention
- **Significantly Over-responsive** (Level 3): "Requiring very substantial support"

  - Intense reactions or aversive responses
  - Major impact on daily life
  - Requires comprehensive support

#### 2. Social Communication Assessment

Directly aligns with DSM-5 Criterion A ("Persistent deficits in social communication and social interaction") and ICF categories d310-d329 (Communicating - receiving) and d330-d349 (Communicating - producing).

Components:

- **Joint Attention** (DSM-5 A.1):

  - Response to name
  - Pointing and showing
  - Social referencing
  - Shared interest
  - DSM-5 Indicators:
    - Reduced social-emotional reciprocity
    - Limited sharing of interests
    - Decreased social initiation
    - Atypical social response
  - ICF: d335 Producing nonverbal messages
- **Nonverbal Communication** (DSM-5 A.2):

  - Gesture use and understanding
  - Eye contact quality
  - Facial expressions
  - Body language
  - DSM-5 Indicators:
    - Deficits in nonverbal communication
    - Atypical eye contact
    - Limited gesture use
    - Reduced facial expression
  - ICF: d315 Communicating with nonverbal messages
- **Verbal Communication** (DSM-5 A.1):

  - Language use and understanding
  - Conversation skills
  - Prosody and tone
  - Pragmatic language
  - DSM-5 Indicators:
    - Conversational challenges
    - Atypical language patterns
    - Social language difficulties
    - Communication adaptability
  - ICF: d330 Speaking
- **Social Understanding** (DSM-5 A.1, A.3):

  - Theory of mind
  - Emotional recognition
  - Social context awareness
  - Perspective taking
  - DSM-5 Indicators:
    - Relationship difficulties
    - Social understanding challenges
    - Emotional reciprocity issues
    - Context interpretation
  - ICF: d710 Basic interpersonal interactions

Scale Interpretation (DSM-5 Severity Levels):

- **Age Appropriate** (Level 0): No clinical significance

  - Skills matching developmental expectations
  - No support needs identified
- **Subtle Differences** (Level 1): "Requiring support"

  - Minor variations from typical patterns
  - Noticeable social communication differences
  - Benefits from support
- **Emerging** (Level 1-2): "Requiring support to substantial support"

  - Developing but inconsistent skills
  - Clear social communication challenges
  - Regular support needed
- **Limited** (Level 2): "Requiring substantial support"

  - Significant differences from expectations
  - Marked deficits in social communication
  - Substantial support required
- **Significantly Limited** (Level 3): "Requiring very substantial support"

  - Marked differences requiring substantial support
  - Severe social communication deficits
  - Intensive support needed

#### 3. Behavior and Interests Assessment

Directly corresponds to DSM-5 Criterion B ("Restricted, repetitive patterns of behavior, interests, or activities") and ICF categories b122 (Global psychosocial functions) and b125 (Dispositions and intra-personal functions).

Components:

- **Repetitive Behaviors** (DSM-5 B.1, B.3):

  - Motor mannerisms
  - Self-stimulatory behaviors
  - Action repetition
  - Behavioral rituals
  - DSM-5 Indicators:
    - Stereotyped movements
    - Repetitive object use
    - Echolalia
    - Motor patterns
  - ICF: b147 Psychomotor functions
- **Routines and Rituals** (DSM-5 B.2):

  - Need for sameness
  - Transition difficulties
  - Schedule adherence
  - Environmental consistency
  - DSM-5 Indicators:
    - Inflexible routines
    - Ritualized patterns
    - Resistance to change
    - Transition challenges
  - ICF: b1641 Organization and planning
- **Special Interests** (DSM-5 B.3):

  - Interest intensity
  - Topic variety
  - Information gathering
  - Conversation patterns
  - DSM-5 Indicators:
    - Highly restricted interests
    - Unusual intensity/focus
    - Preoccupation patterns
    - Limited flexibility
  - ICF: b1220 Psychosocial functions
- **Sensory Interests** (DSM-5 B.4):

  - Sensory seeking
  - Sensory avoidance
  - Unusual sensory responses
  - Environmental preferences
  - DSM-5 Indicators:
    - Unusual sensory interests
    - Hyper/hypo-reactivity
    - Sensory seeking/avoiding
    - Environmental responses
  - ICF: b156 Perceptual functions

Scale Interpretation (DSM-5 Severity Levels):

- **Not Present** (Level 0): No clinical significance

  - No observable impact
  - Typical flexibility
- **Minimal Impact** (Level 1): "Requiring support"

  - Occasional occurrence
  - Some inflexibility
  - Interferes with functioning
- **Moderate Impact** (Level 2): "Requiring substantial support"

  - Regular occurrence
  - Inflexibility
  - Obvious to casual observer
- **Significant Impact** (Level 2-3): "Requiring substantial to very substantial support"

  - Frequent occurrence
  - Marked inflexibility
  - Substantial interference
- **Severe Impact** (Level 3): "Requiring very substantial support"

  - Constant occurrence
  - Extreme inflexibility
  - Severe interference

#### 4. Milestone Tracker

Aligned with WHO developmental milestones and ICF developmental framework.

Categories:

- **Communication**:

  - Early sounds and babbling
  - First words and phrases
  - Complex language development
  - Conversation skills
  - ICF: d330-d349 Communication
- **Motor**:

  - Gross motor milestones
  - Fine motor development
  - Coordination and balance
  - Motor planning
  - ICF: d450-d469 Walking and moving
- **Social**:

  - Social smiling
  - Interactive play
  - Peer relationships
  - Social understanding
  - ICF: d710-d729 Interpersonal interactions
- **Developmental Concerns**:

  - Early warning signs
  - Developmental regression
  - Skill inconsistencies
  - Environmental impacts
  - ICF: Multiple domains

Status Options and Clinical Implications:

- **Typical**: Development within expected range
- **Monitor**: Slight delays or inconsistencies requiring observation
- **Delayed**: Significant difference from expected timeline
- **Pending**: Assessment in progress or incomplete data

## Form Components

### Clinical Assessment Form

Designed to capture comprehensive clinical observations and diagnostic considerations aligned with DSM-5 and ICF frameworks.

#### 1. Diagnostic Status

- **ASC Status**:

  - Aligned with DSM-5 criteria for Autism Spectrum Condition
  - Options: Confirmed, Suspected, Not Present, Requires Further Assessment
  - Links to DSM-5 criteria A and B
  - ICF: b122 Global psychosocial functions
- **ADHD Status**:

  - Based on DSM-5 ADHD presentation types
  - Options: Predominantly Inattentive, Predominantly Hyperactive-Impulsive, Combined, Not Present
  - Links to DSM-5 criteria for ADHD
  - ICF: b130 Energy and drive functions, b140 Attention functions

#### 2. Clinical Documentation

- **Clinical Observations** (min. 60 words):

  - Structured behavioral observations
  - Environmental impacts on behavior
  - Social interaction patterns
  - Communication styles
  - Play and activity engagement
  - Links to DSM-5 diagnostic criteria
  - ICF: Multiple domains based on observations
- **Strengths and Abilities** (min. 60 words):

  - Individual capabilities
  - Special interests and talents
  - Learning preferences
  - Coping strategies
  - Environmental supports
  - ICF: Facilitators in environmental factors
- **Priority Support Areas** (min. 60 words):

  - Key intervention needs
  - Impact on daily functioning
  - Environmental barriers
  - Learning challenges
  - Social support needs
  - Links to DSM-5 severity levels
  - ICF: Activity limitations and participation restrictions
- **Support Recommendations** (min. 60 words):

  - Evidence-based interventions
  - Environmental adaptations
  - Educational supports
  - Family resources
  - Professional services
  - ICF: Environmental factors and support systems

#### 3. Diagnostic Considerations

- **Differential Diagnosis**:

  - Alternative explanations
  - Co-occurring conditions
  - Developmental considerations
  - Environmental factors
  - Cultural considerations
  - Links to DSM-5 differential diagnosis guidelines
- **Developmental Concerns**:

  - Developmental trajectory
  - Skill regression patterns
  - Environmental impacts
  - Family concerns
  - Professional observations
  - ICF: Developmental functions
- **Medical History**:

  - Relevant medical conditions
  - Previous assessments
  - Interventions history
  - Medication impacts
  - Health considerations
  - ICF: Health conditions
- **Family History**:

  - Genetic considerations
  - Family patterns
  - Environmental factors
  - Cultural context
  - Support systems
  - ICF: Environmental factors (e310-e399)

### Assessment Log

Tracks all clinical assessments, observations, and standardized measures used in the evaluation process.

#### Components:

1. **Standardized Assessments**:

   - ADOS-2 observations
   - Cognitive assessments
   - Language evaluations
   - Sensory profiles
   - Executive function measures
   - Tracks dates, scores, and clinical impressions
2. **Observational Assessments**:

   - Play-based observations
   - Social interactions
   - Communication patterns
   - Behavioral patterns
   - Environmental responses
   - Links observations to DSM-5 criteria
3. **Parent/Caregiver Input**:

   - Developmental history
   - Current concerns
   - Behavioral patterns
   - Environmental impacts
   - Support needs
   - Cultural considerations
4. **Professional Observations**:

   - Clinical impressions
   - Behavioral patterns
   - Environmental impacts
   - Response to interventions
   - Progress tracking

Word Count Guidelines and Clinical Implications:

- **Insufficient** (< 60 words):

  - Limited clinical detail
  - May miss key observations
  - Requires additional documentation
- **Minimal** (60-120 words):

  - Basic clinical information
  - Core observations included
  - May need elaboration
- **Good** (120-180 words):

  - Comprehensive documentation
  - Clear clinical picture
  - Sufficient detail for planning
- **Excellent** (> 180 words):

  - Detailed clinical analysis
  - Rich observational data
  - Strong evidence base

### Assessment Log Structure

#### 1. Standardized Assessments

- **Test Administration**:
  - Assessment name and version
  - Administration date and duration
  - Examiner details
  - Testing conditions
- **Scoring Details**:
  - Raw scores
  - Standard scores
  - Percentile ranks
  - Confidence intervals
- **Interpretation Guidelines**:
  - Score significance
  - Clinical implications
  - Comparison to norms
  - Validity indicators

#### 2. Clinical Observations

- **Structured Observations**:
  - Setting description
  - Duration of observation
  - Activity context
  - Environmental factors
- **Behavioral Patterns**:
  - Frequency data
  - Intensity ratings
  - Pattern analysis
  - Trigger identification
- **Social Interactions**:
  - Peer relationships
  - Adult interactions
  - Group dynamics
  - Communication styles

#### 3. Parent/Caregiver Input

- **Developmental History**:
  - Early milestones
  - Medical history
  - Educational experiences
  - Intervention history
- **Current Functioning**:
  - Daily routines
  - Behavioral patterns
  - Social relationships
  - Learning styles
- **Environmental Factors**:
  - Home environment
  - School/daycare setting
  - Community participation
  - Support systems

#### 4. Professional Observations

- **Clinical Impressions**:
  - Diagnostic considerations
  - Functional impact
  - Support needs
  - Progress indicators
- **Interdisciplinary Input**:
  - Team observations
  - Specialist reports
  - Therapy notes
  - Educational assessments
- **Progress Monitoring**:
  - Goal achievement
  - Intervention response
  - Skill development
  - Challenge areas

#### 5. Integration Features

- **Data Synthesis**:
  - Cross-reference capabilities
  - Pattern identification
  - Timeline integration
  - Report generation links
- **Quality Control**:
  - Completeness checks
  - Consistency validation
  - Update tracking
  - Version control
- **Access Management**:
  - Role-based permissions
  - Edit history
  - Collaboration tools
  - Data security

#### 6. Clinical Documentation

- **Entry Requirements**:
  - Minimum data fields
  - Required attachments
  - Validation rules
  - Review process
- **Format Guidelines**:
  - Professional terminology
  - Objective language
  - Evidence-based documentation
  - Cultural sensitivity
- **Integration Points**:
  - Report templates
  - Assessment summaries
  - Progress tracking
  - Service planning

## Clinical Workflow

### 1. Pre-Assessment Phase

1. **Initial Setup**:

   - Review referral information
   - Gather existing reports
   - Plan assessment approach
   - Prepare assessment tools
2. **Assessment Planning**:

   - Select appropriate measures
   - Schedule observations
   - Coordinate with team members
   - Plan environmental contexts

### 2. Assessment Phase

1. **Data Collection**:

   - Conduct standardized assessments
   - Complete observational measures
   - Gather parent/caregiver input
   - Document clinical impressions
2. **Clinical Documentation**:

   - Record assessment results
   - Document observations
   - Note environmental factors
   - Track behavioral patterns

### 3. Data Integration

1. **Assessment Log Entry**:

   - Record all completed assessments
   - Document scores and observations
   - Note clinical impressions
   - Track assessment timeline
2. **Form Completion**:

   - Enter assessment data
   - Document clinical observations
   - Record strengths and needs
   - Note recommendations

### 4. Report Generation Process

#### 1. Data Processing & Validation

- **Input Validation**:

  - Completeness checks for required fields
  - Word count validation for narrative sections
  - Assessment score range verification
  - Timeline consistency checks
  - Cross-reference validation between related domains
- **Data Preparation**:

  - Standardization of assessment scores
  - Formatting of clinical observations
  - Organization of timeline data
  - Structuring of assessment log entries
  - Preparation of visual elements

#### 2. LLM Integration

##### System Context Configuration

The Claude 3.5 Sonnet model is configured with comprehensive context and processing parameters:

```plaintext
SYSTEM_CONTEXT = {
  role: "Clinical Report Writer",
  expertise: ["Developmental Assessment", "Clinical Documentation", "Report Generation"],
  frameworks: ["DSM-5", "ICF", "Developmental Milestones"],
  output_style: {
    technical: "Professional clinical terminology with evidence-based framework references",
    parent: "Accessible language with practical examples and supportive tone"
  }
}

PROCESSING_RULES = {
  report_sections: {
    technical: {
      style: "clinical",
      terminology_level: "professional",
      framework_references: true,
      evidence_requirements: "explicit"
    },
    parent: {
      style: "supportive",
      terminology_level: "accessible",
      practical_examples: true,
      action_oriented: true
    }
  },
  
  content_validation: {
    required_elements: [
      "clinical_observations",
      "assessment_results",
      "developmental_patterns",
      "support_recommendations"
    ],
    framework_alignment: {
      dsm5: ["criteria_references", "severity_levels", "support_needs"],
      icf: ["function_codes", "activity_limitations", "participation_restrictions"]
    }
  }
}

WRITING_REQUIREMENTS = {
  section_specific: {
    clinical_summary: {
      min_words: 200,
      required_elements: [
        "primary_findings",
        "diagnostic_considerations",
        "support_needs",
        "recommendations"
      ],
      style_guide: {
        tone: "professional",
        structure: "systematic",
        evidence_base: "explicit"
      }
    },
    parent_summary: {
      min_words: 150,
      required_elements: [
        "strengths_focus",
        "practical_implications",
        "support_strategies",
        "next_steps"
      ],
      style_guide: {
        tone: "supportive",
        structure: "clear",
        practical_focus: true
      }
    }
  },
  
  quality_checks: {
    clinical_accuracy: {
      framework_alignment: true,
      terminology_consistency: true,
      evidence_support: true
    },
    accessibility: {
      parent_friendly: true,
      practical_focus: true,
      action_oriented: true
    }
  }
}

DATA_PROCESSING = {
  assessment_data: {
    sensory_profile: {
      score_interpretation: true,
      pattern_analysis: true,
      impact_assessment: true
    },
    social_communication: {
      skill_evaluation: true,
      development_tracking: true,
      support_needs: true
    },
    behavior_patterns: {
      frequency_analysis: true,
      impact_evaluation: true,
      support_requirements: true
    },
    milestones: {
      development_tracking: true,
      age_comparison: true,
      progress_monitoring: true
    },
    assessment_log: {
      measure_integration: true,
      observation_synthesis: true,
      timeline_analysis: true
    }
  },
  
  visualization_data: {
    radar_graph: {
      include_if_available: true,
      interpretation_required: true,
      pattern_analysis: true
    }
  }
}

ERROR_HANDLING = {
  validation_failures: {
    retry_with_adjustment: true,
    log_error: true,
    notify_user: true
  },
  content_gaps: {
    identify_missing: true,
    request_specifics: true,
    provide_alternatives: true
  }
}
```

##### Report Template Structure

The report template uses a sophisticated placeholder system with specific sections and formatting requirements:

```plaintext
TEMPLATE_STRUCTURE = {
  metadata: {
    header: {
      clinic_details: "{{CLINIC_INFO}}",
      assessment_date: "{{ASSESSMENT_DATE}}",
      report_date: "{{REPORT_DATE}}",
      reference_number: "{{REF_NUMBER}}"
    },
    child_information: {
      name: "{{CHILD_NAME}}",
      dob: "{{DOB}}",
      age: "{{AGE}}",
      gender: "{{GENDER}}"
    },
    clinician_details: {
      name: "{{CLINICIAN_NAME}}",
      role: "{{CLINICIAN_ROLE}}",
      credentials: "{{CREDENTIALS}}"
    }
  },

  technical_sections: {
    clinical_summary: {
      placeholder: "{{T001}}",
      min_words: 200,
      required_elements: [
        "primary_findings",
        "diagnostic_status",
        "support_needs",
        "recommendations"
      ]
    },
    diagnostic_formulation: {
      placeholder: "{{T002}}",
      min_words: 250,
      required_elements: [
        "dsm5_criteria",
        "icf_framework",
        "differential_diagnosis",
        "comorbidity_considerations"
      ]
    },
    assessment_methodology: {
      placeholder: "{{T003}}",
      min_words: 150,
      required_elements: [
        "standardized_measures",
        "clinical_observations",
        "parent_input",
        "timeline"
      ]
    },
    developmental_history: {
      placeholder: "{{T004}}",
      min_words: 200,
      required_elements: [
        "early_development",
        "medical_history",
        "educational_history",
        "previous_assessments"
      ]
    },
    clinical_observations: {
      placeholder: "{{T005}}",
      min_words: 300,
      required_elements: [
        "sensory_patterns",
        "social_communication",
        "behavior_interests",
        "developmental_skills"
      ]
    }
  },

  parent_sections: {
    summary: {
      placeholder: "{{C001}}",
      min_words: 150,
      style: "accessible",
      required_elements: [
        "key_findings",
        "strengths",
        "support_needs",
        "next_steps"
      ]
    },
    strengths_interests: {
      placeholder: "{{C002}}",
      min_words: 150,
      style: "supportive",
      required_elements: [
        "individual_strengths",
        "special_interests",
        "learning_style",
        "motivators"
      ]
    },
    recommendations: {
      placeholder: "{{C003}}",
      min_words: 200,
      style: "action_oriented",
      required_elements: [
        "immediate_strategies",
        "long_term_goals",
        "environmental_adaptations",
        "resource_links"
      ]
    },
    next_steps: {
      placeholder: "{{C004}}",
      min_words: 100,
      style: "practical",
      required_elements: [
        "immediate_actions",
        "referrals",
        "follow_up_plan",
        "support_services"
      ]
    }
  },

  appendices: {
    technical_appendix: {
      placeholder: "{{A001}}",
      components: [
        "assessment_details",
        "score_interpretations",
        "clinical_framework",
        "evidence_base"
      ]
    },
    assessment_details: {
      placeholder: "{{A002}}",
      components: [
        "standardized_measures",
        "clinical_observations",
        "assessment_log",
        "timeline"
      ]
    },
    visualization: {
      radar_graph: {
        placeholder: "{{V001}}",
        requirements: [
          "image_insertion",
          "score_interpretation",
          "pattern_analysis"
        ]
      },
      timeline: {
        placeholder: "{{V002}}",
        requirements: [
          "developmental_events",
          "assessment_dates",
          "intervention_history"
        ]
      }
    }
  }
}

FORMATTING_REQUIREMENTS = {
  styles: {
    headings: {
      level1: { font: "Arial", size: 16, bold: true },
      level2: { font: "Arial", size: 14, bold: true },
      level3: { font: "Arial", size: 12, bold: true }
    },
    body: {
      font: "Arial",
      size: 11,
      line_spacing: 1.15
    },
    tables: {
      style: "LightGrid",
      header_row: true
    }
  },
  
  layout: {
    margins: {
      top: "2.54cm",
      bottom: "2.54cm",
      left: "2.54cm",
      right: "2.54cm"
    },
    header: {
      first_page: true,
      alignment: "left"
    },
    footer: {
      page_numbers: true,
      alignment: "center"
    }
  }
}
```

##### Error Handling and Validation

```plaintext
ERROR HANDLING:
1. API Errors:
   - Rate limit exceeded: Exponential backoff retry
   - Token limit: Content chunking
   - Timeout: Automatic retry with backoff
   - Authentication: Credential refresh

2. Content Validation:
   - Missing placeholders
   - Incomplete sections
   - Framework misalignment
   - Clinical inconsistencies

3. Quality Checks:
   - Word count thresholds
   - Clinical terminology usage
   - Framework references
   - Recommendation completeness

VALIDATION RULES:
1. Input Requirements:
   - Minimum word counts per section
   - Required clinical observations
   - Essential assessment data
   - Framework references

2. Content Standards:
   - Professional terminology
   - Evidence-based language
   - Cultural sensitivity
   - Strength-based approach

3. Structure Requirements:
   - Section completeness
   - Logical flow
   - Cross-references
   - Format consistency
```

##### Feedback Collection System

```plaintext
FEEDBACK MECHANISMS:
1. Clinical Relevance:
   - Framework alignment rating
   - Clinical accuracy assessment
   - Recommendation effectiveness
   - Evidence integration quality

2. Report Quality:
   - Content completeness
   - Language appropriateness
   - Structure effectiveness
   - Practical utility

3. Technical Performance:
   - Generation time
   - Error rates
   - API efficiency
   - Resource usage

4. User Experience:
   - Interface usability
   - Workflow efficiency
   - Feature effectiveness
   - Output satisfaction
```

##### Performance Monitoring

```plaintext
MONITORING METRICS:
1. API Performance:
   - Response times
   - Token usage
   - Error rates
   - Rate limit status

2. Content Quality:
   - Completion rates
   - Validation success
   - Framework alignment
   - Clinical accuracy

3. System Health:
   - Resource utilization
   - Processing times
   - Queue status
   - Error patterns

4. User Engagement:
   - Feature usage
   - Completion rates
   - Error encounters
   - Feedback submission
```

#### 3. Content Generation and Validation

##### Generation Process

1. **Initial Content Creation**:

   - Section-specific content generation
   - Framework alignment verification
   - Clinical accuracy checks
   - Language style validation
2. **Content Refinement**:

   - Professional terminology review
   - Accessibility enhancement
   - Evidence integration
   - Recommendation validation
3. **Quality Assurance**:

   - Clinical accuracy verification
   - Framework alignment check
   - Language appropriateness review
   - Recommendation relevance assessment

##### Validation Checks

1. **Clinical Validation**:

   ```plaintext
   VALIDATION CRITERIA:
   1. Clinical Accuracy:
      - DSM-5 criteria alignment
      - ICF framework integration
      - Evidence-based support
      - Professional standards

   2. Content Completeness:
      - Required elements present
      - Sufficient detail provided
      - Appropriate examples included
      - Clear recommendations

   3. Professional Standards:
      - Clinical terminology
      - Evidence-based language
      - Logical structure
      - Professional tone

   4. Accessibility:
      - Clear explanations
      - Practical examples
      - Parent-friendly language
      - Actionable recommendations
   ```
2. **Quality Metrics**:

   ```plaintext
   QUALITY INDICATORS:
   1. Content Quality:
      - Clinical accuracy score
      - Framework alignment score
      - Evidence support score
      - Recommendation relevance score

   2. Language Quality:
      - Professional terminology score
      - Accessibility score
      - Cultural sensitivity score
      - Clarity score

   3. Structure Quality:
      - Logical flow score
      - Coherence score
      - Transition quality score
      - Organization score

   4. Clinical Impact:
      - Support needs alignment score
      - Intervention relevance score
      - Environmental consideration score
      - Progress monitoring score
   ```

### 5. Clinical Review

1. **Quality Check**:

   - Review clinical accuracy
   - Verify framework alignment
   - Check recommendations
   - Ensure completeness
2. **Refinement**:

   - Edit content as needed
   - Add clinical insights
   - Enhance recommendations
   - Finalize report

## Apps Script Configuration

### Required Script Properties

- `ANTHROPIC_API_KEY`: Claude API key
- `SPREADSHEET_ID`: ID of the main spreadsheet
- `LOGS_FOLDER_ID`: ID of the folder for storing logs

### Spreadsheet Structure

1. **R3_Form Sheet**:

   - Primary data collection sheet
   - Contains all assessment data
   - Tracks report generation status
2. **Placeholders_Map Sheet**:

   - Maps template placeholders to content requirements
   - Defines writing instructions for each section
3. **API_Logs Sheet**:

   - Tracks all API operations
   - Records errors and processing status

### Template System

- Located in Google Drive
- Uses `{{PLACEHOLDER}}` syntax
- Supports both technical and parent-friendly sections
- Includes dynamic image insertion for charts and timelines

## Development Setup

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```
3. Create `.env` file with required environment variables:

   ```
   VITE_SHEETY_API_ID=your_sheety_api_id
   ```
4. Configure Apps Script:

   - Create new Apps Script project
   - Copy `prompt_and_generate.js` content
   - Set script properties
   - Deploy as web app
   - Configure triggers
5. Start development server:

   ```bash
   npm run dev
   ```

## Deployment

### Web Application

- Build command: `npm run build`
- Output directory: `dist/`
- Deploy to GitHub Pages: `npm run deploy`

### Apps Script

1. Deploy as web app
2. Set up time-based triggers
3. Configure OAuth consent screen
4. Set up domain verification if needed

## Maintenance

### Regular Tasks

- Monitor API rate limits and costs
- Review and update assessment criteria
- Backup assessment data
- Monitor error logs
- Update dependencies
- Security audits
- Performance monitoring

### Troubleshooting

- API connectivity issues
- Report generation failures
- Template formatting problems
- Email notification issues
- Data synchronization errors

## Security Considerations

- API keys stored in script properties
- OAuth 2.0 authentication
- Regular security audits
- Data encryption in transit
- Access control via Google Workspace
- XSS prevention
- Rate limiting
- Error logging and monitoring

## Support and Documentation

1. Review inline code comments
2. Check API documentation:
   - [Sheety API Docs](https://sheety.co/docs)
   - [Claude API Docs](https://docs.anthropic.com/claude/docs)
   - [Google Apps Script Reference](https://developers.google.com/apps-script/reference)
3. Contact development team
4. Review error logs
5. Check component documentation

## Version

Current Version: 0.1.0

## License

MIT License

Copyright (c) 2024 CHATA Clinic

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## MVP Feedback & Improvement

### Feedback Collection Mechanisms

#### 1. Clinical Feedback

```plaintext
CLINICAL ASSESSMENT:
1. Framework Alignment:
   - DSM-5 criteria coverage
   - ICF framework integration
   - Clinical terminology accuracy
   - Evidence-based practice alignment

2. Report Quality:
   - Clinical accuracy
   - Diagnostic clarity
   - Recommendation appropriateness
   - Support needs alignment

3. Professional Utility:
   - Report structure effectiveness
   - Time savings assessment
   - Clinical workflow integration
   - Documentation completeness
```

#### 2. User Experience Feedback

```plaintext
USER EXPERIENCE METRICS:
1. Interface Usability:
   - Form completion ease
   - Navigation efficiency
   - Error message clarity
   - Help system effectiveness

2. Workflow Integration:
   - Assessment process fit
   - Time efficiency
   - Data entry convenience
   - Report generation speed

3. Output Quality:
   - Report readability
   - Content relevance
   - Format appropriateness
   - Customization options
```

#### 3. Technical Performance

```plaintext
PERFORMANCE METRICS:
1. API Performance:
   - Response times
   - Error rates
   - Rate limit utilization
   - Token usage efficiency

2. System Reliability:
   - Uptime tracking
   - Error recovery
   - Data consistency
   - Backup effectiveness

3. Resource Usage:
   - API cost efficiency
   - Storage utilization
   - Processing overhead
   - Bandwidth usage
```

### Improvement Tracking

#### 1. Feature Requests

```plaintext
FEATURE TRACKING:
1. Clinical Features:
   - Additional assessment domains
   - New report sections
   - Enhanced visualization options
   - Extended framework coverage

2. Technical Features:
   - Offline capabilities
   - Enhanced security
   - Performance optimization
   - Mobile responsiveness

3. User Experience:
   - UI/UX improvements
   - Workflow optimizations
   - Customization options
   - Integration capabilities
```

#### 2. Bug Tracking

```plaintext
ISSUE CATEGORIES:
1. Critical Issues:
   - Data integrity
   - Report generation failures
   - API integration problems
   - Security vulnerabilities

2. Functional Issues:
   - UI/UX problems
   - Workflow disruptions
   - Performance bottlenecks
   - Integration errors

3. Enhancement Requests:
   - Feature improvements
   - Performance optimization
   - User experience refinement
   - Documentation updates
```

#### 3. Version Planning

```plaintext
RELEASE PLANNING:
1. Short-term (v0.2.0):
   - Critical bug fixes
   - Essential feature requests
   - Performance improvements
   - Security enhancements

2. Mid-term (v0.3.0):
   - Additional assessment domains
   - Enhanced reporting features
   - Improved visualizations
   - Extended framework support

3. Long-term (v1.0.0):
   - Complete framework coverage
   - Advanced analytics
   - Machine learning integration
   - Enterprise features
```

## User Interface Workflow

### 1. Initial Screen Options

- **Create Report**: Full assessment and report generation workflow
- **Download Template**: Standalone option for manual report writing
  - Provides template structure without automated generation
  - Useful for clinicians preferring manual documentation

### 2. Clinical Information Modal

#### Overview

The modal serves as the initial data collection interface, ensuring comprehensive client and clinician information before assessment.

#### Required Fields and Validation

##### Clinician Information

- **Clinician Name**:
  - Full name with title (e.g., Dr., Ms., Mr.)
  - Credentials validation
  - Professional registration number (optional)
- **Clinic Details**:
  - Clinic name with autocomplete from saved list
  - Location/Branch specification
  - Department/Unit (if applicable)
- **Assessment Context**:
  - Assessment type (Initial/Follow-up/Review)
  - Referral source
  - Assessment purpose

##### Child Information

- **Personal Details**:
  - Full legal name
  - Preferred name (if different)
  - Date of birth (with age auto-calculation)
  - Gender (with inclusive options)
  - Reference/Client number
- **Contact Information**:
  - Parent/Guardian names
  - Relationship to child
  - Contact preferences
- **Additional Information**:
  - Primary language
  - Interpreter needed (Y/N)
  - Cultural considerations
  - Accessibility requirements

#### Functionality Features

- **Auto-save**: Saves data as fields are completed
- **Field Validation**:
  - Real-time format checking
  - Required field highlighting
  - Error messaging with correction guidance
- **Smart Defaults**:
  - Clinic details from user profile
  - Date defaulting to current
  - Age auto-calculation from DOB
- **Data Persistence**:
  - Session recovery on browser refresh
  - Draft saving capability
  - Recent entries quick-fill

#### Integration Points

- Links to existing client records
- Populates report templates
- Updates assessment log entries
- Initializes timeline data
- Sets up assessment framework

#### Access Controls

- Role-based field visibility
- Edit permission management
- Data privacy compliance
- Audit trail tracking

### 3. Main Assessment Interface

#### Left Side: Assessment Carousel

Six interconnected components:

1. **Sensory Profile Assessment** (as detailed in existing section)
2. **Social Communication Assessment** (as detailed in existing section)
3. **Behavior and Interests Assessment** (as detailed in existing section)
4. **Milestone Tracker** (as detailed in existing section)
5. **Assessment Log**:
   - Standardized measures used
   - Clinical observations
   - Parent/caregiver input
   - Professional observations
   - Timeline of assessments
6. **Assessment Summary**:
   - Interactive ASD Profile Radar Graph
   - Downloadable visualization
   - Option to include in final report
   - Domain-specific scores visualization
   - Pattern analysis across domains

#### Right Side: Form Components

Dynamic form interface with:

- Progress indicators
- Section navigation
- Save functionality
- Validation feedback
- Real-time updates

### 4. Data Visualization

#### ASD Profile Radar Graph

##### Graph Generation

- **Data Processing**:
  - Score normalization (0-5 scale)
  - Domain aggregation
  - Pattern recognition
  - Outlier detection
- **Visualization Parameters**:
  - Color scheme: Professional/Clinical
  - Axis labels: Domain-specific
  - Scale markers: Severity levels
  - Grid lines: Support need indicators

##### Components and Metrics

- **Core Domains**:
  - Sensory Processing (SP)
  - Social Communication (SC)
  - Behavioral Patterns (BP)
  - Developmental Progress (DP)
- **Scoring Scale**:
  1. Minimal Support (0-1)
  2. Low Support (1-2)
  3. Moderate Support (2-3)
  4. High Support (3-4)
  5. Intensive Support (4-5)

##### Interactive Features

- **Tooltips**:
  - Domain descriptions
  - Score interpretations
  - Clinical implications
  - Support recommendations
- **Dynamic Updates**:
  - Real-time score reflection
  - Pattern highlighting
  - Trend indicators
  - Comparison overlays

##### Report Integration

- **Export Options**:
  - High-resolution PNG
  - Vector PDF
  - Interactive HTML
  - Raw data CSV
- **Placement Options**:
  - Technical summary
  - Parent summary
  - Assessment appendix
  - Progress tracking
- **Annotation Features**:
  - Clinical notes
  - Pattern highlights
  - Support indicators
  - Progress markers

##### Clinical Utility

- **Pattern Analysis**:
  - Domain interactions
  - Support need patterns
  - Strength identification
  - Challenge areas
- **Progress Monitoring**:
  - Baseline comparison
  - Intervention impact
  - Development tracking
  - Goal achievement
- **Communication Aid**:
  - Parent discussions
  - Team meetings
  - Service planning
  - Progress reviews
- **Treatment Planning**:
  - Priority identification
  - Resource allocation
  - Intervention selection
  - Outcome measurement

##### Technical Implementation

- **Libraries**:
  - Recharts for rendering
  - D3.js for calculations
  - html2canvas for export
  - SVG manipulation
- **Data Flow**:
  - Assessment data input
  - Score calculation
  - Pattern analysis
  - Visualization generation
- **Performance Optimization**:
  - Lazy loading
  - Caching strategies
  - Memory management
  - Render optimization
