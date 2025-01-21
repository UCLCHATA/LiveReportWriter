import React, { useRef, useState, useEffect } from 'react';
import { Timeline, DataSet } from 'vis-timeline/standalone';
import 'vis-timeline/styles/vis-timeline-graph2d.css';
import { HelpCircle } from 'lucide-react';
import styles from './MilestoneTracker.module.css';

interface TimelineItem {
  id: string;
  content: string;
  start: number;
  group: string;
  className: string;
  title?: string;
  expectedAge?: number;
  actualAge?: number;
}

interface TimelineGroup {
  id: string;
  content: string;
  className?: string;
}

export const MilestoneTracker: React.FC = () => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [timeline, setTimeline] = useState<Timeline | null>(null);
  const [items, setItems] = useState<DataSet<TimelineItem> | null>(null);

  useEffect(() => {
    if (!timelineRef.current) return;

    // Create timeline items
    const timelineItems = new DataSet<TimelineItem>(
      initialMilestones.map(milestone => ({
        id: milestone.id,
        content: `
          <div class="milestone-item ${milestone.category}">
            <span>${milestone.title}</span>
            <div class="milestone-tooltip">
              ${categoryInfo[milestone.category].tooltips[milestone.title]}
            </div>
          </div>
        `,
        start: milestone.expectedAge,
        group: milestone.category,
        className: `milestone-${milestone.category}`,
        title: categoryInfo[milestone.category].tooltips[milestone.title],
        expectedAge: milestone.expectedAge
      }))
    );

    // Create timeline groups
    const groups = new DataSet<TimelineGroup>(
      Object.entries(categoryInfo).map(([id, info]) => ({
        id,
        content: info.title,
        className: `group-${id}`
      }))
    );

    // Timeline options
    const options = {
      height: '200px',
      min: 0,
      max: 72, // 6 years in months
      start: 0,
      end: 72,
      editable: {
        add: false,
        remove: false,
        updateTime: true,
        updateGroup: false
      },
      snap: (date: number) => Math.round(date),
      orientation: 'top',
      showCurrentTime: false,
      format: {
        minorLabels: {
          month: 'M[m]',
          year: 'Y[y]'
        }
      },
      timeAxis: { scale: 'month', step: 3 },
      moveable: true,
      zoomable: false,
      margin: { item: { horizontal: 10 } },
      stack: true,
      stackSubgroups: true
    };

    // Create timeline
    const timeline = new Timeline(timelineRef.current, timelineItems, groups, options);
    setTimeline(timeline);
    setItems(timelineItems);

    // Event handlers
    timeline.on('dragstart', (props: any) => {
      const item = items?.get(props.item);
      if (item) {
        // Show expected age indicator
        const element = document.querySelector(`.expected-age-${item.id}`);
        if (element) element.classList.add('visible');
      }
    });

    timeline.on('drag', (props: any) => {
      const item = items?.get(props.item);
      if (item) {
        // Update current position indicator
        const element = document.querySelector('.current-position');
        if (element) {
          element.textContent = `${Math.round(props.time)}m`;
          element.style.left = `${timeline.dom.center.clientWidth * (props.time / 72)}px`;
        }
      }
    });

    timeline.on('dragend', (props: any) => {
      // Hide indicators
      document.querySelectorAll('.expected-age').forEach(el => 
        el.classList.remove('visible')
      );
    });

    return () => {
      timeline.destroy();
    };
  }, []);

  return (
    <div className={styles.container}>
      <div ref={timelineRef} className={styles.timeline} />
    </div>
  );
};

export default MilestoneTracker; 