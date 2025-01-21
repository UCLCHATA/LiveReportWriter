import { submitToSheetyAPI } from './api';
import { R3_FORM_API } from '../config/api';
import { GlobalFormState, Milestone } from '../types';

interface FormData {
  milestones?: Milestone[];
  milestoneHistory?: string;
  ascStatus?: string;
  adhdStatus?: string;
  clinicalObservations?: string;
  strengths?: string;
  priorityAreas?: string;
  recommendations?: string;
  referrals: Record<string, boolean>;
  remarks?: string;
  differentialDiagnosis?: string;
  timelineImage?: string;
  milestoneTimelineData?: string;
  assessmentLogData?: string;
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
    r3form: {
      // Images and Timeline Data
      milestoneImage: formData.timelineImage || '',
      combinedGraphImage: formData.radarChartImage || '',
      milestoneTimelineData: formattedMilestoneData || '',
      assessmentLogData: assessmentLogData || '',
      historyOfConcerns: formData.milestoneHistory || '',
      
      // Basic Info
      timestamp: new Date().toISOString(),
      chataId: globalState.clinician?.chataId || '',
      clinicName: globalState.clinician?.clinicName || '',
      clinicianName: globalState.clinician?.name || '',
      clinicianEmail: globalState.clinician?.email || '',
      childFirstName: globalState.clinician?.childFirstName || '',
      childSecondName: globalState.clinician?.childSecondName || '',
      childAge: globalState.clinician?.childAge || '',
      childGender: globalState.clinician?.childGender || '',
      
      // Form Status
      ascStatus: formData.ascStatus || '',
      adhdStatus: formData.adhdStatus || '',
      clinicalObservations: formData.clinicalObservations || '',
      strengths: formData.strengths || '',
      prioritySupportAreas: formData.priorityAreas || '',
      supportRecommendations: formData.recommendations || '',
      remarks: formData.remarks || '',
      differentialDiagnosis: formData.differentialDiagnosis || '',

      // Sensory Profile Scores and Observations
      visualScore: formatDomainValue(globalState.assessments.sensoryProfile.domains.visual),
      visualObservations: ensureString(globalState.assessments.sensoryProfile.domains.visual.observations),
      auditoryScore: formatDomainValue(globalState.assessments.sensoryProfile.domains.auditory),
      auditoryObservations: ensureString(globalState.assessments.sensoryProfile.domains.auditory.observations),
      tactileScore: formatDomainValue(globalState.assessments.sensoryProfile.domains.tactile),
      tactileObservations: ensureString(globalState.assessments.sensoryProfile.domains.tactile.observations),
      vestibularScore: formatDomainValue(globalState.assessments.sensoryProfile.domains.vestibular),
      vestibularObservations: ensureString(globalState.assessments.sensoryProfile.domains.vestibular.observations),
      proprioceptiveScore: formatDomainValue(globalState.assessments.sensoryProfile.domains.proprioceptive),
      proprioceptiveObservations: ensureString(globalState.assessments.sensoryProfile.domains.proprioceptive.observations),
      oralScore: formatDomainValue(globalState.assessments.sensoryProfile.domains.oral),
      oralObservations: ensureString(globalState.assessments.sensoryProfile.domains.oral.observations),
      
      // Social Communication Scores and Observations
      jointAttentionScore: formatDomainValue(globalState.assessments.socialCommunication.domains.jointAttention),
      jointAttentionObservations: ensureString(globalState.assessments.socialCommunication.domains.jointAttention.observations),
      nonverbalCommunicationScore: formatDomainValue(globalState.assessments.socialCommunication.domains.nonverbalCommunication),
      nonverbalCommunicationObservations: ensureString(globalState.assessments.socialCommunication.domains.nonverbalCommunication.observations),
      verbalCommunicationScore: formatDomainValue(globalState.assessments.socialCommunication.domains.verbalCommunication),
      verbalCommunicationObservations: ensureString(globalState.assessments.socialCommunication.domains.verbalCommunication.observations),
      socialUnderstandingScore: formatDomainValue(globalState.assessments.socialCommunication.domains.socialUnderstanding),
      socialUnderstandingObservations: ensureString(globalState.assessments.socialCommunication.domains.socialUnderstanding.observations),
      playSkillsScore: formatDomainValue(globalState.assessments.socialCommunication.domains.playSkills),
      playSkillsObservations: ensureString(globalState.assessments.socialCommunication.domains.playSkills.observations),
      peerInteractionsScore: formatDomainValue(globalState.assessments.socialCommunication.domains.peerInteractions),
      peerInteractionsObservations: ensureString(globalState.assessments.socialCommunication.domains.peerInteractions.observations),
      
      // Behavior & Interests Scores and Observations
      repetitiveBehaviorsScore: formatDomainValue(globalState.assessments.behaviorInterests.domains.repetitiveBehaviors),
      repetitiveBehaviorsObservations: ensureString(globalState.assessments.behaviorInterests.domains.repetitiveBehaviors.observations),
      routinesRitualsScore: formatDomainValue(globalState.assessments.behaviorInterests.domains.routinesRituals),
      routinesRitualsObservations: ensureString(globalState.assessments.behaviorInterests.domains.routinesRituals.observations),
      specialInterestsScore: formatDomainValue(globalState.assessments.behaviorInterests.domains.specialInterests),
      specialInterestsObservations: ensureString(globalState.assessments.behaviorInterests.domains.specialInterests.observations),
      sensoryInterestsScore: formatDomainValue(globalState.assessments.behaviorInterests.domains.sensoryInterests),
      sensoryInterestsObservations: ensureString(globalState.assessments.behaviorInterests.domains.sensoryInterests.observations),
      emotionalRegulationScore: formatDomainValue(globalState.assessments.behaviorInterests.domains.emotionalRegulation),
      emotionalRegulationObservations: ensureString(globalState.assessments.behaviorInterests.domains.emotionalRegulation.observations),
      flexibilityScore: formatDomainValue(globalState.assessments.behaviorInterests.domains.flexibility),
      flexibilityObservations: ensureString(globalState.assessments.behaviorInterests.domains.flexibility.observations)
    }
  };

  // Log final data structure with image info
  console.log('Final Sheety data structure:', {
    ...sheetyData,
    r3form: {
      ...sheetyData.r3form,
      // Sample of domain data
      Visual_Score: sheetyData.r3form.Visual_Score,
      Visual_Observations: sheetyData.r3form.Visual_Observations,
      Auditory_Score: sheetyData.r3form.Auditory_Score,
      Auditory_Observations: sheetyData.r3form.Auditory_Observations,
      // Sample of social data
      JointAttention_Score: sheetyData.r3form.JointAttention_Score,
      JointAttention_Observations: sheetyData.r3form.JointAttention_Observations,
      // Images and milestone data
      Milestone_Image: sheetyData.r3form.Milestone_Image ? `[BASE64_IMAGE:${sheetyData.r3form.Milestone_Image.substring(0, 50)}...]` : 'MISSING',
      CombinedGraph_Image: sheetyData.r3form.CombinedGraph_Image ? `[BASE64_IMAGE:${sheetyData.r3form.CombinedGraph_Image.substring(0, 50)}...]` : 'MISSING',
      Milestone_Timeline_Data: sheetyData.r3form.Milestone_Timeline_Data || 'MISSING',
      Assessment_Log_Data: sheetyData.r3form.Assessment_Log_Data || 'MISSING'
    }
  });

  return sheetyData;
};

