import { submitFormData } from './api';
import type { GlobalFormState } from '../types';
import html2canvas from 'html2canvas';
import { prepareFormDataForSubmission } from './dataPreparation';
import { ALERT_MESSAGES } from './api';

interface SubmissionResult {
  success: boolean;
  error?: string;
  submittedData?: any;
}

interface SubmissionData {
    chataId: string;
    timestamp: string;
    // Clinician Info
    clinicianName?: string;
    clinicianEmail?: string;
    clinicName?: string;
    childFirstName?: string;
    childLastName?: string;
    childAge?: string;
    childGender?: string;
    
    // Form Data
    clinicalObservations?: string;
    sensoryProfile?: any;
    socialCommunication?: any;
    behaviorInterests?: any;
    
    // Component Scores
    visualScore?: string;
    jointAttentionScore?: string;
    repetitiveBehaviorsScore?: string;
    milestoneTimelineData?: string;
    assessmentLogData?: string;
    
    // Image Data
    includeImages: boolean;
    radarChartImage: {
        data?: string;
        include: boolean;
    };
    
    // Status
    status: string;
    submissionDate: string;
    
    // Allow additional properties
    [key: string]: any;
}

export class SubmissionService {
  private static validateSubmissionData(globalState: GlobalFormState): boolean {
    console.log('🔍 Starting validation with state:', {
      hasChataId: !!globalState.chataId,
      hasClinician: !!globalState.clinician,
      hasFormData: !!globalState.formData,
      hasAssessments: !!globalState.assessments
    });

    // Check CHATA ID
    if (!globalState.chataId) {
      console.error('❌ Missing CHATA ID');
      alert(ALERT_MESSAGES.INVALID_DATA);
      return false;
    }

    // Check required clinician fields
    if (!globalState.clinician?.name?.trim() || 
        !globalState.clinician?.email?.trim() || 
        !globalState.clinician?.clinicName?.trim()) {
      console.error('❌ Missing required clinician information');
      alert('Please fill in all required clinician fields (Name, Email, and Clinic Name) before submitting.');
      return false;
    }

    // Log clinician data for debugging
    const { name, email, clinicName } = globalState.clinician;
    console.log('👤 Clinician data present:', {
      name: name || '(empty)',
      email: email || '(empty)',
      clinicName: clinicName || '(empty)',
      rawData: globalState.clinician
    });

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
  ): SubmissionData {
    console.log('Preparing submission data from state:', {
      chataId: globalState.chataId,
      hasAssessments: !!globalState.assessments,
      formDataPresent: !!globalState.formData,
      clinicianData: globalState.clinician
    });

    // Use the new data preparation function
    const formattedData = prepareFormDataForSubmission(globalState);

    // Add image data if needed
    const submissionData: SubmissionData = {
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