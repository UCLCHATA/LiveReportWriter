import type { GlobalFormState } from '../types';
import type { 
    SensoryDomain, 
    SocialCommunicationDomain, 
    BehaviorDomain,
    Assessment
} from '../types';
import { SHEETY_HEADERS, validateDataFormat } from './dataValidation';

interface ProfileData {
    value: number;
    label: string;
    observations: string[];
}

// Helper to format domain data
function formatDomainData(domain: any): string {
    const defaultData = {
        value: 0,
        label: 'Skipped',
        observations: []
    };

    if (!domain || typeof domain.value === 'undefined') {
        return '';
    }

    return Array.isArray(domain.observations) ? domain.observations.join('. ') : '';
}

// Helper to format domain score
function formatDomainScore(domain: any): string {
    if (!domain || typeof domain.value === 'undefined') {
        return 'Not assessed';
    }

    return `${domain.label}, ${domain.value} out of 5 on the 5 point scale`;
}

// Format sensory profile data
function prepareSensoryProfileData(profile: any) {
    console.log('🔍 Raw sensory profile:', profile);
    
    if (!profile?.domains) {
        console.log('❌ No sensory domains found');
        return {};
    }
    
    const formattedData: Record<string, string> = {};
    const domains = ['visual', 'auditory', 'tactile', 'vestibular', 'proprioceptive', 'oral'] as const;
    
    domains.forEach(domain => {
        const domainData = profile.domains[domain];
        const header = SHEETY_HEADERS.SENSORY[domain as keyof typeof SHEETY_HEADERS.SENSORY];
        formattedData[header.score] = formatDomainScore(domainData);
        formattedData[header.observations] = formatDomainData(domainData);
    });

    console.log('📝 Formatted sensory data:', formattedData);
    return formattedData;
}

// Format social communication data
function prepareSocialCommunicationData(profile: any) {
    console.log('🔍 Raw social profile:', profile);
    
    if (!profile?.domains) {
        console.log('❌ No social domains found');
        return {};
    }
    
    const formattedData: Record<string, string> = {};
    const domains = [
        'jointAttention',
        'nonverbalCommunication',
        'verbalCommunication',
        'socialUnderstanding',
        'playSkills',
        'peerInteractions'
    ] as const;
    
    domains.forEach(domain => {
        const domainData = profile.domains[domain];
        const header = SHEETY_HEADERS.SOCIAL[domain as keyof typeof SHEETY_HEADERS.SOCIAL];
        formattedData[header.score] = formatDomainScore(domainData);
        formattedData[header.observations] = formatDomainData(domainData);
    });

    console.log('📝 Formatted social data:', formattedData);
    return formattedData;
}

// Format behavior interests data
function prepareBehaviorInterestsData(profile: any) {
    console.log('🔍 Raw behavior profile:', profile);
    
    if (!profile?.domains) {
        console.log('❌ No behavior domains found');
        return {};
    }
    
    const formattedData: Record<string, string> = {};
    const domains = [
        'repetitiveBehaviors',
        'routinesRituals',
        'specialInterests',
        'sensoryInterests',
        'emotionalRegulation',
        'flexibility'
    ] as const;
    
    domains.forEach(domain => {
        const domainData = profile.domains[domain];
        const header = SHEETY_HEADERS.BEHAVIOR[domain as keyof typeof SHEETY_HEADERS.BEHAVIOR];
        formattedData[header.score] = formatDomainScore(domainData);
        formattedData[header.observations] = formatDomainData(domainData);
    });

    console.log('📝 Formatted behavior data:', formattedData);
    return formattedData;
}

// Helper to format milestone status
function formatMilestoneStatus(expectedAge: number, achievedAge: number | null): string {
    if (!achievedAge) return '';  // Don't show unplaced milestones
    
    if (achievedAge === expectedAge) return `Placed at: ${achievedAge}m (On Time)`;
    
    const difference = expectedAge - achievedAge;
    if (difference > 0) {
        return `Placed at: ${achievedAge}m (Expected: ${expectedAge}m) - Early by ${difference}m`;
    } else {
        return `Placed at: ${achievedAge}m (Expected: ${expectedAge}m) - Delayed by ${Math.abs(difference)}m`;
    }
}

