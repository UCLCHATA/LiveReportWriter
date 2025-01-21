import html2canvas from 'html2canvas';

// Sheety API configuration
export const SHEETY_API_ID = 'd9da852d0370030da19c227582af6f3a';
export const SHEETY_PROJECT = 'chataLiveData';
export const SHEETY_BASE_URL = `https://api.sheety.co/${SHEETY_API_ID}/${SHEETY_PROJECT}`;
export const R3_FORM_API = `${SHEETY_BASE_URL}/r3Form`;

// API Configuration
export const API_CONFIG = {
  MAX_RETRIES: 3,
  BASE_DELAY: 1000,
  TIMEOUT: 30000,
  MAX_CHUNK_SIZE: 32000 // 32KB for Sheety's limits
};

// Enhanced error types for better error handling
export interface ApiError extends Error {
  code?: string;
  status?: number;
}

interface SheetyResponse {
  success: boolean;
  error?: string;
  r3Form?: {
    id: string;
    chataId: string;
    timestamp: string;
    [key: string]: any;
  };
}

// Helper to format sensory score
function formatSensoryScore(domain: any): string {
    if (!domain?.value) return 'Skipped';
    const score = domain.value;
    const label = domain.label || '';
    return `${label} ${score}/5`;
}

// Helper to format social communication score
function formatSocialScore(domain: any): string {
    if (!domain?.value) return 'Skipped';
    const score = domain.value;
    const label = domain.label || '';
    return `${label} ${score}/5`;
}

// Helper to format behavior score
function formatBehaviorScore(domain: any): string {
    if (!domain?.value) return 'Skipped';
    const score = domain.value;
    const label = domain.label || '';
    return `${label} ${score}/5`;
}

// Helper to format milestone data
function formatMilestoneData(milestones: any[]): string {
    if (!Array.isArray(milestones)) return '';

    const categories = {
        COMMUNICATION: [
            { name: 'Babbling', expected: 6 },
            { name: 'Name response', expected: 9 },
            { name: 'Points to show', expected: 12 },
            { name: 'First words', expected: 12 },
            { name: 'Combines words', expected: 24 }
        ],
        MOTOR: [
            { name: 'Head control', expected: 3 },
            { name: 'Reaches & grasps', expected: 5 },
            { name: 'Independent sitting', expected: 8 },
            { name: 'Independent walking', expected: 12 },
            { name: 'Climbs & runs', expected: 18 }
        ],
        SOCIAL: [
            { name: 'Social smile', expected: 2 },
            { name: 'Eye contact', expected: 3 },
            { name: 'Imitation', expected: 9 },
            { name: 'Pretend play', expected: 18 },
            { name: 'Interactive play', expected: 24 }
        ],
        CONCERNS: [
            { name: 'Rigid play patterns', expected: 0 },
            { name: 'Limited social engagement', expected: 0 },
            { name: 'Sensory seeking/avoiding', expected: 0 }
        ]
    };

    const formatMilestoneStatus = (milestone: any, expectedMonth: number) => {
        if (!milestone || !milestone.achievedAge) return `Expected ${expectedMonth}m (Not yet achieved)`;
        
        const achievedAge = milestone.achievedAge;
        const delay = achievedAge - expectedMonth;
        
        if (delay === 0) return `Expected ${expectedMonth}m (Achieved on time)`;
        if (delay > 0) return `Expected ${expectedMonth}m (Delayed by ${delay} months)`;
        return `Expected ${expectedMonth}m (Advanced by ${Math.abs(delay)} months)`;
    };

    const formatConcern = (concern: any) => {
        return concern && concern.isPresent ? 'Present' : 'Not Present';
    };

    let output = '';

    // Format developmental milestones
    for (const [category, milestoneList] of Object.entries(categories)) {
        output += `=== ${category} ===\n`;
        
        for (const item of milestoneList) {
            const milestone = milestones.find(m => m.name === item.name);
            
            if (category === 'CONCERNS') {
                output += `${item.name}: ${formatConcern(milestone)}\n`;
            } else {
                output += `${item.name}: ${formatMilestoneStatus(milestone, item.expected)}\n`;
            }
        }
        output += '\n';
    }

    return output.trim();
}

