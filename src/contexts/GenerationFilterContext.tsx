'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useGenerationFilter } from '@/hooks/useGenerationFilter';

type GenerationFilterContextType = ReturnType<typeof useGenerationFilter>;

const GenerationFilterContext = createContext<GenerationFilterContextType | null>(null);

export function GenerationFilterProvider({ children }: { children: ReactNode }) {
  const filter = useGenerationFilter();

  return (
    <GenerationFilterContext.Provider value={filter}>
      {children}
    </GenerationFilterContext.Provider>
  );
}

export function useGenerationFilterContext() {
  const context = useContext(GenerationFilterContext);
  if (!context) {
    throw new Error(
      'useGenerationFilterContext must be used within a GenerationFilterProvider'
    );
  }
  return context;
}
