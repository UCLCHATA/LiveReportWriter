import { Milestone } from './types';

export const defaultMilestones: Milestone[] = [
  {
    id: 'social_smile',
    domain: 'Social Communication',
    description: 'Social smile in response to caregiver',
    expectedAgeRange: { min: 1, max: 3 },
    source: 'parent',
    status: 'achieved',
    notes: 'Consistently smiles at parents and familiar caregivers'
  },
  {
    id: 'joint_attention',
    domain: 'Social Communication',
    description: 'Shows joint attention',
    expectedAgeRange: { min: 9, max: 14 },
    source: 'clinician',
    status: 'partial',
    notes: 'Occasionally follows pointing but inconsistent'
  },
  {
    id: 'gross_motor_walk',
    domain: 'Motor Skills',
    description: 'Independent walking',
    expectedAgeRange: { min: 12, max: 18 },
    source: 'clinician',
    status: 'not_achieved'
  },
  {
    id: 'first_words',
    domain: 'Language & Speech',
    description: 'First meaningful words',
    expectedAgeRange: { min: 12, max: 16 },
    source: 'parent',
    status: 'not_achieved'
  }
]; 