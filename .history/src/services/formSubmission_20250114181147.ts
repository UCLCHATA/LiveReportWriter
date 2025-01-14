import { submitToSheetyAPI } from './api';
import { R3_FORM_API } from '../config/api';
import { GlobalFormState, Milestone } from '../types';

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

interface FormSubmissionData {
  formData: FormData;
  globalState: GlobalFormState;
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

  // Add detailed milestone data logging
  console.log('Raw milestone data:', {
    milestones: formData.milestones || globalState.assessments.milestones?.currentMilestones,
    timelineImage: formData.timelineImage ? 'Present' : 'Missing',
    timelineImageLength: formData.timelineImage?.length || 0
  });

  // Helper function to ensure string values
  const ensureString = (value: any): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return '';
  };

  // Format milestone data with detailed logging
  let milestoneTimelineData = '';
  const milestonesToUse = formData.milestones || globalState.assessments.milestones?.currentMilestones || [];
  
  if (milestonesToUse && milestonesToUse.length > 0) {
    console.log('Processing milestones:', milestonesToUse);
    milestoneTimelineData = milestonesToUse
      .filter(milestone => {
        const hasActualAge = milestone.actualAge !== undefined;
        console.log(`Milestone ${milestone.title}: actualAge=${milestone.actualAge}, included=${hasActualAge}`);
        return hasActualAge;
      })
      .map(milestone => {
        const difference = milestone.actualAge !== undefined ? milestone.actualAge - milestone.expectedAge : 0;
        const formatted = `${milestone.title}|${milestone.category}|${milestone.expectedAge}|${milestone.actualAge}|${milestone.status}|${difference > 0 ? `Delayed by ${difference}m` : difference < 0 ? `Advanced by ${Math.abs(difference)}m` : 'On Track'}|${milestone.id.startsWith('custom-concern-') ? 'custom' : 'standard'}`;
        console.log(`Formatted milestone: ${formatted}`);
        return formatted;
      })
      .join(' || ');
  } else {
    console.log('No milestones found in formData or globalState');
  }

  console.log('Final milestone timeline data:', milestoneTimelineData);

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
      jointAttentionScore: ensureString(globalState.assessments.socialCommunication.domains.jointAttention?.value),
      jointAttentionObservations: ensureString(globalState.assessments.socialCommunication.domains.jointAttention?.observations),
      nonverbalCommunicationScore: ensureString(globalState.assessments.socialCommunication.domains.nonverbalCommunication?.value),
      nonverbalCommunicationObservations: ensureString(globalState.assessments.socialCommunication.domains.nonverbalCommunication?.observations),
      verbalCommunicationScore: ensureString(globalState.assessments.socialCommunication.domains.verbalCommunication?.value),
      verbalCommunicationObservations: ensureString(globalState.assessments.socialCommunication.domains.verbalCommunication?.observations),
      socialUnderstandingScore: ensureString(globalState.assessments.socialCommunication.domains.socialUnderstanding?.value),
      socialUnderstandingObservations: ensureString(globalState.assessments.socialCommunication.domains.socialUnderstanding?.observations),
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
      historyOfConcerns: ensureString(formData.milestoneHistory || globalState.assessments.milestones?.history),
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

  // Log final data structure with image info
  console.log('Final Sheety data structure:', {
    ...sheetyData,
    r3Form: {
      ...sheetyData.r3Form,
      milestoneImage: sheetyData.r3Form.milestoneImage ? `[BASE64_IMAGE:${sheetyData.r3Form.milestoneImage.substring(0, 50)}...]` : 'MISSING',
      combinedGraphImage: sheetyData.r3Form.combinedGraphImage ? `[BASE64_IMAGE:${sheetyData.r3Form.combinedGraphImage.substring(0, 50)}...]` : 'MISSING',
      Milestone_Timeline_Data: milestoneTimelineData || 'MISSING'
    }
  });

  return sheetyData;
};

export const submitFormData = async (data: FormSubmissionData) => {
  console.log('submitFormData called with:', {
    hasMilestones: !!data.formData.milestones,
    milestoneCount: data.formData.milestones?.length || 0,
    hasTimelineImage: !!data.formData.timelineImage,
    hasRadarChart: !!data.radarChartImage
  });

  const sheetyData = prepareSheetyData(data);
  
  // Log the data being sent with more detail
  console.log('Submitting to Sheety API:', {
    endpoint: R3_FORM_API,
    dataStructure: {
      ...sheetyData,
      r3Form: {
        ...sheetyData.r3Form,
        milestoneImage: sheetyData.r3Form.milestoneImage ? `[BASE64_IMAGE:${sheetyData.r3Form.milestoneImage.length} chars]` : 'MISSING',
        combinedGraphImage: sheetyData.r3Form.combinedGraphImage ? `[BASE64_IMAGE:${sheetyData.r3Form.combinedGraphImage.length} chars]` : 'MISSING',
        Milestone_Timeline_Data: sheetyData.r3Form.Milestone_Timeline_Data || 'MISSING'
      }
    }
  });

  return await submitToSheetyAPI(R3_FORM_API, sheetyData);
}; 