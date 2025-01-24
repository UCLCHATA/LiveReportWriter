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
      alert('Please ensure you have a valid CHATA ID before submitting.');
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

    // Check child information
    if (!globalState.formData?.childFirstname?.trim() || 
        !globalState.formData?.childSecondname?.trim() || 
        !globalState.formData?.childAge?.trim() || 
        !globalState.formData?.childGender?.trim()) {
      console.error('❌ Missing required child information');
      alert('Please fill in all required child information (First Name, Last Name, Age, and Gender) before submitting.');
      return false;
    }

    // Check ASC and ADHD status selection
    if (!globalState.formData?.ascStatus || !globalState.formData?.adhdStatus) {
      console.error('❌ Missing ASC or ADHD status selection');
      alert('Please select both ASC and ADHD status before submitting.');
      return false;
    }

    // Check minimum word count in assessment textboxes
    const MIN_WORDS = 20; // Minimum words required per textbox
    const textboxes = [
      { name: 'Sensory Profile', text: globalState.formData?.sensoryProfileText },
      { name: 'Social Communication', text: globalState.formData?.socialCommunicationText },
      { name: 'Behavior and Interests', text: globalState.formData?.behaviorInterestsText },
      { name: 'Clinical Observations', text: globalState.formData?.clinicalObservationsText }
    ];

    for (const { name, text } of textboxes) {
      if (!text || text.trim().split(/\s+/).length < MIN_WORDS) {
        console.error(`❌ Insufficient detail in ${name}`);
        alert(`Please provide at least ${MIN_WORDS} words of detail in the ${name} section.`);
        return false;
      }
    }

    // Check if all required domains have scores
    const domains = {
      sensory: ['visual', 'auditory', 'tactile', 'vestibular', 'proprioceptive', 'oral'],
      social: ['jointAttention', 'nonverbalCommunication', 'verbalCommunication', 'socialUnderstanding', 'playSkills', 'peerInteractions'],
      behavior: ['repetitiveBehaviors', 'routinesRituals', 'specialInterests', 'sensoryInterests', 'emotionalRegulation', 'flexibility']
    };

    // Check sensory domains
    if (!globalState.formData?.sensoryProfile?.domains) {
      console.error('❌ Missing sensory profile scores');
      alert('Please complete all sensory profile assessments before submitting.');
      return false;
    }

    // Check social domains
    if (!globalState.formData?.socialCommunication?.domains) {
      console.error('❌ Missing social communication scores');
      alert('Please complete all social communication assessments before submitting.');
      return false;
    }

    // Check behavior domains
    if (!globalState.formData?.behaviorInterests?.domains) {
      console.error('❌ Missing behavior and interests scores');
      alert('Please complete all behavior and interests assessments before submitting.');
      return false;
    }

    // Log successful validation
    console.log('✓ All validation checks passed');
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

      // Validate submission data first
      console.log('Validating submission data...');
      if (!this.validateSubmissionData(globalState)) {
        console.log('❌ Validation failed - submission blocked');
        return {
          success: false,
          error: 'Please complete all required fields before submitting.'
        };
      }
      console.log('✓ Validation passed');

      // Only proceed with data preparation and submission if validation passed
      console.log('Preparing submission data...');
      const submissionData = this.prepareSubmissionData(globalState, includeImages, chartElement ? 
        await this.captureChartImage(chartElement) : null);
      
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
          chartImage: !!submissionData.radarChartImage?.data
        }
      });

      // Submit to Sheety
      const response = await submitFormData(submissionData);

      console.log('✓ Submission completed successfully:', {
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