import React, { useState } from 'react';
import { SensoryProfileBuilder } from './SensoryProfileBuilder';
import { BehavioralAssessment } from './BehavioralAssessment';

type AssessmentTool = {
  id: string;
  title: string;
  component: React.ReactNode;
};

export const AssessmentCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const assessmentTools: AssessmentTool[] = [
    {
      id: 'sensory',
      title: 'Sensory Profile',
      component: <SensoryProfileBuilder />,
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
        <span className="tool-title">{assessmentTools[currentIndex].title}</span>
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