// Helper to format assessment log data
function formatAssessmentLogData(assessmentLog: any): string {
    if (!assessmentLog) return '';
    
    const entries = Object.entries(assessmentLog);
    if (entries.length === 0) return '';

    return entries
        .map(([assessment, data]: [string, any]) => {
            const date = data.date ? new Date(data.date).toISOString().split('T')[0] : 'Date NA';
            const notes = data.notes || '';
            return `${assessment} (${date}): ${notes}`;
        })
        .filter(entry => entry.trim() !== '')
        .join('\n\n');
}

// Constants for image handling
const IMAGE_CONFIG = {
    MAX_CHUNK_SIZE: 40000, // Target size for chunks
    CHUNK_LIMIT: 45000,    // Size limit before chunking
    NUM_CHUNKS: 3          // Number of chunks to split into
};

// Helper to generate and process image
async function generateImage(element: HTMLElement | null): Promise<string | null> {
    if (!element) return null;
    
    try {
        const canvas = await html2canvas(element, {
            scale: 0.75, // Reduce size
            useCORS: true,
            logging: false
        });
        
        return canvas.toDataURL('image/jpeg', 0.7); // Use JPEG with 70% quality
    } catch (error) {
        console.error('Image generation failed:', error);
        return null;
    }
}

// Helper to chunk image data
function chunkImageData(base64Data: string): { chunk1: string, chunk2: string, chunk3: string } {
    if (!base64Data) {
        return {
            chunk1: '{{NOT INCLUDE}}',
            chunk2: '{{NOT INCLUDE}}',
            chunk3: '{{NOT INCLUDE}}'
        };
    }

    const chunkSize = Math.ceil(base64Data.length / IMAGE_CONFIG.NUM_CHUNKS);
    return {
        chunk1: base64Data.slice(0, chunkSize),
        chunk2: base64Data.slice(chunkSize, chunkSize * 2),
        chunk3: base64Data.slice(chunkSize * 2)
    };
}

// Helper to format form data
function formatFormData(state: any) {
    // Extract nested data
    const { clinician, formData, assessments, chataId } = state;
    
    return {
        r3Form: {
            // Use the top-level chataId
            chataId: chataId,
            
            // Clinician and child info
            clinicName: clinician.clinicName,
            clinicianName: clinician.name,
            clinicianEmail: clinician.email,
            childFirstname: clinician.childFirstName,
            childSecondname: clinician.childLastName,
            childAge: clinician.childAge,
            childGender: clinician.childGender,
            
            // Form status and metadata
            timestamp: new Date().toISOString(),
            status: formData.status || 'submitted',
            
            // Sensory Profile scores
            visualScore: formatSensoryScore(assessments.sensoryProfile.domains.visual),
            auditoryScore: formatSensoryScore(assessments.sensoryProfile.domains.auditory),
            tactileScore: formatSensoryScore(assessments.sensoryProfile.domains.tactile),
            vestibularScore: formatSensoryScore(assessments.sensoryProfile.domains.vestibular),
            proprioceptiveScore: formatSensoryScore(assessments.sensoryProfile.domains.proprioceptive),
            oralScore: formatSensoryScore(assessments.sensoryProfile.domains.oral),
            
            // Social Communication scores
            jointAttentionScore: formatSocialScore(assessments.socialCommunication.domains.jointAttention),
            nonverbalCommunicationScore: formatSocialScore(assessments.socialCommunication.domains.nonverbalCommunication),
            verbalCommunicationScore: formatSocialScore(assessments.socialCommunication.domains.verbalCommunication),
            socialUnderstandingScore: formatSocialScore(assessments.socialCommunication.domains.socialUnderstanding),
            playSkillsScore: formatSocialScore(assessments.socialCommunication.domains.playSkills),
            peerInteractionsScore: formatSocialScore(assessments.socialCommunication.domains.peerInteractions),
            
            // Behavior & Interests scores
            repetitiveBehaviorsScore: formatBehaviorScore(assessments.behaviorInterests.domains.repetitiveBehaviors),
            routinesRitualsScore: formatBehaviorScore(assessments.behaviorInterests.domains.routinesRituals),
            specialInterestsScore: formatBehaviorScore(assessments.behaviorInterests.domains.specialInterests),
            sensoryInterestsScore: formatBehaviorScore(assessments.behaviorInterests.domains.sensoryInterests),
            emotionalRegulationScore: formatBehaviorScore(assessments.behaviorInterests.domains.emotionalRegulation),
            flexibilityScore: formatBehaviorScore(assessments.behaviorInterests.domains.flexibility),
            
            // Clinical assessment data
            ascStatus: formData.ascStatus,
            adhdStatus: formData.adhdStatus,
            clinicalObservations: formData.clinicalObservations,
            strengths: formData.strengths,
            priorityAreas: formData.priorityAreas,
            recommendations: formData.recommendations,
            referrals: JSON.stringify(formData.referrals),
            remarks: formData.remarks,
            differentialDiagnosis: formData.differentialDiagnosis,
            
            // Timeline and history data
            milestoneTimelineData: state.milestoneTimelineData,
            historyOfConcerns: formData.developmentalConcerns,
            assessmentLogData: state.assessmentLogData,
            
            // Image placeholders (will be updated separately if needed)
            milestoneImageChunk1: '{{NOT INCLUDE}}',
            milestoneImageChunk2: '{{NOT INCLUDE}}',
            milestoneImageChunk3: '{{NOT INCLUDE}}',
            combinedGraphImageChunk1: '{{NOT INCLUDE}}',
            combinedGraphImageChunk2: '{{NOT INCLUDE}}',
            combinedGraphImageChunk3: '{{NOT INCLUDE}}'
        }
    };
}

