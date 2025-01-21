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
    if (!milestones?.milestones?.length) return {
        [SHEETY_HEADERS.MILESTONE.timelineData]: '',
        [SHEETY_HEADERS.MILESTONE.historyOfConcerns]: ''
    };

    // Group milestones by category
    const groupedMilestones: Record<MilestoneCategory, string[]> = {
        COMMUNICATION: [],
        MOTOR: [],
        SOCIAL: [],
        CONCERNS: []
    };

    // Process only placed milestones
    milestones.milestones.forEach((milestone: any) => {
        if (!milestone.achievedAge) return;  // Skip unplaced milestones

        const category = milestone.category.toUpperCase() as MilestoneCategory;
        const entry = formatMilestoneEntry(milestone);
        if (entry && category in groupedMilestones) {
            groupedMilestones[category].push(entry);
        }
    });

    // Build sections, only including categories that have placed milestones
    const sections: string[] = [];
    
    if (groupedMilestones.COMMUNICATION.length) {
        sections.push('=== COMMUNICATION ===');
        sections.push(...groupedMilestones.COMMUNICATION);
        sections.push('');
    }
    
    if (groupedMilestones.MOTOR.length) {
        sections.push('=== MOTOR ===');
        sections.push(...groupedMilestones.MOTOR);
        sections.push('');
    }
    
    if (groupedMilestones.SOCIAL.length) {
        sections.push('=== SOCIAL ===');
        sections.push(...groupedMilestones.SOCIAL);
        sections.push('');
    }

    // Add concerns section only if there are concerns
    const concerns = milestones.concerns?.filter((c: any) => c.isPresent)
        .map((c: any) => `${c.name}: Present`) || [];
    
    if (concerns.length) {
        sections.push('=== CONCERNS ===');
        sections.push(...concerns);
    }

    // Remove any trailing empty lines and join with newlines
    const formattedText = sections.filter(line => line !== '').join('\n');
    
    return {
        [SHEETY_HEADERS.MILESTONE.timelineData]: formattedText,  // Don't wrap in JSON
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