import { useState, useEffect } from 'react';

const PROGRESS_STORAGE_KEY = 'chata_form_progress';

interface ProgressState {
  formProgress: number;
  carouselProgress: number;
  lastUpdated: number;
}

export const useProgressPersistence = (chataId: string) => {
  const [storedProgress, setStoredProgress] = useState<ProgressState>({
    formProgress: 0,
    carouselProgress: 0,
    lastUpdated: Date.now()
  });

  // Load progress from localStorage when chataId changes
  useEffect(() => {
    if (!chataId) {
      setStoredProgress({
        formProgress: 0,
        carouselProgress: 0,
        lastUpdated: Date.now()
      });
      return;
    }

    const savedProgress = localStorage.getItem(`${PROGRESS_STORAGE_KEY}_${chataId}`);
    if (savedProgress) {
      try {
        const parsed = JSON.parse(savedProgress);
        setStoredProgress(parsed);
      } catch (error) {
        console.error('Error loading progress:', error);
      }
    }
  }, [chataId]);

  // Save progress to localStorage
  const saveProgress = (formProgress: number, carouselProgress: number) => {
    if (!chataId) return;

    const newProgress = {
      formProgress,
      carouselProgress,
      lastUpdated: Date.now()
    };

    setStoredProgress(newProgress);
    localStorage.setItem(
      `${PROGRESS_STORAGE_KEY}_${chataId}`,
      JSON.stringify(newProgress)
    );
  };

  // Clear progress
  const clearProgress = () => {
    if (!chataId) return;
    localStorage.removeItem(`${PROGRESS_STORAGE_KEY}_${chataId}`);
    setStoredProgress({
      formProgress: 0,
      carouselProgress: 0,
      lastUpdated: Date.now()
    });
  };

  return {
    storedProgress,
    saveProgress,
    clearProgress
  };
}; 