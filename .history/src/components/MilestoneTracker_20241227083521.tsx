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

interface CategoryInfo {
  title: string;
  color: string;
  tooltips: { [key: string]: string };
}

interface Milestone {
  id: string;
  title: string;
  category: 'communication' | 'motor' | 'social';
  expectedAge: number;
  actualAge?: number;
}

const categoryInfo: { [key: string]: CategoryInfo } = {
  communication: {
    title: 'Communication',
    color: '#4299E1',
    tooltips: {
      'First words': 'Look for intentional use of words like "mama", "dada", "no"',
      'Two-word phrases': 'Examples: "more milk", "car go", "daddy up"',
      'Complex sentences': 'Should use pronouns, plurals, and basic prepositions',
      'Follows commands': 'Check for understanding of basic instructions without gestures',
      'Uses gestures': 'Look for pointing, waving, reaching with intent'
    }
  },
  motor: {
    title: 'Motor Skills',
    color: '#48BB78',
    tooltips: {
      'Rolling over': 'Should roll both ways - back to front and front to back',
      'Sitting': 'Look for independent sitting without support',
      'Crawling': 'Check for coordinated movement using both arms and legs',
      'Walking': 'Observe balance and confidence in steps',
      'Running': 'Note coordination and speed control'
    }
  },
  social: {
    title: 'Social & Emotional',
    color: '#ED8936',
    tooltips: {
      'Social smile': 'Responds to faces with genuine smile',
      'Stranger anxiety': 'Shows clear preference for familiar people',
      'Parallel play': 'Plays alongside but not with other children',
      'Cooperative play': 'Engages in games with rules and turn-taking',
      'Shows empathy': 'Recognizes and responds to others\' emotions'
    }
  }
};

const initialMilestones: Milestone[] = [
  // Communication milestones
  { id: 'first-words', title: 'First words', category: 'communication', expectedAge: 12 },
  { id: 'two-word-phrases', title: 'Two-word phrases', category: 'communication', expectedAge: 24 },
  { id: 'complex-sentences', title: 'Complex sentences', category: 'communication', expectedAge: 36 },
  { id: 'follows-commands', title: 'Follows commands', category: 'communication', expectedAge: 18 },
  { id: 'uses-gestures', title: 'Uses gestures', category: 'communication', expectedAge: 9 },

  // Motor milestones
  { id: 'rolling-over', title: 'Rolling over', category: 'motor', expectedAge: 6 },
  { id: 'sitting', title: 'Sitting', category: 'motor', expectedAge: 8 },
  { id: 'crawling', title: 'Crawling', category: 'motor', expectedAge: 10 },
  { id: 'walking', title: 'Walking', category: 'motor', expectedAge: 12 },
  { id: 'running', title: 'Running', category: 'motor', expectedAge: 18 },

  // Social milestones
  { id: 'social-smile', title: 'Social smile', category: 'social', expectedAge: 2 },
  { id: 'stranger-anxiety', title: 'Stranger anxiety', category: 'social', expectedAge: 8 },
  { id: 'parallel-play', title: 'Parallel play', category: 'social', expectedAge: 24 },
  { id: 'cooperative-play', title: 'Cooperative play', category: 'social', expectedAge: 36 },
  { id: 'shows-empathy', title: 'Shows empathy', category: 'social', expectedAge: 48 }
];

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