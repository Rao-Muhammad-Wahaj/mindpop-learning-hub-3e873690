
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCourses } from "@/providers/CoursesProvider";
import { useQuizzes } from "@/providers/QuizzesProvider";

export const useCourseStats = () => {
  const { courses } = useCourses();
  const { quizzes } = useQuizzes();

  const { data: enrollments = [], isLoading: isLoadingEnrollments } = useQuery({
    queryKey: ['course-enrollments'],
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

  return {
    enrollments,
    isLoadingEnrollments
  };
};
