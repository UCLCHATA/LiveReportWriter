import { useState, useEffect, useCallback } from 'react';
import { FormState, ClinicianInfo, AssessmentData, Milestone } from '../types';

const initialMilestones: Milestone[] = [
  // Communication milestones
  { id: 'babbling', title: 'Babbling', category: 'communication', expectedAge: 6 },
  { id: 'name-response', title: 'Name response', category: 'communication', expectedAge: 9 },
  { id: 'points-to-show', title: 'Points to show', category: 'communication', expectedAge: 12 },
  
  // Motor milestones
  { id: 'head-control', title: 'Head control', category: 'motor', expectedAge: 3 },
  { id: 'reaches-grasps', title: 'Reaches & grasps', category: 'motor', expectedAge: 5 },
  { id: 'independent-sitting', title: 'Independent sitting', category: 'motor', expectedAge: 8 },
  
  // Social milestones
  { id: 'social-smile', title: 'Social smile', category: 'social', expectedAge: 2 },
  { id: 'eye-contact', title: 'Eye contact', category: 'social', expectedAge: 3 },
  { id: 'imitation', title: 'Imitation', category: 'social', expectedAge: 9 },
  
  // Developmental concerns
  { id: 'rigid-play', title: 'Rigid play patterns', category: 'concerns', expectedAge: 0 },
  { id: 'limited-social', title: 'Limited social engagement', category: 'concerns', expectedAge: 0 },
  { id: 'custom-concern', title: '+', category: 'concerns', expectedAge: 0 }
];

const initialState: FormState = {
  clinicianInfo: null,
  assessments: {
    type: 'initial',
    progress: 0
  },
  milestones: {
    type: 'milestoneTracker',
    milestones: initialMilestones,
    history: '',
    progress: 0
  }
};