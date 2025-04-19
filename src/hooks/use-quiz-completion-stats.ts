
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { QuizAttempt } from "@/types";

export const useQuizCompletionStats = () => {
  const { data: recentAttempts = [], isLoading: isLoadingAttempts } = useQuery({
    queryKey: ['recent-quiz-attempts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select(`
          id,
          quiz_id,
          user_id,
          started_at,
          completed_at,
          score,
          max_score,
          profiles:user_id(name),
          quizzes:quiz_id(title, course_id)
        `)
        .order('completed_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      
      return data
        .filter(attempt => attempt.quizzes && attempt.profiles)
        .map(attempt => ({
          id: attempt.id,
          quizId: attempt.quiz_id,
          userId: attempt.user_id,
          studentName: attempt.profiles?.name || 'Unknown',
          quizTitle: attempt.quizzes?.title || 'Unknown Quiz',
          courseId: attempt.quizzes?.course_id,
          startedAt: attempt.started_at,
          completedAt: attempt.completed_at,
          score: attempt.score || 0,
          maxScore: attempt.max_score || 0,
          month: new Date(attempt.completed_at || attempt.started_at).toLocaleString('default', { month: 'long', year: 'numeric' })
        }));
    }
  });

  // Group attempts by month
  const attemptsByMonth = recentAttempts.reduce((acc, attempt) => {
    const month = attempt.month;
    if (!acc[month]) {
      acc[month] = [];
    }
    acc[month].push(attempt);
    return acc;
  }, {} as Record<string, typeof recentAttempts>);

  return {
    recentAttempts,
    attemptsByMonth,
    isLoadingAttempts
  };
};
