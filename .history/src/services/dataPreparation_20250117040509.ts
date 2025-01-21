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
        return JSON.stringify(defaultData);
    }

    return JSON.stringify({
        value: domain.value,
        label: domain.label || '',
        observations: Array.isArray(domain.observations) ? domain.observations : []
    });
}

// Format sensory profile data
function prepareSensoryProfileData(profile: any) {
    if (!profile?.domains) return {};
    
    const formattedData: Record<string, string> = {};
    const domains = ['visual', 'auditory', 'tactile', 'vestibular', 'proprioceptive', 'oral'] as const;
    
    domains.forEach(domain => {
        const domainData = profile.domains[domain];
        const header = SHEETY_HEADERS.SENSORY[domain as keyof typeof SHEETY_HEADERS.SENSORY];
        formattedData[header.score] = `${domainData?.value || 0}/5`;
        formattedData[header.observations] = formatDomainData(domainData);
    });

    return formattedData;
}

// Format social communication data
function prepareSocialCommunicationData(profile: any) {
    if (!profile?.domains) return {};
    
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
        formattedData[header.score] = `${domainData?.value || 0}/5`;
        formattedData[header.observations] = formatDomainData(domainData);
    });

    return formattedData;
}

// Format behavior interests data
function prepareBehaviorInterestsData(profile: any) {
    if (!profile?.domains) return {};
    
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
        formattedData[header.score] = `${domainData?.value || 0}/5`;
        formattedData[header.observations] = formatDomainData(domainData);
    });

    return formattedData;
}

// Format milestone data
function prepareMilestoneData(milestones: any) {
    if (!milestones) return {
        [SHEETY_HEADERS.MILESTONE.timelineData]: '[]',
        [SHEETY_HEADERS.MILESTONE.historyOfConcerns]: ''
    };

    const timelineData = milestones.milestones?.map((milestone: any) => ({
        name: milestone.name,
        expectedAge: milestone.expectedAge,
        achievedAge: milestone.achievedAge,
        status: milestone.achievedAge ? 
            milestone.achievedAge === milestone.expectedAge ? 'On Time' :
            milestone.achievedAge > milestone.expectedAge ? `Delayed by ${milestone.achievedAge - milestone.expectedAge} months` :
            `Advanced by ${milestone.expectedAge - milestone.achievedAge} months`
            : 'Not Yet Achieved'
    })) || [];

    return {
        [SHEETY_HEADERS.MILESTONE.timelineData]: JSON.stringify(timelineData),
        [SHEETY_HEADERS.MILESTONE.historyOfConcerns]: milestones.historyOfConcerns || ''
    };
}

// Format assessment log data
function prepareAssessmentLogData(assessmentLog: Record<string, Assessment> | undefined) {
    if (!assessmentLog) return {
        [SHEETY_HEADERS.ASSESSMENT_LOG.data]: '{}'
    };

    const formattedLog = Object.entries(assessmentLog).reduce((acc, [key, assessment]) => {
        acc[key] = {
            id: assessment.id,
            name: assessment.name,
            date: assessment.date || '',
            notes: assessment.notes || '',
            status: assessment.status || 'pending',
            category: assessment.category,
            color: assessment.color,
            addedAt: assessment.addedAt || '',
            lastModified: assessment.lastModified || ''
        };
        return acc;
    }, {} as Record<string, any>);

    return {
        [SHEETY_HEADERS.ASSESSMENT_LOG.data]: JSON.stringify(formattedLog)
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
    
    const formattedData = {
        [SHEETY_HEADERS.CLINICIAN.name]: clinician?.name || '',
        [SHEETY_HEADERS.CLINICIAN.email]: clinician?.email || '',
        [SHEETY_HEADERS.CLINICIAN.clinic]: clinician?.clinicName || '',
        [SHEETY_HEADERS.CLINICIAN.childFirstName]: clinician?.childFirstName || '',
        [SHEETY_HEADERS.CLINICIAN.childLastName]: clinician?.childLastName || '',
        [SHEETY_HEADERS.CLINICIAN.childAge]: clinician?.childAge?.toString() || '',
        [SHEETY_HEADERS.CLINICIAN.childGender]: clinician?.childGender || ''
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
        chataId 
    });

    // Prepare all component data
    const clinicianData = prepareClinicianData(clinician);
    const formDataPrepped = prepareFormData(formData);
    const sensoryData = prepareSensoryProfileData(assessments?.sensoryProfile);
    const socialData = prepareSocialCommunicationData(assessments?.socialCommunication);
    const behaviorData = prepareBehaviorInterestsData(assessments?.behaviorInterests);
    const milestoneData = prepareMilestoneData(assessments?.milestones);
    const assessmentLogData = prepareAssessmentLogData(assessments?.assessmentLog);

    // Combine all data
    const submissionData = {
        timestamp: new Date().toISOString(),
        chataId,
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
        clinicianFields: Object.keys(clinicianData),
        formFields: Object.keys(formDataPrepped),
        sensoryFields: Object.keys(sensoryData),
        socialFields: Object.keys(socialData),
        behaviorFields: Object.keys(behaviorData),
        milestoneFields: Object.keys(milestoneData),
        assessmentLogFields: Object.keys(assessmentLogData)
    });

    // Validate the data format
    const validation = validateDataFormat(submissionData);
    if (!validation.isValid) {
        console.error('❌ Data validation failed:', {
            missingFields: validation.missingFields,
            invalidFormats: validation.invalidFormats
        });
    } else {
        console.log('✅ Data validation passed');
    }

    return submissionData;
} 