// Helper to format milestone entry
function formatMilestoneEntry(milestone: any): string | null {
    if (!milestone.achievedAge) return null;  // Skip unplaced milestones
    
    return `${milestone.name}: ${formatMilestoneStatus(milestone.expectedAge, milestone.achievedAge)}`;
}

type MilestoneCategory = 'COMMUNICATION' | 'MOTOR' | 'SOCIAL' | 'CONCERNS';

// Format milestone data
function prepareMilestoneData(milestones: any) {
    console.log('🔍 Raw milestone data:', JSON.stringify(milestones, null, 2));

    // Early return if no milestone data
    if (!milestones?.milestones) {
        console.log('❌ No milestone data found');
        return {
            [SHEETY_HEADERS.MILESTONE.timelineData]: '',
            [SHEETY_HEADERS.MILESTONE.historyOfConcerns]: milestones?.history || ''
        };
    }

    // Filter to only placed milestones
    const placedMilestones = milestones.milestones.filter((m: any) => {
        const isPlaced = m.actualAge !== null && m.actualAge !== undefined;
        if (isPlaced) {
            console.log('✓ Found placed milestone:', m.title, {
                actualAge: m.actualAge,
                expectedAge: m.expectedAge,
                status: m.status
            });
        }
        return isPlaced;
    });

    console.log('📊 Placed milestones:', placedMilestones);

    if (placedMilestones.length === 0) {
        console.log('ℹ️ No milestones placed on timeline');
        return {
            [SHEETY_HEADERS.MILESTONE.timelineData]: '',
            [SHEETY_HEADERS.MILESTONE.historyOfConcerns]: milestones.history || ''
        };
    }

    // Group placed milestones by category
    const groupedMilestones: Record<string, string[]> = {};

    placedMilestones.forEach((milestone: any) => {
        const category = milestone.category?.toUpperCase() || 'UNCATEGORIZED';
        
        if (!groupedMilestones[category]) {
            groupedMilestones[category] = [];
        }

        // Format milestone text
        let milestoneText;
        if (category === 'CONCERNS') {
            milestoneText = `${milestone.title} - Achieved at ${milestone.actualAge} months`;
        } else {
            const difference = milestone.expectedAge - milestone.actualAge;
            const status = difference === 0 ? 'On time' :
                          difference > 0 ? `Early by ${difference} months` :
                          `Delayed by ${Math.abs(difference)} months`;
            
            milestoneText = `${milestone.title} - ${status}, expected at ${milestone.expectedAge} months`;
        }

        groupedMilestones[category].push(`- ${milestoneText}`);
    });

    // Build formatted text with sections
    const sections: string[] = [];
    
    // Add milestone categories in specific order
    const categoryOrder = ['COMMUNICATION', 'MOTOR', 'SOCIAL', 'CONCERNS'];
    categoryOrder.forEach(category => {
        if (groupedMilestones[category]?.length > 0) {
            // Convert 'CONCERNS' to 'DEVELOPMENTAL CONCERNS' in display
            const displayCategory = category === 'CONCERNS' ? 'DEVELOPMENTAL CONCERNS' : category;
            sections.push(displayCategory);
            sections.push(...groupedMilestones[category]);
            sections.push(''); // Add spacing between sections
        }
    });

    // Join sections and remove trailing empty lines
    const formattedText = sections.join('\n').trim();
    
    console.log('📝 Formatted milestone text:', formattedText);

    return {
        [SHEETY_HEADERS.MILESTONE.timelineData]: formattedText,
        [SHEETY_HEADERS.MILESTONE.historyOfConcerns]: milestones.history || ''
    };
}

