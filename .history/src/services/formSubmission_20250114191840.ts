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
  // Debug logs for input data
  console.log('Preparing Sheety data with:', {
    formData,
    globalState,
    hasRadarChart: !!radarChartImage,
    milestoneCount: formData.milestones?.length || 0
  });

  const ensureString = (value: any): string => {
    if (Array.isArray(value)) return value.join(', ');
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return '';
  };

  // Format milestone data
  const milestonesToUse = globalState.assessments.milestones?.milestones || [];
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

  // Format assessment log data
  const assessmentLogData = Object.entries(globalState.assessments.assessmentLog.entries)
    .filter(([_, entry]) => entry && typeof entry === 'object')
    .map(([_, entry]) => `${entry.name}|${entry.date}|${entry.notes}`)
    .join(' || ');

  // Format domain data with labels and values
  const formatDomainValue = (domain: any) => {
    const label = domain?.label || '';
    const value = domain?.value || 0;
    return `${label} (${value}/5)`;
  };

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
      Visual_Score: formatDomainValue(globalState.assessments.sensoryProfile.domains.visual),
      Visual_Observations: ensureString(globalState.assessments.sensoryProfile.domains.visual?.observations),
      Auditory_Score: formatDomainValue(globalState.assessments.sensoryProfile.domains.auditory),
      Auditory_Observations: ensureString(globalState.assessments.sensoryProfile.domains.auditory?.observations),
      Tactile_Score: formatDomainValue(globalState.assessments.sensoryProfile.domains.tactile),
      Tactile_Observations: ensureString(globalState.assessments.sensoryProfile.domains.tactile?.observations),
      Vestibular_Score: formatDomainValue(globalState.assessments.sensoryProfile.domains.vestibular),
      Vestibular_Observations: ensureString(globalState.assessments.sensoryProfile.domains.vestibular?.observations),
      Proprioceptive_Score: formatDomainValue(globalState.assessments.sensoryProfile.domains.proprioceptive),
      Proprioceptive_Observations: ensureString(globalState.assessments.sensoryProfile.domains.proprioceptive?.observations),
      Oral_Score: formatDomainValue(globalState.assessments.sensoryProfile.domains.oral),
      Oral_Observations: ensureString(globalState.assessments.sensoryProfile.domains.oral?.observations),
      
      // Social Communication Scores and Observations
      JointAttention_Score: formatDomainValue(globalState.assessments.socialCommunication.domains.jointAttention),
      JointAttention_Observations: ensureString(globalState.assessments.socialCommunication.domains.jointAttention?.observations),
      NonverbalCommunication_Score: formatDomainValue(globalState.assessments.socialCommunication.domains.nonverbalCommunication),
      NonverbalCommunication_Observations: ensureString(globalState.assessments.socialCommunication.domains.nonverbalCommunication?.observations),
      VerbalCommunication_Score: formatDomainValue(globalState.assessments.socialCommunication.domains.verbalCommunication),
      VerbalCommunication_Observations: ensureString(globalState.assessments.socialCommunication.domains.verbalCommunication?.observations),
      SocialUnderstanding_Score: formatDomainValue(globalState.assessments.socialCommunication.domains.socialUnderstanding),
      SocialUnderstanding_Observations: ensureString(globalState.assessments.socialCommunication.domains.socialUnderstanding?.observations),
      PlaySkills_Score: formatDomainValue(globalState.assessments.socialCommunication.domains.playSkills),
      PlaySkills_Observations: ensureString(globalState.assessments.socialCommunication.domains.playSkills?.observations),
      PeerInteractions_Score: formatDomainValue(globalState.assessments.socialCommunication.domains.peerInteractions),
      PeerInteractions_Observations: ensureString(globalState.assessments.socialCommunication.domains.peerInteractions?.observations),
      
      // Behavior & Interests Scores and Observations
      RepetitiveBehaviors_Score: formatDomainValue(globalState.assessments.behaviorInterests.domains.repetitiveBehaviors),
      RepetitiveBehaviors_Observations: ensureString(globalState.assessments.behaviorInterests.domains.repetitiveBehaviors?.observations),
      RoutinesRituals_Score: formatDomainValue(globalState.assessments.behaviorInterests.domains.routinesRituals),
      RoutinesRituals_Observations: ensureString(globalState.assessments.behaviorInterests.domains.routinesRituals?.observations),
      SpecialInterests_Score: formatDomainValue(globalState.assessments.behaviorInterests.domains.specialInterests),
      SpecialInterests_Observations: ensureString(globalState.assessments.behaviorInterests.domains.specialInterests?.observations),
      SensoryInterests_Score: formatDomainValue(globalState.assessments.behaviorInterests.domains.sensoryInterests),
      SensoryInterests_Observations: ensureString(globalState.assessments.behaviorInterests.domains.sensoryInterests?.observations),
      EmotionalRegulation_Score: formatDomainValue(globalState.assessments.behaviorInterests.domains.emotionalRegulation),
      EmotionalRegulation_Observations: ensureString(globalState.assessments.behaviorInterests.domains.emotionalRegulation?.observations),
      Flexibility_Score: formatDomainValue(globalState.assessments.behaviorInterests.domains.flexibility),
      Flexibility_Observations: ensureString(globalState.assessments.behaviorInterests.domains.flexibility?.observations),
      
      // Rest of the form data
      Assessment_Log_Data: assessmentLogData || '',
      // ... rest of the fields ...
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