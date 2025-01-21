import { submitFormData } from './api';
import html2canvas from 'html2canvas';
import { prepareFormDataForSubmission } from './dataPreparation';
export class SubmissionService {
    static validateSubmissionData(globalState) {
        console.log('🔍 Starting validation with state:', {
            hasChataId: !!globalState.chataId,
            hasClinician: !!globalState.clinician,
            hasFormData: !!globalState.formData,
            hasAssessments: !!globalState.assessments
        });
        // Only CHATA ID is required
        if (!globalState.chataId) {
            console.error('❌ Missing CHATA ID');
            return false;
        }
        // Log clinician data for debugging
        if (globalState.clinician) {
            const { name, email, clinicName } = globalState.clinician;
            console.log('👤 Clinician data present:', {
                name: name || '(empty)',
                email: email || '(empty)',
                clinicName: clinicName || '(empty)',
                rawData: globalState.clinician
            });
        }
        return true;
    }
    static async captureChartImage(chartElement) {
        if (!chartElement)
            return null;
        try {
            const canvas = await html2canvas(chartElement, {
                scale: 0.75,
                logging: false,
                useCORS: true,
                backgroundColor: null
            });
            return canvas.toDataURL('image/jpeg', 0.7);
        }
        catch (error) {
            console.error('Failed to capture chart image:', error);
            return null;
        }
    }
    static prepareSubmissionData(globalState, includeImages = false, chartImage) {
        console.log('Preparing submission data from state:', {
            chataId: globalState.chataId,
            hasAssessments: !!globalState.assessments,
            formDataPresent: !!globalState.formData,
            clinicianData: globalState.clinician
        });
        // Use the new data preparation function
        const formattedData = prepareFormDataForSubmission(globalState);
        // Add image data if needed
        const submissionData = {
            ...formattedData,
            includeImages,
            radarChartImage: chartImage ? {
                data: chartImage,
                include: true
            } : {
                include: false
            }
        };
        // Log data presence for debugging
        console.log('Prepared submission data:', {
            hasClinicianName: !!submissionData.clinicianName,
            hasClinicianEmail: !!submissionData.clinicianEmail,
            hasClinicName: !!submissionData.clinicName,
            hasChildInfo: !!(submissionData.childFirstName || submissionData.childLastName),
            hasSensoryData: !!submissionData.visualScore,
            hasSocialData: !!submissionData.jointAttentionScore,
            hasBehaviorData: !!submissionData.repetitiveBehaviorsScore,
            hasMilestoneData: !!submissionData.milestoneTimelineData,
            hasAssessmentLog: !!submissionData.assessmentLogData
        });
        return submissionData;
    }
    static async submit(globalState, includeImages = false, chartElement) {
        try {
            console.log('Starting submission process for CHATA ID:', globalState.chataId);
            // Validate submission data
            if (!this.validateSubmissionData(globalState)) {
                throw new Error('Invalid submission data');
            }
            // Capture chart image if needed
            const chartImage = includeImages && chartElement ?
                await this.captureChartImage(chartElement) : null;
            // Prepare data for submission
            const submissionData = this.prepareSubmissionData(globalState, includeImages, chartImage);
            console.log('Submitting data to Sheety:', {
                chataId: submissionData.chataId,
                timestamp: submissionData.timestamp,
                dataPresent: {
                    clinician: !!submissionData.clinicianName,
                    formData: !!submissionData.clinicalObservations,
                    sensoryProfile: !!submissionData.sensoryProfile,
                    socialCommunication: !!submissionData.socialCommunication,
                    behaviorInterests: !!submissionData.behaviorInterests,
                    milestones: !!submissionData.milestoneTimelineData,
                    assessmentLog: !!submissionData.assessmentLogData,
                    chartImage: !!chartImage
                }
            });
            // Submit to Sheety
            const response = await submitFormData(submissionData);
            console.log('Submission completed successfully:', {
                chataId: submissionData.chataId,
                timestamp: submissionData.timestamp
            });
            return {
                success: true,
                submittedData: submissionData
            };
        }
        catch (error) {
            console.error('Submission failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
}
