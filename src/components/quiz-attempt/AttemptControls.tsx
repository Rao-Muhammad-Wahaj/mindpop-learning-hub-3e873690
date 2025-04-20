
import React from 'react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface AttemptControlsProps {
  questionCount: number;
  answeredCount: number;
  isSubmitting: boolean;
  onSubmit: () => void;
}

export const AttemptControls = ({
  questionCount,
  answeredCount,
  isSubmitting,
  onSubmit,
}: AttemptControlsProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
      <Button
        onClick={onSubmit}
        disabled={isSubmitting || answeredCount !== questionCount}
        className={`${isMobile ? 'text-sm py-5' : ''} w-full`}
      >
        {isSubmitting ? (
          <>Submitting...</>
        ) : (
          `Submit Quiz (${answeredCount}/${questionCount} Answered)`
        )}
      </Button>
      <p className="text-xs text-center mt-2 text-gray-500 dark:text-gray-400">
        You cannot change your answers after submission
      </p>
    </div>
  );
};