export const submitFormData = async (data: FormSubmissionData) => {
  console.log('Checking for milestone data:', {
    hasMilestones: data.formData.milestones?.length > 0,
    milestoneCount: data.formData.milestones?.length || 0,
    hasTimelineImage: Boolean(data.formData.timelineImage),
    hasRadarChart: Boolean(data.formData.radarChartImage)
  });

  console.log('Checking for sensory profile data:', {
    visual_score: data.globalState.assessments.sensoryProfile.domains.visual,
    auditory_score: data.globalState.assessments.sensoryProfile.domains.auditory,
    joint_attention_score: data.globalState.assessments.socialCommunication.domains.jointAttention
  });

  console.log('Checking for image data:', {
    milestone_image: data.formData.timelineImage ? data.formData.timelineImage.slice(0, 50) + '...' : 'MISSING',
    combinedgraph_image: data.formData.radarChartImage ? data.formData.radarChartImage.slice(0, 50) + '...' : 'MISSING',
    milestone_timeline_data: data.formData.milestoneTimelineData ? 'PRESENT' : 'MISSING',
    assessment_log_data: data.formData.assessmentLogData ? 'PRESENT' : 'MISSING'
  });

  const sheetyData = prepareSheetyData(data);
  
  // Log the data being sent with more detail
  console.log('Submitting to Sheety API:', {
    endpoint: R3_FORM_API,
    dataStructure: {
      ...sheetyData,
      r3form: {
        ...sheetyData.r3form,
        Milestone_Image: sheetyData.r3form.Milestone_Image ? `[BASE64_IMAGE:${sheetyData.r3form.Milestone_Image.length} chars]` : 'MISSING',
        CombinedGraph_Image: sheetyData.r3form.CombinedGraph_Image ? `[BASE64_IMAGE:${sheetyData.r3form.CombinedGraph_Image.length} chars]` : 'MISSING',
        Milestone_Timeline_Data: sheetyData.r3form.Milestone_Timeline_Data || 'MISSING'
      }
    }
  });

  return await submitToSheetyAPI(R3_FORM_API, sheetyData);
}; 