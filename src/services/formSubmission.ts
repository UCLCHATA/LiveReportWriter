import { submitToSheetyAPI, R3_FORM_API } from '../services/api';
import { GlobalFormState, Milestone, AssessmentDomainBase } from '../types';
import { APPS_SCRIPT_URLS } from '../config/api';
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
  appScriptUrl?: string;
}

interface ReportGenerationResponse {
  success: boolean;
  error?: string;
  templateUrl: string;
  downloadUrl: string;
  documentTitle: string;
  progress: {
    status: string;
    message: string;
    step: number;
    totalSteps: number;
    details: {
      documentUrl: string;
      timestamp: string;
    };
  };
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

const splitBase64Image = (base64Data: string, includeFlag: boolean): string[] => {
  if (!base64Data) {
    console.log('No base64 data provided for splitting');
    return [];
  }

  console.log(`Processing image data (length: ${base64Data.length})`);
  
  // If image is under 45k, return as single chunk with just include flag
  if (base64Data.length <= 45000) {
    const prefix = includeFlag ? '{{Include}}' : '{{Not-Include}}';
    const formattedData = `${prefix} ${base64Data}`;
    console.log(`Created single chunk, length: ${formattedData.length}`);
    return [formattedData];
  }
  
  // For larger images, split into 45k chunks
  const chunks: string[] = [];
  let index = 0;
  const maxChunkSize = 45000;
  const totalChunks = Math.ceil(base64Data.length / maxChunkSize);
  
  while (index < base64Data.length) {
    const chunk = base64Data.slice(index, index + maxChunkSize);
    const chunkIndex = Math.floor(index / maxChunkSize) + 1;
    
    // Format: {{Include/Not-Include}}|CHUNK_INDEX|TOTAL_CHUNKS|CHUNK_DATA
    const prefix = includeFlag ? '{{Include}}' : '{{Not-Include}}';
    const formattedChunk = `${prefix}|${chunkIndex}|${totalChunks}|${chunk}`;
    chunks.push(formattedChunk);
    
    console.log(`Created chunk ${chunkIndex}/${totalChunks}:`, {
      length: formattedChunk.length,
      preview: formattedChunk.slice(0, 100) + '...'
    });
    
    index += maxChunkSize;
  }

  return chunks;
};

const generateReport = async (rawData: any): Promise<ReportGenerationResponse> => {
    return new Promise((resolve, reject) => {
        const callbackName = 'callback_' + Math.round(100000 * Math.random());
        let timeoutId: number;
        let script: HTMLScriptElement;
        let redirectAttempts = 0;
        const MAX_REDIRECT_ATTEMPTS = 3;

        console.log('Initializing report generation with:', {
            callbackName,
            chataId: rawData.chataId,
            timestamp: rawData.timestamp
        });

        // Create cleanup function
        const cleanup = (reason: string) => {
            console.log(`Cleaning up report generation (Reason: ${reason})`, {
                timeoutExists: !!timeoutId,
                scriptExists: !!script,
                scriptInDOM: script?.parentNode != null,
                callbackExists: !!(window as any)[callbackName]
            });
            
            if (timeoutId) clearTimeout(timeoutId);
            if (script && script.parentNode) {
                script.parentNode.removeChild(script);
            }
            delete (window as any)[callbackName];
        };

        // Create callback function
        (window as any)[callbackName] = (response: ReportGenerationResponse) => {
            console.log('JSONP callback received response:', {
                success: response.success,
                hasTemplateUrl: !!response.templateUrl,
                hasDownloadUrl: !!response.downloadUrl,
                documentTitle: response.documentTitle,
                progress: response.progress
            });
            
            cleanup('Callback received');
            
            if (response.success) {
                // Handle successful response
                if (response.templateUrl) {
                    console.log('Opening report in new tab:', response.templateUrl);
                    window.open(response.templateUrl, '_blank');
                }
                
                // Create email link if download URL is available
                if (response.downloadUrl) {
                    console.log('Creating email link with download URL:', response.downloadUrl);
                    const emailSubject = `Report for ${rawData.childFirstName || 'Assessment'}`;
                    const emailBody = `Please find the assessment report attached.\n\nDownload link: ${response.downloadUrl}`;
                    const emailLink = document.createElement('a');
                    emailLink.href = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
                    emailLink.click();
                }
                
                resolve(response);
            } else {
                const error = new Error(response.error || 'Unknown error');
                console.error('JSONP callback received error:', error);
                reject(error);
            }
        };

        const handleRedirect = async (url: string) => {
            redirectAttempts++;
            console.log(`Handling redirect attempt ${redirectAttempts}/${MAX_REDIRECT_ATTEMPTS}:`, {
                originalUrl: reportGenerationUrl,
                redirectUrl: url
            });

            if (redirectAttempts > MAX_REDIRECT_ATTEMPTS) {
                const error = new Error(`Exceeded maximum redirect attempts (${MAX_REDIRECT_ATTEMPTS})`);
                console.error('Redirect limit exceeded:', error);
                cleanup('Redirect limit exceeded');
                reject(error);
                return;
            }

            try {
                // Instead of creating a new script, fetch the content directly
                console.log('Fetching redirected content directly:', url);
                const response = await fetch(url);
                const content = await response.text();
                
                console.log('Received content from redirect:', {
                    length: content.length,
                    preview: content.substring(0, 100)
                });

                // Create a new script with the content
                const newScript = document.createElement('script');
                newScript.textContent = content;
                console.log('Creating new script element with fetched content');

                // Add error handling for the new script
                newScript.onerror = (error) => {
                    console.error('Script execution failed:', error);
                    cleanup('Script execution error');
                    reject(new Error('Failed to execute script content'));
                };

                // Add the script to the document
                document.head.appendChild(newScript);
                console.log('Added script with content to document head');
            } catch (error) {
                console.error('Error handling redirect:', error);
                cleanup('Redirect handling error');
                reject(new Error('Failed to handle redirect'));
            }
        };

        // Create script element
        script = document.createElement('script');
        const reportGenerationUrl = `${APPS_SCRIPT_URLS.reportGeneration}?callback=${callbackName}&chataId=${encodeURIComponent(rawData.chataId)}&timestamp=${encodeURIComponent(rawData.timestamp)}`;
        script.src = reportGenerationUrl;
        console.log('Creating initial script element:', {
            url: reportGenerationUrl,
            callbackName
        });

        // Add error handling
        script.onerror = async () => {
            console.error('Initial script load failed, checking for redirects...');
            cleanup('Initial script error');
            
            try {
                console.log('Fetching URL to check for redirects:', reportGenerationUrl);
                const response = await fetch(reportGenerationUrl);
                console.log('Fetch response:', {
                    status: response.status,
                    statusText: response.statusText,
                    redirected: response.redirected,
                    redirectUrl: response.redirected ? response.url : 'N/A',
                    type: response.type,
                    headers: Array.from(response.headers.entries())
                });
                
                if (response.redirected) {
                    await handleRedirect(response.url);
                } else {
                    console.error('No redirect found in response');
                    reject(new Error('Failed to load report generation script'));
                }
            } catch (error) {
                console.error('Error checking for redirects:', error);
                reject(new Error('Failed to check for redirects'));
            }
        };

        // Set timeout (3 minutes)
        timeoutId = window.setTimeout(() => {
            console.error('Report generation timed out after 3 minutes');
            cleanup('Timeout');
            reject(new Error('Report generation timed out'));
        }, 180000);

        // Add script to document
        document.head.appendChild(script);
        console.log('Added initial script to document head');
    });
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
      length: radarChartImage?.length,
      includeFlag: data.globalState.assessments.summary?.includeInReport
    },
    timeline: {
      present: !!timelineImage,
      length: timelineImage?.length,
      includeFlag: data.globalState.assessments.milestones?.includeTimelineInReport
    }
  });

  // Format base data
  const formattedData = {
    // Metadata
    timestamp: new Date().toISOString(),
    chataId: data.globalState.clinician?.chataId,
    clinicName: data.globalState.clinician?.clinicName,
    clinicianName: data.globalState.clinician?.name,
    clinicianEmail: data.globalState.clinician?.email,
    childFirstName: data.globalState.clinician?.childFirstName,
    childSecondName: data.globalState.clinician?.childSecondName,
    childAge: data.globalState.clinician?.childAge,
    childGender: data.globalState.clinician?.childGender,

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
  };

  // Process radar chart image
  const radarChartChunks = radarChartImage ? 
    splitBase64Image(radarChartImage, data.globalState.assessments.summary?.includeInReport || false) : 
    [];

  // Process timeline image
  const timelineChunks = timelineImage ? 
    splitBase64Image(timelineImage, data.globalState.assessments.milestones?.includeTimelineInReport || false) : 
    [];

  try {
    // Submit base data first
    const baseResponse = await submitToSheetyAPI(R3_FORM_API, {
      r3Form: formattedData
    });
    console.log('Base data submitted successfully');

    // Submit radar chart chunks
    if (radarChartChunks.length > 0) {
      console.log(`Submitting ${radarChartChunks.length} radar chart chunks...`);
      for (let i = 0; i < radarChartChunks.length; i++) {
        await submitToSheetyAPI(R3_FORM_API, {
          r3Form: {
            chataId: formattedData.chataId,
            timestamp: formattedData.timestamp,
            radarChartImage: radarChartChunks[i]
          }
        });
        console.log(`Radar chart chunk ${i + 1}/${radarChartChunks.length} submitted`);
        // Add a small delay between chunks
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // Submit timeline chunks
    if (timelineChunks.length > 0) {
      console.log(`Submitting ${timelineChunks.length} timeline chunks...`);
      for (let i = 0; i < timelineChunks.length; i++) {
        await submitToSheetyAPI(R3_FORM_API, {
          r3Form: {
            chataId: formattedData.chataId,
            timestamp: formattedData.timestamp,
            timelineImage: timelineChunks[i]
          }
        });
        console.log(`Timeline chunk ${i + 1}/${timelineChunks.length} submitted`);
        // Add a small delay between chunks
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // Generate report
    const reportData = await generateReport(formattedData);
    console.log('Report generation successful:', reportData);
    
    return {
      ...baseResponse,
      report: {
        url: reportData.templateUrl,
        downloadUrl: reportData.downloadUrl,
        title: reportData.documentTitle,
        status: reportData.progress.status,
        message: reportData.progress.message
      }
    };
  } catch (error) {
    console.error('Error submitting form data:', error);
    throw error;
  }
}; 