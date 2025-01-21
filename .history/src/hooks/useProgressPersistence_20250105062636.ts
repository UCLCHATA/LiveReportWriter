import { useState, useEffect } from 'react';

const PROGRESS_STORAGE_KEY = 'chata_form_progress';

interface ProgressState {
  formProgress: number;
  carouselProgress: number;
  lastUpdated: number;
}

export const useProgressPersistence = (validatedChataId: string | null) => {
  const [storedProgress, setStoredProgress] = useState<ProgressState>({
    formProgress: 0,
    carouselProgress: 0,
    lastUpdated: Date.now()
  });

  // Load progress from localStorage only when validatedChataId is provided
  useEffect(() => {
    if (!validatedChataId) {
      setStoredProgress({
        formProgress: 0,
        carouselProgress: 0,
        lastUpdated: Date.now()
      });
      return;
    }

    const savedProgress = localStorage.getItem(`${PROGRESS_STORAGE_KEY}_${validatedChataId}`);
    if (savedProgress) {
      try {
        const parsed = JSON.parse(savedProgress);
        setStoredProgress(parsed);
      } catch (error) {
        console.error('Error loading progress:', error);
      }
    }
  }, [validatedChataId]);

  // Save progress to localStorage only when validatedChataId is provided
  const saveProgress = (formProgress: number, carouselProgress: number) => {
    if (!validatedChataId) return;

    const newProgress = {
      formProgress,
      carouselProgress,
      lastUpdated: Date.now()
    };

    setStoredProgress(newProgress);
    localStorage.setItem(
      `${PROGRESS_STORAGE_KEY}_${validatedChataId}`,
      JSON.stringify(newProgress)
    );
  };

  // Clear progress
  const clearProgress = () => {
    if (!validatedChataId) return;
    localStorage.removeItem(`${PROGRESS_STORAGE_KEY}_${validatedChataId}`);
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