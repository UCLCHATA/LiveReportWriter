import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Timeline, DataSet } from 'vis-timeline/standalone';
import 'vis-timeline/styles/vis-timeline-graph2d.css';
import { DevelopmentalDomain, Milestone, TimelineItem } from './types';
import { MilestoneService } from './services/milestoneService';
import { defaultMilestones } from './defaultMilestones';
import { MilestoneReport, MilestoneTrackerState } from './types/milestoneTypes';
import './MilestoneTracker.css';

interface MilestoneTrackerProps {
  gsheetId?: string;
  onMilestoneUpdate?: (milestone: Milestone) => void;
  onMilestoneAdd?: (milestone: Milestone) => void;
  onReportGenerate?: (report: MilestoneReport) => void;
  onError?: (error: Error) => void;
  formKey?: string; // Used to trigger reset when form is cleared
}

const MilestoneTracker: React.FC<MilestoneTrackerProps> = ({
  gsheetId,
  onMilestoneUpdate,
  onMilestoneAdd,
  onReportGenerate,
  onError,
  formKey,
}) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [timeline, setTimeline] = useState<Timeline | null>(null);
  const [state, setState] = useState<MilestoneTrackerState>({
    milestones: [],
    selectedMilestone: null,
    selectedDomain: 'all',
    isLoading: true,
    error: null,
  });
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [detailsExpanded, setDetailsExpanded] = useState(true);
  const [items, setItems] = useState<DataSet<TimelineItem>>(new DataSet());
  const milestoneService = MilestoneService.getInstance();

  // Reset component when form is cleared
  useEffect(() => {
    const handleFormClear = () => {
      resetComponent();
    };

    // Listen for form clear event from parent
    window.addEventListener('formClear', handleFormClear);
    
    // Also handle formKey changes
    if (formKey) {
      handleFormClear();
    }

    return () => {
      window.removeEventListener('formClear', handleFormClear);
    };
  }, [formKey]);

  const resetComponent = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      await milestoneService.clearAll(); // Clear stored data
      await milestoneService.saveAll(defaultMilestones);
      setState(prev => ({
        ...prev,
        milestones: defaultMilestones,
        selectedMilestone: null,
        selectedDomain: 'all',
        isLoading: false,
      }));

      // Clear timeline items
      items.clear();
      items.add(defaultMilestones.map(convertMilestoneToTimelineItem));

      // Save to localStorage to match existing pattern
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultMilestones));
      
      // Emit report with default state
      if (onReportGenerate) {
        const report = generateReport();
        onReportGenerate(report);
      }
    } catch (error) {
      handleError(error as Error);
    }
  }, []);

  useEffect(() => {
    if (gsheetId) {
      milestoneService.setGSheetId(gsheetId);
    }
    loadMilestones();
  }, [gsheetId]);

  const loadMilestones = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      let loadedMilestones = await milestoneService.loadAll();
      if (loadedMilestones.length === 0) {
        loadedMilestones = defaultMilestones;
        await milestoneService.saveAll(defaultMilestones);
      }
      setState(prev => ({
        ...prev,
        milestones: loadedMilestones,
        isLoading: false,
      }));
    } catch (error) {
      handleError(error as Error);
    }
  };

  const handleError = (error: Error) => {
    setState(prev => ({
      ...prev,
      error: error.message,
      isLoading: false,
    }));
    onError?.(error);
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
          setState(prev => ({
            ...prev,
            selectedMilestone: selectedItem.milestone,
          }));
        }
      });

      newTimeline.on('drop', handleMilestoneDrop);
      newTimeline.on('update', handleMilestoneUpdate);
    }
  }, [timelineRef.current]);

  useEffect(() => {
    const timelineItems = state.milestones
      .filter((milestone) => 
        state.selectedDomain === 'all' || milestone.domain === state.selectedDomain
      )
      .map((milestone) => convertMilestoneToTimelineItem(milestone));
    
    items.clear();
    items.add(timelineItems);
  }, [state.milestones, state.selectedDomain]);

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
    try {
      const updatedMilestone = { ...event.milestone };
      const updatedMilestones = state.milestones.map(m => 
        m.id === updatedMilestone.id ? updatedMilestone : m
      );
      
      setState(prev => ({
        ...prev,
        milestones: updatedMilestones,
        selectedMilestone: updatedMilestone,
      }));

      await milestoneService.saveAll(updatedMilestones);
      onMilestoneUpdate?.(updatedMilestone);
      
      // Generate and emit report after update
      const report = generateReport();
      onReportGenerate?.(report);
    } catch (error) {
      handleError(error as Error);
    }
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

      const updatedMilestones = [...state.milestones, newMilestone];
      setState(prev => ({
        ...prev,
        milestones: updatedMilestones,
        selectedMilestone: newMilestone,
      }));
      await milestoneService.saveAll(updatedMilestones);
      onMilestoneAdd?.(newMilestone);
    }
  };

  const exportData = async () => {
    const exportedData = state.milestones.map(milestone => ({
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

  const generateReport = useCallback((): MilestoneReport => {
    const { milestones } = state;
    const report: MilestoneReport = {
      overallProgress: {
        achievedCount: milestones.filter(m => m.status === 'achieved').length,
        partialCount: milestones.filter(m => m.status === 'partial').length,
        notAchievedCount: milestones.filter(m => m.status === 'not_achieved').length,
        totalCount: milestones.length,
      },
      domainAnalysis: {} as Record<DevelopmentalDomain, any>,
      clinicalImplications: [],
      recommendations: [],
      assessmentDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };

    // Generate domain analysis
    const domains = [...new Set(milestones.map(m => m.domain))] as DevelopmentalDomain[];
    domains.forEach(domain => {
      const domainMilestones = milestones.filter(m => m.domain === domain);
      const achieved = domainMilestones.filter(m => m.status === 'achieved').length;
      
      report.domainAnalysis[domain] = {
        milestones: domainMilestones,
        summary: generateDomainSummary(domainMilestones),
        concerns: generateDomainConcerns(domainMilestones),
        progressPercentage: (achieved / domainMilestones.length) * 100,
      };
    });

    return report;
  }, [state.milestones]);

  const generateDomainSummary = (milestones: Milestone[]): string => {
    const achieved = milestones.filter(m => m.status === 'achieved').length;
    const total = milestones.length;
    return `${achieved}/${total} milestones achieved (${Math.round((achieved/total) * 100)}%)`;
  };

  const generateDomainConcerns = (milestones: Milestone[]): string[] => {
    return milestones
      .filter(m => m.status === 'not_achieved' && m.notes)
      .map(m => `${m.description}: ${m.notes}`);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    if (timeline) {
      setTimeout(() => {
        timeline.redraw();
      }, 300);
    }
  };

  if (state.error) {
    return (
      <div className="milestone-tracker-error">
        <h3>Error Loading Milestones</h3>
        <p>{state.error}</p>
        <button onClick={loadMilestones}>Retry</button>
      </div>
    );
  }

  if (state.isLoading) {
    return (
      <div className="milestone-tracker-loading">
        <div className="spinner"></div>
        <p>Loading milestones...</p>
      </div>
    );
  }

  return (
    <div className={`milestone-tracker ${isCollapsed ? 'collapsed' : ''}`}>
      <button 
        className="milestone-collapse-toggle"
        onClick={toggleCollapse}
        title={isCollapsed ? 'Expand' : 'Collapse'}
      >
        {isCollapsed ? '→' : '←'}
      </button>

      <div className="milestone-header">
        <h2 className="text-lg font-medium">Developmental Milestones</h2>
      </div>

      <div className="controls">
        <select 
          value={state.selectedDomain} 
          onChange={(e) => setState(prev => ({
            ...prev,
            selectedDomain: e.target.value as DevelopmentalDomain | 'all'
          }))}
        >
          <option value="all">All Domains</option>
          {groups.get().map((group: any) => (
            <option key={group.id} value={group.id}>
              {group.content}
            </option>
          ))}
        </select>
        <button onClick={exportData}>Export</button>
        <button onClick={resetComponent}>Reset</button>
      </div>

      <div className="timeline-section">
        <div ref={timelineRef} className="timeline-container" />
      </div>

      {state.selectedMilestone && (
        <div className={`milestone-details ${detailsExpanded ? '' : 'collapsed'}`}>
          <div 
            className="collapsible-header"
            onClick={() => setDetailsExpanded(!detailsExpanded)}
          >
            <h3 className="text-base font-medium">
              {state.selectedMilestone.description}
            </h3>
            <span>{detailsExpanded ? '▼' : '▲'}</span>
          </div>

          <div className={`collapsible-content ${detailsExpanded ? 'expanded' : ''}`}>
            <div className="milestone-info">
              <div>
                <label>Expected Age Range</label>
                <p>
                  {state.selectedMilestone.expectedAgeRange.min} - {state.selectedMilestone.expectedAgeRange.max} months
                </p>
              </div>
              <div>
                <label>Status</label>
                <select
                  value={state.selectedMilestone.status}
                  onChange={(e) => handleMilestoneUpdate({
                    milestone: {
                      ...state.selectedMilestone,
                      status: e.target.value as Milestone['status']
                    }
                  })}
                >
                  <option value="achieved">Achieved</option>
                  <option value="partial">Partial</option>
                  <option value="not_achieved">Not Achieved</option>
                </select>
              </div>
              <div>
                <label>Source</label>
                <select
                  value={state.selectedMilestone.source}
                  onChange={(e) => handleMilestoneUpdate({
                    milestone: {
                      ...state.selectedMilestone,
                      source: e.target.value as Milestone['source']
                    }
                  })}
                >
                  <option value="parent">Parent</option>
                  <option value="clinician">Clinician</option>
                  <option value="teacher">Teacher</option>
                  <option value="records">Records</option>
                </select>
              </div>
            </div>
            <textarea
              value={state.selectedMilestone.notes || ''}
              onChange={(e) => handleMilestoneUpdate({
                milestone: {
                  ...state.selectedMilestone,
                  notes: e.target.value
                }
              })}
              placeholder="Add clinical notes..."
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MilestoneTracker; 