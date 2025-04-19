
import { useStudentStats } from "./use-student-stats";
import { useCourseStats } from "./use-course-stats";
import { useQuizCompletionStats } from "./use-quiz-completion-stats";
import { useCompletionRate } from "./use-completion-rate";
import { useQuizzes } from "@/providers/QuizzesProvider";
import { useQuizAttempts } from "@/providers/QuizAttemptsProvider";

export const useAdminDashboard = () => {
  const { quizzes } = useQuizzes();
  const { attempts } = useQuizAttempts();
  const { totalStudents, isLoadingStudents } = useStudentStats();
  const { enrollments, isLoadingEnrollments } = useCourseStats();
  const { attemptsByMonth, isLoadingAttempts } = useQuizCompletionStats();
  const { completionRate, isLoadingCompletions } = useCompletionRate();

  // Calculate quiz performance data
  const quizPerformanceData = quizzes.map(quiz => {
    const quizAttempts = attempts.filter(attempt => attempt.quizId === quiz.id);
    const attemptCount = quizAttempts.length;
    
    const averageScore = attemptCount > 0
      ? quizAttempts.reduce((sum, attempt) => {
          const score = attempt.score || 0;
          const maxScore = attempt.maxScore || 1;
          return sum + ((score / maxScore) * 100);
        }, 0) / attemptCount
      : 0;

    return {
      name: quiz.title,
      average: Math.round(averageScore)
    };
  });

  // Calculate quiz completion data
  const completedAttempts = attempts.filter(attempt => attempt.completedAt).length;
  const incompleteAttempts = attempts.filter(attempt => !attempt.completedAt).length;
  
  const quizCompletionData = [
    { name: "Completed", value: completedAttempts },
    { name: "Incomplete", value: incompleteAttempts },
  ];

  return {
    totalStudents,
    coursesCount: enrollments.length,
    quizzesCount: quizzes.length,
    completionRate,
    enrollments,
    quizCompletionData,
    quizPerformanceData,
    attemptsByMonth,
    isLoading: isLoadingStudents || isLoadingEnrollments || isLoadingAttempts || isLoadingCompletions
  };
};
