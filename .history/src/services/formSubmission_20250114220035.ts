import { submitToSheetyAPI } from '../utils/api';
import { GlobalFormState, Milestone } from '../types';
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

export const submitFormData = async (data: FormSubmissionData) => {
  console.log('Submitting form data...');
  
  // Log milestone data
  console.log('Milestone data:', {
    milestoneCount: data.milestones?.length || 0,
    hasImage: !!data.milestoneImage,
    imageIncluded: data.includeMilestoneImage
  });

  // Log assessment data
  console.log('Assessment data:', {
    assessmentCount: data.assessments?.length || 0,
    hasRadarChart: !!data.combinedGraphImage,
    chartIncluded: data.includeRadarChart
  });

  // Format data for Sheety API
  const formattedData: Record<string, any> = {
    milestoneImage: data.includeMilestoneImage && data.milestoneImage ? data.milestoneImage : '',
    combinedGraphImage: data.includeRadarChart && data.combinedGraphImage ? data.combinedGraphImage : '',
    chataId: data.globalState.chataId || '',
    timestamp: new Date().toISOString(),
  };

  // Convert all keys to camelCase
  const camelCaseData = Object.entries(formattedData).reduce((acc, [key, value]) => ({
    ...acc,
    [toCamelCase(key)]: value === null || value === undefined ? '' : value
  }), {});

  // Prepare the payload with the required r3Form root property
  const payload = {
    r3form: camelCaseData
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