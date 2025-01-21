export function isAssessment(data) {
    return (data &&
        typeof data.id === 'string' &&
        typeof data.name === 'string' &&
        (data.date === undefined || typeof data.date === 'string') &&
        (data.notes === undefined || typeof data.notes === 'string') &&
        (data.status === undefined || ['pending', 'completed', 'scheduled'].includes(data.status)) &&
        typeof data.color === 'string' &&
        typeof data.category === 'string');
}
export function isAssessmentLogData(data) {
    return (data &&
        data.type === 'assessmentLog' &&
        Array.isArray(data.selectedAssessments) &&
        data.selectedAssessments.every(isAssessment) &&
        typeof data.entries === 'object' &&
        Object.values(data.entries).every(isAssessment) &&
        typeof data.progress === 'number' &&
        typeof data.isComplete === 'boolean');
}
