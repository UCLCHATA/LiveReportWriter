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
    if (!milestones) return {
        [SHEETY_HEADERS.MILESTONE.timelineData]: JSON.stringify({ data: '' }),
        [SHEETY_HEADERS.MILESTONE.historyOfConcerns]: ''
    };

    // Build milestone data object
    const timelineData = {
        communication: [] as any[],
        motor: [] as any[],
        social: [] as any[],
        concerns: [] as any[]
    };

    // Process COMMUNICATION milestones
    const communicationMilestones = milestones.milestones
        ?.filter((m: any) => m.category.toUpperCase() === 'COMMUNICATION')
        ?.sort((a: any, b: any) => a.expectedAge - b.expectedAge) || [];
    
    communicationMilestones.forEach((milestone: any) => {
        let status = 'Not yet achieved';
        if (milestone.achievedAge !== null && milestone.achievedAge !== undefined) {
            if (milestone.achievedAge === milestone.expectedAge) {
                status = 'On Time';
            } else if (milestone.achievedAge > milestone.expectedAge) {
                const delay = milestone.achievedAge - milestone.expectedAge;
                status = `Delayed by ${delay} month${delay !== 1 ? 's' : ''}`;
            } else {
                const advance = milestone.expectedAge - milestone.achievedAge;
                status = `Early by ${advance} month${advance !== 1 ? 's' : ''}`;
            }
        }
        timelineData.communication.push({
            name: milestone.name,
            expectedAge: milestone.expectedAge,
            status
        });
    });

    // Process MOTOR milestones
    const motorMilestones = milestones.milestones
        ?.filter((m: any) => m.category.toUpperCase() === 'MOTOR')
        ?.sort((a: any, b: any) => a.expectedAge - b.expectedAge) || [];
    
    motorMilestones.forEach((milestone: any) => {
        let status = 'Not yet achieved';
        if (milestone.achievedAge !== null && milestone.achievedAge !== undefined) {
            if (milestone.achievedAge === milestone.expectedAge) {
                status = 'On Time';
            } else if (milestone.achievedAge > milestone.expectedAge) {
                const delay = milestone.achievedAge - milestone.expectedAge;
                status = `Delayed by ${delay} month${delay !== 1 ? 's' : ''}`;
            } else {
                const advance = milestone.expectedAge - milestone.achievedAge;
                status = `Early by ${advance} month${advance !== 1 ? 's' : ''}`;
            }
        }
        timelineData.motor.push({
            name: milestone.name,
            expectedAge: milestone.expectedAge,
            status
        });
    });

    // Process SOCIAL milestones
    const socialMilestones = milestones.milestones
        ?.filter((m: any) => m.category.toUpperCase() === 'SOCIAL')
        ?.sort((a: any, b: any) => a.expectedAge - b.expectedAge) || [];
    
    socialMilestones.forEach((milestone: any) => {
        let status = 'Not yet achieved';
        if (milestone.achievedAge !== null && milestone.achievedAge !== undefined) {
            if (milestone.achievedAge === milestone.expectedAge) {
                status = 'On Time';
            } else if (milestone.achievedAge > milestone.expectedAge) {
                const delay = milestone.achievedAge - milestone.expectedAge;
                status = `Delayed by ${delay} month${delay !== 1 ? 's' : ''}`;
            } else {
                const advance = milestone.expectedAge - milestone.achievedAge;
                status = `Early by ${advance} month${advance !== 1 ? 's' : ''}`;
            }
        }
        timelineData.social.push({
            name: milestone.name,
            expectedAge: milestone.expectedAge,
            status
        });
    });

    // Process CONCERNS
    const concernMilestones = milestones.milestones
        ?.filter((m: any) => m.category.toUpperCase() === 'CONCERNS') || [];
    
    concernMilestones.forEach((concern: any) => {
        const status = concern.achievedAge !== null && concern.achievedAge !== undefined
            ? `Present at ${concern.achievedAge} months`
            : 'Not Present';
        timelineData.concerns.push({
            name: concern.name,
            status
        });
    });

    // Format the data as a readable string but wrapped in JSON
    const formattedString = Object.entries(timelineData).map(([category, items]) => {
        const itemsText = items.map(item => {
            if (category === 'concerns') {
                return `${item.name}: ${item.status}`;
            }
            return `${item.name}: Expected ${item.expectedAge}m (${item.status})`;
        }).join('\n');
        
        return `${category.toUpperCase()}:\n${itemsText}`;
    }).join('\n\n');

    return {
        [SHEETY_HEADERS.MILESTONE.timelineData]: JSON.stringify({ data: formattedString }),
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