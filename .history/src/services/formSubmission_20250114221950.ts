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
  if (!milestones || milestones.length === 0) return '';
  
  const formattedMilestones = milestones.map(milestone => {
    const actualAge = milestone.actualAge;
    const expectedAge = milestone.expectedAge || 0;
    
    if (milestone.category === 'concerns') {
      return `${milestone.title} (${milestone.category}): ${milestone.status === 'typical' ? 'Not Present' : 'Present'}`;
    }
    
    if (actualAge !== undefined && actualAge !== null) {
      const difference = actualAge - expectedAge;
      const status = difference > 0 ? 'Delayed' : difference < 0 ? 'Advanced' : 'On track';
      return `${milestone.title} (${milestone.category}): Expected ${expectedAge}m, Achieved ${actualAge}m, ${status} by ${Math.abs(difference)}m`;
    }
    
    return `${milestone.title} (${milestone.category}): Expected ${expectedAge}m (Not achieved)`;
  });

  // Group by category
  const byCategory = formattedMilestones.reduce((acc: Record<string, string[]>, milestone) => {
    const category = milestone.split('(')[1].split(')')[0];
    if (!acc[category]) acc[category] = [];
    acc[category].push(milestone);
    return acc;
  }, {});

  // Format with category headers
  return Object.entries(byCategory)
    .map(([category, items]) => `=== ${category.toUpperCase()} ===\n${items.join('\n')}`)
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

