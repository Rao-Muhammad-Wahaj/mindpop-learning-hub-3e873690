
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useQuizzes } from '@/providers/QuizzesProvider';
import { useCourses } from '@/providers/CoursesProvider';
import { Quiz } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const quizSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  courseId: z.string().min(1, {
    message: "Please select a course.",
  }),
  timeLimit: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number().positive().optional()
  ),
  passingScore: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number().min(0).max(100).optional()
  ),
  reviewEnabled: z.boolean().default(false),
});

type QuizFormValues = z.infer<typeof quizSchema>;

interface QuizFormProps {
  initialData?: Quiz;
  onSuccess?: () => void;
  courseId?: string;
}

export function QuizForm({ initialData, onSuccess, courseId }: QuizFormProps) {
  const { createQuiz, updateQuiz } = useQuizzes();
  const { courses } = useCourses();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedQuiz, setSavedQuiz] = useState<Quiz | null>(null);
  const navigate = useNavigate();

  const defaultValues: Partial<QuizFormValues> = {
    title: initialData?.title || '',
    description: initialData?.description || '',
    courseId: courseId || initialData?.courseId || '',
    timeLimit: initialData?.timeLimit,
    passingScore: initialData?.passingScore,
    reviewEnabled: initialData?.reviewEnabled || false,
  };

  const form = useForm<QuizFormValues>({
    resolver: zodResolver(quizSchema),
    defaultValues,
  });

  const onSubmit = async (data: QuizFormValues) => {
    setIsSubmitting(true);
    try {
      if (initialData) {
        // Update existing quiz
        const updated = await updateQuiz(initialData.id, {
          title: data.title,
          description: data.description,
          timeLimit: data.timeLimit,
          passingScore: data.passingScore,
          reviewEnabled: data.reviewEnabled,
        });
        
        if (updated) {
          setSavedQuiz(updated);
        }
      } else {
        // Create new quiz
        const created = await createQuiz({
          title: data.title,
          description: data.description,
          courseId: data.courseId,
          timeLimit: data.timeLimit,
          passingScore: data.passingScore,
          reviewEnabled: data.reviewEnabled,
        });
        
        if (created) {
          setSavedQuiz(created);
        }
        
        // Reset form if not in edit mode and if courseId is not provided (not in course context)
        if (!courseId) {
          form.reset();
        } else {
          // If in course context, just reset the non-course fields
          form.reset({
            ...form.getValues(),
            title: '',
            description: '',
            timeLimit: undefined,
            passingScore: undefined,
            reviewEnabled: false,
          });
        }
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error saving quiz:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddQuestions = () => {
    if (savedQuiz) {
      navigate(`/admin/quizzes/${savedQuiz.id}/questions`);
    } else if (initialData) {
      navigate(`/admin/quizzes/${initialData.id}/questions`);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {!courseId && !initialData && (
          <FormField
            control={form.control}
            name="courseId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Course</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter quiz title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter quiz description" 
                  {...field} 
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="timeLimit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time Limit (minutes, optional)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="e.g., 30" 
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value === '' ? '' : parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="passingScore"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Passing Score (%, optional)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="e.g., 70" 
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value === '' ? '' : parseInt(e.target.value))}
                    min={0}
                    max={100}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="reviewEnabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Allow Review</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Students can review their answers after completion
                </p>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          {(savedQuiz || initialData) && (
            <Button 
              type="button" 
              variant="outline"
              onClick={handleAddQuestions}
            >
              Add Questions
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : initialData ? 'Update Quiz' : 'Create Quiz'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
