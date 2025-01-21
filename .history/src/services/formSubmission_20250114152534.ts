import { submitToSheetyAPI } from './api';
import { R3_FORM_API } from '../config/api';

interface FormSubmissionData {
  formData: any;
  globalState: any;
  radarChartImage?: string;
}

export const prepareSheetyData = ({ formData, globalState, radarChartImage }: FormSubmissionData) => {
  return {
    r3Form: {
      timestamp: new Date().toISOString(),
      chataId: globalState.clinician?.chataId || '',
      clinicName: globalState.clinician?.clinicName || '',
      clinicianName: globalState.clinician?.name || '',
      clinicianEmail: globalState.clinician?.email || '',
      
      // Sensory Profile Scores and Observations
      tactileScore: globalState.assessments.sensoryProfile.domains.tactile?.value || '',
      tactileObservations: globalState.assessments.sensoryProfile.domains.tactile?.observations || '',
      vestibularScore: globalState.assessments.sensoryProfile.domains.vestibular?.value || '',
      vestibularObservations: globalState.assessments.sensoryProfile.domains.vestibular?.observations || '',
      proprioceptiveScore: globalState.assessments.sensoryProfile.domains.proprioceptive?.value || '',
      proprioceptiveObservations: globalState.assessments.sensoryProfile.domains.proprioceptive?.observations || '',
      auditoryScore: globalState.assessments.sensoryProfile.domains.auditory?.value || '',
      auditoryObservations: globalState.assessments.sensoryProfile.domains.auditory?.observations || '',
      visualScore: globalState.assessments.sensoryProfile.domains.visual?.value || '',
      visualObservations: globalState.assessments.sensoryProfile.domains.visual?.observations || '',
      
      // Social Communication Scores and Observations
      socialEngagementScore: globalState.assessments.socialCommunication.domains.socialEngagement?.value || '',
      socialEngagementObservations: globalState.assessments.socialCommunication.domains.socialEngagement?.observations || '',
      nonverbalCommunicationScore: globalState.assessments.socialCommunication.domains.nonverbalCommunication?.value || '',
      nonverbalCommunicationObservations: globalState.assessments.socialCommunication.domains.nonverbalCommunication?.observations || '',
      playSkillsScore: globalState.assessments.socialCommunication.domains.playSkills?.value || '',
      playSkillsObservations: globalState.assessments.socialCommunication.domains.playSkills?.observations || '',
      peerInteractionsScore: globalState.assessments.socialCommunication.domains.peerInteractions?.value || '',
      peerInteractionsObservations: globalState.assessments.socialCommunication.domains.peerInteractions?.observations || '',
      
      // Behavior & Interests Scores and Observations
      repetitiveBehaviorsScore: globalState.assessments.behaviorInterests.domains.repetitiveBehaviors?.value || '',
      repetitiveBehaviorsObservations: globalState.assessments.behaviorInterests.domains.repetitiveBehaviors?.observations || '',
      routinesRitualsScore: globalState.assessments.behaviorInterests.domains.routinesRituals?.value || '',
      routinesRitualsObservations: globalState.assessments.behaviorInterests.domains.routinesRituals?.observations || '',
      specialInterestsScore: globalState.assessments.behaviorInterests.domains.specialInterests?.value || '',
      specialInterestsObservations: globalState.assessments.behaviorInterests.domains.specialInterests?.observations || '',
      sensoryInterestsScore: globalState.assessments.behaviorInterests.domains.sensoryInterests?.value || '',
      sensoryInterestsObservations: globalState.assessments.behaviorInterests.domains.sensoryInterests?.observations || '',
      emotionalRegulationScore: globalState.assessments.behaviorInterests.domains.emotionalRegulation?.value || '',
      emotionalRegulationObservations: globalState.assessments.behaviorInterests.domains.emotionalRegulation?.observations || '',
      flexibilityScore: globalState.assessments.behaviorInterests.domains.flexibility?.value || '',
      flexibilityObservations: globalState.assessments.behaviorInterests.domains.flexibility?.observations || '',
      
      // Milestone and Assessment Data
      milestoneTimelineData: formData.milestones
        ?.map(milestone => 
          `${milestone.title}|${milestone.description}|${milestone.isCustom ? 'NA' : milestone.expectedAge}|${milestone.actualAge}|${
            milestone.actualAge !== undefined && !milestone.isCustom
              ? milestone.actualAge > milestone.expectedAge
                ? `Delayed by ${milestone.actualAge - milestone.expectedAge} months`
                : milestone.actualAge < milestone.expectedAge
                  ? `Advanced by ${milestone.expectedAge - milestone.actualAge} months`
                  : 'On Track'
              : 'Not Assessed'
          }`
        )
        .join(' || ') || '',
      historyOfConcerns: formData.milestoneHistory || '',
      assessmentLogData: Object.values(globalState.assessments.assessmentLog.entries)
        .filter(entry => entry && typeof entry === 'object')
        .map(entry => `${entry.name || ''} (${entry.date || 'No date'})${entry.notes ? ': ' + entry.notes : ''}`)
        .join(' | '),
      
      // Status and Clinical Information
      ascStatus: formData.ascStatus || '',
      adhdStatus: formData.adhdStatus || '',
      clinicalObservations: formData.clinicalObservations || '',
      strengthsAbilities: formData.strengths || '',
      prioritySupportAreas: formData.priorityAreas || '',
      supportRecommendations: formData.recommendations || '',
      referrals: Object.entries(formData.referrals || {})
        .filter(([_, value]) => value)
        .map(([key]) => key)
        .join(', '),
      additionalRemarks: formData.remarks || '',
      differentialDiagnosis: formData.differentialDiagnosis || '',
      milestoneImage: formData.timelineImage || '',
      combinedGraphImage: radarChartImage || ''
    }
  };
};

export const submitFormData = async (data: FormSubmissionData) => {
  const sheetyData = prepareSheetyData(data);
  
  console.log('Attempting to submit form data to Sheety API...', {
    ...sheetyData,
    r3Form: {
      ...sheetyData.r3Form,
      milestoneImage: sheetyData.r3Form.milestoneImage ? '[BASE64_IMAGE]' : '',
      combinedGraphImage: sheetyData.r3Form.combinedGraphImage ? '[BASE64_IMAGE]' : ''
    }
  });

  return await submitToSheetyAPI(R3_FORM_API, sheetyData);
}; 