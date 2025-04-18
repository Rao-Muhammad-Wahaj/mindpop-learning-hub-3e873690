import { useState, useEffect } from 'react';
import { Question } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';

interface QuestionFormProps {
  quizId: string;
  initialData?: Question;
  onSuccess?: () => void;
}

export function QuestionForm({ quizId, initialData, onSuccess }: QuestionFormProps) {
  const [text, setText] = useState(initialData?.text || '');
  const [options, setOptions] = useState<string[]>(
    initialData?.options as string[] || ['', '', '', '']
  );
  const [correctAnswer, setCorrectAnswer] = useState<string>(
    initialData?.correctAnswer as string || '0'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      toast({
        title: 'Success',
        description: initialData ? 'Question updated successfully' : 'Question added successfully',
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save question',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="question">Question Text</Label>
        <Input
          id="question"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter the question"
          required
        />
      </div>

      <div className="space-y-4">
        <Label>Options</Label>
        {options.map((option, index) => (
          <div key={index} className="flex items-center space-x-2">
            <Input
              value={option}
              onChange={(e) => {
                const newOptions = [...options];
                newOptions[index] = e.target.value;
                setOptions(newOptions);
              }}
              placeholder={`Option ${index + 1}`}
              required
            />
          </div>
        ))}
      </div>

      <div>
        <Label>Correct Answer</Label>
        <RadioGroup
          value={correctAnswer}
          onValueChange={setCorrectAnswer}
          className="space-y-2"
        >
          {options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <RadioGroupItem value={index.toString()} id={`option-${index}`} />
              <Label htmlFor={`option-${index}`}>Option {index + 1}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : initialData ? 'Update Question' : 'Add Question'}
      </Button>
    </form>
  );
}
