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

  const ensureString = (value: any, maxLength = 40000): string => {
    if (!value) return '';
    if (Array.isArray(value)) {
      const filtered = value.filter(v => v);
      return filtered.join(', ').substring(0, maxLength);
    }
    if (typeof value === 'string') return value.substring(0, maxLength);
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return '';
  };

  // Format domain data with labels and values
  const formatDomainValue = (domain: any): string => {
    if (!domain) return '';
    const label = domain.label || 'Typical';
    const value = typeof domain.value === 'number' ? domain.value : 0;
    return `${label} ${value}/5`;
  };

  // Debug sensory profile data
  console.log('Sensory Profile Data:', {
    visual: globalState.assessments.sensoryProfile.domains.visual,
    auditory: globalState.assessments.sensoryProfile.domains.auditory,
    visualScore: formatDomainValue(globalState.assessments.sensoryProfile.domains.visual),
    visualObs: ensureString(globalState.assessments.sensoryProfile.domains.visual?.observations)
  });

  // Debug social communication data
  console.log('Social Communication Data:', {
    jointAttention: globalState.assessments.socialCommunication.domains.jointAttention,
    score: formatDomainValue(globalState.assessments.socialCommunication.domains.jointAttention)
  });

  // Format milestone data
  const milestonesToUse = globalState.assessments.milestones?.milestones || [];
  console.log('Formatting milestones:', milestonesToUse);

  const formattedMilestoneData = milestonesToUse
    .map(milestone => {
      const actualAge = milestone.actualAge || 0;
      const expectedAge = milestone.expectedAge || 0;
      const difference = actualAge - expectedAge;
      const status = difference > 0 ? 'delayed' : difference < 0 ? 'early' : 'on-track';
      return `${milestone.title}|${actualAge}|${expectedAge}|${status}`;
    })
    .join('||');

  // Format assessment log data
  const assessmentLogData = Object.entries(globalState.assessments.assessmentLog.entries)
    .filter(([_, entry]) => entry && typeof entry === 'object')
    .map(([_, entry]) => `${entry.name}|${entry.date}|${ensureString(entry.notes, 1000)}`)
    .join('||');

  const sheetyData = {
    r3Form: {
      // Images and Timeline Data
      milestone_image: formData.timelineImage || '',
      combinedgraph_image: formData.radarChartImage || '',
      milestone_timeline_data: formattedMilestoneData || '',
      assessment_log_data: assessmentLogData || '',
      history_of_concerns: formData.milestoneHistory || '',
      
      // Basic Info
      timestamp: new Date().toISOString(),
      chata_id: globalState.clinician?.chataId || '',
      clinic_name: globalState.clinician?.clinicName || '',
      clinician_name: globalState.clinician?.name || '',
      clinician_email: globalState.clinician?.email || '',
      child_first_name: globalState.clinician?.childFirstName || '',
      child_second_name: globalState.clinician?.childSecondName || '',
      child_age: globalState.clinician?.childAge || '',
      child_gender: globalState.clinician?.childGender || '',
      
      // Form Status
      asc_status: formData.ascStatus || '',
      adhd_status: formData.adhdStatus || '',
      clinical_observations: formData.clinicalObservations || '',
      strengths: formData.strengths || '',
      priority_support_areas: formData.priorityAreas || '',
      support_recommendations: formData.recommendations || '',
      remarks: formData.remarks || '',
      differential_diagnosis: formData.differentialDiagnosis || '',

      // Sensory Profile Scores and Observations
      visual_score: formatDomainValue(globalState.assessments.sensoryProfile.domains.visual),
      visual_observations: ensureString(globalState.assessments.sensoryProfile.domains.visual.observations),
      auditory_score: formatDomainValue(globalState.assessments.sensoryProfile.domains.auditory),
      auditory_observations: ensureString(globalState.assessments.sensoryProfile.domains.auditory.observations),
      tactile_score: formatDomainValue(globalState.assessments.sensoryProfile.domains.tactile),
      tactile_observations: ensureString(globalState.assessments.sensoryProfile.domains.tactile.observations),
      vestibular_score: formatDomainValue(globalState.assessments.sensoryProfile.domains.vestibular),
      vestibular_observations: ensureString(globalState.assessments.sensoryProfile.domains.vestibular.observations),
      proprioceptive_score: formatDomainValue(globalState.assessments.sensoryProfile.domains.proprioceptive),
      proprioceptive_observations: ensureString(globalState.assessments.sensoryProfile.domains.proprioceptive.observations),
      oral_score: formatDomainValue(globalState.assessments.sensoryProfile.domains.oral),
      oral_observations: ensureString(globalState.assessments.sensoryProfile.domains.oral.observations),
      
      // Social Communication Scores and Observations
      joint_attention_score: formatDomainValue(globalState.assessments.socialCommunication.domains.jointAttention),
      joint_attention_observations: ensureString(globalState.assessments.socialCommunication.domains.jointAttention.observations),
      nonverbal_communication_score: formatDomainValue(globalState.assessments.socialCommunication.domains.nonverbalCommunication),
      nonverbal_communication_observations: ensureString(globalState.assessments.socialCommunication.domains.nonverbalCommunication.observations),
      verbal_communication_score: formatDomainValue(globalState.assessments.socialCommunication.domains.verbalCommunication),
      verbal_communication_observations: ensureString(globalState.assessments.socialCommunication.domains.verbalCommunication.observations),
      social_understanding_score: formatDomainValue(globalState.assessments.socialCommunication.domains.socialUnderstanding),
      social_understanding_observations: ensureString(globalState.assessments.socialCommunication.domains.socialUnderstanding.observations),
      play_skills_score: formatDomainValue(globalState.assessments.socialCommunication.domains.playSkills),
      play_skills_observations: ensureString(globalState.assessments.socialCommunication.domains.playSkills.observations),
      peer_interactions_score: formatDomainValue(globalState.assessments.socialCommunication.domains.peerInteractions),
      peer_interactions_observations: ensureString(globalState.assessments.socialCommunication.domains.peerInteractions.observations),
      
      // Behavior & Interests Scores and Observations
      repetitive_behaviors_score: formatDomainValue(globalState.assessments.behaviorInterests.domains.repetitiveBehaviors),
      repetitive_behaviors_observations: ensureString(globalState.assessments.behaviorInterests.domains.repetitiveBehaviors.observations),
      routines_rituals_score: formatDomainValue(globalState.assessments.behaviorInterests.domains.routinesRituals),
      routines_rituals_observations: ensureString(globalState.assessments.behaviorInterests.domains.routinesRituals.observations),
      special_interests_score: formatDomainValue(globalState.assessments.behaviorInterests.domains.specialInterests),
      special_interests_observations: ensureString(globalState.assessments.behaviorInterests.domains.specialInterests.observations),
      sensory_interests_score: formatDomainValue(globalState.assessments.behaviorInterests.domains.sensoryInterests),
      sensory_interests_observations: ensureString(globalState.assessments.behaviorInterests.domains.sensoryInterests.observations),
      emotional_regulation_score: formatDomainValue(globalState.assessments.behaviorInterests.domains.emotionalRegulation),
      emotional_regulation_observations: ensureString(globalState.assessments.behaviorInterests.domains.emotionalRegulation.observations),
      flexibility_score: formatDomainValue(globalState.assessments.behaviorInterests.domains.flexibility),
      flexibility_observations: ensureString(globalState.assessments.behaviorInterests.domains.flexibility.observations)
    }
  };

  // Log final data structure with image info
  console.log('Final Sheety data structure:', {
    ...sheetyData,
    r3Form: {
      ...sheetyData.r3Form,
      // Sample of domain data
      Visual_Score: sheetyData.r3Form.Visual_Score,
      Visual_Observations: sheetyData.r3Form.Visual_Observations,
      Auditory_Score: sheetyData.r3Form.Auditory_Score,
      Auditory_Observations: sheetyData.r3Form.Auditory_Observations,
      // Sample of social data
      JointAttention_Score: sheetyData.r3Form.JointAttention_Score,
      JointAttention_Observations: sheetyData.r3Form.JointAttention_Observations,
      // Images and milestone data
      Milestone_Image: sheetyData.r3Form.Milestone_Image ? `[BASE64_IMAGE:${sheetyData.r3Form.Milestone_Image.substring(0, 50)}...]` : 'MISSING',
      CombinedGraph_Image: sheetyData.r3Form.CombinedGraph_Image ? `[BASE64_IMAGE:${sheetyData.r3Form.CombinedGraph_Image.substring(0, 50)}...]` : 'MISSING',
      Milestone_Timeline_Data: sheetyData.r3Form.Milestone_Timeline_Data || 'MISSING',
      Assessment_Log_Data: sheetyData.r3Form.Assessment_Log_Data || 'MISSING'
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