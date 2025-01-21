import React, { useEffect, useRef } from 'react';
import { Timeline } from 'vis-timeline/standalone';
import 'vis-timeline/styles/vis-timeline-graph2d.css';
import { Milestone } from './types';

interface MilestoneTrackerProps {
  milestones: Milestone[];
  onMilestoneUpdate: (milestone: Milestone) => void;
}

const MilestoneTracker: React.FC<MilestoneTrackerProps> = ({ milestones, onMilestoneUpdate }) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const timelineInstance = useRef<Timeline | null>(null);

  useEffect(() => {
    if (timelineRef.current && !timelineInstance.current) {
      const container = timelineRef.current;
      const items = milestones.map(milestone => ({
        id: milestone.id,
        content: milestone.description,
        start: milestone.date,
        type: 'point',
        className: milestone.status === 'completed' ? 'completed-milestone' : 'pending-milestone'
      }));

      const options = {
        height: '100%',
        min: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
        max: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        zoomMin: 1000 * 60 * 60 * 24 * 7, // One week
        zoomMax: 1000 * 60 * 60 * 24 * 365, // One year
        editable: {
          updateTime: true,
          remove: false,
          overrideItems: false
        }
      };

      timelineInstance.current = new Timeline(container, items, options);

      timelineInstance.current.on('select', (properties) => {
        const selectedId = properties.items[0];
        const selectedMilestone = milestones.find(m => m.id === selectedId);
        if (selectedMilestone) {
          onMilestoneUpdate(selectedMilestone);
        }
      });
    }

    return () => {
      if (timelineInstance.current) {
        timelineInstance.current.destroy();
        timelineInstance.current = null;
      }
    };
  }, [milestones, onMilestoneUpdate]);

  return (
    <div className="milestone-tracker">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold">Developmental Milestones</h2>
      </div>
      <div ref={timelineRef} style={{ height: 'calc(100% - 60px)' }} />
    </div>
  );
};

export default MilestoneTracker; 