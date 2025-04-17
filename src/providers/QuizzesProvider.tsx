
import { createContext, useContext, ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Quiz } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface QuizzesContextType {
  quizzes: Quiz[];
  isLoading: boolean;
  error: Error | null;
  getQuizzesByCourse: (courseId: string) => Quiz[];
  createQuiz: (quiz: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Quiz | null>;
  updateQuiz: (id: string, quiz: Partial<Quiz>) => Promise<Quiz | null>;
  deleteQuiz: (id: string) => Promise<boolean>;
}

const QuizzesContext = createContext<QuizzesContextType | undefined>(undefined);

export function QuizzesProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all quizzes
  const { data: quizzes = [], isLoading, error } = useQuery({
    queryKey: ['quizzes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*');

      if (error) {
        throw new Error(error.message);
      }

      return data.map(quiz => ({
        id: quiz.id,
        courseId: quiz.course_id,
        title: quiz.title,
        description: quiz.description,
        timeLimit: quiz.time_limit,
        passingScore: quiz.passing_score,
        createdAt: quiz.created_at,
        updatedAt: quiz.updated_at,
        reviewEnabled: quiz.review_enabled
      }));
    },
  });

  // Get quizzes by course ID
  const getQuizzesByCourse = (courseId: string) => {
    return quizzes.filter(quiz => quiz.courseId === courseId);
  };

  // Create a new quiz
  const createQuizMutation = useMutation({
    mutationFn: async (quiz: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'>) => {
      const { data, error } = await supabase
        .from('quizzes')
        .insert({
          course_id: quiz.courseId,
          title: quiz.title,
          description: quiz.description,
          time_limit: quiz.timeLimit,
          passing_score: quiz.passingScore,
          review_enabled: quiz.reviewEnabled
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return {
        id: data.id,
        courseId: data.course_id,
        title: data.title,
        description: data.description,
        timeLimit: data.time_limit,
        passingScore: data.passing_score,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        reviewEnabled: data.review_enabled
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      toast({
        title: 'Success',
        description: 'Quiz created successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to create quiz: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Update an existing quiz
  const updateQuizMutation = useMutation({
    mutationFn: async ({ id, quiz }: { id: string; quiz: Partial<Quiz> }) => {
      const { data, error } = await supabase
        .from('quizzes')
        .update({
          title: quiz.title,
          description: quiz.description,
          time_limit: quiz.timeLimit,
          passing_score: quiz.passingScore,
          review_enabled: quiz.reviewEnabled,
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
        courseId: data.course_id,
        title: data.title,
        description: data.description,
        timeLimit: data.time_limit,
        passingScore: data.passing_score,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        reviewEnabled: data.review_enabled
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      toast({
        title: 'Success',
        description: 'Quiz updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update quiz: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Delete a quiz
  const deleteQuizMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      toast({
        title: 'Success',
        description: 'Quiz deleted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete quiz: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Create a quiz
  const createQuiz = async (quiz: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      return await createQuizMutation.mutateAsync(quiz);
    } catch (error) {
      console.error('Error creating quiz:', error);
      return null;
    }
  };

  // Update a quiz
  const updateQuiz = async (id: string, quiz: Partial<Quiz>) => {
    try {
      return await updateQuizMutation.mutateAsync({ id, quiz });
    } catch (error) {
      console.error('Error updating quiz:', error);
      return null;
    }
  };

  // Delete a quiz
  const deleteQuiz = async (id: string) => {
    try {
      return await deleteQuizMutation.mutateAsync(id);
    } catch (error) {
      console.error('Error deleting quiz:', error);
      return false;
    }
  };

  return (
    <QuizzesContext.Provider
      value={{
        quizzes,
        isLoading,
        error,
        getQuizzesByCourse,
        createQuiz,
        updateQuiz,
        deleteQuiz,
      }}
    >
      {children}
    </QuizzesContext.Provider>
  );
}

export function useQuizzes() {
  const context = useContext(QuizzesContext);
  if (context === undefined) {
    throw new Error('useQuizzes must be used within a QuizzesProvider');
  }
  return context;
}
