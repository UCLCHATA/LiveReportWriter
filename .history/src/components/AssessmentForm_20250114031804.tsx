import React, { useState, useEffect, useCallback } from 'react';
import { useGlobalState } from '../context/GlobalStateContext';
import { SubmissionProgress } from './SubmissionProgress';
import html2canvas from 'html2canvas';
import { SubmissionOverlay } from './SubmissionOverlay';
import { APPS_SCRIPT_URLS } from '../services/api';
import { makeAppsScriptCall } from '../utils/api';

interface FormData {
  ascStatus: string;
  adhdStatus: string;
  clinicalObservations: string;
  strengths: string;
  priorityAreas: string;
  recommendations: string;
  referrals: Record<string, boolean>;
  remarks?: string;
  differentialDiagnosis?: string;
}

interface AssessmentFormProps {
  onClear: () => void;
  onProgressUpdate: (progress: number) => void;
  initialProgress?: number;
}

export const AssessmentForm: React.FC<AssessmentFormProps> = ({ 
  onClear, 
  onProgressUpdate,
  initialProgress = 0
}) => {
  const { globalState } = useGlobalState();
  const [formData, setFormData] = useState<FormData>({
        ascStatus: '',
        adhdStatus: '',
        clinicalObservations: '',
    strengths: '',
        priorityAreas: '',
        recommendations: '',
    referrals: {},
    remarks: '',
    differentialDiagnosis: ''
  });

  const [submissionStage, setSubmissionStage] = useState<string>('');
  const [submissionProgress, setSubmissionProgress] = useState<number>(initialProgress);

  const handleStatusChange = async (newStatus: 'draft' | 'submitted') => {
    try {
      if (!globalState.clinician?.chataId) {
        throw new Error('No CHATA ID selected');
      }

        setSubmissionProgress(30);
        setSubmissionStage('waiting');

        // Submit form data
        const response = await fetch(APPS_SCRIPT_URLS.formHandler, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            r3Form: {
            chataId: globalState.clinician.chataId,
            name: globalState.clinician.name,
              timestamp: new Date().toISOString(),
              asc: formData.ascStatus,
              adhd: formData.adhdStatus,
              observations: formData.clinicalObservations,
              strengths: formData.strengths,
              supportareas: formData.priorityAreas,
              recommendations: formData.recommendations,
              referrals: Object.entries(formData.referrals)
                .filter(([_, value]) => value)
                .map(([key]) => key)
                .join(', '),
              ...(formData.remarks && { remarks: formData.remarks }),
              ...(formData.differentialDiagnosis && { differential: formData.differentialDiagnosis })
            }
          })
        });

        if (!response.ok) {
          throw new Error('Form submission failed');
        }

      // Wait for data sync
        setSubmissionProgress(50);
      setSubmissionStage('syncing');

      // Make Apps Script calls in sequence
      try {
        // Template stage
        setSubmissionProgress(60);
        setSubmissionStage('template');
        const templateResult = await makeAppsScriptCall(APPS_SCRIPT_URLS.template, globalState.clinician.chataId);
        if (!templateResult.success) {
          throw new Error(`Template stage failed: ${templateResult.error || 'Unknown error'}`);
        }

        // Analysis stage
        setSubmissionProgress(70);
        setSubmissionStage('analysis');
        const analysisResult = await makeAppsScriptCall(APPS_SCRIPT_URLS.analysis, globalState.clinician.chataId);
        if (!analysisResult.success) {
          throw new Error(`Analysis stage failed: ${analysisResult.error || 'Unknown error'}`);
        }

        // Report generation stage
        setSubmissionProgress(80);
        setSubmissionStage('report');
        const result = await makeAppsScriptCall(APPS_SCRIPT_URLS.report, globalState.clinician.chataId);

        if (result?.success && result.progress?.details) {
          const { documentUrl, emailStatus } = result.progress.details;
          
          setSubmissionProgress(100);
          setSubmissionStage('complete');

          if (documentUrl) {
            window.open(documentUrl, '_blank');
          }
        } else {
          throw new Error('Invalid response format from report generation');
        }

      } catch (error) {
        setSubmissionStage('error');
        console.error('Apps Script call error:', error);
        throw error;
      }

    } catch (error) {
      setSubmissionStage('error');
      console.error('Form submission error:', error);
      throw error;
    }
  };

  // ... rest of your component code ...

  return (
    // ... your existing JSX ...
  );
}; 