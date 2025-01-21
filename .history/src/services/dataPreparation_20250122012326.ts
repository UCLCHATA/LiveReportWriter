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
function prepareMilestoneData(milestoneData: any) {
    if (!milestoneData) return {};

    console.log('🔍 Raw milestone data:', milestoneData);

    // Process placed milestones
    const placedMilestones = milestoneData.milestones?.filter((m: any) => m.actualAge !== undefined) || [];
    placedMilestones.forEach((milestone: any) => {
        console.log('✓ Found placed milestone:', milestone.title, milestone);
    });
    console.log('📊 Placed milestones:', placedMilestones);

    // Format milestone text
    let milestoneText = '';
    const categories: { [key: string]: any[] } = {};

    placedMilestones.forEach((milestone: any) => {
        if (!categories[milestone.category]) {
            categories[milestone.category] = [];
        }
        categories[milestone.category].push(milestone);
    });

    Object.entries(categories).forEach(([category, milestones]) => {
        milestoneText += `${category.toUpperCase()}\n`;
        milestones.forEach((milestone: any) => {
            const diff = milestone.actualAge - milestone.expectedAge;
            const status = diff === 0 ? 'On time' :
                          diff > 0 ? `Delayed by ${diff} months` :
                          `Early by ${Math.abs(diff)} months`;
            milestoneText += `- ${milestone.title} - ${status}, expected at ${milestone.expectedAge} months\n`;
        });
        milestoneText += '\n';
    });

    console.log('📝 Formatted milestone text:', milestoneText);

    // Process milestone image if present
    let milestoneImageData = null;
    if (milestoneData.timelineImage && milestoneData.includeTimelineInReport) {
        console.log('📸 Processing milestone timeline image...');
        milestoneImageData = {
            data: milestoneData.timelineImage,
            include: true
        };
    }

    return {
        [SHEETY_HEADERS.FORM.milestoneTimelineData]: milestoneText,
        [SHEETY_HEADERS.FORM.historyOfConcerns]: milestoneData.historyOfConcerns || '',
        milestoneImage: milestoneImageData
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
    // Format referrals into a comma-separated string
    const referralLabels = {
        speech: 'Speech & Language',
        occupational: 'Occupational Therapy',
        educational: 'Educational Psychology',
        sleep: 'Sleep Support',
        mental: 'Mental Health',
        other: 'Other'
    };

    console.log('🔍 Raw referrals data:', formData?.referrals);

    const selectedReferrals = Object.entries(formData?.referrals || {})
        .filter(([_, isSelected]) => isSelected === true)  // Explicitly check for true
        .map(([key, _]) => referralLabels[key as keyof typeof referralLabels])
        .filter(Boolean);

    console.log('✓ Selected referrals:', selectedReferrals);
    const formattedReferrals = selectedReferrals.join(', ');
    console.log('📝 Formatted referrals string:', formattedReferrals);

    return {
        [SHEETY_HEADERS.FORM.clinicalObservations]: (formData?.clinicalObservations || '').substring(0, 100),
        [SHEETY_HEADERS.FORM.recommendations]: (formData?.recommendations || '').substring(0, 100),
        [SHEETY_HEADERS.FORM.differentialDiagnosis]: (formData?.differentialDiagnosis || '').substring(0, 100),
        [SHEETY_HEADERS.FORM.supportAreas]: (formData?.priorityAreas || '').substring(0, 100),
        [SHEETY_HEADERS.FORM.strengths]: (formData?.strengths || '').substring(0, 100),
        [SHEETY_HEADERS.FORM.ascStatus]: formData?.ascStatus || '',
        [SHEETY_HEADERS.FORM.adhdStatus]: formData?.adhdStatus || '',
        [SHEETY_HEADERS.FORM.additionalRemarks]: (formData?.remarks || '').substring(0, 100),
        [SHEETY_HEADERS.FORM.referrals]: formattedReferrals || ''  // Use the header constant and ensure empty string fallback
    };
}

// Format clinician data
function prepareClinicianData(clinician: any, chataId: string) {
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
        chataId: chataId // Ensure CHATA ID is included
    };
    
    console.log('📝 Formatted clinician data:', formattedData);
    console.log('✓ Fields mapped to headers:', Object.keys(formattedData));
    
    return formattedData;
}

// Main function to prepare all data for submission
const prepareFormDataForSubmission = (globalState: GlobalFormState) => {
    // Log the raw data for debugging
    console.log('📦 Raw form data:', {
        hasClinician: !!globalState.clinician,
        hasFormData: !!globalState.formData,
        hasAssessments: !!globalState.assessments,
        hasMilestones: !!globalState.assessments?.milestones,
        hasSummary: !!globalState.assessments?.summary
    });

    // Prepare main submission data (without images)
    const mainSubmissionData = {
        ...prepareClinicianData(globalState.clinician, globalState.chataId),
        ...prepareFormData(globalState.formData),
        ...prepareMilestoneData(globalState.assessments?.milestones),
        ...prepareAssessmentLogData(globalState.assessments?.assessmentLog)
    };

    // Log the base64 lengths and include flags for debugging
    const milestoneTimelineImage = globalState.assessments?.milestones?.timelineImage || '';
    const radarChartImage = globalState.assessments?.summary?.radarChartImage || '';
    const includeTimeline = globalState.assessments?.milestones?.includeTimelineInReport || false;
    const includeRadarChart = globalState.assessments?.summary?.includeInReport || false;

    console.log('📏 Image data:', {
        milestoneImageLength: milestoneTimelineImage.length,
        radarChartImageLength: radarChartImage.length,
        includeTimeline,
        includeRadarChart
    });

    // Add milestone image data to main submission
    if (includeTimeline && milestoneTimelineImage) {
        mainSubmissionData.milestoneImage = {
            data: milestoneTimelineImage,
            include: true
        };
    }

    // Add radar chart image data to main submission
    if (includeRadarChart && radarChartImage) {
        mainSubmissionData.radarChartImage = {
            data: radarChartImage,
            include: true
        };
    }

    return mainSubmissionData;
}; 