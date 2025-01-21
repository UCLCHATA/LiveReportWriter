import React, { useState } from 'react';
import { SensoryProfileBuilder } from './SensoryProfileBuilder';
import { BehavioralAssessment } from './BehavioralAssessment';
import { HelpCircle } from 'lucide-react';

type AssessmentTool = {
  id: string;
  title: string;
  component: React.ReactNode;
  helpText?: string;
};

export const AssessmentCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const assessmentTools: AssessmentTool[] = [
    {
      id: 'sensory',
      title: 'Sensory Profile',
      component: <SensoryProfileBuilder />,
      helpText: `How to use the Sensory Profile:

Rating Scale:
• 1 - Significantly under-responsive: Child shows minimal or no reaction to sensory input
• 2 - Mildly under-responsive: Child shows reduced reaction to sensory input
• 3 - Typical: Age-appropriate responses to sensory input
• 4 - Mildly over-responsive: Child shows enhanced reaction to sensory input
• 5 - Significantly over-responsive: Child shows extreme reaction to sensory input

Instructions:
1. Rate each sensory domain using the sliders
2. Add specific observations for each domain
3. The radar chart will update automatically
4. Blue area shows the child's sensory profile pattern`
    },
    {
      id: 'behavioral',
      title: 'Behavioral Assessment',
      component: <BehavioralAssessment />,
    },
    // Add more tools here
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
            <div className="tooltip-wrapper">
              <HelpCircle 
                className="help-icon" 
                size={18}
              />
              <div className="tooltip-content">
                {assessmentTools[currentIndex].helpText}
              </div>
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