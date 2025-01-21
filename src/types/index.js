// Type guards
export const isMilestone = (obj) => {
    return obj && typeof obj === 'object' && 'id' in obj && 'category' in obj;
};
export const isMilestoneTrackerData = (obj) => {
    return obj && typeof obj === 'object' && obj.type === 'milestoneTracker';
};
export const isAssessmentEntry = (obj) => {
    return obj && typeof obj === 'object' && 'id' in obj && 'name' in obj;
};
export const isAssessmentLogData = (obj) => {
    return obj && typeof obj === 'object' && obj.type === 'assessmentLog';
};
