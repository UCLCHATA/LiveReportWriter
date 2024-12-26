import React, { useEffect, useRef, useState } from 'react';
import { Timeline, DataSet } from 'vis-timeline/standalone';
import 'vis-timeline/styles/vis-timeline-graph2d.css';
import { DevelopmentalDomain, Milestone, TimelineItem } from './types';
import { MilestoneService } from './services/milestoneService';
import { defaultMilestones } from './defaultMilestones';
import './MilestoneTracker.css';

interface MilestoneTrackerProps {
  gsheetId?: string;
  onMilestoneUpdate?: (milestone: Milestone) => void;
  onMilestoneAdd?: (milestone: Milestone) => void;
}

const MilestoneTracker: React.FC<MilestoneTrackerProps> = ({
  gsheetId,
  onMilestoneUpdate,
  onMilestoneAdd,
}) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [timeline, setTimeline] = useState<Timeline | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<DevelopmentalDomain | 'all'>('all');
  const [items, setItems] = useState<DataSet<TimelineItem>>(new DataSet());
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const milestoneService = MilestoneService.getInstance();

  useEffect(() => {
    if (gsheetId) {
      milestoneService.setGSheetId(gsheetId);
    }
    loadMilestones();
  }, [gsheetId]);

  const loadMilestones = async () => {
    try {
      let loadedMilestones = await milestoneService.loadAll();
      if (loadedMilestones.length === 0) {
        loadedMilestones = defaultMilestones;
        await milestoneService.saveAll(defaultMilestones);
      }
      setMilestones(loadedMilestones);
    } catch (error) {
      console.error('Error loading milestones:', error);
      setMilestones(defaultMilestones);
    }
  };

  const [groups] = useState(new DataSet([
    { id: 'Social Communication', content: 'Social Communication' },
    { id: 'Motor Skills', content: 'Motor Skills' },
    { id: 'Language & Speech', content: 'Language & Speech' },
    { id: 'Play & Social Interaction', content: 'Play & Social Interaction' },
    { id: 'Adaptive Skills', content: 'Adaptive Skills' },
    { id: 'Sensory Processing', content: 'Sensory Processing' },
  ]));

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

      newTimeline.on('select', (properties) => {
        const selectedItem = items.get(properties.items[0]);
        if (selectedItem) {
          setSelectedMilestone(selectedItem.milestone);
        }
      });

      newTimeline.on('drop', handleMilestoneDrop);
      newTimeline.on('update', handleMilestoneUpdate);
    }
  }, [timelineRef.current]);

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

  const handleMilestoneUpdate = async (event: any) => {
    const updatedMilestone = { ...event.milestone };
    const updatedMilestones = milestones.map(m => 
      m.id === updatedMilestone.id ? updatedMilestone : m
    );
    
    setMilestones(updatedMilestones);
    await milestoneService.saveAll(updatedMilestones);
    onMilestoneUpdate?.(updatedMilestone);
  };

  const handleMilestoneDrop = async (event: any) => {
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

      const updatedMilestones = [...milestones, newMilestone];
      setMilestones(updatedMilestones);
      await milestoneService.saveAll(updatedMilestones);
      onMilestoneAdd?.(newMilestone);
    }
  };

  const exportData = async () => {
    const exportedData = milestones.map(milestone => ({
      ...milestone,
      exportDate: new Date().toISOString(),
    }));
    
    // Save to Google Sheets if configured
    if (gsheetId) {
      await milestoneService.saveToGSheets(exportedData);
    }
    
    // Also provide local download
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
      
      {selectedMilestone && (
        <div className="milestone-details">
          <h3>{selectedMilestone.description}</h3>
          <div className="milestone-info">
            <div>
              <label>Expected Age Range</label>
              <p>{selectedMilestone.expectedAgeRange.min} - {selectedMilestone.expectedAgeRange.max} months</p>
            </div>
            <div>
              <label>Status</label>
              <p>{selectedMilestone.status}</p>
            </div>
            <div>
              <label>Source</label>
              <p>{selectedMilestone.source}</p>
            </div>
          </div>
          <textarea
            value={selectedMilestone.notes || ''}
            onChange={(e) => handleMilestoneUpdate({
              milestone: {
                ...selectedMilestone,
                notes: e.target.value
              }
            })}
            placeholder="Add clinical notes..."
          />
        </div>
      )}
    </div>
  );
};

export default MilestoneTracker; 