
import { createContext, useContext, ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Course } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface CoursesContextType {
  courses: Course[];
  isLoading: boolean;
  error: Error | null;
  createCourse: (course: Omit<Course, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'enrolledCount'>) => Promise<Course | null>;
  updateCourse: (id: string, course: Partial<Course>) => Promise<Course | null>;
  deleteCourse: (id: string) => Promise<boolean>;
}

const CoursesContext = createContext<CoursesContextType | undefined>(undefined);

export function CoursesProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all courses
  const { data: courses = [], isLoading, error } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*');

      if (error) {
        throw new Error(error.message);
      }

      return data.map(course => ({
        id: course.id,
        title: course.title,
        description: course.description,
        imageUrl: course.image_url,
        createdBy: course.created_by,
        createdAt: course.created_at,
        updatedAt: course.updated_at,
        enrolledCount: 0 // We'll calculate this in a separate query if needed
      }));
    },
  });

  // Create a new course
  const createCourseMutation = useMutation({
    mutationFn: async (course: Omit<Course, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'enrolledCount'>) => {
      const user = await supabase.auth.getUser();
      
      if (!user.data.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('courses')
        .insert({
          title: course.title,
          description: course.description,
          image_url: course.imageUrl,
          created_by: user.data.user.id,
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return {
        id: data.id,
        title: data.title,
        description: data.description,
        imageUrl: data.image_url,
        createdBy: data.created_by,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        enrolledCount: 0
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast({
        title: 'Success',
        description: 'Course created successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to create course: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Update an existing course
  const updateCourseMutation = useMutation({
    mutationFn: async ({ id, course }: { id: string; course: Partial<Course> }) => {
      const { data, error } = await supabase
        .from('courses')
        .update({
          title: course.title,
          description: course.description,
          image_url: course.imageUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return {
        id: data.id,
        title: data.title,
        description: data.description,
        imageUrl: data.image_url,
        createdBy: data.created_by,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        enrolledCount: course.enrolledCount || 0
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast({
        title: 'Success',
        description: 'Course updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update course: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Delete a course
  const deleteCourseMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast({
        title: 'Success',
        description: 'Course deleted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete course: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Create a course
  const createCourse = async (course: Omit<Course, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'enrolledCount'>) => {
    try {
      return await createCourseMutation.mutateAsync(course);
    } catch (error) {
      console.error('Error creating course:', error);
      return null;
    }
  };

  // Update a course
  const updateCourse = async (id: string, course: Partial<Course>) => {
    try {
      return await updateCourseMutation.mutateAsync({ id, course });
    } catch (error) {
      console.error('Error updating course:', error);
      return null;
    }
  };

  // Delete a course
  const deleteCourse = async (id: string) => {
    try {
      return await deleteCourseMutation.mutateAsync(id);
    } catch (error) {
      console.error('Error deleting course:', error);
      return false;
    }
  };

  return (
    <CoursesContext.Provider
      value={{
        courses,
        isLoading,
        error,
        createCourse,
        updateCourse,
        deleteCourse,
      }}
    >
      {children}
    </CoursesContext.Provider>
  );
}

export function useCourses() {
  const context = useContext(CoursesContext);
  if (context === undefined) {
    throw new Error('useCourses must be used within a CoursesProvider');
  }
  return context;
}
