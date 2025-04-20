
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { QuizAttempt } from "@/types";

export const useQuizCompletionStats = () => {
  const { data: recentAttempts = [], isLoading: isLoadingAttempts } = useQuery({
    queryKey: ['recent-quiz-attempts'],
    queryFn: async () => {
      // First, let's get the raw quiz attempts data
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
          quizzes:quiz_id(title, course_id)
        `)
        .order('completed_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      
      // Then, for each attempt, get the user's profile data separately
      // This avoids the relation error between quiz_attempts and profiles
      const enhancedData = await Promise.all(
        data.map(async (attempt) => {
          // Get profile for this user
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', attempt.user_id)
            .single();
          
          // If can't get profile, use a default name
          const studentName = profileError ? 'Unknown' : profileData?.name || 'Unknown';
          
          return {
            id: attempt.id,
            quizId: attempt.quiz_id,
            userId: attempt.user_id,
            studentName: studentName,
            quizTitle: attempt.quizzes?.title || 'Unknown Quiz',
            courseId: attempt.quizzes?.course_id,
            startedAt: attempt.started_at,
            completedAt: attempt.completed_at,
            score: attempt.score || 0,
            maxScore: attempt.max_score || 0,
            month: new Date(attempt.completed_at || attempt.started_at).toLocaleString('default', { month: 'long', year: 'numeric' })
          };
        })
      );

      return enhancedData;
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

  // Add console log to debug what's happening with attemptsByMonth
  console.log('Quiz Completion Stats:', { recentAttempts, attemptsByMonth, isEmpty: Object.keys(attemptsByMonth).length === 0 });

  return {
    recentAttempts,
    attemptsByMonth,
    isLoadingAttempts
  };
};
