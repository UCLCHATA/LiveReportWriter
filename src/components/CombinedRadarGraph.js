import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';
import styles from './CombinedRadarGraph.module.css';
export const CombinedRadarGraph = ({ sensoryData, socialData, behaviorData }) => {
    const processData = () => {
        const allDomains = new Set();
        const dataPoints = {};
        // Process sensory domains
        if (sensoryData?.domains) {
            Object.entries(sensoryData.domains).forEach(([key, data]) => {
                const domain = data.name || key;
                allDomains.add(domain);
                if (!dataPoints[domain]) {
                    dataPoints[domain] = { domain, fullMark: 5 };
                }
                if (typeof data.value === 'number') {
                    dataPoints[domain].sensitivity = data.value;
                }
            });
        }
        // Process social domains
        if (socialData?.domains) {
            Object.entries(socialData.domains).forEach(([key, data]) => {
                const domain = data.name || key;
                allDomains.add(domain);
                if (!dataPoints[domain]) {
                    dataPoints[domain] = { domain, fullMark: 5 };
                }
                if (typeof data.value === 'number') {
                    dataPoints[domain].social = data.value;
                }
            });
        }
        // Process behavior domains
        if (behaviorData?.domains) {
            Object.entries(behaviorData.domains).forEach(([key, data]) => {
                const domain = data.name || key;
                allDomains.add(domain);
                if (!dataPoints[domain]) {
                    dataPoints[domain] = { domain, fullMark: 5 };
                }
                if (typeof data.value === 'number') {
                    dataPoints[domain].behavior = data.value;
                }
            });
        }
        // Convert to array and ensure all values are numbers
        const result = Array.from(allDomains).map(domain => ({
            ...dataPoints[domain],
            sensitivity: typeof dataPoints[domain].sensitivity === 'number' ? dataPoints[domain].sensitivity : 0,
            social: typeof dataPoints[domain].social === 'number' ? dataPoints[domain].social : 0,
            behavior: typeof dataPoints[domain].behavior === 'number' ? dataPoints[domain].behavior : 0
        }));
        return result;
    };
    const data = processData();
    // Only render if we have data to show
    if (data.length === 0) {
        return null;
    }
    return (_jsx("div", { className: styles.container, children: _jsx("div", { className: styles.graphWrapper, children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(RadarChart, { cx: "50%", cy: "50%", outerRadius: "75%", data: data, margin: { top: 15, right: 50, bottom: 15, left: 50 }, className: "combined-radar-chart", children: [_jsx(PolarGrid, { gridType: "polygon" }), _jsx(PolarAngleAxis, { dataKey: "domain", tick: ({ x, y, payload, index, cx, cy }) => {
                                const dx = x - cx;
                                const dy = y - cy;
                                const theta = Math.atan2(dy, dx);
                                const deg = theta * 180 / Math.PI;
                                const isVertical = Math.abs(Math.abs(deg) - 90) < 10 || Math.abs(Math.abs(deg) - 270) < 10;
                                if (isVertical) {
                                    const isVisualLabel = payload.value === "Visual";
                                    const isTop = isVisualLabel ? true : Math.abs(Math.abs(deg) - 270) < 10;
                                    return (_jsx("text", { x: x, y: isTop ? y - 25 : y + 25, fill: index % 2 === 0 ? '#1f2937' : '#4b5563', textAnchor: "middle", fontSize: 12, dominantBaseline: isTop ? "bottom" : "top", style: { userSelect: 'none' }, children: payload.value }));
                                }
                                const isRightSide = x > cx;
                                const xOffset = isRightSide ? 10 : -10;
                                return (_jsx("text", { x: x + xOffset, y: y, fill: index % 2 === 0 ? '#1f2937' : '#4b5563', textAnchor: isRightSide ? 'start' : 'end', fontSize: 12, dominantBaseline: "middle", style: { userSelect: 'none' }, children: payload.value }));
                            } }), _jsx(PolarRadiusAxis, { angle: 30, domain: [0, 5], tickCount: 6, tick: { fill: '#4b5563', fontSize: 12 }, allowDataOverflow: false, scale: "linear" }), _jsx(Radar, { name: "Behavior & Interests", dataKey: "behavior", stroke: behaviorData ? '#f59e0b' : 'transparent', fill: behaviorData ? '#f59e0b' : 'transparent', fillOpacity: 0.2 }), _jsx(Radar, { name: "Social Communication", dataKey: "social", stroke: socialData ? '#10b981' : 'transparent', fill: socialData ? '#10b981' : 'transparent', fillOpacity: 0.2 }), _jsx(Radar, { name: "Sensory Profile", dataKey: "sensitivity", stroke: sensoryData ? '#be185d' : 'transparent', fill: sensoryData ? '#be185d' : 'transparent', fillOpacity: 0.2 }), _jsx(Legend, { wrapperStyle: {
                                paddingTop: '20px',
                                fontSize: '14px'
                            } })] }) }) }) }));
};
export default CombinedRadarGraph;
