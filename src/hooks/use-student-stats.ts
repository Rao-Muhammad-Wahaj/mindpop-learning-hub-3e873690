
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useStudentStats = () => {
  const { data: totalStudents = 0, isLoading: isLoadingStudents } = useQuery({
    queryKey: ['total-students'],
    queryFn: async () => {
      try {
        // Get count of all profiles with 'student' role
        const { count, error } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'student');

        if (error) {
          console.error("Error fetching total students:", error);
          throw error;
        }
        
        console.log("Total students count from database:", count);
        return count || 0;
      } catch (error) {
        console.error("Error in student stats:", error);
        return 0;
      }
    }
  });

  return {
    totalStudents,
    isLoadingStudents
  };
};
