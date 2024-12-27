import React, { useState } from 'react';
import { SensoryProfileBuilder } from './SensoryProfileBuilder';
import { BehavioralAssessment } from './BehavioralAssessment';
import { HelpCircle } from 'lucide-react';

type AssessmentTool = {
  id: string;
  title: string;
  helpText?: string;
  component: React.ReactNode;
};

export const AssessmentCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const assessmentTools: AssessmentTool[] = [
    {
      id: 'sensory',
      title: 'Sensory Profile',
      helpText: `How to rate sensory responses:
1: Significantly under-responsive
2: Mildly under-responsive
3: Typical response
4: Mildly over-responsive
5: Significantly over-responsive

Add specific observations for each domain to support your ratings.
This helps track patterns and plan interventions.`,
      component: <SensoryProfileBuilder />,
    },
    {
      id: 'behavioral',
      title: 'Behavioral Assessment',
      component: <BehavioralAssessment />,
    },
  ];

  const nextTool = () => {
    setCurrentIndex((prev) => 
      prev === assessmentTools.length - 1 ? 0 : prev + 1
    );
  };

  const previousTool = () => {
    setCurrentIndex((prev) => 
      prev === 0 ? assessmentTools.length - 1 : prev - 1
    );
  };

  const goToTool = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="assessment-carousel">
      <div className="carousel-navigation">
        <button onClick={previousTool} className="nav-button">
          ←
        </button>
        <div className="title-container">
          <span className="tool-title">{assessmentTools[currentIndex].title}</span>
          {assessmentTools[currentIndex].helpText && (
            <div className="help-tooltip">
              <HelpCircle className="help-icon" size={18} />
              <span className="tooltip-text">{assessmentTools[currentIndex].helpText}</span>
            </div>
          )}
        </div>
        <span className="carousel-position">
          {currentIndex + 1} of {assessmentTools.length}
        </span>
        <button onClick={nextTool} className="nav-button">
          →
        </button>
      </div>
      
      <div className="carousel-content">
        {assessmentTools[currentIndex].component}
      </div>

      <div className="carousel-indicators">
        {assessmentTools.map((_, index) => (
          <button
            key={index}
            className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => goToTool(index)}
            aria-label={`Go to tool ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}; 