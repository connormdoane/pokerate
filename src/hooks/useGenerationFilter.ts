'use client';

import { useState, useEffect, useCallback } from 'react';
import { GENERATIONS, getDefaultEnabledGenerations } from '@/lib/generations';

const STORAGE_KEY = 'pokerate-enabled-generations';

export function useGenerationFilter() {
  const [enabledGenerations, setEnabledGenerations] = useState<number[]>(
    getDefaultEnabledGenerations()
  );
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setEnabledGenerations(parsed);
        }
      } catch {
        // Invalid JSON, use defaults
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage when enabled generations change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(enabledGenerations));
    }
  }, [enabledGenerations, isLoaded]);

  const toggleGeneration = useCallback((genId: number) => {
    setEnabledGenerations((prev) => {
      const isEnabled = prev.includes(genId);

      // Prevent disabling all generations
      if (isEnabled && prev.length === 1) {
        return prev;
      }

      if (isEnabled) {
        return prev.filter((id) => id !== genId);
      } else {
        return [...prev, genId].sort((a, b) => a - b);
      }
    });
  }, []);

  const enableAll = useCallback(() => {
    setEnabledGenerations(getDefaultEnabledGenerations());
  }, []);

  const isAllEnabled = enabledGenerations.length === GENERATIONS.length;

  return {
    enabledGenerations,
    toggleGeneration,
    enableAll,
    isAllEnabled,
    isLoaded,
  };
}
