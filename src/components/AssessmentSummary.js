import { jsx as _jsx } from "react/jsx-runtime";
import { CombinedRadarGraph } from './CombinedRadarGraph';
import styles from './AssessmentSummary.module.css';
export const AssessmentSummary = ({ data, onChange }) => {
    return (_jsx("div", { className: styles.container, children: _jsx(CombinedRadarGraph, { sensoryData: data?.sensoryProfile, socialData: data?.socialCommunication, behaviorData: data?.behaviorInterests }) }));
};
export default AssessmentSummary;
