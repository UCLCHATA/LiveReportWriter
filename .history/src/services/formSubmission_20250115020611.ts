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

// Image capture functions
const waitForElement = (selector: string, maxAttempts = 5, interval = 500): Promise<HTMLElement | null> => {
  return new Promise((resolve) => {
    let attempts = 0;
    
    const checkElement = () => {
      attempts++;
      const element = document.querySelector(selector);
      
      if (element) {
        console.log(`Found element with selector "${selector}" after ${attempts} attempts`);
        resolve(element as HTMLElement);
      } else if (attempts < maxAttempts) {
        console.log(`Element "${selector}" not found, attempt ${attempts}/${maxAttempts}`);
        setTimeout(checkElement, interval);
      } else {
        console.error(`Element "${selector}" not found after ${maxAttempts} attempts`);
        resolve(null);
      }
    };
    
    checkElement();
  });
};

const captureRadarChart = async (): Promise<string> => {
  console.log('Capturing radar chart...');
  
  // Try multiple selectors in case the class names vary
  const selectors = [
    '[class*="recharts-wrapper"]',
    '[class*="combined-radar-chart"]',
    '[class*="radarChart"]'
  ];
  let chartElement = null;
  let matchedSelector = '';
  
  // Add a small delay to ensure the element is rendered
  await new Promise(resolve => setTimeout(resolve, 500));
  
  for (const selector of selectors) {
    chartElement = await waitForElement(selector);
    if (chartElement) {
      console.log(`Found radar chart with selector: ${selector}`);
      matchedSelector = selector;
      break;
    }
  }
  
  if (!chartElement) {
    console.error('Radar chart element not found with any selector');
    return '';
  }

  try {
    const canvas = await html2canvas(chartElement, {
      scale: 2,
      logging: true,
      allowTaint: true,
      useCORS: true,
      backgroundColor: '#ffffff',
      onclone: (doc) => {
        // Ensure the element and its children are visible
        const element = doc.querySelector(matchedSelector) as HTMLElement;
        if (element) {
          element.style.visibility = 'visible';
          element.style.display = 'block';
          // Make all child elements visible
          element.querySelectorAll('*').forEach((child: Element) => {
            (child as HTMLElement).style.visibility = 'visible';
            (child as HTMLElement).style.display = 'block';
          });
        }
      }
    });
    
    // Increased quality from 0.85 to 0.9 for radar chart
    const imageData = canvas.toDataURL('image/jpeg', 0.9);
    console.log('Radar chart captured successfully, length:', imageData.length);
    return imageData;
  } catch (error) {
    console.error('Error capturing radar chart:', error);
    return '';
  }
};

const captureTimelineImage = async (): Promise<string> => {
  console.log('Capturing timeline image...');
  
  // Try multiple selectors in case the class names vary
  const selectors = [
    '[class*="timelineWrapper"]',
    '[class*="timeline"]',
    '[class*="container"]'
  ];
  let timelineElement = null;
  let matchedSelector = '';
  
  // Add a small delay to ensure the element is rendered
  await new Promise(resolve => setTimeout(resolve, 500));
  
  for (const selector of selectors) {
    timelineElement = await waitForElement(selector);
    if (timelineElement) {
      console.log(`Found timeline element with selector: ${selector}`);
      matchedSelector = selector;
      break;
    }
  }
  
  if (!timelineElement) {
    console.error('Timeline element not found with any selector');
    return '';
  }

  try {
    const canvas = await html2canvas(timelineElement, {
      scale: 1.2,
      logging: true,
      allowTaint: true,
      useCORS: true,
      backgroundColor: '#ffffff',
      onclone: (doc) => {
        // Ensure the element and its children are visible
        const element = doc.querySelector(matchedSelector) as HTMLElement;
        if (element) {
          element.style.visibility = 'visible';
          element.style.display = 'block';
          // Make all child elements visible
          element.querySelectorAll('*').forEach((child: Element) => {
            (child as HTMLElement).style.visibility = 'visible';
            (child as HTMLElement).style.display = 'block';
          });
        }
      }
    });
    
    // Decreased quality from 0.85 to 0.8 for timeline
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    console.log('Timeline image captured successfully, length:', imageData.length);
    return imageData;
  } catch (error) {
    console.error('Error capturing timeline:', error);
    return '';
  }
};

