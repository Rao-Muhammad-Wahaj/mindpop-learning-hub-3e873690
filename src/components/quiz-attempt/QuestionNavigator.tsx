
import { CheckCircle } from "lucide-react";

interface QuestionNavigatorProps {
  questions: { id: string }[];
  currentQuestionIndex: number;
  answers: Record<string, string>;
  onQuestionSelect: (index: number) => void;
}

export function QuestionNavigator({ 
  questions, 
  currentQuestionIndex, 
  answers, 
  onQuestionSelect 
}: QuestionNavigatorProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {questions.map((q, index) => (
        <button
          key={q.id}
          onClick={() => onQuestionSelect(index)}
          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
            currentQuestionIndex === index
              ? 'bg-mindpop-400 text-white'
              : answers[q.id]
              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          {index + 1}
          {answers[q.id] && (
            <CheckCircle className="absolute -top-1 -right-1 h-3 w-3 text-green-500" />
          )}
        </button>
      ))}
    </div>
  );
}
