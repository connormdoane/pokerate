'use client';

import { GENERATIONS } from '@/lib/generations';
import { useGenerationFilterContext } from '@/contexts/GenerationFilterContext';

type SettingsDrawerProps = {
  isOpen: boolean;
};

export default function SettingsDrawer({ isOpen }: SettingsDrawerProps) {
  const { enabledGenerations, toggleGeneration, enableAll, isAllEnabled, isLoaded } =
    useGenerationFilterContext();

  if (!isLoaded) {
    return null;
  }

  return (
    <div
      className={`
        overflow-hidden transition-all duration-300 ease-in-out
        border-b-4 border-gb-dark bg-gb-darkest
        ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 border-b-0'}
      `}
    >
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-pixel text-[10px] text-gb-lightest">FILTER BY GENERATION</h2>
          <button
            onClick={enableAll}
            disabled={isAllEnabled}
            className={`
              font-pixel text-[8px] px-2 py-1 border-2 transition-all
              ${
                isAllEnabled
                  ? 'bg-gb-darkest text-gb-dark border-gb-dark cursor-not-allowed'
                  : 'bg-gb-dark text-gb-lightest border-gb-light hover:bg-gb-light hover:text-gb-darkest'
              }
            `}
          >
            ENABLE ALL
          </button>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
          {GENERATIONS.map((gen) => {
            const isEnabled = enabledGenerations.includes(gen.id);
            const isLastEnabled = isEnabled && enabledGenerations.length === 1;

            return (
              <button
                key={gen.id}
                onClick={() => toggleGeneration(gen.id)}
                disabled={isLastEnabled}
                title={`Gen ${gen.name} - ${gen.region}`}
                className={`
                  font-pixel text-[8px] px-2 py-3 border-2 transition-all
                  flex flex-col items-center gap-1
                  ${
                    isEnabled
                      ? 'bg-gb-light text-gb-darkest border-gb-lightest'
                      : 'bg-gb-darkest text-gb-dark border-gb-dark hover:border-gb-light'
                  }
                  ${isLastEnabled ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}
                `}
              >
                <span className="text-[10px]">{gen.name}</span>
                <span className="text-[6px] opacity-75">{gen.region}</span>
              </button>
            );
          })}
        </div>

        <p className="font-pixel text-[6px] text-gb-dark mt-3 text-center">
          {enabledGenerations.length} OF {GENERATIONS.length} GENERATIONS ENABLED
        </p>
      </div>
    </div>
  );
}
