
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useStudentStats = () => {
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

  return {
    totalStudents,
    isLoadingStudents
  };
};
