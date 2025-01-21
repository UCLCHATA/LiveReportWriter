import { submitToSheetyAPI } from '../utils/api';
import { GlobalFormState, Milestone, AssessmentDomainBase } from '../types';
import { R3_FORM_API } from '../config/api';

interface Assessment {
  id: string;
  type: string;
  date: string;
  notes?: string;
  domains?: Record<string, any>;
}

interface FormSubmissionData {
  milestones?: Milestone[];
  assessments?: Assessment[];
  milestoneImage?: string;
  combinedGraphImage?: string;
  includeMilestoneImage?: boolean;
  includeRadarChart?: boolean;
  globalState: GlobalFormState;
}

interface SheetyFormData {
  milestoneImage?: string;
  combinedGraphImage?: string;
  milestoneTimelineData?: string;
  assessmentLogData?: string;
  chataId?: string;
  timestamp?: string;
}

const toCamelCase = (str: string): string => {
  return str.replace(/([-_][a-z])/g, group =>
    group.toUpperCase().replace('-', '').replace('_', '')
  );
};

// Helper functions
const formatDomainValue = (domain: any): string => {
  if (!domain || !domain.value || domain.value === 0) return 'Skipped';
  const label = domain.label || 'Typical';
  return `${label} ${domain.value}/5`;
};

const formatMilestoneData = (milestones: Milestone[] = []): string => {
  return milestones.map(milestone => {
    const actualAge = milestone.actualAge;
    const expectedAge = milestone.expectedAge || 0;
    
    if (milestone.category === 'concerns') {
      return `${milestone.title}: ${milestone.status === 'typical' ? 'Not Present' : 'Present'}`;
    }
    
    if (actualAge) {
      const difference = actualAge - expectedAge;
      const status = difference > 0 ? 'Delayed' : difference < 0 ? 'Advanced' : 'On track';
      return `${milestone.title}: Expected at ${expectedAge} months, Achieved at ${actualAge} months, ${status} by ${Math.abs(difference)} months`;
    }
    
    return `${milestone.title}: Expected at ${expectedAge} months (Not yet achieved)`;
  }).join('\n');
};

const formatAssessmentLog = (entries: Record<string, any> = {}): string => {
  return Object.values(entries)
    .filter(entry => entry && typeof entry === 'object')
    .map(entry => {
      const { name, date, notes } = entry;
      return `${name} (${date}): ${notes || ''}`;
    })
    .join('\n');
};

