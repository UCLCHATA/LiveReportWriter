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

// Format milestone data
function prepareMilestoneData(milestones: any) {
    if (!milestones?.milestones) {
        return {
            [SHEETY_HEADERS.MILESTONE.timelineData]: JSON.stringify({ data: '' }),
            [SHEETY_HEADERS.MILESTONE.historyOfConcerns]: ''
        };
    }

    interface MilestoneItem {
        milestone: string;
        expectedAge: number;
        achievedAge: number;
        status: string;
    }

    // Group milestones by category
    const categorizedMilestones = milestones.milestones.reduce((acc: Record<string, MilestoneItem[]>, milestone: any) => {
        const category = milestone.category?.toUpperCase() || 'UNKNOWN';
        if (!acc[category]) {
            acc[category] = [];
        }
        
        // Only include milestones that have been placed on timeline
        if (milestone.achievedAge !== null && milestone.achievedAge !== undefined) {
            let status;
            if (milestone.achievedAge === milestone.expectedAge) {
                status = 'On Time';
            } else if (milestone.achievedAge > milestone.expectedAge) {
                const delay = milestone.achievedAge - milestone.expectedAge;
                status = `Delayed by ${delay} month${delay !== 1 ? 's' : ''}`;
            } else {
                const advance = milestone.expectedAge - milestone.achievedAge;
                status = `Early by ${advance} month${advance !== 1 ? 's' : ''}`;
            }
            
            acc[category].push({
                milestone: milestone.milestone || milestone.name || 'Unnamed Milestone',
                expectedAge: milestone.expectedAge,
                achievedAge: milestone.achievedAge,
                status
            });
        }
        return acc;
    }, {});

    // Format each category's milestones
    const sections = Object.entries(categorizedMilestones)
        .filter(([category]) => ['COMMUNICATION', 'MOTOR', 'SOCIAL'].includes(category))
        .map(([category, items]) => {
            // Type assertion since we know the structure
            const milestoneItems = items as MilestoneItem[];
            const sortedItems = [...milestoneItems].sort((a, b) => a.expectedAge - b.expectedAge);
            const itemsText = sortedItems
                .map(item => `${item.milestone}: Expected ${item.expectedAge}m, Achieved ${item.achievedAge}m (${item.status})`)
                .join('\n');
            return `${category}:\n${itemsText || 'No milestones recorded'}`;
        });

    // Add concerns section
    const concerns = milestones.concerns || [];
    const concernsText = concerns.length > 0
        ? concerns.map((c: any) => `${c.name || c.milestone || 'Unnamed Concern'}: ${c.status || 'Status not specified'}`).join('\n')
        : 'No concerns recorded';
    sections.push(`CONCERNS:\n${concernsText}`);

    // Join all sections with double newlines and wrap in JSON
    const formattedData = {
        data: sections.join('\n\n'),
        metadata: {
            totalMilestones: Object.values(categorizedMilestones).flat().length,
            categories: Object.keys(categorizedMilestones),
            lastUpdated: new Date().toISOString()
        }
    };

    return {
        [SHEETY_HEADERS.MILESTONE.timelineData]: JSON.stringify(formattedData),
        [SHEETY_HEADERS.MILESTONE.historyOfConcerns]: milestones.historyOfConcerns || ''
    };
}

// Format assessment log data
function prepareAssessmentLogData(assessmentLog: Record<string, Assessment> | undefined) {
    if (!assessmentLog) return {
        [SHEETY_HEADERS.ASSESSMENT_LOG.data]: JSON.stringify({ entries: [] })
    };

    const formattedLog = Object.entries(assessmentLog).map(([key, assessment]) => ({
        id: assessment.id,
        name: assessment.name,
        date: assessment.date || '',
        notes: assessment.notes || '',
        status: assessment.status || 'pending',
        category: assessment.category,
        color: assessment.color,
        addedAt: assessment.addedAt || '',
        lastModified: assessment.lastModified || ''
    }));

    return {
        [SHEETY_HEADERS.ASSESSMENT_LOG.data]: JSON.stringify({ entries: formattedLog })
    };
}

// Format form data (truncate to 100 chars and ensure JSON safety)
function prepareFormData(formData: any) {
    const processedData = {
        [SHEETY_HEADERS.FORM.clinicalObservations]: JSON.stringify({ text: (formData?.clinicalObservations || '').substring(0, 100) }),
        [SHEETY_HEADERS.FORM.recommendations]: JSON.stringify({ text: (formData?.recommendations || '').substring(0, 100) }),
        [SHEETY_HEADERS.FORM.differentialDiagnosis]: JSON.stringify({ text: (formData?.differentialDiagnosis || '').substring(0, 100) }),
        [SHEETY_HEADERS.FORM.supportAreas]: JSON.stringify({ text: (formData?.priorityAreas || '').substring(0, 100) }),
        [SHEETY_HEADERS.FORM.strengths]: JSON.stringify({ text: (formData?.strengths || '').substring(0, 100) }),
        [SHEETY_HEADERS.FORM.ascStatus]: JSON.stringify({ status: formData?.ascStatus || '' }),
        [SHEETY_HEADERS.FORM.adhdStatus]: JSON.stringify({ status: formData?.adhdStatus || '' }),
        [SHEETY_HEADERS.FORM.additionalRemarks]: JSON.stringify({ text: (formData?.remarks || '').substring(0, 100) })
    };

    return processedData;
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