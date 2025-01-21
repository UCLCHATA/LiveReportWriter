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
    milestones: formData.milestones || globalState.assessments.milestones?.milestones,
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
  const milestonesToUse = globalState.assessments.milestones?.milestones || [];
  console.log('Raw milestone data:', milestonesToUse);

  const formattedMilestoneData = milestonesToUse
    .map(milestone => {
      const actualAge = milestone.actualAge || 0;
      const expectedAge = milestone.expectedAge || 0;
      const difference = actualAge - expectedAge;
      const differenceText = difference > 0 
        ? `delayed by ${difference} months`
        : difference < 0 
          ? `earlier by ${Math.abs(difference)} months`
          : 'on track';
      
      return `${milestone.title} (Achieved at ${actualAge} months, Expected at ${expectedAge} months, ${differenceText})`;
    })
    .join('; ');

  console.log('Formatted milestone data:', formattedMilestoneData);
  milestoneTimelineData = formattedMilestoneData;

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
      
      // Milestone Data
      Milestone_Timeline_Data: formattedMilestoneData || '',
      History_Of_Concerns: formData.milestoneHistory || '',
      Milestone_Image: formData.timelineImage || '',
      CombinedGraph_Image: radarChartImage || '',
      
      // Sensory Profile Scores and Observations
      Visual_Score: ensureString(globalState.assessments.sensoryProfile.domains.visual?.value),
      Visual_Observations: ensureString(globalState.assessments.sensoryProfile.domains.visual?.observations),
      Auditory_Score: ensureString(globalState.assessments.sensoryProfile.domains.auditory?.value),
      Auditory_Observations: ensureString(globalState.assessments.sensoryProfile.domains.auditory?.observations),
      Tactile_Score: ensureString(globalState.assessments.sensoryProfile.domains.tactile?.value),
      Tactile_Observations: ensureString(globalState.assessments.sensoryProfile.domains.tactile?.observations),
      Vestibular_Score: ensureString(globalState.assessments.sensoryProfile.domains.vestibular?.value),
      Vestibular_Observations: ensureString(globalState.assessments.sensoryProfile.domains.vestibular?.observations),
      Proprioceptive_Score: ensureString(globalState.assessments.sensoryProfile.domains.proprioceptive?.value),
      Proprioceptive_Observations: ensureString(globalState.assessments.sensoryProfile.domains.proprioceptive?.observations),
      Oral_Score: ensureString(globalState.assessments.sensoryProfile.domains.oral?.value),
      Oral_Observations: ensureString(globalState.assessments.sensoryProfile.domains.oral?.observations),
      
      // Social Communication Scores and Observations
      JointAttention_Score: ensureString(globalState.assessments.socialCommunication.domains.jointAttention?.value),
      JointAttention_Observations: ensureString(globalState.assessments.socialCommunication.domains.jointAttention?.observations),
      NonverbalCommunication_Score: ensureString(globalState.assessments.socialCommunication.domains.nonverbalCommunication?.value),
      NonverbalCommunication_Observations: ensureString(globalState.assessments.socialCommunication.domains.nonverbalCommunication?.observations),
      VerbalCommunication_Score: ensureString(globalState.assessments.socialCommunication.domains.verbalCommunication?.value),
      VerbalCommunication_Observations: ensureString(globalState.assessments.socialCommunication.domains.verbalCommunication?.observations),
      SocialUnderstanding_Score: ensureString(globalState.assessments.socialCommunication.domains.socialUnderstanding?.value),
      SocialUnderstanding_Observations: ensureString(globalState.assessments.socialCommunication.domains.socialUnderstanding?.observations),
      PlaySkills_Score: ensureString(globalState.assessments.socialCommunication.domains.playSkills?.value),
      PlaySkills_Observations: ensureString(globalState.assessments.socialCommunication.domains.playSkills?.observations),
      PeerInteractions_Score: ensureString(globalState.assessments.socialCommunication.domains.peerInteractions?.value),
      PeerInteractions_Observations: ensureString(globalState.assessments.socialCommunication.domains.peerInteractions?.observations),
      
      // Behavior & Interests Scores and Observations
      RepetitiveBehaviors_Score: ensureString(globalState.assessments.behaviorInterests.domains.repetitiveBehaviors?.value),
      RepetitiveBehaviors_Observations: ensureString(globalState.assessments.behaviorInterests.domains.repetitiveBehaviors?.observations),
      RoutinesRituals_Score: ensureString(globalState.assessments.behaviorInterests.domains.routinesRituals?.value),
      RoutinesRituals_Observations: ensureString(globalState.assessments.behaviorInterests.domains.routinesRituals?.observations),
      SpecialInterests_Score: ensureString(globalState.assessments.behaviorInterests.domains.specialInterests?.value),
      SpecialInterests_Observations: ensureString(globalState.assessments.behaviorInterests.domains.specialInterests?.observations),
      SensoryInterests_Score: ensureString(globalState.assessments.behaviorInterests.domains.sensoryInterests?.value),
      SensoryInterests_Observations: ensureString(globalState.assessments.behaviorInterests.domains.sensoryInterests?.observations),
      EmotionalRegulation_Score: ensureString(globalState.assessments.behaviorInterests.domains.emotionalRegulation?.value),
      EmotionalRegulation_Observations: ensureString(globalState.assessments.behaviorInterests.domains.emotionalRegulation?.observations),
      Flexibility_Score: ensureString(globalState.assessments.behaviorInterests.domains.flexibility?.value),
      Flexibility_Observations: ensureString(globalState.assessments.behaviorInterests.domains.flexibility?.observations),
      
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
      Assessment_Log_Data: assessmentLogData || 'MISSING'
    }
  };

  // Log final data structure with image info
  console.log('Final Sheety data structure:', {
    ...sheetyData,
    r3Form: {
      ...sheetyData.r3Form,
      Milestone_Image: sheetyData.r3Form.Milestone_Image ? `[BASE64_IMAGE:${sheetyData.r3Form.Milestone_Image.substring(0, 50)}...]` : 'MISSING',
      CombinedGraph_Image: sheetyData.r3Form.CombinedGraph_Image ? `[BASE64_IMAGE:${sheetyData.r3Form.CombinedGraph_Image.substring(0, 50)}...]` : 'MISSING',
      Milestone_Timeline_Data: formattedMilestoneData || 'MISSING',
      Assessment_Log_Data: assessmentLogData || 'MISSING'
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
        Milestone_Image: sheetyData.r3Form.Milestone_Image ? `[BASE64_IMAGE:${sheetyData.r3Form.Milestone_Image.length} chars]` : 'MISSING',
        CombinedGraph_Image: sheetyData.r3Form.CombinedGraph_Image ? `[BASE64_IMAGE:${sheetyData.r3Form.CombinedGraph_Image.length} chars]` : 'MISSING',
        Milestone_Timeline_Data: sheetyData.r3Form.Milestone_Timeline_Data || 'MISSING'
      }
    }
  });

  return await submitToSheetyAPI(R3_FORM_API, sheetyData);
}; 