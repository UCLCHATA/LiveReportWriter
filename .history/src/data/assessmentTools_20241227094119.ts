export const icfCategories = {
  body_functions: [
    'b122 Global psychosocial functions',
    'b140 Attention functions',
    'b147 Psychomotor functions',
    'b152 Emotional functions',
    'b164 Higher-level cognitive functions',
    'b167 Language functions'
  ],
  activities_participation: [
    'd310-d329 Communication - receiving',
    'd330-d349 Communication - producing',
    'd710 Basic interpersonal interactions',
    'd720 Complex interpersonal interactions',
    'd880 Engagement in play'
  ],
  environmental_factors: [
    'e310 Immediate family',
    'e355 Health professionals',
    'e425 Attitudes of acquaintances',
    'e585 Education and training services'
  ]
};

export const assessmentTools = {
  core_diagnostic: [
    {
      id: 'ados2',
      name: 'ADOS-2',
      fullName: 'Autism Diagnostic Observation Schedule',
      icfDomains: ['b122', 'd710', 'd720', 'd880'],
      modules: ['T', '1', '2', '3', '4'],
      timeNeeded: '40-60min'
    },
    // ... other core diagnostic tools
  ],
  // ... other categories
};

export type AssessmentTool = {
  id: string;
  name: string;
  fullName: string;
  icfDomains: string[];
  modules?: string[];
  versions?: string[];
  timeNeeded: string;
};

export type CompletedAssessment = AssessmentTool & {
  date: string;
  module?: string;
  version?: string;
  clinician?: string;
  notes?: string;
}; 