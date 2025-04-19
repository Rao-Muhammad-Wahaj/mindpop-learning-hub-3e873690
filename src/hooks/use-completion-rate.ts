
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useQuizzes } from "@/providers/QuizzesProvider";

export const useCompletionRate = () => {
  const { quizzes } = useQuizzes();

  const { data: completionRate = 0, isLoading: isLoadingCompletions } = useQuery({
    queryKey: ['completion-rate'],
    queryFn: async () => {
      const { data: enrollments, error } = await supabase
        .from('enrollments')
        .select(`
          user_id,
          course_id,
          completed_quizzes
        `);

      if (error) throw error;

      if (enrollments.length === 0) return 0;

      // Group by student
      const enrollmentsByStudent: Record<string, any[]> = {};
      enrollments.forEach(enrollment => {
        if (!enrollmentsByStudent[enrollment.user_id]) {
          enrollmentsByStudent[enrollment.user_id] = [];
        }
        enrollmentsByStudent[enrollment.user_id].push(enrollment);
      });

      let totalEnrolled = 0;
      let totalCompleted = 0;

      Object.values(enrollmentsByStudent).forEach(studentEnrollments => {
        studentEnrollments.forEach(enrollment => {
          totalEnrolled++;

          const courseQuizzes = quizzes.filter(q => q.courseId === enrollment.course_id);
          
          if (courseQuizzes.length === 0) {
            totalCompleted++;
            return;
          }

          let completedQuizIds: string[] = [];
          if (enrollment.completed_quizzes) {
            if (Array.isArray(enrollment.completed_quizzes)) {
              completedQuizIds = enrollment.completed_quizzes.map(q => 
                typeof q === 'string' ? q : String(q)
              );
            }
          }

          const allCompleted = courseQuizzes.every(quiz => 
            completedQuizIds.includes(quiz.id)
          );

          if (allCompleted) {
            totalCompleted++;
          }
        });
      });

      return totalEnrolled > 0 ? Math.round((totalCompleted / totalEnrolled) * 100) : 0;
    }
  });

  return {
    completionRate,
    isLoadingCompletions
  };
};