export const submitFormData = async (data: FormSubmissionData) => {
  console.log('Submitting form data...');
  
  // Debug logs
  console.log('Raw milestone data:', data.globalState.assessments.milestones.milestones);
  console.log('Raw assessment log:', data.globalState.assessments.assessmentLog.entries);
  
  // Log milestone data
  console.log('Milestone data:', {
    milestoneCount: data.globalState.assessments.milestones.milestones?.length || 0,
    hasImage: !!data.milestoneImage,
    imageIncluded: data.includeMilestoneImage
  });

  // Log assessment data
  console.log('Assessment data:', {
    assessmentCount: Object.keys(data.globalState.assessments.assessmentLog.entries || {}).length || 0,
    hasRadarChart: !!data.combinedGraphImage,
    chartIncluded: data.includeRadarChart
  });

  // Debug log for data being sent
  console.log('Data being prepared for submission:', {
    clinicianData: data.globalState.clinician,
    sensoryProfile: data.globalState.assessments.sensoryProfile,
    socialComm: data.globalState.assessments.socialCommunication,
    behaviorInterests: data.globalState.assessments.behaviorInterests,
    milestones: data.globalState.assessments.milestones,
    assessmentLog: data.globalState.assessments.assessmentLog,
    formData: data.globalState.formData
  });

  // Collect all component data with exact column header matches
  const formattedData: Record<string, any> = {
    // Metadata
    Timestamp: new Date().toISOString(),
    
    // Clinician Data
    CHATA_ID: data.globalState.clinician?.chataId || '',
    Clinic_Name: data.globalState.clinician?.clinicName || '',
    Clinician_Name: data.globalState.clinician?.name || '',
    Clinician_Email: data.globalState.clinician?.email || '',
    Child_FirstName: data.globalState.clinician?.childFirstName || '',
    Child_SecondName: data.globalState.clinician?.childSecondName || '',
    Child_Age: data.globalState.clinician?.childAge || '',
    Child_Gender: data.globalState.clinician?.childGender || '',

    // Sensory Profile Data
    Visual_Score: formatDomainValue(data.globalState.assessments.sensoryProfile.domains.visual),
    Visual_Observations: data.globalState.assessments.sensoryProfile.domains.visual?.observations || '',
    Auditory_Score: formatDomainValue(data.globalState.assessments.sensoryProfile.domains.auditory),
    Auditory_Observations: data.globalState.assessments.sensoryProfile.domains.auditory?.observations || '',
    Tactile_Score: formatDomainValue(data.globalState.assessments.sensoryProfile.domains.tactile),
    Tactile_Observations: data.globalState.assessments.sensoryProfile.domains.tactile?.observations || '',
    Vestibular_Score: formatDomainValue(data.globalState.assessments.sensoryProfile.domains.vestibular),
    Vestibular_Observations: data.globalState.assessments.sensoryProfile.domains.vestibular?.observations || '',
    Proprioceptive_Score: formatDomainValue(data.globalState.assessments.sensoryProfile.domains.proprioceptive),
    Proprioceptive_Observations: data.globalState.assessments.sensoryProfile.domains.proprioceptive?.observations || '',
    Oral_Score: formatDomainValue(data.globalState.assessments.sensoryProfile.domains.oral),
    Oral_Observations: data.globalState.assessments.sensoryProfile.domains.oral?.observations || '',

    // Social Communication Data
    JointAttention_Score: formatDomainValue(data.globalState.assessments.socialCommunication.domains.jointAttention),
    JointAttention_Observations: data.globalState.assessments.socialCommunication.domains.jointAttention?.observations || '',
    NonverbalCommunication_Score: formatDomainValue(data.globalState.assessments.socialCommunication.domains.nonverbalCommunication),
    NonverbalCommunication_Observations: data.globalState.assessments.socialCommunication.domains.nonverbalCommunication?.observations || '',
    VerbalCommunication_Score: formatDomainValue(data.globalState.assessments.socialCommunication.domains.verbalCommunication),
    VerbalCommunication_Observations: data.globalState.assessments.socialCommunication.domains.verbalCommunication?.observations || '',
    SocialUnderstanding_Score: formatDomainValue(data.globalState.assessments.socialCommunication.domains.socialUnderstanding),
    SocialUnderstanding_Observations: data.globalState.assessments.socialCommunication.domains.socialUnderstanding?.observations || '',
    PlaySkills_Score: formatDomainValue(data.globalState.assessments.socialCommunication.domains.playSkills),
    PlaySkills_Observations: data.globalState.assessments.socialCommunication.domains.playSkills?.observations || '',
    PeerInteractions_Score: formatDomainValue(data.globalState.assessments.socialCommunication.domains.peerInteractions),
    PeerInteractions_Observations: data.globalState.assessments.socialCommunication.domains.peerInteractions?.observations || '',

    // Behavior & Interests Data
    RepetitiveBehaviors_Score: formatDomainValue(data.globalState.assessments.behaviorInterests.domains.repetitiveBehaviors),
    RepetitiveBehaviors_Observations: data.globalState.assessments.behaviorInterests.domains.repetitiveBehaviors?.observations || '',
    RoutinesRituals_Score: formatDomainValue(data.globalState.assessments.behaviorInterests.domains.routinesRituals),
    RoutinesRituals_Observations: data.globalState.assessments.behaviorInterests.domains.routinesRituals?.observations || '',
    SpecialInterests_Score: formatDomainValue(data.globalState.assessments.behaviorInterests.domains.specialInterests),
    SpecialInterests_Observations: data.globalState.assessments.behaviorInterests.domains.specialInterests?.observations || '',
    SensoryInterests_Score: formatDomainValue(data.globalState.assessments.behaviorInterests.domains.sensoryInterests),
    SensoryInterests_Observations: data.globalState.assessments.behaviorInterests.domains.sensoryInterests?.observations || '',
    EmotionalRegulation_Score: formatDomainValue(data.globalState.assessments.behaviorInterests.domains.emotionalRegulation),
    EmotionalRegulation_Observations: data.globalState.assessments.behaviorInterests.domains.emotionalRegulation?.observations || '',
    Flexibility_Score: formatDomainValue(data.globalState.assessments.behaviorInterests.domains.flexibility),
    Flexibility_Observations: data.globalState.assessments.behaviorInterests.domains.flexibility?.observations || '',

    // Milestone Data
    Milestone_Timeline_Data: formatMilestoneData(data.globalState.assessments.milestones.milestones),
    History_Of_Concerns: data.globalState.assessments.milestones.history || '',
    Milestone_Image: data.milestoneImage || '',

    // Assessment Log Data
    Assessment_Log_Data: formatAssessmentLog(data.globalState.assessments.assessmentLog.entries),

    // Form Data
    ASC_Status: data.globalState.formData.ascStatus || '',
    ADHD_Status: data.globalState.formData.adhdStatus || '',
    Clinical_Observations: data.globalState.formData.clinicalObservations || '',
    Strengths_Abilities: data.globalState.formData.strengths || '',
    Priority_Support_Areas: data.globalState.formData.priorityAreas || '',
    Support_Recommendations: data.globalState.formData.recommendations || '',
    Referrals: Object.entries(data.globalState.formData.referrals || {})
      .filter(([_, value]) => value)
      .map(([key]) => key)
      .join(', ') || '',
    Additional_Remarks: data.globalState.formData.remarks || '',
    Differential_Diagnosis: data.globalState.formData.differentialDiagnosis || '',

    // Combined Graph
    CombinedGraph_Image: data.combinedGraphImage || ''
  };

  // Prepare the payload with the required r3Form root property
  const payload = {
    r3Form: formattedData
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