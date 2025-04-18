
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCourses } from "@/providers/CoursesProvider";
import { useQuizzes } from "@/providers/QuizzesProvider";
import { useQuizAttempts } from "@/providers/QuizAttemptsProvider";

export const useAdminDashboard = () => {
  const { courses } = useCourses();
  const { quizzes } = useQuizzes();
  const { attempts } = useQuizAttempts();

  const { data: totalStudents = 0 } = useQuery({
    queryKey: ['total-students'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student');

      if (error) throw error;
      return count || 0;
    }
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['enrollments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          course_id,
          courses (
            title
          )
        `);

      if (error) throw error;

      // Process enrollment data by course
      const enrollmentCounts: Record<string, number> = {};
      data.forEach(enrollment => {
        const courseId = enrollment.course_id;
        enrollmentCounts[courseId] = (enrollmentCounts[courseId] || 0) + 1;
      });

      return courses.map(course => ({
        name: course.title,
        students: enrollmentCounts[course.id] || 0,
        quizzes: quizzes.filter(quiz => quiz.courseId === course.id).length
      }));
    },
    enabled: courses.length > 0
  });

  // Calculate quiz performance data
  const quizPerformanceData = quizzes.map(quiz => {
    const quizAttempts = attempts.filter(attempt => attempt.quizId === quiz.id);
    const attemptCount = quizAttempts.length;
    
    // Calculate average score safely, handling empty arrays
    const averageScore = attemptCount > 0
      ? quizAttempts.reduce((sum, attempt) => {
          // Handle potentially undefined values
          const score = attempt.score || 0;
          const maxScore = attempt.maxScore || 1; // Avoid division by zero
          return sum + ((score / maxScore) * 100);
        }, 0) / attemptCount
      : 0;

    return {
      name: quiz.title,
      average: Math.round(averageScore)
    };
  });

  // Calculate quiz completion data safely
  const completedAttempts = attempts.filter(attempt => attempt.completedAt).length;
  const incompleteAttempts = attempts.filter(attempt => !attempt.completedAt).length;
  
  const quizCompletionData = [
    { name: "Completed", value: completedAttempts },
    { name: "Incomplete", value: incompleteAttempts },
  ];

  const completionRate = attempts.length > 0
    ? Math.round((completedAttempts / attempts.length) * 100)
    : 0;

  return {
    totalStudents,
    coursesCount: courses.length,
    quizzesCount: quizzes.length,
    completionRate,
    enrollments,
    quizCompletionData,
    quizPerformanceData
  };
};
