
import { useState, useEffect, useCallback } from 'react';

interface UseQuizTimerProps {
  initialTimeInSeconds: number | null;
  onTimeUp: () => void;
}

export const useQuizTimer = ({ initialTimeInSeconds, onTimeUp }: UseQuizTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<number | null>(initialTimeInSeconds);
  const [isRunning, setIsRunning] = useState(false);

  const startTimer = useCallback(() => {
    if (timeLeft !== null && timeLeft > 0) {
      setIsRunning(true);
    }
  }, [timeLeft]);

  const pauseTimer = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resetTimer = useCallback((newTime: number | null = initialTimeInSeconds) => {
    setTimeLeft(newTime);
    setIsRunning(false);
  }, [initialTimeInSeconds]);

  useEffect(() => {
    let timerId: number | undefined;

    if (isRunning && timeLeft !== null && timeLeft > 0) {
      timerId = window.setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = (prev as number) - 1;
          if (newTime <= 0) {
            clearInterval(timerId);
            setIsRunning(false);
            onTimeUp();
            return 0;
          }
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (timerId) {
        clearInterval(timerId);
      }
    };
  }, [isRunning, timeLeft, onTimeUp]);

  const formatTime = useCallback(() => {
    if (timeLeft === null) return '--:--';
    
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [timeLeft]);

  return {
    timeLeft,
    isRunning,
    startTimer,
    pauseTimer,
    resetTimer,
    formatTime,
  };
};