export const submitFormData = async (data: FormSubmissionData) => {
  console.log('Submitting form data...');
  
  // Log milestone data
  console.log('Milestone data:', {
    milestoneCount: data.milestones?.length || 0,
    hasImage: !!data.milestoneImage,
    imageIncluded: data.includeMilestoneImage
  });

  // Log assessment data
  console.log('Assessment data:', {
    assessmentCount: data.assessments?.length || 0,
    hasRadarChart: !!data.combinedGraphImage,
    chartIncluded: data.includeRadarChart
  });

  // Collect all component data
  const formattedData: Record<string, any> = {
    // Clinician Data
    chataId: data.globalState.clinician?.chataId || '',
    clinicName: data.globalState.clinician?.clinicName || '',
    clinicianName: data.globalState.clinician?.name || '',
    clinicianEmail: data.globalState.clinician?.email || '',
    childFirstName: data.globalState.clinician?.childFirstName || '',
    childSecondName: data.globalState.clinician?.childSecondName || '',
    childAge: data.globalState.clinician?.childAge || '',
    childGender: data.globalState.clinician?.childGender || '',

    // Sensory Profile Data
    visualScore: formatDomainValue(data.globalState.assessments.sensoryProfile.domains.visual),
    visualObservations: data.globalState.assessments.sensoryProfile.domains.visual?.observations || '',
    auditoryScore: formatDomainValue(data.globalState.assessments.sensoryProfile.domains.auditory),
    auditoryObservations: data.globalState.assessments.sensoryProfile.domains.auditory?.observations || '',
    tactileScore: formatDomainValue(data.globalState.assessments.sensoryProfile.domains.tactile),
    tactileObservations: data.globalState.assessments.sensoryProfile.domains.tactile?.observations || '',
    vestibularScore: formatDomainValue(data.globalState.assessments.sensoryProfile.domains.vestibular),
    vestibularObservations: data.globalState.assessments.sensoryProfile.domains.vestibular?.observations || '',
    proprioceptiveScore: formatDomainValue(data.globalState.assessments.sensoryProfile.domains.proprioceptive),
    proprioceptiveObservations: data.globalState.assessments.sensoryProfile.domains.proprioceptive?.observations || '',
    oralScore: formatDomainValue(data.globalState.assessments.sensoryProfile.domains.oral),
    oralObservations: data.globalState.assessments.sensoryProfile.domains.oral?.observations || '',

    // Social Communication Data
    jointAttentionScore: formatDomainValue(data.globalState.assessments.socialCommunication.domains.jointAttention),
    jointAttentionObservations: data.globalState.assessments.socialCommunication.domains.jointAttention?.observations || '',
    nonverbalCommunicationScore: formatDomainValue(data.globalState.assessments.socialCommunication.domains.nonverbalCommunication),
    nonverbalCommunicationObservations: data.globalState.assessments.socialCommunication.domains.nonverbalCommunication?.observations || '',
    verbalCommunicationScore: formatDomainValue(data.globalState.assessments.socialCommunication.domains.verbalCommunication),
    verbalCommunicationObservations: data.globalState.assessments.socialCommunication.domains.verbalCommunication?.observations || '',
    socialUnderstandingScore: formatDomainValue(data.globalState.assessments.socialCommunication.domains.socialUnderstanding),
    socialUnderstandingObservations: data.globalState.assessments.socialCommunication.domains.socialUnderstanding?.observations || '',
    playSkillsScore: formatDomainValue(data.globalState.assessments.socialCommunication.domains.playSkills),
    playSkillsObservations: data.globalState.assessments.socialCommunication.domains.playSkills?.observations || '',
    peerInteractionsScore: formatDomainValue(data.globalState.assessments.socialCommunication.domains.peerInteractions),
    peerInteractionsObservations: data.globalState.assessments.socialCommunication.domains.peerInteractions?.observations || '',

    // Behavior & Interests Data
    repetitiveBehaviorsScore: formatDomainValue(data.globalState.assessments.behaviorInterests.domains.repetitiveBehaviors),
    repetitiveBehaviorsObservations: data.globalState.assessments.behaviorInterests.domains.repetitiveBehaviors?.observations || '',
    routinesRitualsScore: formatDomainValue(data.globalState.assessments.behaviorInterests.domains.routinesRituals),
    routinesRitualsObservations: data.globalState.assessments.behaviorInterests.domains.routinesRituals?.observations || '',
    specialInterestsScore: formatDomainValue(data.globalState.assessments.behaviorInterests.domains.specialInterests),
    specialInterestsObservations: data.globalState.assessments.behaviorInterests.domains.specialInterests?.observations || '',
    sensoryInterestsScore: formatDomainValue(data.globalState.assessments.behaviorInterests.domains.sensoryInterests),
    sensoryInterestsObservations: data.globalState.assessments.behaviorInterests.domains.sensoryInterests?.observations || '',
    emotionalRegulationScore: formatDomainValue(data.globalState.assessments.behaviorInterests.domains.emotionalRegulation),
    emotionalRegulationObservations: data.globalState.assessments.behaviorInterests.domains.emotionalRegulation?.observations || '',
    flexibilityScore: formatDomainValue(data.globalState.assessments.behaviorInterests.domains.flexibility),
    flexibilityObservations: data.globalState.assessments.behaviorInterests.domains.flexibility?.observations || '',

    // Milestone Data
    milestoneTimelineData: formatMilestoneData(data.globalState.assessments.milestones.milestones),
    milestoneHistory: data.globalState.assessments.milestones.history || '',
    milestoneImage: data.includeMilestoneImage && data.milestoneImage ? data.milestoneImage : '',

    // Assessment Log Data
    assessmentLogData: formatAssessmentLog(data.globalState.assessments.assessmentLog.entries),

    // Combined Graph
    combinedGraphImage: data.includeRadarChart && data.combinedGraphImage ? data.combinedGraphImage : '',

    // Metadata
    timestamp: new Date().toISOString(),
  };

  // Convert all keys to camelCase
  const camelCaseData = Object.entries(formattedData).reduce((acc, [key, value]) => ({
    ...acc,
    [toCamelCase(key)]: value === null || value === undefined ? '' : value
  }), {});

  // Prepare the payload with the required r3Form root property
  const payload = {
    r3Form: camelCaseData
  };

  try {
    const response = await submitToSheetyAPI(R3_FORM_API, payload);
    console.log('Form submission successful:', response);
    return response;
  } catch (error) {
    console.error('Error submitting form:', error);
    throw error;
  }
}; 