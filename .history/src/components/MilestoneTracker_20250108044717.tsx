import React, { useState, useRef, useCallback, useEffect } from 'react';
import { DndContext, useDraggable, useDroppable, DragEndEvent, UniqueIdentifier } from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';
import { useFormState } from '../hooks/useFormState';
import styles from './MilestoneTracker.module.css';
import { Milestone, CategoryType, MilestoneStatus } from './types';

export const categoryInfo: Record<CategoryType, {
  title: string;
  color: string;
  tooltips: { [key: string]: string };
}> = {
  communication: {
    title: 'Communication',
    color: '#4299E1',
    tooltips: {
      'Babbling': 'Varied consonant-vowel combinations, speech-like sounds',
      'Name response': 'Consistently turns to name when called',
      'Points to show': 'Points to objects of interest to share attention',
      'First words': 'Uses specific words consistently with meaning',
      'Combines words': 'Puts two or more words together meaningfully'
    }
  },
  motor: {
    title: 'Motor Skills',
    color: '#48BB78',
    tooltips: {
      'Head control': 'Holds head steady without support',
      'Reaches & grasps': 'Actively reaches and grasps objects',
      'Independent sitting': 'Sits without support for extended period',
      'Independent walking': 'Walks without holding on',
      'Climbs & runs': 'Climbs furniture and runs steadily'
    }
  },
  social: {
    title: 'Social & Play',
    color: '#ED8936',
    tooltips: {
      'Social smile': 'Smiles in response to faces and voices',
      'Eye contact': 'Makes and maintains appropriate eye contact',
      'Imitation': 'Copies simple actions and expressions',
      'Pretend play': 'Engages in imaginative play with toys',
      'Interactive play': 'Plays cooperatively with others'
    }
  },
  concerns: {
    title: 'Developmental Concerns',
    color: '#9F7AEA',
    tooltips: {
      'Rigid play patterns': 'Repetitive play sequences, strong preference for sameness, difficulty with changes in routine',
      'Limited social engagement': 'Reduced social initiation, parallel play preference, limited peer interaction',
      'Sensory seeking/avoiding': 'Unusual responses to sensory input, covering ears, visual fascinations, tactile sensitivity',
      'custom-concern': 'Add a custom developmental concern'
    }
  }
};

export const initialMilestones: Milestone[] = [
  // Communication milestones
  { id: 'babbling', title: 'Babbling', category: 'communication', expectedAge: 6 },
  { id: 'name-response', title: 'Name response', category: 'communication', expectedAge: 9 },
  { id: 'points-to-show', title: 'Points to show', category: 'communication', expectedAge: 12 },
  { id: 'first-words', title: 'First words', category: 'communication', expectedAge: 12 },
  { id: 'combines-words', title: 'Combines words', category: 'communication', expectedAge: 24 },

  // Motor milestones
  { id: 'head-control', title: 'Head control', category: 'motor', expectedAge: 3 },
  { id: 'reaches-grasps', title: 'Reaches & grasps', category: 'motor', expectedAge: 5 },
  { id: 'independent-sitting', title: 'Independent sitting', category: 'motor', expectedAge: 8 },
  { id: 'independent-walking', title: 'Independent walking', category: 'motor', expectedAge: 12 },
  { id: 'climbs-runs', title: 'Climbs & runs', category: 'motor', expectedAge: 18 },

  // Social milestones
  { id: 'social-smile', title: 'Social smile', category: 'social', expectedAge: 2 },
  { id: 'eye-contact', title: 'Eye contact', category: 'social', expectedAge: 3 },
  { id: 'imitation', title: 'Imitation', category: 'social', expectedAge: 9 },
  { id: 'pretend-play', title: 'Pretend play', category: 'social', expectedAge: 18 },
  { id: 'interactive-play', title: 'Interactive play', category: 'social', expectedAge: 24 },

  // Developmental concerns
  { id: 'rigid-play', title: 'Rigid play patterns', category: 'concerns', expectedAge: 0 },
  { id: 'limited-social', title: 'Limited social engagement', category: 'concerns', expectedAge: 0 },
  { id: 'sensory-patterns', title: 'Sensory seeking/avoiding', category: 'concerns', expectedAge: 0 },
  { id: 'custom-concern', title: '+', category: 'concerns', expectedAge: 0 }
];

// ... rest of the component code ... 