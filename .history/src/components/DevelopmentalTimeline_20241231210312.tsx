import React, { useState } from 'react';
import styles from './DevelopmentalTimeline.module.css';

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
      <div className={styles.timelineGrid}>
        <div className={styles.gridContainer}>
          {months.map(month => (
            <div
              key={month}
              className={styles.monthMarker}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, month)}
            >
              {month % 12 === 0 && (
                <span className={`${styles.monthLabel} ${styles.year}`}>
                  {month / 12}y
                </span>
              )}
              {month % 6 === 0 && month % 12 !== 0 && (
                <span className={styles.monthLabel}>
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
    <div className={styles.milestoneDetails}>
      <h4 className={styles.detailsTitle}>{milestone.milestone}</h4>
      <div className={styles.detailsContent}>
        <p><span className={styles.detailsLabel}>Expected:</span> {milestone.expectedAge} months</p>
        {milestone.actualAge !== null && (
          <p><span className={styles.detailsLabel}>Observed:</span> {milestone.actualAge} months</p>
        )}
        <p><span className={styles.detailsLabel}>Significance:</span> {milestone.significance}</p>
        <p><span className={styles.detailsLabel}>Clinical Impact:</span> {milestone.impact}</p>
        <p>
          <span className={styles.detailsLabel}>Status: </span>
          <span className={`${styles.status} ${styles[getMilestoneStatus(milestone)]}`}>
            {getMilestoneStatus(milestone)}
          </span>
        </p>
      </div>
    </div>
  );

  return (
    <div className={styles.timeline}>
      {Object.entries(milestones).map(([category, items]) => (
        <div key={category} className={styles.milestoneContainer}>
          <h3 className={styles.categoryTitle}>
            {category.replace(/([A-Z])/g, ' $1').trim()}
          </h3>
          {items.map(milestone => (
            <div
              key={milestone.id}
              className={styles.milestone}
              draggable
              onDragStart={(e) => handleDragStart(e, category, milestone.id)}
              onClick={() => {
                setSelectedMilestone(milestone);
                setShowDetails(true);
              }}
            >
              <span className={styles.milestoneTitle}>{milestone.milestone}</span>
              {milestone.actualAge !== null && (
                <span className={`${styles.status} ${styles[getMilestoneStatus(milestone)]}`}>
                  {milestone.actualAge}m
                </span>
              )}
            </div>
          ))}
          {selectedMilestone?.category === category && showDetails && (
            <MilestoneDetails milestone={selectedMilestone} />
          )}
        </div>
      ))}
      <TimelineGrid />
    </div>
  );
}; 