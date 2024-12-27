import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface Milestone {
  id: number;
  milestone: string;
  expectedAge: number;
  actualAge: number | null;
}

type MilestoneCategory = {
  [key: string]: Milestone[];
};

export const MilestoneTracker: React.FC = () => {
  const [milestones, setMilestones] = useState<MilestoneCategory>({
    communication: [
      { id: 1, milestone: "First words", expectedAge: 12, actualAge: null },
      { id: 2, milestone: "Two-word phrases", expectedAge: 24, actualAge: null },
      { id: 3, milestone: "Complex sentences", expectedAge: 36, actualAge: null }
    ],
    motor: [
      { id: 4, milestone: "Rolling over", expectedAge: 6, actualAge: null },
      { id: 5, milestone: "Crawling", expectedAge: 9, actualAge: null },
      { id: 6, milestone: "Walking independently", expectedAge: 12, actualAge: null }
    ],
    social: [
      { id: 7, milestone: "Social smile", expectedAge: 2, actualAge: null },
      { id: 8, milestone: "Stranger anxiety", expectedAge: 8, actualAge: null },
      { id: 9, milestone: "Parallel play", expectedAge: 24, actualAge: null }
    ]
  });

  const handleDragStart = (e: React.DragEvent, category: string, id: number) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ category, id }));
  };

  const handleDrop = (e: React.DragEvent, monthPoint: number) => {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
    const { category, id } = data;
    
    setMilestones(prev => ({
      ...prev,
      [category]: prev[category].map(m => 
        m.id === id ? { ...m, actualAge: monthPoint } : m
      )
    }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const TimelineGrid: React.FC = () => {
    const months = Array.from({ length: 48 }, (_, i) => i);
    
    return (
      <div className="timeline-grid">
        <div className="timeline-months">
          {months.map(month => (
            <div
              key={month}
              className="timeline-month"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, month)}
            >
              {month % 12 === 0 && (
                <span className="year-marker">
                  {month / 12}y
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="milestone-tracker-container">
      <div className="milestone-header">
        <h3>Development Timeline</h3>
        <HelpCircle className="help-icon" size={16} />
      </div>
      <div className="milestone-content">
        {Object.entries(milestones).map(([category, categoryMilestones]) => (
          <div key={category} className="milestone-category">
            <h4 className="category-title">{category}</h4>
            <div className="milestones-list">
              {categoryMilestones.map(milestone => (
                <div
                  key={milestone.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, category, milestone.id)}
                  className={`milestone-item ${milestone.actualAge !== null ? 'milestone-placed' : ''}`}
                >
                  {milestone.milestone}
                  {milestone.actualAge !== null && ` (${milestone.actualAge}m)`}
                </div>
              ))}
            </div>
            <TimelineGrid />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MilestoneTracker; 