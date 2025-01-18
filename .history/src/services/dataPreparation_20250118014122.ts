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
    console.log('🔍 Raw milestone data:', milestones);

    if (!milestones?.milestones) {
        return {
            [SHEETY_HEADERS.MILESTONE.timelineData]: JSON.stringify({ data: '' }),
            [SHEETY_HEADERS.MILESTONE.historyOfConcerns]: ''
        };
    }

    // Build formatted string exactly matching the Google Sheet format
    let formattedString = '';

    // Process COMMUNICATION milestones
    formattedString += '=== COMMUNICATION ===\n';
    const communicationMilestones = [
        { id: 'babbling', name: 'Babbling', expectedAge: 6 },
        { id: 'nameResponse', name: 'Name response', expectedAge: 9 },
        { id: 'pointsToShow', name: 'Points to show', expectedAge: 12 },
        { id: 'firstWords', name: 'First words', expectedAge: 12 },
        { id: 'combinesWords', name: 'Combines words', expectedAge: 24 }
    ];
    
    communicationMilestones.forEach(milestone => {
        const placed = milestones.milestones.find((m: any) => 
            m.category.toUpperCase() === 'COMMUNICATION' && 
            m.id === milestone.id
        );
        
        if (placed) {
            const status = placed.achievedAge !== null && placed.achievedAge !== undefined
                ? placed.achievedAge < placed.expectedAge
                    ? `Early by ${placed.expectedAge - placed.achievedAge} months`
                    : placed.achievedAge > placed.expectedAge
                        ? `Delayed by ${placed.achievedAge - placed.expectedAge} months`
                        : 'On Time'
                : 'Not yet achieved';
            formattedString += `${milestone.name}: Expected ${milestone.expectedAge}m (${status})\n`;
        }
    });

    // Process MOTOR milestones
    formattedString += '\n=== MOTOR ===\n';
    const motorMilestones = [
        { id: 'headControl', name: 'Head control', expectedAge: 3 },
        { id: 'reachesGrasps', name: 'Reaches & grasps', expectedAge: 5 },
        { id: 'independentSitting', name: 'Independent sitting', expectedAge: 8 },
        { id: 'independentWalking', name: 'Independent walking', expectedAge: 12 },
        { id: 'climbsRuns', name: 'Climbs & runs', expectedAge: 18 }
    ];
    
    motorMilestones.forEach(milestone => {
        const placed = milestones.milestones.find((m: any) => 
            m.category.toUpperCase() === 'MOTOR' && 
            m.id === milestone.id
        );
        
        if (placed) {
            const status = placed.achievedAge !== null && placed.achievedAge !== undefined
                ? placed.achievedAge < placed.expectedAge
                    ? `Early by ${placed.expectedAge - placed.achievedAge} months`
                    : placed.achievedAge > placed.expectedAge
                        ? `Delayed by ${placed.achievedAge - placed.expectedAge} months`
                        : 'On Time'
                : 'Not yet achieved';
            formattedString += `${milestone.name}: Expected ${milestone.expectedAge}m (${status})\n`;
        }
    });

    // Process SOCIAL milestones
    formattedString += '\n=== SOCIAL ===\n';
    const socialMilestones = [
        { id: 'socialSmile', name: 'Social smile', expectedAge: 2 },
        { id: 'eyeContact', name: 'Eye contact', expectedAge: 3 },
        { id: 'imitation', name: 'Imitation', expectedAge: 9 },
        { id: 'pretendPlay', name: 'Pretend play', expectedAge: 18 },
        { id: 'interactivePlay', name: 'Interactive play', expectedAge: 24 }
    ];
    
    socialMilestones.forEach(milestone => {
        const placed = milestones.milestones.find((m: any) => 
            m.category.toUpperCase() === 'SOCIAL' && 
            m.id === milestone.id
        );
        
        if (placed) {
            const status = placed.achievedAge !== null && placed.achievedAge !== undefined
                ? placed.achievedAge < placed.expectedAge
                    ? `Early by ${placed.expectedAge - placed.achievedAge} months`
                    : placed.achievedAge > placed.expectedAge
                        ? `Delayed by ${placed.achievedAge - placed.expectedAge} months`
                        : 'On Time'
                : 'Not yet achieved';
            formattedString += `${milestone.name}: Expected ${milestone.expectedAge}m (${status})\n`;
        }
    });

    // Process CONCERNS
    formattedString += '\n=== CONCERNS ===\n';
    const concernsList = [
        { id: 'rigidPlayPatterns', name: 'Rigid play patterns' },
        { id: 'limitedSocialEngagement', name: 'Limited social engagement' },
        { id: 'sensorySeeking', name: 'Sensory seeking/avoiding' }
    ];
    
    concernsList.forEach(concern => {
        const placed = milestones.concerns?.find((c: any) => c.id === concern.id);
        formattedString += `${concern.name}: ${placed?.status || 'Not Present'}\n`;
    });

    // Wrap the formatted string in a JSON object
    const formattedData = {
        data: formattedString
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