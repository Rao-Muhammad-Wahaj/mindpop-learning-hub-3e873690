
import { useStudentStats } from "./use-student-stats";
import { useCourseStats } from "./use-course-stats";
import { useCompletionRate } from "./use-completion-rate";
import { useQuizzes } from "@/providers/QuizzesProvider";
// No need for quiz attempts if we're only showing enrollment and stats
export const useAdminDashboard = () => {
  const { quizzes } = useQuizzes();
  const { totalStudents, isLoadingStudents } = useStudentStats();
  const { enrollments, isLoadingEnrollments } = useCourseStats();
  const { completionRate, isLoadingCompletions } = useCompletionRate();

  // Defensive: ensure student count is actually a number and not NaN/null/undefined
  const realTotalStudents = typeof totalStudents === "number" && totalStudents > 0 ? totalStudents : 0;

  return {
    totalStudents: realTotalStudents,
    coursesCount: enrollments.length,
    quizzesCount: quizzes.length,
    completionRate,
    enrollments,
    isLoading: isLoadingStudents || isLoadingEnrollments || isLoadingCompletions
  };
};
