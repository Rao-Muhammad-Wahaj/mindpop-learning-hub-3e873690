
import { Quiz, Question } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft } from "lucide-react";

interface QuizStartCardProps {
  quiz: Quiz | null;
  quizQuestions: Question[];
  onStart: () => void;
  onBack: () => void;
}

export function QuizStartCard({ quiz, quizQuestions, onStart, onBack }: QuizStartCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">{quiz?.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p>{quiz?.description}</p>
          <div className="space-y-2">
            <p><strong>Number of questions:</strong> {quizQuestions.length}</p>
            {quiz?.timeLimit && <p><strong>Time limit:</strong> {quiz.timeLimit} minutes</p>}
            {quiz?.passingScore && <p><strong>Passing score:</strong> {quiz.passingScore}%</p>}
          </div>
          <Alert>
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              You can only attempt this quiz once. Make sure you're ready before starting.
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <Button onClick={onStart}>
          Start Quiz
        </Button>
      </CardFooter>
    </Card>
  );
}
