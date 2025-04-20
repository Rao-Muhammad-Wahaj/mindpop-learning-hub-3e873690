
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { QuizAttempt } from "@/types";
import { useToast } from "@/hooks/use-toast";

interface CreateAttemptParams extends Omit<QuizAttempt, 'id' | 'startedAt' | 'completedAt'> {}

interface CompleteAttemptParams {
  id: string;
  quizId: string;
  courseId: string;
  score: number;
  studentName?: string;
  answers: {
    questionId: string;
    answer: string;
    isCorrect: boolean;
  }[];
}

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
        throw error;
      }

      return data.map(attempt => ({
        id: attempt.id,
        quizId: attempt.quiz_id,
        userId: attempt.user_id,
        studentName: attempt.student_name || 'Unknown Student',
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

  const invalidateRelatedQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['quiz-attempts'] });
    queryClient.invalidateQueries({ queryKey: ['student-completions'] });
    queryClient.invalidateQueries({ queryKey: ['recent-quiz-attempts'] });
    queryClient.invalidateQueries({ queryKey: ['total-students'] });
    queryClient.invalidateQueries({ queryKey: ['enrollments'] });
  };

  const createAttemptMutation = useMutation({
    mutationFn: async (attempt: CreateAttemptParams) => {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .insert({
          quiz_id: attempt.quizId,
          user_id: attempt.userId,
          student_name: attempt.studentName || 'Unknown Student',
          score: attempt.score,
          max_score: attempt.maxScore,
          answers: Array.isArray(attempt.answers) ? attempt.answers : []
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: invalidateRelatedQueries,
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to create attempt: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const completeAttemptMutation = useMutation({
    mutationFn: async ({ id, score, answers, quizId, courseId, studentName }: CompleteAttemptParams) => {
      const { data: quizAttemptData, error: quizAttemptError } = await supabase
        .from('quiz_attempts')
        .update({
          completed_at: new Date().toISOString(),
          score,
          max_score: answers.length,
          student_name: studentName,
          answers
        })
        .eq('id', id)
        .select()
        .single();

      if (quizAttemptError) throw quizAttemptError;

      if (userId && courseId) {
        const { data: enrollment } = await supabase
          .from('enrollments')
          .select('completed_quizzes')
          .eq('user_id', userId)
          .eq('course_id', courseId)
          .single();

        if (enrollment) {
          let completedQuizzes: string[] = [];
          if (enrollment.completed_quizzes) {
            completedQuizzes = Array.isArray(enrollment.completed_quizzes)
              ? enrollment.completed_quizzes.map(id => typeof id === 'string' ? id : String(id))
              : [];
          }

          if (!completedQuizzes.includes(quizId)) {
            completedQuizzes.push(quizId);
            
            await supabase
              .from('enrollments')
              .update({ completed_quizzes: completedQuizzes })
              .eq('user_id', userId)
              .eq('course_id', courseId);

            const { data: courseQuizzes } = await supabase
              .from('quizzes')
              .select('id')
              .eq('course_id', courseId);

            if (courseQuizzes) {
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

      return quizAttemptData;
    },
    onSuccess: () => {
      invalidateRelatedQueries();
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

  return {
    attempts,
    isLoading,
    error,
    createAttempt: createAttemptMutation.mutateAsync,
    completeAttempt: completeAttemptMutation.mutateAsync,
    getUserAttemptsByQuiz: (quizId: string) => attempts.filter(attempt => attempt.quizId === quizId),
    hasAttemptedQuiz: (quizId: string) => attempts.some(attempt => attempt.quizId === quizId && attempt.completedAt),
  };
};
