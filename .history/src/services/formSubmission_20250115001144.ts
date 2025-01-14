import { submitToSheetyAPI } from '../utils/api';
import { GlobalFormState, Milestone, AssessmentDomainBase } from '../types';
import { R3_FORM_API } from '../config/api';
import html2canvas from 'html2canvas';

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

const formatObservations = (observations: any): string => {
  if (!observations) return '';
  if (Array.isArray(observations)) return observations.join(', ');
  return String(observations);
};

const ensureString = (value: any): string => {
  if (value === null || value === undefined) {
    return '';
  }
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  return String(value);
};

const formatMilestoneData = (milestones: Milestone[] = []): string => {
  if (!milestones || milestones.length === 0) return '';
  
  // Group by category first
  const byCategory = milestones.reduce((acc: Record<string, Milestone[]>, milestone) => {
    const category = milestone.category || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(milestone);
    return acc;
  }, {});

  // Format milestones within each category
  return Object.entries(byCategory)
    .map(([category, categoryMilestones]) => {
      const formattedMilestones = categoryMilestones.map(milestone => {
        const actualAge = milestone.actualAge;
        const expectedAge = milestone.expectedAge || 0;
        
        if (milestone.category === 'concerns') {
          return `${milestone.title}: ${milestone.status === 'typical' ? 'Not Present' : 'Present'}`;
        }
        
        let status: string;
        if (actualAge === 0) {
          status = 'Skipped';
        } else if (actualAge === undefined || actualAge === null) {
          status = 'Not yet achieved';
        } else if (actualAge === expectedAge) {
          status = 'Achieved on time';
        } else {
          const difference = actualAge - expectedAge;
          status = difference > 0 ? 
            `Delayed by ${difference} months` : 
            `Early by ${Math.abs(difference)} months`;
        }
        
        return `${milestone.title}: Expected ${expectedAge}m (${status})`;
      });

      const header = category.toUpperCase();
      return `=== ${header} ===\n${formattedMilestones.join('\n')}`;
    })
    .join('\n\n');
};

const formatAssessmentLog = (entries: Record<string, any> = {}): string => {
  if (!entries || Object.keys(entries).length === 0) return '';
  
  return Object.values(entries)
    .filter(entry => entry && typeof entry === 'object')
    .map(entry => {
      const { name, date, notes } = entry;
      if (!name || !date) return null;
      return `${name} (${date}): ${notes || 'No notes provided'}`;
    })
    .filter(Boolean)
    .join('\n');
};

// Add image capture functions
const captureRadarChart = async (): Promise<string> => {
  console.log('Capturing radar chart...');
  const chartElement = document.querySelector('.recharts-wrapper');
  if (!chartElement) {
    console.error('Radar chart element not found');
    return '';
  }

  try {
    const canvas = await html2canvas(chartElement as HTMLElement, {
      scale: 2,
      logging: true,
      allowTaint: true,
      useCORS: true,
      backgroundColor: '#ffffff'
    });
    const imageData = canvas.toDataURL('image/png');
    console.log('Radar chart captured successfully, length:', imageData.length);
    return imageData;
  } catch (error) {
    console.error('Error capturing radar chart:', error);
    return '';
  }
};

const captureTimelineImage = async (): Promise<string> => {
  console.log('Capturing timeline image...');
  const timelineElement = document.querySelector('.timelineWrapper');
  if (!timelineElement) {
    console.error('Timeline element not found');
    return '';
  }

  try {
    const canvas = await html2canvas(timelineElement as HTMLElement, {
      scale: 2,
      logging: true,
      allowTaint: true,
      useCORS: true,
      backgroundColor: '#ffffff'
    });
    const imageData = canvas.toDataURL('image/png');
    console.log('Timeline image captured successfully, length:', imageData.length);
    return imageData;
  } catch (error) {
    console.error('Error capturing timeline:', error);
    return '';
  }
};

