
import { Progress } from "@/components/ui/progress";

interface QuizProgressProps {
  currentQuestion: number;
  totalQuestions: number;
  answeredCount: number;
}

export function QuizProgress({ currentQuestion, totalQuestions, answeredCount }: QuizProgressProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Question {currentQuestion + 1} of {totalQuestions}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {answeredCount} of {totalQuestions} answered
        </div>
      </div>
      <Progress value={(answeredCount / totalQuestions) * 100} className="h-2 mb-6" />
    </div>
  );
}
