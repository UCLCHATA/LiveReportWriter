import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ChevronLeft, ChevronRight, HelpCircle, CheckCircle2 } from 'lucide-react';
import { SensoryProfileBuilder, SensoryProfileGraph } from './SensoryProfileBuilder';
import { SocialCommunicationProfile, SocialCommunicationGraph } from './SocialCommunicationProfile';
import { BehaviorInterestsProfile, BehaviorInterestsGraph } from './BehaviorInterestsProfile';
import { MilestoneTracker } from './MilestoneTracker';
import { AssessmentLogger } from './AssessmentLogger';
import { AssessmentSummary } from './AssessmentSummary';
import { useFormState } from '../hooks/useFormState';
import { FormStateService } from '../services/formState';
import confetti from 'canvas-confetti';
import html2canvas from 'html2canvas';
import { debounce } from 'lodash';

import sensoryIcon from '../assets/sensory-icon.png';
import socialIcon from '../assets/social-icon.png';
import behaviorIcon from '../assets/behavior-icon.png';
import developmentIcon from '../assets/development-icon.png';
import assessmentIcon from '../assets/assessment-icon.png';
import summaryIcon from '../assets/summary-icon.png';

import styles from './AssessmentCarousel.module.css';
import { assessmentTools } from './AssessmentLogger';

import type {
  RuntimeFormState,
  AssessmentData
} from '../types/formState';

interface AssessmentCarouselProps {
  onProgressUpdate: (progress: number) => void;
  initialProgress: number;
}

interface Tool {
  id: keyof AssessmentData;
  title: string;
  component: React.ComponentType<any>;
  description: string;
  icon: string;
}

interface CompletionState {
  isComplete: boolean;
  isSkipped: boolean;
  progress: number;
  autoDetected: boolean;
}

const formStateService = new FormStateService();

export const AssessmentCarousel: React.FC<AssessmentCarouselProps> = ({ onProgressUpdate, initialProgress }) => {
  const { state: globalState, setAssessmentData } = useFormState();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentTool, setCurrentTool] = useState<keyof AssessmentData>('sensoryProfile');
  const [completionStates, setCompletionStates] = useState<Record<string, CompletionState>>({});

  const handleSensoryProfileChange = useCallback((data: AssessmentData['sensoryProfile']) => {
    if (!globalState?.assessments) return;
    setAssessmentData({ sensoryProfile: data });
  }, [globalState, setAssessmentData]);

  const handleSocialCommunicationChange = useCallback((data: AssessmentData['socialCommunication']) => {
    if (!globalState?.assessments) return;
    setAssessmentData({ socialCommunication: data });
  }, [globalState, setAssessmentData]);

  const handleBehaviorInterestsChange = useCallback((data: AssessmentData['behaviorInterests']) => {
    if (!globalState?.assessments) return;
    setAssessmentData({ behaviorInterests: data });
  }, [globalState, setAssessmentData]);
};

export default AssessmentCarousel; 