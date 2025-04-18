
import { createContext, useContext, ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Question } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface QuestionsContextType {
  questions: Question[];
  isLoading: boolean;
  error: Error | null;
  getQuestionsByQuiz: (quizId: string) => Question[];
  createQuestion: (question: Omit<Question, 'id'>) => Promise<Question | null>;
  updateQuestion: (id: string, question: Partial<Question>) => Promise<Question | null>;
  deleteQuestion: (id: string) => Promise<boolean>;
}

const QuestionsContext = createContext<QuestionsContextType | undefined>(undefined);

export function QuestionsProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all questions
  const { data: questions = [], isLoading, error } = useQuery({
    queryKey: ['questions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('questions')
        .select('*');

      if (error) {
        throw new Error(error.message);
      }

      return data.map(question => ({
        id: question.id,
        quizId: question.quiz_id,
        text: question.text,
        type: question.type as 'multiple_choice' | 'true_false' | 'short_answer',
        options: question.options ? Array.isArray(question.options) ? question.options : [] : [],
        correctAnswer: question.correct_answer,
        points: question.points
      }));
    },
  });

  // Get questions by quiz ID
  const getQuestionsByQuiz = (quizId: string) => {
    return questions.filter(question => question.quizId === quizId);
  };

  // Create a new question
  const createQuestionMutation = useMutation({
    mutationFn: async (question: Omit<Question, 'id'>) => {
      const { data, error } = await supabase
        .from('questions')
        .insert({
          quiz_id: question.quizId,
          text: question.text,
          type: question.type,
          options: question.options,
          correct_answer: question.correctAnswer,
          points: question.points
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return {
        id: data.id,
        quizId: data.quiz_id,
        text: data.text,
        type: data.type as 'multiple_choice' | 'true_false' | 'short_answer',
        options: data.options ? Array.isArray(data.options) ? data.options : [] : [],
        correctAnswer: data.correct_answer,
        points: data.points
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      toast({
        title: 'Success',
        description: 'Question created successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to create question: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Update an existing question
  const updateQuestionMutation = useMutation({
    mutationFn: async ({ id, question }: { id: string; question: Partial<Question> }) => {
      const { data, error } = await supabase
        .from('questions')
        .update({
          text: question.text,
          type: question.type,
          options: question.options,
          correct_answer: question.correctAnswer,
          points: question.points
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return {
        id: data.id,
        quizId: data.quiz_id,
        text: data.text,
        type: data.type as 'multiple_choice' | 'true_false' | 'short_answer',
        options: data.options ? Array.isArray(data.options) ? data.options : [] : [],
        correctAnswer: data.correct_answer,
        points: data.points
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      toast({
        title: 'Success',
        description: 'Question updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update question: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Delete a question
  const deleteQuestionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      toast({
        title: 'Success',
        description: 'Question deleted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete question: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Create a question
  const createQuestion = async (question: Omit<Question, 'id'>) => {
    try {
      return await createQuestionMutation.mutateAsync(question);
    } catch (error) {
      console.error('Error creating question:', error);
      return null;
    }
  };

  // Update a question
  const updateQuestion = async (id: string, question: Partial<Question>) => {
    try {
      return await updateQuestionMutation.mutateAsync({ id, question });
    } catch (error) {
      console.error('Error updating question:', error);
      return null;
    }
  };

  // Delete a question
  const deleteQuestion = async (id: string) => {
    try {
      return await deleteQuestionMutation.mutateAsync(id);
    } catch (error) {
      console.error('Error deleting question:', error);
      return false;
    }
  };

  return (
    <QuestionsContext.Provider
      value={{
        questions,
        isLoading,
        error,
        getQuestionsByQuiz,
        createQuestion,
        updateQuestion,
        deleteQuestion,
      }}
    >
      {children}
    </QuestionsContext.Provider>
  );
}

export function useQuestions() {
  const context = useContext(QuestionsContext);
  if (context === undefined) {
    throw new Error('useQuestions must be used within a QuestionsProvider');
  }
  return context;
}
