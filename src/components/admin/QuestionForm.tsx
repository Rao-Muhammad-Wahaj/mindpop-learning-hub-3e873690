
import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useQuestions } from '@/providers/QuestionsProvider';
import { useQuizzes } from '@/providers/QuizzesProvider';
import { Question } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Trash2, Plus } from 'lucide-react';

const questionSchema = z.object({
  text: z.string().min(3, {
    message: "Question text must be at least 3 characters.",
  }),
  quizId: z.string().min(1, {
    message: "Please select a quiz.",
  }),
  type: z.enum(['multiple_choice', 'true_false', 'short_answer']),
  options: z.array(z.string()).min(1, {
    message: "At least one option is required.",
  }).optional(),
  correctAnswer: z.union([z.string(), z.array(z.string())]),
  points: z.preprocess(
    (val) => (val === '' ? 1 : Number(val)),
    z.number().positive().default(1)
  ),
});

type QuestionFormValues = z.infer<typeof questionSchema>;

interface QuestionFormProps {
  initialData?: Question;
  onSuccess?: () => void;
  quizId?: string;
}

export function QuestionForm({ initialData, onSuccess, quizId }: QuestionFormProps) {
  const { createQuestion, updateQuestion } = useQuestions();
  const { quizzes } = useQuizzes();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Need to convert correctAnswer to string for form input
  const defaultValues: Partial<QuestionFormValues> = {
    text: initialData?.text || '',
    quizId: quizId || initialData?.quizId || '',
    type: initialData?.type || 'multiple_choice',
    options: initialData?.options as string[] || ['', ''],
    correctAnswer: initialData?.correctAnswer || '',
    points: initialData?.points || 1,
  };

  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options",
  });

  const questionType = form.watch('type');

  const onSubmit = async (data: QuestionFormValues) => {
    setIsSubmitting(true);
    try {
      // Process the form data based on question type
      let processedOptions: string[] | undefined;
      let processedCorrectAnswer: string | string[];

      switch (data.type) {
        case 'multiple_choice':
          processedOptions = data.options;
          processedCorrectAnswer = data.correctAnswer;
          break;
        case 'true_false':
          processedOptions = ['True', 'False'];
          processedCorrectAnswer = data.correctAnswer;
          break;
        case 'short_answer':
          processedOptions = undefined;
          processedCorrectAnswer = data.correctAnswer as string;
          break;
      }

      if (initialData) {
        // Update existing question
        await updateQuestion(initialData.id, {
          text: data.text,
          type: data.type,
          options: processedOptions,
          correctAnswer: processedCorrectAnswer,
          points: data.points,
        });
      } else {
        // Create new question
        await createQuestion({
          quizId: data.quizId,
          text: data.text,
          type: data.type,
          options: processedOptions,
          correctAnswer: processedCorrectAnswer,
          points: data.points,
        });
        
        // Reset form if not in edit mode and if quizId is not provided (not in quiz context)
        if (!quizId) {
          form.reset();
        } else {
          // If in quiz context, just reset the non-quiz fields
          form.reset({
            ...form.getValues(),
            text: '',
            type: 'multiple_choice',
            options: ['', ''],
            correctAnswer: '',
            points: 1,
          });
        }
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error saving question:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {!quizId && !initialData && (
          <FormField
            control={form.control}
            name="quizId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quiz</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a quiz" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {quizzes.map((quiz) => (
                      <SelectItem key={quiz.id} value={quiz.id}>
                        {quiz.title}
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
          name="text"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Question Text</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter your question here" 
                  {...field} 
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Question Type</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  // Reset options and correctAnswer when changing question type
                  if (value === 'multiple_choice') {
                    form.setValue("options", ['', '']);
                    form.setValue("correctAnswer", '');
                  } else if (value === 'true_false') {
                    form.setValue("options", ['True', 'False']);
                    form.setValue("correctAnswer", '');
                  } else if (value === 'short_answer') {
                    form.setValue("options", undefined);
                    form.setValue("correctAnswer", '');
                  }
                }}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select question type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                  <SelectItem value="true_false">True/False</SelectItem>
                  <SelectItem value="short_answer">Short Answer</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {questionType === 'multiple_choice' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Answer Options</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append('')}
                disabled={fields.length >= 6}
              >
                <Plus className="h-4 w-4 mr-2" /> Add Option
              </Button>
            </div>
            
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-start gap-2">
                <FormField
                  control={form.control}
                  name={`options.${index}`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input placeholder={`Option ${index + 1}`} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="correctAnswer"
                  render={({ field: correctAnswerField }) => (
                    <FormItem className="mt-2">
                      <FormControl>
                        <input
                          type="radio"
                          className="h-4 w-4"
                          checked={correctAnswerField.value === index.toString()}
                          onChange={() => correctAnswerField.onChange(index.toString())}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                  disabled={fields.length <= 2}
                  className="mt-1"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
            <div className="text-sm text-muted-foreground">
              Select the radio button next to the correct answer.
            </div>
          </div>
        )}

        {questionType === 'true_false' && (
          <FormField
            control={form.control}
            name="correctAnswer"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Correct Answer</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value as string}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="0" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        True
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="1" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        False
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {questionType === 'short_answer' && (
          <FormField
            control={form.control}
            name="correctAnswer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correct Answer</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter the correct answer" 
                    {...field} 
                    value={field.value as string}
                  />
                </FormControl>
                <FormMessage />
                <p className="text-sm text-muted-foreground">
                  Enter the expected answer. Student responses must match exactly.
                </p>
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="points"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Points</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="1" 
                  {...field}
                  value={field.value || 1}
                  onChange={(e) => field.onChange(e.target.value === '' ? 1 : parseInt(e.target.value))}
                  min={1}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : initialData ? 'Update Question' : 'Create Question'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
