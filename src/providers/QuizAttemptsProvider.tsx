import { createContext, useContext, ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { QuizAttempt } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth';

interface QuizAttemptsContextType {
  attempts: QuizAttempt[];
  isLoading: boolean;
  error: Error | null;
  getUserAttemptsByQuiz: (quizId: string) => QuizAttempt[];
  createAttempt: (attempt: Omit<QuizAttempt, 'id' | 'startedAt' | 'completedAt'>) => Promise<QuizAttempt | null>;
  completeAttempt: (id: string, score: number, answers: QuizAttempt['answers']) => Promise<QuizAttempt | null>;
  hasAttemptedQuiz: (quizId: string) => boolean;
}

const QuizAttemptsContext = createContext<QuizAttemptsContextType | undefined>(undefined);

export function QuizAttemptsProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: attempts = [], isLoading, error } = useQuery({
    queryKey: ['quiz-attempts', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        throw new Error(error.message);
      }

      return data.map(attempt => ({
        id: attempt.id,
        quizId: attempt.quiz_id,
        userId: attempt.user_id,
        startedAt: attempt.started_at,
        completedAt: attempt.completed_at,
        score: attempt.score || 0,
        maxScore: attempt.max_score || 0,
        answers: attempt.answers ? 
          Array.isArray(attempt.answers) ? 
            attempt.answers.map((ans: any) => ({
              questionId: ans.questionId || ans.question_id,
              answer: ans.answer,
              isCorrect: ans.isCorrect || ans.is_correct
            })) : 
            [] : 
          []
      }));
    },
    enabled: !!user,
  });

  const getUserAttemptsByQuiz = (quizId: string) => {
    return attempts.filter(attempt => attempt.quizId === quizId);
  };

  const hasAttemptedQuiz = (quizId: string) => {
    return attempts.some(attempt => attempt.quizId === quizId && attempt.completedAt);
  };

  const createAttemptMutation = useMutation({
    mutationFn: async (attempt: Omit<QuizAttempt, 'id' | 'startedAt' | 'completedAt'>) => {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .insert({
          quiz_id: attempt.quizId,
          user_id: attempt.userId,
          score: attempt.score,
          max_score: attempt.maxScore,
          answers: attempt.answers
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return {
        id: data.id,
        quizId: data.quiz_id,
        userId: data.user_id,
        startedAt: data.started_at,
        completedAt: data.completed_at,
        score: data.score || 0,
        maxScore: data.max_score || 0,
        answers: Array.isArray(data.answers) ? 
          data.answers.map((ans: any) => ({
            questionId: ans.questionId || ans.question_id,
            answer: ans.answer,
            isCorrect: ans.isCorrect || ans.is_correct
          })) : 
          []
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-attempts'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to create attempt: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const completeAttemptMutation = useMutation({
    mutationFn: async ({ id, answers }: { id: string; answers: QuizAttempt['answers'] }) => {
      const score = answers.reduce((total, answer) => {
        return total + (answer.isCorrect ? 1 : 0);
      }, 0);

      const maxScore = answers.length;

      const { data, error } = await supabase
        .from('quiz_attempts')
        .update({
          completed_at: new Date().toISOString(),
          score,
          max_score: maxScore,
          answers
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return {
        id: data.id,
        quizId: data.quiz_id,
        userId: data.user_id,
        startedAt: data.started_at,
        completedAt: data.completed_at,
        score: data.score || 0,
        maxScore: data.max_score || 0,
        answers: Array.isArray(data.answers) ? 
          data.answers.map((ans: any) => ({
            questionId: ans.questionId || ans.question_id,
            answer: ans.answer,
            isCorrect: ans.isCorrect || ans.is_correct
          })) : 
          []
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-attempts'] });
      toast({
        title: 'Success',
        description: 'Quiz completed successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to complete attempt: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const createAttempt = async (attempt: Omit<QuizAttempt, 'id' | 'startedAt' | 'completedAt'>) => {
    try {
      return await createAttemptMutation.mutateAsync(attempt);
    } catch (error) {
      console.error('Error creating attempt:', error);
      return null;
    }
  };

  const completeAttempt = async (id: string, score: number, answers: QuizAttempt['answers']) => {
    try {
      const maxScore = answers.length;
      
      return await completeAttemptMutation.mutateAsync({ id, score, maxScore, answers });
    } catch (error) {
      console.error('Error completing attempt:', error);
      return null;
    }
  };

  return (
    <QuizAttemptsContext.Provider
      value={{
        attempts,
        isLoading,
        error,
        getUserAttemptsByQuiz,
        createAttempt,
        completeAttempt,
        hasAttemptedQuiz,
      }}
    >
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