const splitBase64Image = (base64Data: string, includeFlag: boolean, maxChunkSize = 25000): string[] => {
  if (!base64Data) {
    console.log('No base64 data provided for splitting');
    return [];
  }

  const chunks: string[] = [];
  const includePrefix = includeFlag ? '{{Include}}' : '{{Not-Include}}';
  let index = 0;

  console.log(`Splitting image data (length: ${base64Data.length}) into chunks of ${maxChunkSize} characters`);

  while (index < base64Data.length) {
    const chunk = base64Data.slice(index, index + maxChunkSize);
    const totalChunks = Math.ceil(base64Data.length / maxChunkSize);
    const chunkIndex = Math.floor(index / maxChunkSize) + 1;
    
    // Format: {{Include/Not-Include}}|CHUNK_INDEX|TOTAL_CHUNKS|CHUNK_DATA
    const formattedChunk = `${includePrefix}|${chunkIndex}|${totalChunks}|${chunk}`;
    chunks.push(formattedChunk);
    
    console.log(`Created chunk ${chunkIndex}/${totalChunks}:`, {
      length: formattedChunk.length,
      preview: formattedChunk.slice(0, 100) + '...',
      includeFlag
    });
    
    index += maxChunkSize;
  }

  return chunks;
};

export const submitFormData = async (data: FormSubmissionData) => {
  console.log('Submitting form data...');
  
  // Always capture images
  const [radarChartImage, timelineImage] = await Promise.all([
    captureRadarChart(),
    captureTimelineImage()
  ]);

  // Debug logs for image data
  console.log('Image capture results:', {
    radarChart: {
      present: !!radarChartImage,
      length: radarChartImage.length,
      includeFlag: data.globalState.assessments.summary?.includeInReport,
      expectedChunks: Math.ceil(radarChartImage.length / 25000)
    },
    timeline: {
      present: !!timelineImage,
      length: timelineImage.length,
      includeFlag: data.globalState.assessments.milestones?.includeTimelineInReport,
      expectedChunks: Math.ceil(timelineImage.length / 25000)
    }
  });

  // Format all data
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
    milestoneTimelineData: formatMilestoneData(data.globalState.assessments.milestones.milestones),
    historyOfConcerns: data.globalState.assessments.milestones.history,
    ...(() => {
      const chunks = splitBase64Image(timelineImage, !!data.globalState.assessments.milestones?.includeTimelineInReport, 25000);
      console.log('Created milestone image chunks:', chunks.map((_, i) => `milestoneImageChunk${i + 1}`));
      return chunks.reduce((acc, chunk, index) => ({
        ...acc,
        [`milestoneImageChunk${index + 1}`]: chunk
      }), {});
    })(),

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

    // Combined Graph Chunks
    ...(() => {
      const chunks = splitBase64Image(radarChartImage, !!data.globalState.assessments.summary?.includeInReport, 25000);
      console.log('Created combined graph chunks:', chunks.map((_, i) => `combinedGraphImageChunk${i + 1}`));
      return chunks.reduce((acc, chunk, index) => ({
        ...acc,
        [`combinedGraphImageChunk${index + 1}`]: chunk
      }), {});
    })()
  };

  // Convert all values to strings before submission
  const stringifiedData = Object.entries(rawData).reduce((acc, [key, value]) => {
    console.log(`Processing field "${key}":`, {
      type: typeof value,
      length: typeof value === 'string' ? value.length : 'N/A',
      preview: typeof value === 'string' ? value.slice(0, 100) + '...' : value
    });
    return {
      ...acc,
      [key]: ensureString(value)
    };
  }, {} as Record<string, string>);

  // Prepare the final payload
  const payload = {
    r3Form: stringifiedData
  };

  // Submit the data
  try {
    console.log('Submitting form data to Sheety API. Payload keys:', Object.keys(stringifiedData));
    const response = await submitToSheetyAPI(R3_FORM_API, payload);
    console.log('Sheety API Response:', response);
    return response;
  } catch (error) {
    console.error('Error submitting form data:', error);
    throw error;
  }
}; 