export const submitFormData = async (data: FormSubmissionData) => {
  console.log('Submitting form data...', data);
  
  // Get the include flags from the state
  const shouldIncludeTimeline = data.globalState.assessments.milestones?.includeTimelineInReport;
  const shouldIncludeRadar = data.globalState.assessments.summary?.includeInReport;
  
  console.log('Include flags:', {
    includeTimeline: shouldIncludeTimeline,
    includeRadar: shouldIncludeRadar
  });

  // Get existing images from state
  let timelineImage = data.globalState.assessments.milestones?.timelineImage || '';
  let radarChartImage = data.globalState.assessments.summary?.radarChartImage || '';

  // Capture images if they should be included but don't exist
  if (shouldIncludeTimeline && !timelineImage) {
    console.log('Capturing timeline image...');
    timelineImage = await captureTimelineImage();
  }

  if (shouldIncludeRadar && !radarChartImage) {
    console.log('Capturing radar chart image...');
    radarChartImage = await captureRadarChart();
  }

  // Debug logs for raw data
  console.log('Raw milestone data:', data.globalState.assessments.milestones.milestones);
  console.log('Raw assessment log:', data.globalState.assessments.assessmentLog.entries);
  
  // Log milestone data
  console.log('Milestone data:', {
    milestoneCount: data.globalState.assessments.milestones.milestones?.length || 0,
    hasImage: !!timelineImage,
    imageIncluded: shouldIncludeTimeline,
    imageLength: timelineImage?.length || 0
  });

  // Log assessment data
  console.log('Assessment data:', {
    assessmentCount: Object.keys(data.globalState.assessments.assessmentLog.entries || {}).length || 0,
    hasRadarChart: !!radarChartImage,
    chartIncluded: shouldIncludeRadar,
    chartLength: radarChartImage?.length || 0
  });

  // Format milestone data
  const milestoneTimelineData = formatMilestoneData(data.globalState.assessments.milestones.milestones);
  console.log('Formatted milestone data:', milestoneTimelineData);

  // Collect all component data
  const rawData = {
    // Metadata
    timestamp: new Date().toISOString(),
    
    // Clinician Data
    chataId: data.globalState.clinician?.chataId,
    clinicName: data.globalState.clinician?.clinicName,
    clinicianName: data.globalState.clinician?.name,
    clinicianEmail: data.globalState.clinician?.email,
    childFirstName: data.globalState.clinician?.childFirstName,
    childSecondName: data.globalState.clinician?.childSecondName,
    childAge: data.globalState.clinician?.childAge,
    childGender: data.globalState.clinician?.childGender,

    // Sensory Profile Data
    visualScore: formatDomainValue(data.globalState.assessments.sensoryProfile.domains.visual),
    visualObservations: formatObservations(data.globalState.assessments.sensoryProfile.domains.visual?.observations),
    auditoryScore: formatDomainValue(data.globalState.assessments.sensoryProfile.domains.auditory),
    auditoryObservations: formatObservations(data.globalState.assessments.sensoryProfile.domains.auditory?.observations),
    tactileScore: formatDomainValue(data.globalState.assessments.sensoryProfile.domains.tactile),
    tactileObservations: formatObservations(data.globalState.assessments.sensoryProfile.domains.tactile?.observations),
    vestibularScore: formatDomainValue(data.globalState.assessments.sensoryProfile.domains.vestibular),
    vestibularObservations: formatObservations(data.globalState.assessments.sensoryProfile.domains.vestibular?.observations),
    proprioceptiveScore: formatDomainValue(data.globalState.assessments.sensoryProfile.domains.proprioceptive),
    proprioceptiveObservations: formatObservations(data.globalState.assessments.sensoryProfile.domains.proprioceptive?.observations),
    oralScore: formatDomainValue(data.globalState.assessments.sensoryProfile.domains.oral),
    oralObservations: formatObservations(data.globalState.assessments.sensoryProfile.domains.oral?.observations),

    // Social Communication Data
    jointAttentionScore: formatDomainValue(data.globalState.assessments.socialCommunication.domains.jointAttention),
    jointAttentionObservations: formatObservations(data.globalState.assessments.socialCommunication.domains.jointAttention?.observations),
    nonverbalCommunicationScore: formatDomainValue(data.globalState.assessments.socialCommunication.domains.nonverbalCommunication),
    nonverbalCommunicationObservations: formatObservations(data.globalState.assessments.socialCommunication.domains.nonverbalCommunication?.observations),
    verbalCommunicationScore: formatDomainValue(data.globalState.assessments.socialCommunication.domains.verbalCommunication),
    verbalCommunicationObservations: formatObservations(data.globalState.assessments.socialCommunication.domains.verbalCommunication?.observations),
    socialUnderstandingScore: formatDomainValue(data.globalState.assessments.socialCommunication.domains.socialUnderstanding),
    socialUnderstandingObservations: formatObservations(data.globalState.assessments.socialCommunication.domains.socialUnderstanding?.observations),
    playSkillsScore: formatDomainValue(data.globalState.assessments.socialCommunication.domains.playSkills),
    playSkillsObservations: formatObservations(data.globalState.assessments.socialCommunication.domains.playSkills?.observations),
    peerInteractionsScore: formatDomainValue(data.globalState.assessments.socialCommunication.domains.peerInteractions),
    peerInteractionsObservations: formatObservations(data.globalState.assessments.socialCommunication.domains.peerInteractions?.observations),

    // Behavior & Interests Data
    repetitiveBehaviorsScore: formatDomainValue(data.globalState.assessments.behaviorInterests.domains.repetitiveBehaviors),
    repetitiveBehaviorsObservations: formatObservations(data.globalState.assessments.behaviorInterests.domains.repetitiveBehaviors?.observations),
    routinesRitualsScore: formatDomainValue(data.globalState.assessments.behaviorInterests.domains.routinesRituals),
    routinesRitualsObservations: formatObservations(data.globalState.assessments.behaviorInterests.domains.routinesRituals?.observations),
    specialInterestsScore: formatDomainValue(data.globalState.assessments.behaviorInterests.domains.specialInterests),
    specialInterestsObservations: formatObservations(data.globalState.assessments.behaviorInterests.domains.specialInterests?.observations),
    sensoryInterestsScore: formatDomainValue(data.globalState.assessments.behaviorInterests.domains.sensoryInterests),
    sensoryInterestsObservations: formatObservations(data.globalState.assessments.behaviorInterests.domains.sensoryInterests?.observations),
    emotionalRegulationScore: formatDomainValue(data.globalState.assessments.behaviorInterests.domains.emotionalRegulation),
    emotionalRegulationObservations: formatObservations(data.globalState.assessments.behaviorInterests.domains.emotionalRegulation?.observations),
    flexibilityScore: formatDomainValue(data.globalState.assessments.behaviorInterests.domains.flexibility),
    flexibilityObservations: formatObservations(data.globalState.assessments.behaviorInterests.domains.flexibility?.observations),

    // Milestone Data
    milestoneTimelineData,
    historyOfConcerns: data.globalState.assessments.milestones.history,
    milestoneImage: shouldIncludeTimeline ? timelineImage : '',

    // Assessment Log Data
    assessmentLogData: formatAssessmentLog(data.globalState.assessments.assessmentLog.entries),

    // Form Data
    ascStatus: data.globalState.formData.ascStatus,
    adhdStatus: data.globalState.formData.adhdStatus,
    clinicalObservations: data.globalState.formData.clinicalObservations,
    strengthsAbilities: data.globalState.formData.strengths,
    prioritySupportAreas: data.globalState.formData.priorityAreas,
    supportRecommendations: data.globalState.formData.recommendations,
    referrals: Object.entries(data.globalState.formData.referrals || {})
      .filter(([_, value]) => value)
      .map(([key]) => key)
      .join(', '),
    additionalRemarks: data.globalState.formData.remarks,
    differentialDiagnosis: data.globalState.formData.differentialDiagnosis,

    // Combined Graph
    combinedGraphImage: shouldIncludeRadar ? radarChartImage : ''
  };

  // Convert all values to strings
  const stringifiedData = Object.entries(rawData).reduce((acc, [key, value]) => ({
    ...acc,
    [key]: ensureString(value)
  }), {} as Record<string, string>);

  // Prepare the final payload
  const payload = {
    r3Form: stringifiedData
  };

  // Log the final image data being sent
  console.log('Final image data:', {
    milestoneImagePresent: !!payload.r3Form.milestoneImage,
    milestoneImageLength: payload.r3Form.milestoneImage.length,
    combinedGraphImagePresent: !!payload.r3Form.combinedGraphImage,
    combinedGraphImageLength: payload.r3Form.combinedGraphImage.length
  });

  // Submit the data
  try {
    console.log('Submitting form data to Sheety API:', payload);
    const response = await submitToSheetyAPI(R3_FORM_API, payload);
    console.log('Sheety API Response:', response);
    return response;
  } catch (error) {
    console.error('Error submitting form data:', error);
    throw error;
  }
}; 