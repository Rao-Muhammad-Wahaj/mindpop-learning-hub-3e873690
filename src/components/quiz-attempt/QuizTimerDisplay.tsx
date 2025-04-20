
import React from 'react';
import { Clock } from 'lucide-react';
import { useQuizTimer } from '@/hooks/use-quiz-timer';

interface QuizTimerDisplayProps {
  timeLeft: number | null;
  onTimeUp: () => void;
}

export const QuizTimerDisplay = ({ timeLeft, onTimeUp }: QuizTimerDisplayProps) => {
  const { formatTime, isRunning } = useQuizTimer({
    initialTimeInSeconds: timeLeft,
    onTimeUp,
  });

  // Start timer as soon as component mounts
  React.useEffect(() => {
    const timer = useQuizTimer({
      initialTimeInSeconds: timeLeft,
      onTimeUp,
    });
    
    if (timeLeft !== null) {
      timer.startTimer();
    }
  }, [timeLeft, onTimeUp]);

  if (timeLeft === null) return null;

  return (
    <div className="flex items-center bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-lg">
      <Clock className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
      <span className={`font-mono ${timeLeft < 60 ? 'text-red-500 dark:text-red-400' : ''}`}>
        {formatTime()}
      </span>
    </div>
  );
};
