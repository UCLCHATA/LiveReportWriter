import React, { useState } from 'react';

interface Milestone {
  id: number;
  milestone: string;
  expectedAge: number;
  actualAge: number | null;
  significance: string;
  impact: string;
  category: string;
}

interface MilestoneCategory {
  [key: string]: Milestone[];
}

export const DevelopmentalTimeline: React.FC = () => {
  const [milestones, setMilestones] = useState<MilestoneCategory>({
    communication: [
      {
        id: 1,
        milestone: "Babbling",
        expectedAge: 6,
        actualAge: null,
        significance: "Early vocal development",
        impact: "Foundation for verbal communication",
        category: "communication"
      },
      {
        id: 2,
        milestone: "First words",
        expectedAge: 12,
        actualAge: null,
        significance: "Verbal language emergence",
        impact: "Beginning of expressive language",
        category: "communication"
      },
      {
        id: 3,
        milestone: "Two-word phrases",
        expectedAge: 24,
        actualAge: null,
        significance: "Sentence formation",
        impact: "Complex thought expression",
        category: "communication"
      },
      {
        id: 4,
        milestone: "Complex sentences",
        expectedAge: 36,
        actualAge: null,
        significance: "Advanced language",
        impact: "Full communication ability",
        category: "communication"
      }
    ],
    socialEmotional: [
      {
        id: 5,
        milestone: "Social smile",
        expectedAge: 2,
        actualAge: null,
        significance: "Social engagement",
        impact: "Early social connection",
        category: "socialEmotional"
      },
      {
        id: 6,
        milestone: "Joint attention",
        expectedAge: 9,
        actualAge: null,
        significance: "Shared focus",
        impact: "Social learning foundation",
        category: "socialEmotional"
      },
      {
        id: 7,
        milestone: "Symbolic play",
        expectedAge: 18,
        actualAge: null,
        significance: "Imaginative capacity",
        impact: "Cognitive development",
        category: "socialEmotional"
      },
      {
        id: 8,
        milestone: "Peer interaction",
        expectedAge: 36,
        actualAge: null,
        significance: "Social relationships",
        impact: "Social skill development",
        category: "socialEmotional"
      }
    ],
    motorSkills: [
      {
        id: 9,
        milestone: "Head control",
        expectedAge: 3,
        actualAge: null,
        significance: "Core strength",
        impact: "Physical development foundation",
        category: "motorSkills"
      },
      {
        id: 10,
        milestone: "Rolling over",
        expectedAge: 6,
        actualAge: null,
        significance: "Gross motor control",
        impact: "Movement initiation",
        category: "motorSkills"
      },
      {
        id: 11,
        milestone: "Independent walking",
        expectedAge: 12,
        actualAge: null,
        significance: "Mobility",
        impact: "Environmental exploration",
        category: "motorSkills"
      },
      {
        id: 12,
        milestone: "Fine motor skills",
        expectedAge: 24,
        actualAge: null,
        significance: "Manual dexterity",
        impact: "Tool use and writing",
        category: "motorSkills"
      }
    ],
    cognitiveBehavioral: [
      {
        id: 13,
        milestone: "Object permanence",
        expectedAge: 8,
        actualAge: null,
        significance: "Memory development",
        impact: "Cognitive foundation",
        category: "cognitiveBehavioral"
      },
      {
        id: 14,
        milestone: "Following instructions",
        expectedAge: 18,
        actualAge: null,
        significance: "Comprehension",
        impact: "Learning ability",
        category: "cognitiveBehavioral"
      },
      {
        id: 15,
        milestone: "Problem solving",
        expectedAge: 30,
        actualAge: null,
        significance: "Critical thinking",
        impact: "Independent functioning",
        category: "cognitiveBehavioral"
      },
      {
        id: 16,
        milestone: "Abstract thinking",
        expectedAge: 48,
        actualAge: null,
        significance: "Complex cognition",
        impact: "Advanced reasoning",
        category: "cognitiveBehavioral"
      }
    ]
  });

  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleDragStart = (e: React.DragEvent, category: string, id: number) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ category, id }));
  };

  const handleDrop = (e: React.DragEvent, monthPoint: number) => {
    e.preventDefault();
    const { category, id } = JSON.parse(e.dataTransfer.getData('text/plain'));
    
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

  const getMilestoneStatus = (milestone: Milestone) => {
    if (milestone.actualAge === null) return 'pending';
    const diff = milestone.actualAge - milestone.expectedAge;
    if (diff <= 3) return 'typical';
    if (diff <= 6) return 'monitor';
    return 'delayed';
  };

  const TimelineGrid = () => {
    const months = Array.from({ length: 48 }, (_, i) => i);
    
    return (
      <div className="relative h-16 bg-gray-100 rounded-lg mt-2">
        <div className="absolute inset-0 flex">
          {months.map(month => (
            <div
              key={month}
              className="flex-1 border-l border-gray-300 relative"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, month)}
            >
              {month % 12 === 0 && (
                <span className="absolute -bottom-6 text-xs">
                  {month / 12}y
                </span>
              )}
              {month % 6 === 0 && month % 12 !== 0 && (
                <span className="absolute -bottom-6 text-xs text-gray-500">
                  {month}m
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const MilestoneDetails = ({ milestone }: { milestone: Milestone }) => (
    <div className="milestone-details">
      <h4 className="text-sm font-semibold">{milestone.milestone}</h4>
      <div className="text-xs space-y-1">
        <p><strong>Expected:</strong> {milestone.expectedAge} months</p>
        {milestone.actualAge !== null && (
          <p><strong>Observed:</strong> {milestone.actualAge} months</p>
        )}
        <p><strong>Significance:</strong> {milestone.significance}</p>
        <p><strong>Clinical Impact:</strong> {milestone.impact}</p>
        <p><strong>Status:</strong> {getMilestoneStatus(milestone)}</p>
      </div>
    </div>
  );

  const generateClinicalSummary = () => {
    const summary = Object.entries(milestones).map(([category, items]) => {
      const completedMilestones = items.filter(m => m.actualAge !== null);
      const delayedMilestones = completedMilestones.filter(
        m => m.actualAge! - m.expectedAge > 6
      );
      
      return {
        category,
        totalMilestones: items.length,
        completedCount: completedMilestones.length,
        delayedCount: delayedMilestones.length,
        milestones: completedMilestones.map(m => ({
          milestone: m.milestone,
          expectedAge: m.expectedAge,
          actualAge: m.actualAge,
          delay: m.actualAge! - m.expectedAge,
          significance: m.significance,
          impact: m.impact
        }))
      };
    });

    console.log('Clinical Summary for LLM:', JSON.stringify(summary, null, 2));
  };

  return (
    <div className="developmental-timeline">
      <div className="timeline-header">
        <h3 className="text-lg font-bold">Developmental Timeline</h3>
        <div className="flex gap-2">
          <button 
            className="text-sm px-3 py-1 bg-blue-100 text-blue-800 rounded-full"
            onClick={generateClinicalSummary}
          >
            Generate Summary
          </button>
          <i className="material-icons info-icon" title="Drag milestones to timeline">info</i>
        </div>
      </div>

      <div className="timeline-content">
        {Object.entries(milestones).map(([category, categoryMilestones]) => (
          <div key={category} className="category-section">
            <h4 className="category-header">
              {category.replace(/([A-Z])/g, ' $1').trim()}
            </h4>
            <div className="milestones-container">
              <div className="milestone-tags">
                {categoryMilestones.map(milestone => (
                  <div
                    key={milestone.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, category, milestone.id)}
                    onClick={() => {
                      setSelectedMilestone(milestone);
                      setShowDetails(true);
                    }}
                    className={`milestone-tag ${getMilestoneStatus(milestone)}`}
                  >
                    <span className="milestone-name">{milestone.milestone}</span>
                    {milestone.actualAge !== null && (
                      <span className="milestone-age">{milestone.actualAge}m</span>
                    )}
                  </div>
                ))}
              </div>
              <TimelineGrid />
            </div>
          </div>
        ))}
      </div>

      {showDetails && selectedMilestone && (
        <div className="milestone-details-modal">
          <MilestoneDetails milestone={selectedMilestone} />
          <button 
            className="close-button"
            onClick={() => setShowDetails(false)}
          >
            <i className="material-icons">close</i>
          </button>
        </div>
      )}
    </div>
  );
}; 