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
    const domains = ['visual', 'auditory', 'tactile', 'vestibular', 'proprioceptive', 'oral'];
    
    domains.forEach(domain => {
        const domainData = profile.domains[domain];
        formattedData[SHEETY_HEADERS.SENSORY[domain].score] = `${domainData?.value || 0}/5`;
        formattedData[SHEETY_HEADERS.SENSORY[domain].observations] = formatDomainData(domainData);
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
    ];
    
    domains.forEach(domain => {
        const domainData = profile.domains[domain];
        formattedData[SHEETY_HEADERS.SOCIAL[domain].score] = `${domainData?.value || 0}/5`;
        formattedData[SHEETY_HEADERS.SOCIAL[domain].observations] = formatDomainData(domainData);
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
    ];
    
    domains.forEach(domain => {
        const domainData = profile.domains[domain];
        formattedData[SHEETY_HEADERS.BEHAVIOR[domain].score] = `${domainData?.value || 0}/5`;
        formattedData[SHEETY_HEADERS.BEHAVIOR[domain].observations] = formatDomainData(domainData);
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
function prepareAssessmentLogData(assessmentLog: Record<string, Assessment>) {
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
    return {
        [SHEETY_HEADERS.CLINICIAN.name]: clinician?.name || '',
        [SHEETY_HEADERS.CLINICIAN.email]: clinician?.email || '',
        [SHEETY_HEADERS.CLINICIAN.clinic]: clinician?.clinicName || '',
        [SHEETY_HEADERS.CLINICIAN.childFirstName]: clinician?.childFirstName || '',
        [SHEETY_HEADERS.CLINICIAN.childLastName]: clinician?.childLastName || '',
        [SHEETY_HEADERS.CLINICIAN.childAge]: clinician?.childAge || '',
        [SHEETY_HEADERS.CLINICIAN.childGender]: clinician?.childGender || ''
    };
}

// Main function to prepare all data for submission
export function prepareFormDataForSubmission(globalState: GlobalFormState) {
    const { assessments, formData, clinician, chataId } = globalState;

    // Prepare all component data
    const submissionData = {
        timestamp: new Date().toISOString(),
        chataId,
        
        // Component Data
        ...prepareClinicianData(clinician),
        ...prepareFormData(formData),
        ...prepareSensoryProfileData(assessments?.sensoryProfile),
        ...prepareSocialCommunicationData(assessments?.socialCommunication),
        ...prepareBehaviorInterestsData(assessments?.behaviorInterests),
        ...prepareMilestoneData(assessments?.milestones),
        ...prepareAssessmentLogData(assessments?.assessmentLog),
        
        // Status
        status: 'submitted',
        submissionDate: new Date().toISOString()
    };

    // Validate the data format
    const validation = validateDataFormat(submissionData);
    if (!validation.isValid) {
        console.error('Data validation failed:', {
            missingFields: validation.missingFields,
            invalidFormats: validation.invalidFormats
        });
    }

    return submissionData;
} 