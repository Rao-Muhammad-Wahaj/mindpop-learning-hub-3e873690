
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useStudentStats = () => {
  const { data: totalStudents, isLoading: isLoadingStudents } = useQuery({
    queryKey: ["total-students"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "student");

      if (error) {
        console.error("Error fetching total students:", error);
        return 0;
      }
      // Directly return the count to avoid unnecessary type coercion.
      return typeof count === "number" ? count : 0;
    },
  });

  return {
    totalStudents: totalStudents ?? 0,
    isLoadingStudents,
  };
};