// Submit form data to Sheety with separate image submissions
export async function submitFormData(formData: any): Promise<SheetyResponse> {
    try {
        console.log('Starting form submission process...');
        
        // Format main form data
        const formattedData = formatFormData(formData);
        console.log('Main form data formatted successfully. Payload:', {
            chataId: formattedData.r3Form.chataId,
            clinicianInfo: {
                name: formattedData.r3Form.clinicianName,
                email: formattedData.r3Form.clinicianEmail,
                clinic: formattedData.r3Form.clinicName
            },
            childInfo: {
                firstName: formattedData.r3Form.childFirstname,
                lastName: formattedData.r3Form.childSecondname,
                age: formattedData.r3Form.childAge,
                gender: formattedData.r3Form.childGender
            },
            sensoryScores: {
                visual: formattedData.r3Form.visualScore,
                auditory: formattedData.r3Form.auditoryScore,
                tactile: formattedData.r3Form.tactileScore,
                vestibular: formattedData.r3Form.vestibularScore,
                proprioceptive: formattedData.r3Form.proprioceptiveScore,
                oral: formattedData.r3Form.oralScore
            },
            socialScores: {
                jointAttention: formattedData.r3Form.jointAttentionScore,
                nonverbalCommunication: formattedData.r3Form.nonverbalCommunicationScore,
                verbalCommunication: formattedData.r3Form.verbalCommunicationScore,
                socialUnderstanding: formattedData.r3Form.socialUnderstandingScore,
                playSkills: formattedData.r3Form.playSkillsScore,
                peerInteractions: formattedData.r3Form.peerInteractionsScore
            },
            behaviorScores: {
                repetitiveBehaviors: formattedData.r3Form.repetitiveBehaviorsScore,
                routinesRituals: formattedData.r3Form.routinesRitualsScore,
                specialInterests: formattedData.r3Form.specialInterestsScore,
                sensoryInterests: formattedData.r3Form.sensoryInterestsScore,
                emotionalRegulation: formattedData.r3Form.emotionalRegulationScore,
                flexibility: formattedData.r3Form.flexibilityScore
            },
            clinicalAssessment: {
                ascStatus: formattedData.r3Form.ascStatus,
                adhdStatus: formattedData.r3Form.adhdStatus,
                observations: formattedData.r3Form.clinicalObservations,
                strengths: formattedData.r3Form.strengths,
                priorityAreas: formattedData.r3Form.priorityAreas,
                recommendations: formattedData.r3Form.recommendations,
                referrals: formattedData.r3Form.referrals,
                remarks: formattedData.r3Form.remarks,
                differential: formattedData.r3Form.differentialDiagnosis
            },
            timeline: {
                milestoneData: formattedData.r3Form.milestoneTimelineData?.substring(0, 100) + '...',
                historyLength: formattedData.r3Form.historyOfConcerns?.length || 0,
                assessmentLogLength: formattedData.r3Form.assessmentLogData?.length || 0
            }
        });
        
        // Submit main form data
        console.log('Submitting main form data to Sheety...');
        const mainResponse = await submitToSheety(formattedData);
        console.log('✓ Main form data submitted successfully:', {
            responseId: mainResponse.r3Form?.id,
            chataId: mainResponse.r3Form?.chataId,
            timestamp: mainResponse.r3Form?.timestamp
        });
        
        // If images are included, submit them separately
        if (formData.includeImages) {
            console.log('Processing image submissions...', {
                milestoneIncluded: formData.milestoneImage?.include,
                radarChartIncluded: formData.radarChartImage?.include
            });
            
            // Submit milestone image if included
            if (formData.milestoneImage?.include) {
                console.log('Submitting milestone timeline image...', {
                    chataId: formData.chataId,
                    chunk1Length: formData.milestoneImage.chunk1?.length || 0,
                    chunk2Length: formData.milestoneImage.chunk2?.length || 0,
                    chunk3Length: formData.milestoneImage.chunk3?.length || 0
                });
                const milestoneImageData = {
                    r3Form: {
                        chataId: formData.chataId,
                        milestoneImageChunk1: formData.milestoneImage.chunk1,
                        milestoneImageChunk2: formData.milestoneImage.chunk2,
                        milestoneImageChunk3: formData.milestoneImage.chunk3
                    }
                };
                await submitToSheety(milestoneImageData);
                console.log('✓ Milestone timeline image submitted successfully');
            } else {
                console.log('Milestone timeline image submission skipped (not included)');
            }
            
            // Submit radar chart image if included
            if (formData.radarChartImage?.include) {
                console.log('Submitting combined radar chart image...', {
                    chataId: formData.chataId,
                    chunk1Length: formData.radarChartImage.chunk1?.length || 0,
                    chunk2Length: formData.radarChartImage.chunk2?.length || 0,
                    chunk3Length: formData.radarChartImage.chunk3?.length || 0
                });
                const radarChartImageData = {
                    r3Form: {
                        chataId: formData.chataId,
                        combinedGraphImageChunk1: formData.radarChartImage.chunk1,
                        combinedGraphImageChunk2: formData.radarChartImage.chunk2,
                        combinedGraphImageChunk3: formData.radarChartImage.chunk3
                    }
                };
                await submitToSheety(radarChartImageData);
                console.log('✓ Combined radar chart image submitted successfully');
            } else {
                console.log('Combined radar chart image submission skipped (not included)');
            }
            
            console.log('✓ All image submissions completed');
        } else {
            console.log('Image submissions skipped (includeImages flag is false)');
        }
        
        console.log('✓ Form submission process completed successfully');
        return mainResponse;
    } catch (error) {
        console.error('Form submission failed:', {
            error: error instanceof Error ? error.message : String(error),
            code: error instanceof Error ? (error as ApiError).code : undefined,
            status: error instanceof Error ? (error as ApiError).status : undefined
        });
        const apiError: ApiError = error instanceof Error ? error : new Error(String(error));
        apiError.code = 'FORM_SUBMISSION_FAILED';
        throw apiError;
    }
}

