
import { useStudentStats } from "./use-student-stats";
import { useCourseStats } from "./use-course-stats";
import { useCompletionRate } from "./use-completion-rate";
import { useQuizzes } from "@/providers/QuizzesProvider";

export const useAdminDashboard = () => {
  const { quizzes } = useQuizzes();
  const { totalStudents, isLoadingStudents } = useStudentStats();
  const { enrollments, isLoadingEnrollments } = useCourseStats();
  const { completionRate, isLoadingCompletions } = useCompletionRate();

  // Return students count directly; do not force 0 if > 0
  const realTotalStudents = typeof totalStudents === "number" && totalStudents >= 0 ? totalStudents : 0;

  return {
    totalStudents: realTotalStudents,
    coursesCount: enrollments.length,
    quizzesCount: quizzes.length,
    completionRate,
    enrollments,
    isLoading: isLoadingStudents || isLoadingEnrollments || isLoadingCompletions
  };
};
