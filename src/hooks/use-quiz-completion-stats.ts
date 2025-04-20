
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { QuizAttempt } from "@/types";

export const useQuizCompletionStats = () => {
  const { data: recentAttempts = [], isLoading: isLoadingAttempts } = useQuery({
    queryKey: ['recent-quiz-attempts'],
    queryFn: async () => {
      try {
        // Get the quiz attempts data with student_name column
        const { data, error } = await supabase
          .from('quiz_attempts')
          .select(`
            id,
            quiz_id,
            user_id,
            student_name,
            started_at,
            completed_at,
            score,
            max_score,
            quizzes:quiz_id(title, course_id)
          `)
          .order('completed_at', { ascending: false })
          .limit(20);

        if (error) {
          console.error("Error fetching quiz attempts:", error);
          throw error;
        }

        // Fallback: If student_name is missing, fetch from profiles
        const userIds = data
          .filter(attempt => !attempt.student_name)
          .map(attempt => attempt.user_id);

        let profileMap = new Map();
        
        if (userIds.length > 0) {
          const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, name')
            .in('id', userIds);

          if (profilesError) {
            console.error("Error fetching profiles:", profilesError);
          } else if (profiles) {
            profiles.forEach(profile => {
              profileMap.set(profile.id, profile.name || 'Unknown Student');
            });
          }
        }
        
        // Map the data with student names
        const enhancedData = data.map(attempt => {
          // Use student_name from attempt if available, otherwise from profile map, finally fallback
          const studentName = attempt.student_name || 
                            profileMap.get(attempt.user_id) || 
                            'Unknown Student';
          
          return {
            id: attempt.id,
            quizId: attempt.quiz_id,
            userId: attempt.user_id,
            studentName,
            quizTitle: attempt.quizzes?.title || 'Unknown Quiz',
            courseId: attempt.quizzes?.course_id,
            startedAt: attempt.started_at,
            completedAt: attempt.completed_at,
            score: attempt.score || 0,
            maxScore: attempt.max_score || 0,
            month: new Date(attempt.completed_at || attempt.started_at).toLocaleString('default', { month: 'long', year: 'numeric' })
          };
        });

        return enhancedData;
      } catch (error) {
        console.error("Error in quiz completion stats:", error);
        return [];
      }
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
  console.log('Quiz Completion Stats:', { 
    recentAttempts, 
    attemptsByMonth, 
    isEmpty: Object.keys(attemptsByMonth).length === 0,
    profileDataSample: recentAttempts.length > 0 ? recentAttempts[0].studentName : 'No attempts'
  });

  return {
    recentAttempts,
    attemptsByMonth,
    isLoadingAttempts
  };
};
