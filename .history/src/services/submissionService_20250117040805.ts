import { submitFormData } from './api';
import type { GlobalFormState } from '../types';
import html2canvas from 'html2canvas';
import { prepareFormDataForSubmission } from './dataPreparation';

interface SubmissionResult {
  success: boolean;
  error?: string;
  submittedData?: any;
}

export class SubmissionService {
  private static validateSubmissionData(globalState: GlobalFormState): boolean {
    console.log('Validating submission data:', {
        hasChataId: !!globalState.chataId,
        hasClinician: !!globalState.clinician,
        hasFormData: !!globalState.formData,
        hasAssessments: !!globalState.assessments
    });

    if (!globalState.chataId) {
        console.error('Missing CHATA ID');
        return false;
    }

    if (!globalState.clinician?.name || !globalState.clinician?.email) {
        console.error('Missing clinician information');
        return false;
    }

    if (!globalState.formData) {
        console.error('Missing form data');
        return false;
    }

    if (!globalState.assessments) {
        console.error('Missing assessments data');
        return false;
    }

    // Validate required form fields
    const requiredFormFields = [
        'ascStatus',
        'adhdStatus',
        'clinicalObservations',
        'strengths',
        'priorityAreas',
        'recommendations'
    ];

    const missingFields = requiredFormFields.filter(field => !globalState.formData[field]);
    if (missingFields.length > 0) {
        console.error('Missing required form fields:', missingFields);
        return false;
    }

    return true;
  }

  private static async captureChartImage(chartElement: HTMLElement | null): Promise<string | null> {
    if (!chartElement) return null;
    
    try {
      const canvas = await html2canvas(chartElement, {
        scale: 0.75,
        logging: false,
        useCORS: true,
        backgroundColor: null
      });
      return canvas.toDataURL('image/jpeg', 0.7);
    } catch (error) {
      console.error('Failed to capture chart image:', error);
      return null;
    }
  }

  private static prepareSubmissionData(
    globalState: GlobalFormState, 
    includeImages: boolean = false,
    chartImage?: string | null
  ): any {
    console.log('Preparing submission data from state:', {
        chataId: globalState.chataId,
        hasAssessments: !!globalState.assessments,
        formDataPresent: !!globalState.formData
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

    console.log('Prepared submission data structure:', {
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

    return submissionData;
  }

  public static async submit(
    globalState: GlobalFormState, 
    includeImages: boolean = false,
    chartElement?: HTMLElement | null
  ): Promise<SubmissionResult> {
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

    } catch (error) {
      console.error('Submission failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
} 