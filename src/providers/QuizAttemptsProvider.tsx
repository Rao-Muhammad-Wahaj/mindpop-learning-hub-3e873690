
import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/lib/auth';
import { useQuizAttempts as useQuizAttemptsHook } from '@/hooks/use-quiz-attempts';
import { useQueryClient } from '@tanstack/react-query';

const QuizAttemptsContext = createContext<ReturnType<typeof useQuizAttemptsHook> | undefined>(undefined);

export function QuizAttemptsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const quizAttemptsData = useQuizAttemptsHook(user?.id);

  // This provider needs to invalidate related queries when quiz attempts change
  // to address issue #5: Live Statistics

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
