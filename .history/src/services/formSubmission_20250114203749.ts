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
  radarChartImage?: string;
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
    if (!domain.value || domain.value === 0) return 'Skipped';
    const label = domain.label || 'Typical';
    return `${label} ${domain.value}/5`;
  };

  // Format milestone data with descriptive text
  const formatMilestoneData = (milestone: any) => {
    if (!milestone) return '';
    const actualAge = milestone.actualAge;
    const expectedAge = milestone.expectedAge || 0;
    
    // For typical milestones with no actual age set, return with expected age only
    if (milestone.status === 'typical' && !actualAge) {
      return `${milestone.title}: Expected at ${expectedAge} months (On track)`;
    }
    
    // For concerns category, handle differently as they don't have expected ages
    if (milestone.category === 'concerns') {
      return `${milestone.title}: ${milestone.status === 'typical' ? 'Not Present' : 'Present'}`;
    }
    
    // For milestones with actual age
    if (actualAge) {
      const difference = actualAge - expectedAge;
      const status = difference > 0 ? 'Delayed' : difference < 0 ? 'Advanced' : 'On track';
      return `${milestone.title}: Expected at ${expectedAge} months, Achieved at ${actualAge} months, ${status} by ${Math.abs(difference)} months`;
    }
    
    // Default case for unset milestones
    return `${milestone.title}: Expected at ${expectedAge} months (Not yet achieved)`;
  };

  // Format assessment log entries with proper descriptions
  const formatAssessmentLog = (entries: any) => {
    if (!entries) return '';
    return Object.entries(entries)
      .filter(([_, entry]) => entry && typeof entry === 'object')
      .map(([_, entry]: [string, any]) => {
        const { name, date, notes } = entry;
        return `${name} (${date}): ${ensureString(notes, 1000)}`;
      })
      .join('\n');
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
    .map(formatMilestoneData)
    .filter(Boolean)
    .join('\n');

  // Format assessment log data
  const assessmentLogData = formatAssessmentLog(globalState.assessments.assessmentLog.entries);

  const sheetyData = {
    r3form: {
      // Images and Timeline Data
      milestoneImage: formData.timelineImage || '',
      combinedGraphImage: radarChartImage || '',
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
      visualObservations: ensureString(globalState.assessments.sensoryProfile.domains.visual?.observations),
      auditoryScore: formatDomainValue(globalState.assessments.sensoryProfile.domains.auditory),
      auditoryObservations: ensureString(globalState.assessments.sensoryProfile.domains.auditory?.observations),
      tactileScore: formatDomainValue(globalState.assessments.sensoryProfile.domains.tactile),
      tactileObservations: ensureString(globalState.assessments.sensoryProfile.domains.tactile?.observations),
      vestibularScore: formatDomainValue(globalState.assessments.sensoryProfile.domains.vestibular),
      vestibularObservations: ensureString(globalState.assessments.sensoryProfile.domains.vestibular?.observations),
      proprioceptiveScore: formatDomainValue(globalState.assessments.sensoryProfile.domains.proprioceptive),
      proprioceptiveObservations: ensureString(globalState.assessments.sensoryProfile.domains.proprioceptive?.observations),
      oralScore: formatDomainValue(globalState.assessments.sensoryProfile.domains.oral),
      oralObservations: ensureString(globalState.assessments.sensoryProfile.domains.oral?.observations),
      
      // Social Communication Scores and Observations
      jointAttentionScore: formatDomainValue(globalState.assessments.socialCommunication.domains.jointAttention),
      jointAttentionObservations: ensureString(globalState.assessments.socialCommunication.domains.jointAttention?.observations),
      nonverbalCommunicationScore: formatDomainValue(globalState.assessments.socialCommunication.domains.nonverbalCommunication),
      nonverbalCommunicationObservations: ensureString(globalState.assessments.socialCommunication.domains.nonverbalCommunication?.observations),
      verbalCommunicationScore: formatDomainValue(globalState.assessments.socialCommunication.domains.verbalCommunication),
      verbalCommunicationObservations: ensureString(globalState.assessments.socialCommunication.domains.verbalCommunication?.observations),
      socialUnderstandingScore: formatDomainValue(globalState.assessments.socialCommunication.domains.socialUnderstanding),
      socialUnderstandingObservations: ensureString(globalState.assessments.socialCommunication.domains.socialUnderstanding?.observations),
      playSkillsScore: formatDomainValue(globalState.assessments.socialCommunication.domains.playSkills),
      playSkillsObservations: ensureString(globalState.assessments.socialCommunication.domains.playSkills?.observations),
      peerInteractionsScore: formatDomainValue(globalState.assessments.socialCommunication.domains.peerInteractions),
      peerInteractionsObservations: ensureString(globalState.assessments.socialCommunication.domains.peerInteractions?.observations),

      // Behavior & Interests Scores and Observations
      repetitiveBehaviorsScore: formatDomainValue(globalState.assessments.behaviorInterests.domains.repetitiveBehaviors),
      repetitiveBehaviorsObservations: ensureString(globalState.assessments.behaviorInterests.domains.repetitiveBehaviors?.observations),
      routinesRitualsScore: formatDomainValue(globalState.assessments.behaviorInterests.domains.routinesRituals),
      routinesRitualsObservations: ensureString(globalState.assessments.behaviorInterests.domains.routinesRituals?.observations),
      specialInterestsScore: formatDomainValue(globalState.assessments.behaviorInterests.domains.specialInterests),
      specialInterestsObservations: ensureString(globalState.assessments.behaviorInterests.domains.specialInterests?.observations),
      sensoryInterestsScore: formatDomainValue(globalState.assessments.behaviorInterests.domains.sensoryInterests),
      sensoryInterestsObservations: ensureString(globalState.assessments.behaviorInterests.domains.sensoryInterests?.observations),
      emotionalRegulationScore: formatDomainValue(globalState.assessments.behaviorInterests.domains.emotionalRegulation),
      emotionalRegulationObservations: ensureString(globalState.assessments.behaviorInterests.domains.emotionalRegulation?.observations),
      flexibilityScore: formatDomainValue(globalState.assessments.behaviorInterests.domains.flexibility),
      flexibilityObservations: ensureString(globalState.assessments.behaviorInterests.domains.flexibility?.observations)
    }
  };

  // Log final data structure with image info
  console.log('Final Sheety data structure:', {
    ...sheetyData,
    r3form: {
      ...sheetyData.r3form,
      // Sample of domain data
      visualScore: sheetyData.r3form.visualScore,
      visualObservations: sheetyData.r3form.visualObservations,
      auditoryScore: sheetyData.r3form.auditoryScore,
      auditoryObservations: sheetyData.r3form.auditoryObservations,
      // Sample of social data
      jointAttentionScore: sheetyData.r3form.jointAttentionScore,
      jointAttentionObservations: sheetyData.r3form.jointAttentionObservations,
      // Images and milestone data
      milestoneImage: sheetyData.r3form.milestoneImage ? `[BASE64_IMAGE:${sheetyData.r3form.milestoneImage.substring(0, 50)}...]` : 'MISSING',
      combinedGraphImage: sheetyData.r3form.combinedGraphImage ? `[BASE64_IMAGE:${sheetyData.r3form.combinedGraphImage.substring(0, 50)}...]` : 'MISSING',
      milestoneTimelineData: sheetyData.r3form.milestoneTimelineData || 'MISSING',
      assessmentLogData: sheetyData.r3form.assessmentLogData || 'MISSING'
    }
  });

  return sheetyData;
};

