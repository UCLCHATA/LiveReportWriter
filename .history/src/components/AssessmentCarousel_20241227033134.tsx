import React, { useState, useEffect } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { DevelopmentalTimeline } from './DevelopmentalTimeline';

type CarouselSlide = {
  id: string;
  title: string;
  component: React.ReactNode;
};

type MetricInfo = {
  label: string;
  description: string;
  value: number;
};

export const AssessmentCarousel: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [socialMetrics, setSocialMetrics] = useState<Record<string, MetricInfo>>({
    reciprocity: {
      label: "Social Reciprocity",
      description: "Rate from 1 (age appropriate) to 5 (significant challenge). Measures ability to engage in back-and-forth social interactions and respond to social cues.",
      value: 1
    },
    nonVerbalComm: {
      label: "Non-verbal Communication",
      description: "Rate from 1 (age appropriate) to 5 (significant challenge). Assesses use and understanding of gestures, facial expressions, and body language.",
      value: 1
    },
    relationships: {
      label: "Relationships",
      description: "Rate from 1 (age appropriate) to 5 (significant challenge). Evaluates ability to form and maintain peer relationships appropriate to developmental level.",
      value: 1
    },
    emotionalRegulation: {
      label: "Emotional Regulation",
      description: "Rate from 1 (age appropriate) to 5 (significant challenge). Assesses ability to manage and express emotions appropriately for age.",
      value: 1
    },
    adaptiveFunctioning: {
      label: "Adaptive Functioning",
      description: "Rate from 1 (age appropriate) to 5 (significant challenge). Measures ability to handle daily activities and adjust to new situations.",
      value: 1
    }
  });

  const radarData = Object.entries(socialMetrics).map(([key, info]) => ({
    category: info.label,
    value: info.value, // Direct value mapping now that 5 = significant challenge
    fullMark: 5,
    originalValue: info.value
  }));

  // Update slider track color when value changes
  useEffect(() => {
    Object.entries(socialMetrics).forEach(([key, info]) => {
      const slider = document.querySelector(`[data-metric="${key}"]`) as HTMLInputElement;
      if (slider) {
        const percent = ((info.value - 1) / 4) * 100;
        slider.style.setProperty('--value-percent', `${percent}%`);
      }
    });
  }, [socialMetrics]);

  const handleMetricChange = (metric: string, value: string) => {
    setSocialMetrics(prev => ({
      ...prev,
      [metric]: {
        ...prev[metric],
        value: parseInt(value)
      }
    }));
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const metricKey = Object.keys(socialMetrics).find(
        key => socialMetrics[key].label === data.category
      );
      const description = metricKey ? socialMetrics[metricKey].description : '';
      
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{data.category}</p>
          <p className="tooltip-value">Challenge Level: {data.originalValue}/5</p>
          <p className="tooltip-desc">{description}</p>
        </div>
      );
    }
    return null;
  };

  const SocialCommunicationChart = (
    <div className="assessment-card">
      <div className="assessment-header">
        <h3>Social Communication Profile</h3>
        <i className="material-icons info-icon" title="Click for assessment guide">help_outline</i>
      </div>
      <div className="assessment-content">
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
              <PolarGrid gridType="circle" />
              <PolarAngleAxis 
                dataKey="category"
                tick={{ fill: '#666', fontSize: 11 }}
                tickLine={{ stroke: '#ccc' }}
              />
              <Radar
                name="Social Profile"
                dataKey="value"
                stroke="#2563eb"
                fill="#3b82f6"
                fillOpacity={0.6}
              />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="metrics-controls">
          {Object.entries(socialMetrics).map(([key, info]) => (
            <div key={key} className="metric-control">
              <div className="metric-header">
                <label title={info.description}>
                  {info.label}
                </label>
                <span className="value-display">{info.value}/5</span>
              </div>
              <div className="slider-group">
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={info.value}
                  onChange={(e) => handleMetricChange(key, e.target.value)}
                  className="metric-slider"
                  data-metric={key}
                />
                <div className="slider-labels">
                  <span>Age appropriate</span>
                  <span>Significant challenges</span>
                </div>
              </div>
            </div>
          ))}
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
    {
      id: 'development',
      title: 'Development Timeline',
      component: <DevelopmentalTimeline />
    }
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
          >
            <span className="sr-only">{slide.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}; 