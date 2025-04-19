
import { Question } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface QuestionCardProps {
  question: Question;
  currentAnswer: string;
  onAnswerChange: (answer: string) => void;
  onNext: () => void;
  onPrevious: () => void;
  isFirst: boolean;
  isLast: boolean;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function QuestionCard({ 
  question, 
  currentAnswer, 
  onAnswerChange, 
  onNext, 
  onPrevious, 
  isFirst, 
  isLast,
  onSubmit,
  isSubmitting 
}: QuestionCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Question {question.text}</CardTitle>
        <CardDescription>
          {question.points > 1 ? `${question.points} points` : `${question.points} point`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {question.type === 'multiple_choice' && (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center">
                <input
                  type="radio"
                  id={`option-${index}`}
                  name={`question-${question.id}`}
                  value={option}
                  checked={currentAnswer === option}
                  onChange={(e) => onAnswerChange(e.target.value)}
                  className="h-4 w-4 text-mindpop-400 focus:ring-mindpop-300"
                />
                <label
                  htmlFor={`option-${index}`}
                  className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {option}
                </label>
              </div>
            ))}
          </div>
        )}

        {question.type === 'true_false' && (
          <div className="space-y-3">
            {['true', 'false'].map((value) => (
              <div key={value} className="flex items-center">
                <input
                  type="radio"
                  id={value}
                  name={`question-${question.id}`}
                  value={value}
                  checked={currentAnswer === value}
                  onChange={(e) => onAnswerChange(e.target.value)}
                  className="h-4 w-4 text-mindpop-400 focus:ring-mindpop-300"
                />
                <label
                  htmlFor={value}
                  className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {value.charAt(0).toUpperCase() + value.slice(1)}
                </label>
              </div>
            ))}
          </div>
        )}

        {question.type === 'short_answer' && (
          <textarea
            rows={3}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-mindpop-300 focus:border-mindpop-300"
            value={currentAnswer}
            onChange={(e) => onAnswerChange(e.target.value)}
            placeholder="Type your answer here"
          />
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={isFirst}
        >
          Previous
        </Button>
        
        {!isLast ? (
          <Button
            onClick={onNext}
            disabled={!currentAnswer}
          >
            Next
          </Button>
        ) : (
          <Button
            onClick={onSubmit}
            disabled={isSubmitting || !currentAnswer}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? "Submitting..." : "Submit Quiz"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
