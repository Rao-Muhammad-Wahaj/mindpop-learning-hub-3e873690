
import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface QuizTimerProps {
  timeLeft: number | null;
  onTimeUp: () => void;
}

export function QuizTimer({ timeLeft: initialTimeLeft, onTimeUp }: QuizTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number | null>(initialTimeLeft);

  useEffect(() => {
    setTimeLeft(initialTimeLeft);
  }, [initialTimeLeft]);

  useEffect(() => {
    if (!timeLeft || timeLeft <= 0) {
      if (timeLeft === 0) {
        console.log("Timer reached zero, submitting quiz...");
        onTimeUp();
      }
      return;
    }
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev && prev > 0) {
          return prev - 1;
        }
        return 0;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLeft, onTimeUp]);

  const formatTime = (seconds: number | null) => {
    if (seconds === null) return "--:--";
    
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!timeLeft && timeLeft !== 0) return null;

  return (
    <div className={`flex items-center space-x-2 py-1 px-3 rounded-full ${
      timeLeft < 60 
        ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400 animate-pulse' 
        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
    }`}>
      <Clock className="h-4 w-4" />
      <span className="font-medium">{formatTime(timeLeft)}</span>
    </div>
  );
}