// Format assessment log data
function prepareAssessmentLogData(assessmentLog: any) {
    if (!assessmentLog?.selectedAssessments?.length) {
        console.log('❌ No selected assessments found');
        return {
            [SHEETY_HEADERS.ASSESSMENT_LOG.data]: ''
        };
    }

    console.log('🔍 Raw assessment log:', assessmentLog);

    // Format selected assessments using data from entries
    const formattedEntries = assessmentLog.selectedAssessments.map((assessment: Assessment) => {
        // Get the full entry data for this assessment
        const entryData = assessmentLog.entries[assessment.id];
        
        const lines = [
            `Assessment: ${entryData?.name || assessment.name}`,
            `Date: ${entryData?.date || ''}`,
            `Notes: ${entryData?.notes || ''}`
        ];
        return lines.join('\n');
    });

    // Join all entries with double newlines for spacing
    const formattedText = formattedEntries.join('\n\n');
    
    console.log('📝 Formatted assessment log:', formattedText);

    return {
        [SHEETY_HEADERS.ASSESSMENT_LOG.data]: formattedText
    };
}

// Format form data (truncate to 100 chars)
function prepareFormData(formData: any) {
    return {
        [SHEETY_HEADERS.FORM.clinicalObservations]: (formData?.clinicalObservations || '').substring(0, 100),
        [SHEETY_HEADERS.FORM.recommendations]: (formData?.recommendations || '').substring(0, 100),
        [SHEETY_HEADERS.FORM.differentialDiagnosis]: (formData?.differentialDiagnosis || '').substring(0, 100),
        [SHEETY_HEADERS.FORM.supportAreas]: (formData?.priorityAreas || '').substring(0, 100),
        [SHEETY_HEADERS.FORM.strengths]: (formData?.strengths || '').substring(0, 100),
        [SHEETY_HEADERS.FORM.ascStatus]: formData?.ascStatus || '',
        [SHEETY_HEADERS.FORM.adhdStatus]: formData?.adhdStatus || '',
        [SHEETY_HEADERS.FORM.additionalRemarks]: (formData?.remarks || '').substring(0, 100)
    };
}

// Format clinician data
function prepareClinicianData(clinician: any) {
    console.log('🔍 Raw clinician data:', clinician);
    
    // Format the data, preserving all fields
    const formattedData = {
        clinicianName: clinician?.name?.trim() || '',
        clinicianEmail: clinician?.email?.trim() || '',
        clinicName: clinician?.clinicName?.trim() || '',
        childFirstName: clinician?.childFirstName?.trim() || '',
        childSecondName: clinician?.childLastName?.trim() || '',
        childAge: clinician?.childAge?.toString() || '',
        childGender: clinician?.childGender?.trim() || '',
        chataId: clinician?.chataId || ''
    };
    
    console.log('📝 Formatted clinician data:', formattedData);
    console.log('✓ Fields mapped to headers:', Object.keys(formattedData));
    
    return formattedData;
}

// Main function to prepare all data for submission
export function prepareFormDataForSubmission(globalState: GlobalFormState) {
    const { assessments, formData, clinician, chataId } = globalState;

    console.log('🔄 Starting data preparation with state:', { 
        hasAssessments: !!assessments,
        hasFormData: !!formData,
        hasClinician: !!clinician,
        clinicianData: clinician,
        chataId 
    });

    // Prepare all component data
    const clinicianData = prepareClinicianData({
        ...clinician,
        chataId
    });
    const formDataPrepped = prepareFormData(formData);
    const sensoryData = prepareSensoryProfileData(assessments?.sensoryProfile);
    const socialData = prepareSocialCommunicationData(assessments?.socialCommunication);
    const behaviorData = prepareBehaviorInterestsData(assessments?.behaviorInterests);
    const milestoneData = prepareMilestoneData(assessments?.milestones);
    const assessmentLogData = prepareAssessmentLogData(assessments?.assessmentLog);

    // Combine all data
    const submissionData = {
        timestamp: new Date().toISOString(),
        ...clinicianData,
        ...formDataPrepped,
        ...sensoryData,
        ...socialData,
        ...behaviorData,
        ...milestoneData,
        ...assessmentLogData,
        status: 'submitted',
        submissionDate: new Date().toISOString()
    };

    console.log('📦 Prepared submission data:', {
        clinicianFields: clinicianData,
        formFields: Object.keys(formDataPrepped),
        sensoryFields: Object.keys(sensoryData),
        socialFields: Object.keys(socialData),
        behaviorFields: Object.keys(behaviorData),
        milestoneFields: Object.keys(milestoneData),
        assessmentLogFields: Object.keys(assessmentLogData)
    });

    return submissionData;
} 