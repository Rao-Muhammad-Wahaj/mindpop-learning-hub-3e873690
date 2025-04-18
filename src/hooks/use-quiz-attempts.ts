
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { QuizAttempt } from "@/types";
import { useToast } from "@/hooks/use-toast";

export const useQuizAttempts = (userId?: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: attempts = [], isLoading, error } = useQuery({
    queryKey: ['quiz-attempts', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('user_id', userId);

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
        answers: Array.isArray(attempt.answers) ?
          attempt.answers.map((ans: any) => ({
            questionId: ans.questionId || ans.question_id,
            answer: ans.answer,
            isCorrect: ans.isCorrect || ans.is_correct
          })) :
          []
      }));
    },
    enabled: !!userId,
  });

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
      const score = answers.reduce((total, answer) => total + (answer.isCorrect ? 1 : 0), 0);
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

  const getUserAttemptsByQuiz = (quizId: string) => {
    return attempts.filter(attempt => attempt.quizId === quizId);
  };

  const hasAttemptedQuiz = (quizId: string) => {
    return attempts.some(attempt => attempt.quizId === quizId && attempt.completedAt);
  };

  return {
    attempts,
    isLoading,
    error,
    getUserAttemptsByQuiz,
    hasAttemptedQuiz,
    createAttempt: createAttemptMutation.mutateAsync,
    completeAttempt: completeAttemptMutation.mutateAsync,
  };
};
