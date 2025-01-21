import type { GlobalFormState } from '../types';
import type { 
    SensoryDomain, 
    SocialCommunicationDomain, 
    BehaviorDomain,
    Assessment
} from '../types';

interface ProfileData {
    value: number;
    label: string;
    observations: string[];
}

interface DomainData {
    [key: string]: ProfileData;
}

// Helper to format domain data
function formatDomainData(domain: any): string {
    if (!domain || typeof domain.value === 'undefined') return JSON.stringify({
        value: 0,
        label: 'Skipped',
        observations: []
    });

    return JSON.stringify({
        value: domain.value,
        label: domain.label || '',
        observations: Array.isArray(domain.observations) ? domain.observations : []
    });
}

// Format sensory profile data
export function prepareSensoryProfileData(profile: any) {
    if (!profile?.domains) return {};
    
    const formattedData: Record<string, string> = {};
    const domains = ['visual', 'auditory', 'tactile', 'vestibular', 'proprioceptive', 'oral'];
    
    domains.forEach(domain => {
        formattedData[domain] = formatDomainData(profile.domains[domain]);
    });

    return formattedData;
}

// Format social communication data
export function prepareSocialCommunicationData(profile: any) {
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
        formattedData[domain] = formatDomainData(profile.domains[domain]);
    });

    return formattedData;
}

// Format behavior interests data
export function prepareBehaviorInterestsData(profile: any) {
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
        formattedData[domain] = formatDomainData(profile.domains[domain]);
    });

    return formattedData;
}

// Format milestone data
export function prepareMilestoneData(milestones: any) {
    if (!milestones) return {
        timelineData: '[]',
        historyOfConcerns: ''
    };

    return {
        timelineData: JSON.stringify(milestones.milestones || []),
        historyOfConcerns: milestones.historyOfConcerns || ''
    };
}

// Format assessment log data
export function prepareAssessmentLogData(assessmentLog: Record<string, Assessment>) {
    if (!assessmentLog) return '{}';

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

    return JSON.stringify(formattedLog);
}

// Main function to prepare all data for submission
export function prepareFormDataForSubmission(globalState: GlobalFormState) {
    const { assessments, formData, clinician, chataId } = globalState;

    // Prepare profiles data
    const sensoryProfile = prepareSensoryProfileData(assessments?.sensoryProfile);
    const socialCommunication = prepareSocialCommunicationData(assessments?.socialCommunication);
    const behaviorInterests = prepareBehaviorInterestsData(assessments?.behaviorInterests);
    
    // Prepare milestone data
    const { timelineData, historyOfConcerns } = prepareMilestoneData(assessments?.milestones);
    
    // Prepare assessment log
    const assessmentLogData = prepareAssessmentLogData(assessments?.assessmentLog || {});

    return {
        timestamp: new Date().toISOString(),
        chataId,
        
        // Clinician and Child Info
        clinicName: clinician?.clinicName || '',
        clinicianName: clinician?.name || '',
        clinicianEmail: clinician?.email || '',
        childFirstname: clinician?.childFirstName || '',
        childSecondname: clinician?.childLastName || '',
        childAge: clinician?.childAge || '',
        childGender: clinician?.childGender || '',
        
        // Form Data
        ascStatus: formData?.ascStatus || '',
        adhdStatus: formData?.adhdStatus || '',
        clinicalObservations: formData?.clinicalObservations || '',
        strengthsAbilities: formData?.strengths || '',
        prioritySupportAreas: formData?.priorityAreas || '',
        supportRecommendations: formData?.recommendations || '',
        additionalRemarks: formData?.remarks || '',
        differentialDiagnosis: formData?.differentialDiagnosis || '',
        
        // Profile Data (as JSON strings)
        sensoryProfile: JSON.stringify(sensoryProfile),
        socialCommunication: JSON.stringify(socialCommunication),
        behaviorInterests: JSON.stringify(behaviorInterests),
        
        // Timeline and History
        milestoneTimelineData: timelineData,
        historyOfConcerns,
        
        // Assessment Log
        assessmentLogData,
        
        // Status
        status: 'submitted',
        submissionDate: new Date().toISOString()
    };
} 