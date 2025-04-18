
import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/lib/auth';
import { useQuizAttempts as useQuizAttemptsHook } from '@/hooks/use-quiz-attempts';

const QuizAttemptsContext = createContext<ReturnType<typeof useQuizAttemptsHook> | undefined>(undefined);

export function QuizAttemptsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const quizAttemptsData = useQuizAttemptsHook(user?.id);

  return (
    <QuizAttemptsContext.Provider value={quizAttemptsData}>
      {children}
    </QuizAttemptsContext.Provider>
  );
}

export function useQuizAttempts() {
  const context = useContext(QuizAttemptsContext);
  if (context === undefined) {
    throw new Error('useQuizAttempts must be used within a QuizAttemptsProvider');
  }
  return context;
}
