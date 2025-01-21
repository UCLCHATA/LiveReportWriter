import { submitToSheetyAPI } from './api';
import { R3_FORM_API } from '../config/api';

interface Milestone {
  title: string;
  description: string;
  expectedAge: number;
  actualAge?: number;
  isCustom?: boolean;
}

interface AssessmentEntry {
  name: string;
  date: string;
  notes: string;
}

interface FormData {
  milestones?: Milestone[];
  milestoneHistory?: string;
  ascStatus: string;
  adhdStatus: string;
  clinicalObservations: string;
  strengths: string;
  priorityAreas: string;
  recommendations: string;
  referrals: Record<string, boolean>;
  remarks?: string;
  differentialDiagnosis?: string;
  timelineImage?: string;
}

interface GlobalState {
  clinician?: {
    chataId?: string;
    clinicName?: string;
    name?: string;
    email?: string;
  };
  assessments: {
    sensoryProfile: {
      domains: Record<string, { value?: string; observations?: string; }>;
    };
    socialCommunication: {
      domains: Record<string, { value?: string; observations?: string; }>;
    };
    behaviorInterests: {
      domains: Record<string, { value?: string; observations?: string; }>;
    };
    assessmentLog: {
      entries: Record<string, AssessmentEntry>;
    };
  };
}

interface FormSubmissionData {
  formData: FormData;
  globalState: GlobalState;
  radarChartImage?: string;
}

