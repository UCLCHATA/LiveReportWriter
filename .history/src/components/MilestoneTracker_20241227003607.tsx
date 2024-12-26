import React, { useState } from 'react';
import './MilestoneTracker.css';

export const MilestoneTracker: React.FC = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <>
            <div className={`milestone-tracker ${isCollapsed ? 'collapsed' : ''}`}>
                <div id="milestone-timeline">
                    {/* Timeline content will be added here */}
                </div>
            </div>
            <button 
                className="milestone-toggle"
                onClick={() => setIsCollapsed(!isCollapsed)}
                aria-label={isCollapsed ? 'Expand' : 'Collapse'}
            >
                {isCollapsed ? '→' : '←'}
            </button>
        </>
    );
};

export default MilestoneTracker; 