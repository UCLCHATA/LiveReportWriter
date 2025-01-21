import { submitFormData } from './api';
import type { GlobalFormState, AssessmentData } from '../types';

interface SubmissionResult {
  success: boolean;
  error?: string;
  submittedData?: any;
}

export class SubmissionService {
  private static validateSubmissionData(globalState: GlobalFormState): boolean {
    if (!globalState.chataId) {
      console.error('Missing CHATA ID');
      return false;
    }

    if (!globalState.clinician?.name || !globalState.clinician?.email) {
      console.error('Missing clinician information');
      return false;
    }

    return true;
  }

  private static prepareSubmissionData(globalState: GlobalFormState, includeImages: boolean = false): any {
    console.log('Preparing submission data from state:', {
      chataId: globalState.chataId,
      hasAssessments: !!globalState.assessments,
      formDataPresent: !!globalState.formData
    });

    const { assessments, formData, clinician, chataId } = globalState;

    return {
      chataId,
      clinician,
      formData,
      assessments,
      includeImages,
      timestamp: new Date().toISOString()
    };
  }

  public static async submit(globalState: GlobalFormState, includeImages: boolean = false): Promise<SubmissionResult> {
    try {
      console.log('Starting submission process for CHATA ID:', globalState.chataId);

      // Validate submission data
      if (!this.validateSubmissionData(globalState)) {
        throw new Error('Invalid submission data');
      }

      // Prepare data for submission
      const submissionData = this.prepareSubmissionData(globalState, includeImages);
      
      console.log('Submitting data to Sheety:', {
        chataId: submissionData.chataId,
        timestamp: submissionData.timestamp,
        dataPresent: {
          clinician: !!submissionData.clinician,
          formData: !!submissionData.formData,
          assessments: !!submissionData.assessments,
          sensoryProfile: !!submissionData.assessments?.sensoryProfile,
          socialCommunication: !!submissionData.assessments?.socialCommunication,
          behaviorInterests: !!submissionData.assessments?.behaviorInterests,
          milestones: !!submissionData.assessments?.milestones,
          assessmentLog: !!submissionData.assessments?.assessmentLog
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