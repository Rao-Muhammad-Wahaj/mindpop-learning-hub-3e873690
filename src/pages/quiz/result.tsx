
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { Question, QuizAttempt } from '@/types';
import { useAuth } from '@/lib/auth';

export default function QuizResultPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [quizAttempt, setQuizAttempt] = useState<QuizAttempt | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    // Get quiz attempt data from location state
    if (location.state?.quizAttempt && location.state?.questions) {
      setQuizAttempt(location.state.quizAttempt);
      setQuestions(location.state.questions);
    } else {
      navigate('/courses');
    }
  }, [location.state, navigate]);

  if (!quizAttempt) {
    return <div className="container py-8">Loading results...</div>;
  }

  const passingScore = 70; // This could be dynamic from quiz settings
  const percentage = Math.floor((quizAttempt.score / quizAttempt.maxScore) * 100);
  const isPassed = percentage >= passingScore;

  const goBack = () => {
    navigate('/courses');
  };

  const getQuestionByID = (id: string): Question | undefined => {
    return questions.find(q => q.id === id);
  };

  return (
    <div className="container max-w-3xl py-8">
      <Card>
        <CardHeader className={`${isPassed ? 'bg-green-50 dark:bg-green-950' : 'bg-red-50 dark:bg-red-950'}`}>
          <CardTitle className="text-2xl flex items-center">
            {isPassed ? (
              <CheckCircle className="mr-2 h-6 w-6 text-green-600 dark:text-green-400" />
            ) : (
              <XCircle className="mr-2 h-6 w-6 text-red-600 dark:text-red-400" />
            )}
            Quiz Result
          </CardTitle>
          <CardDescription className="text-lg">
            {isPassed ? 'Congratulations! You passed the quiz.' : 'You did not pass the quiz.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <span className="font-medium">Score:</span>
              <span className="font-bold">{quizAttempt.score} / {quizAttempt.maxScore}</span>
            </div>
            <div className="flex justify-between mb-4">
              <span className="font-medium">Percentage:</span>
              <span className={`font-bold ${isPassed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {percentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div 
                className={`h-2.5 rounded-full ${isPassed ? 'bg-green-600' : 'bg-red-600'}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          <h3 className="text-xl font-bold mb-4">Question Review</h3>
          {quizAttempt.answers.map((answer, index) => {
            const question = getQuestionByID(answer.questionId);
            return (
              <div key={answer.questionId} className="mb-4 p-4 border rounded-lg">
                <div className="flex items-start">
                  <div className="mr-3 mt-1">
                    {answer.isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{index + 1}. {question?.text || 'Unknown question'}</h4>
                    <div className="mt-2">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Your answer: {answer.answer}</div>
                      {!answer.isCorrect && question && (
                        <div className="text-sm text-green-600 dark:text-green-400 mt-1">
                          Correct answer: {Array.isArray(question.correctAnswer) ? question.correctAnswer.join(', ') : question.correctAnswer}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
        <CardFooter>
          <Button onClick={goBack} className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to Courses
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