export const prepareSheetyData = ({ formData, globalState, radarChartImage }: FormSubmissionData) => {
  // Helper function to ensure string values
  const ensureString = (value: any): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return '';
  };

  // Helper function to format milestone status
  const getMilestoneStatus = (milestone: Milestone): string => {
    if (!milestone.actualAge || milestone.isCustom) return 'Not Assessed';
    const diff = milestone.actualAge - milestone.expectedAge;
    if (diff > 0) return `Delayed by ${diff} months`;
    if (diff < 0) return `Advanced by ${Math.abs(diff)} months`;
    return 'On Track';
  };

  // Debug log for milestone data
  console.log('Raw milestone data:', {
    milestones: formData.milestones,
    formData,
    globalState
  });

  // Format milestone data
  const formatMilestone = (milestone: Milestone) => {
    const formatted = {
      title: ensureString(milestone.title),
      description: ensureString(milestone.description),
      expectedMonth: milestone.isCustom ? 'NA' : ensureString(milestone.expectedAge),
      actualMonth: ensureString(milestone.actualAge),
      status: getMilestoneStatus(milestone)
    };
    console.log('Formatted milestone:', formatted);
    return formatted;
  };

  const joinMilestone = (formatted: Record<string, string>) => {
    const joined = Object.values(formatted).join('|');
    console.log('Joined milestone string:', joined);
    return joined;
  };

  const milestoneTimelineData = formData.milestones
    ? formData.milestones
        .map(formatMilestone)
        .map(joinMilestone)
        .join(' || ')
    : '';

  console.log('Final milestone timeline data:', milestoneTimelineData);

  return {
    r3Form: {
      timestamp: new Date().toISOString(),
      chataId: ensureString(globalState.clinician?.chataId),
      clinicName: ensureString(globalState.clinician?.clinicName),
      clinicianName: ensureString(globalState.clinician?.name),
      clinicianEmail: ensureString(globalState.clinician?.email),
      
      // Sensory Profile Scores and Observations
      tactileScore: ensureString(globalState.assessments.sensoryProfile.domains.tactile?.value),
      tactileObservations: ensureString(globalState.assessments.sensoryProfile.domains.tactile?.observations),
      vestibularScore: ensureString(globalState.assessments.sensoryProfile.domains.vestibular?.value),
      vestibularObservations: ensureString(globalState.assessments.sensoryProfile.domains.vestibular?.observations),
      proprioceptiveScore: ensureString(globalState.assessments.sensoryProfile.domains.proprioceptive?.value),
      proprioceptiveObservations: ensureString(globalState.assessments.sensoryProfile.domains.proprioceptive?.observations),
      auditoryScore: ensureString(globalState.assessments.sensoryProfile.domains.auditory?.value),
      auditoryObservations: ensureString(globalState.assessments.sensoryProfile.domains.auditory?.observations),
      visualScore: ensureString(globalState.assessments.sensoryProfile.domains.visual?.value),
      visualObservations: ensureString(globalState.assessments.sensoryProfile.domains.visual?.observations),
      
      // Social Communication Scores and Observations
      socialEngagementScore: ensureString(globalState.assessments.socialCommunication.domains.socialEngagement?.value),
      socialEngagementObservations: ensureString(globalState.assessments.socialCommunication.domains.socialEngagement?.observations),
      nonverbalCommunicationScore: ensureString(globalState.assessments.socialCommunication.domains.nonverbalCommunication?.value),
      nonverbalCommunicationObservations: ensureString(globalState.assessments.socialCommunication.domains.nonverbalCommunication?.observations),
      playSkillsScore: ensureString(globalState.assessments.socialCommunication.domains.playSkills?.value),
      playSkillsObservations: ensureString(globalState.assessments.socialCommunication.domains.playSkills?.observations),
      peerInteractionsScore: ensureString(globalState.assessments.socialCommunication.domains.peerInteractions?.value),
      peerInteractionsObservations: ensureString(globalState.assessments.socialCommunication.domains.peerInteractions?.observations),
      
      // Behavior & Interests Scores and Observations
      repetitiveBehaviorsScore: ensureString(globalState.assessments.behaviorInterests.domains.repetitiveBehaviors?.value),
      repetitiveBehaviorsObservations: ensureString(globalState.assessments.behaviorInterests.domains.repetitiveBehaviors?.observations),
      routinesRitualsScore: ensureString(globalState.assessments.behaviorInterests.domains.routinesRituals?.value),
      routinesRitualsObservations: ensureString(globalState.assessments.behaviorInterests.domains.routinesRituals?.observations),
      specialInterestsScore: ensureString(globalState.assessments.behaviorInterests.domains.specialInterests?.value),
      specialInterestsObservations: ensureString(globalState.assessments.behaviorInterests.domains.specialInterests?.observations),
      sensoryInterestsScore: ensureString(globalState.assessments.behaviorInterests.domains.sensoryInterests?.value),
      sensoryInterestsObservations: ensureString(globalState.assessments.behaviorInterests.domains.sensoryInterests?.observations),
      emotionalRegulationScore: ensureString(globalState.assessments.behaviorInterests.domains.emotionalRegulation?.value),
      emotionalRegulationObservations: ensureString(globalState.assessments.behaviorInterests.domains.emotionalRegulation?.observations),
      flexibilityScore: ensureString(globalState.assessments.behaviorInterests.domains.flexibility?.value),
      flexibilityObservations: ensureString(globalState.assessments.behaviorInterests.domains.flexibility?.observations),
      
      // Milestone and Assessment Data
      Milestone_Timeline_Data: milestoneTimelineData,
      historyOfConcerns: ensureString(formData.milestoneHistory),
      assessmentLogData: Object.values(globalState.assessments.assessmentLog.entries)
        .filter(entry => entry && typeof entry === 'object')
        .map(entry => `${ensureString(entry.name)} (${ensureString(entry.date)})${entry.notes ? ': ' + ensureString(entry.notes) : ''}`)
        .join(' | '),
      
      // Status and Clinical Information
      ascStatus: ensureString(formData.ascStatus),
      adhdStatus: ensureString(formData.adhdStatus),
      clinicalObservations: ensureString(formData.clinicalObservations),
      strengthsAbilities: ensureString(formData.strengths),
      prioritySupportAreas: ensureString(formData.priorityAreas),
      supportRecommendations: ensureString(formData.recommendations),
      referrals: Object.entries(formData.referrals || {})
        .filter(([_, value]) => value)
        .map(([key]) => ensureString(key))
        .join(', '),
      additionalRemarks: ensureString(formData.remarks),
      differentialDiagnosis: ensureString(formData.differentialDiagnosis),
      milestoneImage: formData.timelineImage || '',
      combinedGraphImage: radarChartImage || ''
    }
  };
};

export const submitFormData = async (data: FormSubmissionData) => {
  const sheetyData = prepareSheetyData(data);
  
  // Log the data being sent (excluding base64 images for clarity)
  console.log('Attempting to submit form data to Sheety API...', {
    ...sheetyData,
    r3Form: {
      ...sheetyData.r3Form,
      milestoneImage: sheetyData.r3Form.milestoneImage ? '[BASE64_IMAGE]' : '',
      combinedGraphImage: sheetyData.r3Form.combinedGraphImage ? '[BASE64_IMAGE]' : ''
    }
  });

  return await submitToSheetyAPI(R3_FORM_API, sheetyData);
}; 