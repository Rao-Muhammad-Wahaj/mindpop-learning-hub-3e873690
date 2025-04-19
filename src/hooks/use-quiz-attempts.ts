
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
        toast({
          title: 'Error loading quiz attempts',
          description: error.message,
          variant: 'destructive',
        });
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
          answers: Array.isArray(attempt.answers) ? attempt.answers : []
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
      // Invalidate relevant queries for live statistics
      queryClient.invalidateQueries({ queryKey: ['quiz-attempts'] });
      queryClient.invalidateQueries({ queryKey: ['student-completions'] });
      queryClient.invalidateQueries({ queryKey: ['recent-quiz-attempts'] });
      queryClient.invalidateQueries({ queryKey: ['total-students'] });
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
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
    mutationFn: async (params: { id: string; score: number; answers: any[]; quizId: string; courseId: string }) => {
      const { id, score, answers, quizId, courseId } = params;
      const safeAnswers = Array.isArray(answers) ? answers : [];
      const maxScore = safeAnswers.length;

      // Start a transaction
      const { data: quizAttemptData, error: quizAttemptError } = await supabase
        .from('quiz_attempts')
        .update({
          completed_at: new Date().toISOString(),
          score,
          max_score: maxScore,
          answers: safeAnswers
        })
        .eq('id', id)
        .select()
        .single();

      if (quizAttemptError) {
        throw new Error(quizAttemptError.message);
      }

      // Update enrollment.completed_quizzes to track course completion
      if (userId && courseId) {
        const { data: enrollment, error: enrollmentError } = await supabase
          .from('enrollments')
          .select('completed_quizzes')
          .eq('user_id', userId)
          .eq('course_id', courseId)
          .single();

        if (enrollmentError) {
          console.error('Error fetching enrollment:', enrollmentError);
        } else {
          // Extract completed quizzes safely
          let completedQuizzes: string[] = [];
          if (enrollment && enrollment.completed_quizzes) {
            if (Array.isArray(enrollment.completed_quizzes)) {
              completedQuizzes = enrollment.completed_quizzes.map(id => 
                typeof id === 'string' ? id : String(id)
              );
            }
          }

          // Add the quiz to completed_quizzes if not already there
          if (!completedQuizzes.includes(quizId)) {
            completedQuizzes.push(quizId);

            // Update the enrollment
            const { error: updateError } = await supabase
              .from('enrollments')
              .update({
                completed_quizzes: completedQuizzes
              })
              .eq('user_id', userId)
              .eq('course_id', courseId);

            if (updateError) {
              console.error('Error updating enrollment:', updateError);
            }

            // Update the progress percentage based on completed quizzes
            // This fixes issue #4: Student Dashboard Status
            const { data: courseQuizzes, error: quizzesError } = await supabase
              .from('quizzes')
              .select('id')
              .eq('course_id', courseId);

            if (!quizzesError && courseQuizzes) {
              const totalQuizzes = courseQuizzes.length;
              const completedCount = completedQuizzes.length;
              const progress = totalQuizzes > 0 
                ? Math.round((completedCount / totalQuizzes) * 100) 
                : 100;

              await supabase
                .from('enrollments')
                .update({ progress })
                .eq('user_id', userId)
                .eq('course_id', courseId);
            }
          }
        }
      }

      return {
        id: quizAttemptData.id,
        quizId: quizAttemptData.quiz_id,
        userId: quizAttemptData.user_id,
        startedAt: quizAttemptData.started_at,
        completedAt: quizAttemptData.completed_at,
        score: quizAttemptData.score || 0,
        maxScore: quizAttemptData.max_score || 0,
        answers: Array.isArray(quizAttemptData.answers) ?
          quizAttemptData.answers.map((ans: any) => ({
            questionId: ans.questionId || ans.question_id,
            answer: ans.answer,
            isCorrect: ans.isCorrect || ans.is_correct
          })) :
          []
      };
    },
    onSuccess: () => {
      // Invalidate relevant queries for live statistics
      queryClient.invalidateQueries({ queryKey: ['quiz-attempts'] });
      queryClient.invalidateQueries({ queryKey: ['student-completions'] });
      queryClient.invalidateQueries({ queryKey: ['recent-quiz-attempts'] });
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
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
