
import { useEffect } from 'react';
import { Clock } from 'lucide-react';

interface QuizTimerProps {
  timeLeft: number | null;
  onTimeUp: () => void;
}

export function QuizTimer({ timeLeft, onTimeUp }: QuizTimerProps) {
  useEffect(() => {
    if (timeLeft === 0) {
      onTimeUp();
    }
  }, [timeLeft, onTimeUp]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!timeLeft) return null;

  return (
    <div className={`flex items-center space-x-2 py-1 px-3 rounded-full ${
      timeLeft < 60 
        ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' 
        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
    }`}>
      <Clock className="h-4 w-4" />
      <span className="font-medium">{formatTime(timeLeft)}</span>
    </div>
  );
}
