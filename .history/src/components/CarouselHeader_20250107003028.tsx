import React from 'react';
import { HelpCircle, CheckCircle2 } from 'lucide-react';
import styles from './CarouselHeader.module.css';

interface Tool {
  id: string;
  title: string;
  description: string;
}

interface CompletionState {
  isComplete: boolean;
  isSkipped: boolean;
  progress: number;
  autoDetected: boolean;
}

interface CarouselHeaderProps {
  tools: Tool[];
  currentIndex: number;
  completionStates: Record<string, CompletionState>;
  onIndicatorClick: (index: number) => void;
}

const getTooltipContent = (title: string): string => {
  switch (title) {
    case 'Sensory Profile':
      return '• Visual, auditory, tactile processing\n• Vestibular and proprioceptive responses\n• Oral sensitivities\n• Sensory seeking/avoiding behaviors';
    case 'Social Communication':
      return '• Joint attention and engagement\n• Verbal/non-verbal communication\n• Social understanding and reciprocity\n• Play skills and peer interactions';
    case 'Behavior & Interests':
      return '• Repetitive behaviors and routines\n• Special interests and fixations\n• Flexibility and transitions\n• Self-regulation abilities';
    case 'Milestone Tracker':
      return '• Motor development\n• Language milestones\n• Social-emotional growth\n• Cognitive development';
    case 'Assessment Log':
      return '• Session observations\n• Progress tracking\n• Assessment notes\n• Development monitoring';
    default:
      return '';
  }
};

const getComponentIcon = (componentId: string): string => {
  switch (componentId) {
    case 'sensoryProfile':
      return '/assets/sensory.png';
    case 'socialCommunication':
      return '/assets/Social.png';
    case 'behaviorInterests':
      return '/assets/behavior icon.png';
    case 'milestones':
      return '/assets/development icon.png';
    case 'assessmentLog':
      return '/assets/assessment icon.png';
    default:
      return '';
  }
};

export const CarouselHeader: React.FC<CarouselHeaderProps> = ({
  tools,
  currentIndex,
  completionStates,
  onIndicatorClick
}) => {
  const currentTool = tools[currentIndex];

  return (
    <div className={styles.header}>
      <div className={styles.titleSection}>
        <h2 className={styles.title}>
          <img
            src={getComponentIcon(currentTool.id)}
            alt={currentTool.title}
            className={styles.icon}
          />
          {currentTool.title}
          <button className={styles.tooltipButton}>
            <HelpCircle size={16} />
            <div className={styles.tooltip}>
              {getTooltipContent(currentTool.title)}
            </div>
          </button>
        </h2>
      </div>

      <div className={styles.navigation}>
        <div className={styles.completionStatus}>
          {completionStates[currentTool.id]?.isComplete && (
            <div className={styles.completionBadge}>
              <CheckCircle2 size={16} />
              <span>Complete</span>
            </div>
          )}
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{
                width: `${completionStates[currentTool.id]?.progress || 0}%`
              }}
            />
          </div>
        </div>

        <div className={styles.indicators}>
          {tools.map((tool, index) => (
            <button
              key={tool.id}
              className={`${styles.indicator} ${
                index === currentIndex ? styles.active : ''
              } ${completionStates[tool.id]?.isComplete ? styles.complete : ''}`}
              onClick={() => onIndicatorClick(index)}
              title={tool.title}
            />
          ))}
        </div>
      </div>
    </div>
  );
}; 