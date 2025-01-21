import React, { useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

type CarouselSlide = {
  id: string;
  title: string;
  component: React.ReactNode;
};

export const AssessmentCarousel: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [socialMetrics, setSocialMetrics] = useState({
    reciprocity: 3,
    nonVerbalComm: 3,
    relationships: 3,
    emotionalRegulation: 3,
    adaptiveFunctioning: 3
  });

  const radarData = [
    {
      category: "Social Reciprocity",
      value: socialMetrics.reciprocity,
      fullMark: 5,
    },
    {
      category: "Non-verbal Communication",
      value: socialMetrics.nonVerbalComm,
      fullMark: 5,
    },
    {
      category: "Relationships",
      value: socialMetrics.relationships,
      fullMark: 5,
    },
    {
      category: "Emotional Regulation",
      value: socialMetrics.emotionalRegulation,
      fullMark: 5,
    },
    {
      category: "Adaptive Functioning",
      value: socialMetrics.adaptiveFunctioning,
      fullMark: 5,
    }
  ];

  const handleMetricChange = (metric: string, value: string) => {
    setSocialMetrics(prev => ({
      ...prev,
      [metric]: parseInt(value)
    }));
  };

  const SocialCommunicationChart = (
    <div className="assessment-card">
      <div className="assessment-header">
        <h3>Social Communication Profile</h3>
        <i className="material-icons">info</i>
      </div>
      <div className="assessment-content">
        <div className="metrics-grid">
          <div className="metrics-controls">
            {Object.entries(socialMetrics).map(([key, value]) => (
              <div key={key} className="metric-control">
                <label>
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </label>
                <div className="slider-group">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={value}
                    onChange={(e) => handleMetricChange(key, e.target.value)}
                  />
                  <span className="value-display">{value}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="category" />
                <Radar
                  name="Social Profile"
                  dataKey="value"
                  stroke="#2563eb"
                  fill="#3b82f6"
                  fillOpacity={0.6}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );

  const slides: CarouselSlide[] = [
    {
      id: 'social',
      title: 'Social Communication',
      component: SocialCommunicationChart
    },
    // Add more slides here for other assessment tools
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="assessment-carousel">
      <div className="carousel-container">
        <button className="carousel-button prev" onClick={prevSlide}>
          <i className="material-icons">chevron_left</i>
        </button>
        
        <div className="carousel-content">
          {slides[currentSlide].component}
        </div>
        
        <button className="carousel-button next" onClick={nextSlide}>
          <i className="material-icons">chevron_right</i>
        </button>
      </div>
      
      <div className="carousel-indicators">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            className={`indicator ${index === currentSlide ? 'active' : ''}`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </div>
  );
}; 