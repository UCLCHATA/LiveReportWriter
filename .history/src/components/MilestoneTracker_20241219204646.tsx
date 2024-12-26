import React, { useEffect, useRef, useState } from 'react';
import { Timeline, DataSet } from 'vis-timeline/standalone';
import 'vis-timeline/styles/vis-timeline-graph2d.css';
import { DevelopmentalDomain, Milestone, TimelineItem } from './types';
import './MilestoneTracker.css';

interface MilestoneTrackerProps {
  milestones: Milestone[];
  onMilestoneUpdate: (milestone: Milestone) => void;
  onMilestoneAdd: (milestone: Milestone) => void;
}

const MilestoneTracker: React.FC<MilestoneTrackerProps> = ({
  milestones,
  onMilestoneUpdate,
  onMilestoneAdd,
}) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [timeline, setTimeline] = useState<Timeline | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<DevelopmentalDomain | 'all'>('all');
  const [items, setItems] = useState<DataSet<TimelineItem>>(new DataSet());
  const [groups] = useState(new DataSet([
    { id: 'Social Communication', content: 'Social Communication' },
    { id: 'Motor Skills', content: 'Motor Skills' },
    { id: 'Language & Speech', content: 'Language & Speech' },
    { id: 'Play & Social Interaction', content: 'Play & Social Interaction' },
    { id: 'Adaptive Skills', content: 'Adaptive Skills' },
    { id: 'Sensory Processing', content: 'Sensory Processing' },
  ]));

  // Initialize timeline
  useEffect(() => {
    if (timelineRef.current && !timeline) {
      const options = {
        height: '600px',
        min: new Date(2020, 0, 1),
        max: new Date(2025, 0, 1),
        editable: {
          add: true,
          updateTime: true,
          updateGroup: true,
          remove: true,
        },
        groupOrder: 'content',
        tooltip: {
          followMouse: true,
          overflowMethod: 'cap',
        },
      };

      const newTimeline = new Timeline(timelineRef.current, items, groups, options);
      setTimeline(newTimeline);

      // Event handlers
      newTimeline.on('select', (properties) => {
        const selectedItem = items.get(properties.items[0]);
        if (selectedItem) {
          handleMilestoneClick(selectedItem);
        }
      });

      newTimeline.on('drop', (event) => {
        handleMilestoneDrop(event);
      });
    }
  }, [timelineRef.current]);

  // Update items when milestones change
  useEffect(() => {
    const timelineItems = milestones
      .filter((milestone) => 
        selectedDomain === 'all' || milestone.domain === selectedDomain
      )
      .map((milestone) => convertMilestoneToTimelineItem(milestone));
    
    items.clear();
    items.add(timelineItems);
  }, [milestones, selectedDomain]);

  const convertMilestoneToTimelineItem = (milestone: Milestone): TimelineItem => {
    const start = new Date();
    start.setMonth(start.getMonth() + milestone.expectedAgeRange.min);
    
    const end = new Date();
    end.setMonth(end.getMonth() + milestone.expectedAgeRange.max);

    return {
      id: milestone.id,
      content: milestone.description,
      start,
      end,
      type: 'range',
      group: milestone.domain,
      className: `milestone-${milestone.status}`,
      title: generateTooltipContent(milestone),
      milestone,
    };
  };

  const generateTooltipContent = (milestone: Milestone): string => {
    return `
      <div class="milestone-tooltip">
        <h4>${milestone.description}</h4>
        <p>Expected: ${milestone.expectedAgeRange.min}-${milestone.expectedAgeRange.max} months</p>
        ${milestone.actualAge ? `<p>Actual: ${milestone.actualAge} months</p>` : ''}
        <p>Status: ${milestone.status}</p>
        <p>Source: ${milestone.source}</p>
        ${milestone.notes ? `<p>Notes: ${milestone.notes}</p>` : ''}
      </div>
    `;
  };

  const handleMilestoneClick = (item: TimelineItem) => {
    // Implement modal or side panel for editing milestone details
    const updatedMilestone = { ...item.milestone };
    onMilestoneUpdate(updatedMilestone);
  };

  const handleMilestoneDrop = (event: any) => {
    const { group, time } = event;
    if (group && time) {
      const newMilestone: Milestone = {
        id: `milestone-${Date.now()}`,
        domain: group as DevelopmentalDomain,
        description: 'New Milestone',
        expectedAgeRange: {
          min: 0,
          max: 12,
        },
        source: 'clinician',
        status: 'not_achieved',
      };
      onMilestoneAdd(newMilestone);
    }
  };

  const exportData = () => {
    const exportedData = milestones.map(milestone => ({
      ...milestone,
      exportDate: new Date().toISOString(),
    }));
    const blob = new Blob([JSON.stringify(exportedData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'milestones-export.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="milestone-tracker">
      <div className="controls">
        <select 
          value={selectedDomain} 
          onChange={(e) => setSelectedDomain(e.target.value as DevelopmentalDomain | 'all')}
        >
          <option value="all">All Domains</option>
          {groups.get().map((group: any) => (
            <option key={group.id} value={group.id}>
              {group.content}
            </option>
          ))}
        </select>
        <button onClick={exportData}>Export Data</button>
      </div>
      <div ref={timelineRef} className="timeline-container" />
    </div>
  );
};

export default MilestoneTracker; 