export const submitFormData = async (data: FormSubmissionData) => {
  try {
    console.log('Starting form submission process...');

    // Debug logs for milestone data
    console.log('Checking for milestone data:', {
      hasMilestones: data.formData.milestones && data.formData.milestones.length > 0,
      milestoneCount: data.formData.milestones?.length || 0,
      hasTimelineImage: Boolean(data.formData.timelineImage),
      hasRadarChart: Boolean(data.radarChartImage)
    });

    // Debug logs for assessment data
    console.log('Checking for assessment data:', {
      sensoryProfile: {
        visual: data.globalState.assessments.sensoryProfile.domains.visual,
        auditory: data.globalState.assessments.sensoryProfile.domains.auditory
      },
      socialCommunication: {
        jointAttention: data.globalState.assessments.socialCommunication.domains.jointAttention
      }
    });

    // Debug logs for image data
    console.log('Checking for image data:', {
      milestone_image: data.formData.timelineImage ? 'PRESENT' : 'MISSING',
      radar_chart: data.radarChartImage ? 'PRESENT' : 'MISSING'
    });

    // Prepare the data in Sheety format
    const sheetyData = prepareSheetyData(data);

    // Submit to Sheety API
    console.log('Submitting to Sheety API...');
    const response = await submitToSheetyAPI(R3_FORM_API, sheetyData);
    console.log('Successfully submitted to Sheety API:', response);

    return response;
  } catch (error) {
    console.error('Form submission error:', error);
    throw error;
  }
}; 