
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCourses } from "@/providers/CoursesProvider";
import { useQuizzes } from "@/providers/QuizzesProvider";
import { useQuizAttempts } from "@/providers/QuizAttemptsProvider";
import { User } from "@/types";

export const useAdminDashboard = () => {
  const { courses } = useCourses();
  const { quizzes } = useQuizzes();
  const { attempts } = useQuizAttempts();

  // Fix for issue #1: Correctly count total students with role = 'student'
  const { data: totalStudents = 0, isLoading: isLoadingStudents } = useQuery({
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

  // Get all completed courses per student to calculate completion rate
  const { data: studentCompletions = [], isLoading: isLoadingCompletions } = useQuery({
    queryKey: ['student-completions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          user_id,
          course_id,
          progress,
          completed_quizzes
        `);

      if (error) throw error;
      return data;
    }
  });

  // Get recent quiz attempts with student details for issue #3
  const { data: recentQuizAttempts = [], isLoading: isLoadingAttempts } = useQuery({
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
          profiles(name),
          quizzes(title, course_id)
        `)
        .order('completed_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      
      return data.map(attempt => ({
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

  // Fix for issue #2: Calculate completion rate correctly
  const calculateCompletionRate = () => {
    if (studentCompletions.length === 0) return 0;
    
    // Group by student
    const enrollmentsByStudent: Record<string, any[]> = {};
    studentCompletions.forEach(enrollment => {
      if (!enrollmentsByStudent[enrollment.user_id]) {
        enrollmentsByStudent[enrollment.user_id] = [];
      }
      enrollmentsByStudent[enrollment.user_id].push(enrollment);
    });
    
    let totalEnrolled = 0;
    let totalCompleted = 0;
    
    // For each student, check if all quizzes in each course are completed
    Object.values(enrollmentsByStudent).forEach(enrollments => {
      enrollments.forEach(enrollment => {
        totalEnrolled++;
        
        // Get all quizzes for this course
        const courseQuizzes = quizzes.filter(q => q.courseId === enrollment.course_id);
        
        // If no quizzes, the course is technically "complete"
        if (courseQuizzes.length === 0) {
          totalCompleted++;
          return;
        }
        
        // Extract the completed quizzes array safely
        let completedQuizIds: string[] = [];
        if (enrollment.completed_quizzes) {
          // Handle different possible types for completed_quizzes
          if (Array.isArray(enrollment.completed_quizzes)) {
            completedQuizIds = enrollment.completed_quizzes.map(q => 
              typeof q === 'string' ? q : String(q)
            );
          }
        }
        
        // Check if all quizzes are completed
        const allCompleted = courseQuizzes.every(quiz => 
          completedQuizIds.includes(quiz.id)
        );
        
        if (allCompleted) {
          totalCompleted++;
        }
      });
    });
    
    return totalEnrolled > 0 ? Math.round((totalCompleted / totalEnrolled) * 100) : 0;
  };

  // Get course enrollment data
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

  // Fix for completion rate calculation
  const completionRate = calculateCompletionRate();

  // Group recent quiz attempts by month
  const attemptsByMonth = recentQuizAttempts.reduce((acc, attempt) => {
    const month = attempt.month;
    if (!acc[month]) {
      acc[month] = [];
    }
    acc[month].push(attempt);
    return acc;
  }, {} as Record<string, typeof recentQuizAttempts>);

  return {
    totalStudents,
    coursesCount: courses.length,
    quizzesCount: quizzes.length,
    completionRate,
    enrollments,
    quizCompletionData,
    quizPerformanceData,
    recentQuizAttempts,
    attemptsByMonth,
    isLoading: isLoadingStudents || isLoadingCompletions || isLoadingAttempts
  };
};
