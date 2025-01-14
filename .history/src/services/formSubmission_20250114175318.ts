import { submitToSheetyAPI } from './api';
import { R3_FORM_API } from '../config/api';

interface Milestone {
  title: string;
  description: string;
  expectedAge: number;
  actualAge?: number;
  isCustom?: boolean;
  status: string;
  category?: string;
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
  milestoneTimelineData?: string;
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
  // Debug logs for all input data
  console.log('Preparing Sheety data with:', {
    formData,
    globalState,
    hasRadarChart: !!radarChartImage,
    milestoneCount: formData.milestones?.length || 0
  });

  // Helper function to ensure string values
  const ensureString = (value: any): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return '';
  };

  // Format milestone data
  const milestoneTimelineData = formData.milestones
    ? formData.milestones
        .filter(milestone => milestone.actualAge !== undefined)
        .map(milestone => 
          `${milestone.title}|${milestone.category}|${milestone.expectedAge}|${milestone.actualAge}|${milestone.status}|${milestone.isCustom ? 'custom' : 'standard'}`
        )
        .join(' || ')
    : '';

  console.log('Formatted milestone timeline data:', milestoneTimelineData);

  // Format assessment log data
  const assessmentLogData = Object.entries(globalState.assessments.assessmentLog.entries)
    .filter(([_, entry]) => entry && typeof entry === 'object')
    .map(([_, entry]) => `${entry.name}|${entry.date}|${entry.notes}`)
    .join(' || ');

  console.log('Formatted assessment log data:', assessmentLogData);

  const sheetyData = {
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
      Assessment_Log_Data: assessmentLogData,
      
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

  // Log final data structure (excluding base64 images)
  console.log('Final Sheety data structure:', {
    ...sheetyData,
    r3Form: {
      ...sheetyData.r3Form,
      milestoneImage: sheetyData.r3Form.milestoneImage ? '[BASE64_IMAGE]' : '',
      combinedGraphImage: sheetyData.r3Form.combinedGraphImage ? '[BASE64_IMAGE]' : ''
    }
  });

  return sheetyData;
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