// Helper to submit data to Sheety
async function submitToSheety(data: any): Promise<SheetyResponse> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

    try {
        const payload = JSON.stringify(data);
        console.log('Making Sheety API request...', {
            url: R3_FORM_API,
            dataSize: payload.length,
            timeout: API_CONFIG.TIMEOUT,
            payloadPreview: payload.substring(0, 200) + '...'
        });

        const response = await fetch(R3_FORM_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer CHATAI'
            },
            body: payload,
            signal: controller.signal
        });

        clearTimeout(timeout);
        const responseText = await response.text();
        
        console.log('Sheety API response received:', {
            status: response.status,
            statusText: response.statusText,
            responseSize: responseText.length,
            responsePreview: responseText.substring(0, 200) + '...'
        });

        let jsonResponse;
        try {
            jsonResponse = JSON.parse(responseText);
            if (response.ok) {
                console.log('Sheety API request successful:', {
                    success: true,
                    id: jsonResponse.r3Form?.id,
                    chataId: jsonResponse.r3Form?.chataId,
                    fields: Object.keys(jsonResponse.r3Form || {}).join(', ')
                });
            } else {
                console.error('Sheety API request failed:', {
                    success: false,
                    error: jsonResponse.error,
                    status: response.status,
                    response: responseText
                });
            }
        } catch (e) {
            console.error('Failed to parse Sheety API response:', responseText);
            throw new Error(`Invalid JSON response from Sheety API: ${responseText}`);
        }

        if (!response.ok) {
            throw new Error(`Sheety API submission failed: ${response.status} ${response.statusText}`);
        }

        return jsonResponse;
    } catch (error: any) {
        console.error('Sheety API request failed:', {
            error: error instanceof Error ? error.message : String(error),
            timeout: error.name === 'AbortError' ? 'Request timed out' : undefined
        });
        throw error;
    } finally {
        clearTimeout(timeout);
    }
} 