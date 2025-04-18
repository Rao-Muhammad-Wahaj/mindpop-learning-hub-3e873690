
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuizzes } from '@/providers/QuizzesProvider';
import { useQuestions } from '@/providers/QuestionsProvider';
import { useQuizAttempts } from '@/providers/QuizAttemptsProvider';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Question, Quiz, QuizAttempt } from '@/types';

const QuizReviewPage = () => {
  const { courseId, quizId } = useParams<{ courseId: string; quizId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { quizzes, isLoading: quizzesLoading } = useQuizzes();
  const { questions, isLoading: questionsLoading } = useQuestions();
  const { attempts, isLoading: attemptsLoading } = useQuizAttempts();
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set loading state based on data loading
    if (!quizzesLoading && !questionsLoading && !attemptsLoading) {
      setLoading(false);
    }
  }, [quizzesLoading, questionsLoading, attemptsLoading]);

  useEffect(() => {
    // Find the quiz
    if (!quizzesLoading && quizzes.length > 0 && quizId) {
      const foundQuiz = quizzes.find(q => q.id === quizId);
      if (foundQuiz) {
        setQuiz(foundQuiz);
      } else {
        setError("Quiz not found");
      }
    }
  }, [quizId, quizzes, quizzesLoading]);

  useEffect(() => {
    // Find the questions for this quiz
    if (!questionsLoading && questions.length > 0 && quizId) {
      const filteredQuestions = questions.filter(question => question.quizId === quizId);
      setQuizQuestions(filteredQuestions);
    }
  }, [quizId, questions, questionsLoading]);

  useEffect(() => {
    // Find the user's attempt for this quiz
    if (!attemptsLoading && attempts.length > 0 && quizId && user) {
      const userAttempts = attempts.filter(
        attempt => attempt.quizId === quizId && attempt.completedAt
      );
      
      if (userAttempts.length > 0) {
        // Get the most recent attempt
        const sortedAttempts = [...userAttempts].sort(
          (a, b) => new Date(b.completedAt || '').getTime() - new Date(a.completedAt || '').getTime()
        );
        setAttempt(sortedAttempts[0]);
      } else {
        setError("No completed attempts found for this quiz");
      }
    }
  }, [quizId, attempts, attemptsLoading, user]);

  // Handle case where quiz isn't reviewable
  useEffect(() => {
    if (quiz && !quiz.reviewEnabled && !loading) {
      setError("Review is not enabled for this quiz");
    }
  }, [quiz, loading]);

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex justify-center">
          <p>Loading quiz review...</p>
        </div>
      </div>
    );
  }

  if (error || !quiz || !attempt) {
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <AlertTitle>Cannot Review Quiz</AlertTitle>
          <AlertDescription>
            {error || "Unable to load quiz review. You may not have permission to review this quiz."}
          </AlertDescription>
        </Alert>
        <Button 
          className="mt-4" 
          onClick={() => navigate(`/courses/${courseId}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Course
        </Button>
      </div>
    );
  }

  const score = attempt.score || 0;
  const maxScore = attempt.maxScore || 1; // Avoid division by zero
  const percentage = Math.round((score / maxScore) * 100);

  // Create a mapping of question IDs to answers for easier lookup
  const answerMap: Record<string, any> = {};
  attempt.answers.forEach(answer => {
    answerMap[answer.questionId] = answer;
  });

  return (
    <div className="container max-w-3xl py-8">
      <div className="mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/courses/${courseId}`)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Course
        </Button>
        
        <h1 className="text-2xl font-bold mb-2">{quiz.title} - Review</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Completed on {new Date(attempt.completedAt || '').toLocaleDateString()}
        </p>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Quiz Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">Score:</span>
                <span className="text-lg font-bold">{score} / {maxScore} ({percentage}%)</span>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Total points</span>
                  <span>{percentage}%</span>
                </div>
                <Progress 
                  value={percentage} 
                  className="h-2" 
                  color={percentage >= (quiz.passingScore || 70) ? "green" : "red"}
                />
              </div>
              
              <div className="pt-2">
                {percentage >= (quiz.passingScore || 70) ? (
                  <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <AlertTitle>Passed!</AlertTitle>
                    <AlertDescription>
                      Congratulations! You've successfully passed this quiz.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertTitle>Not Passed</AlertTitle>
                    <AlertDescription>
                      You didn't reach the passing score of {quiz.passingScore || 70}%. You may want to review the course material.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Questions and Answers</h2>
        
        {quizQuestions.map((question, index) => {
          const userAnswer = answerMap[question.id] || {};
          const isCorrect = userAnswer.isCorrect || false;
          
          return (
            <Card key={question.id} className={`border-l-4 ${isCorrect ? 'border-l-green-500' : 'border-l-red-500'}`}>
              <CardHeader>
                <CardTitle className="flex items-start justify-between">
                  <div>Question {index + 1}</div>
                  <div className={isCorrect ? 'text-green-600' : 'text-red-600'}>
                    {isCorrect ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <XCircle className="h-5 w-5" />
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-lg font-medium">{question.text}</p>
                  
                  {question.type === 'multiple_choice' && (
                    <div className="space-y-2">
                      {Array.isArray(question.options) && question.options.map((option, optionIndex) => {
                        const isUserChoice = userAnswer.answer === optionIndex.toString();
                        const isCorrectChoice = question.correctAnswer.toString() === optionIndex.toString();
                        
                        return (
                          <div 
                            key={optionIndex}
                            className={`p-2 rounded flex items-center ${
                              isUserChoice && isCorrectChoice ? 'bg-green-100 dark:bg-green-900/20' :
                              isUserChoice && !isCorrectChoice ? 'bg-red-100 dark:bg-red-900/20' :
                              !isUserChoice && isCorrectChoice ? 'bg-green-50 dark:bg-green-900/10' :
                              'bg-gray-50 dark:bg-gray-800/50'
                            }`}
                          >
                            {isUserChoice && (
                              isCorrectChoice ? (
                                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mr-2" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-600 dark:text-red-400 mr-2" />
                              )
                            )}
                            {!isUserChoice && isCorrectChoice && (
                              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mr-2" />
                            )}
                            <span>{option}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  {question.type === 'true_false' && (
                    <div className="space-y-2">
                      {['True', 'False'].map((option, optionIndex) => {
                        const isUserChoice = userAnswer.answer === optionIndex.toString();
                        const isCorrectChoice = question.correctAnswer.toString() === optionIndex.toString();
                        
                        return (
                          <div 
                            key={optionIndex}
                            className={`p-2 rounded flex items-center ${
                              isUserChoice && isCorrectChoice ? 'bg-green-100 dark:bg-green-900/20' :
                              isUserChoice && !isCorrectChoice ? 'bg-red-100 dark:bg-red-900/20' :
                              !isUserChoice && isCorrectChoice ? 'bg-green-50 dark:bg-green-900/10' :
                              'bg-gray-50 dark:bg-gray-800/50'
                            }`}
                          >
                            {isUserChoice && (
                              isCorrectChoice ? (
                                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mr-2" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-600 dark:text-red-400 mr-2" />
                              )
                            )}
                            {!isUserChoice && isCorrectChoice && (
                              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mr-2" />
                            )}
                            <span>{option}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  {question.type === 'short_answer' && (
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Your answer:</p>
                        <div className={`p-2 rounded ${isCorrect ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
                          {userAnswer.answer || '(No answer provided)'}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Correct answer:</p>
                        <div className="p-2 rounded bg-green-50 dark:bg-green-900/10">
                          {question.correctAnswer.toString()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      <div className="mt-8">
        <Button 
          onClick={() => navigate(`/courses/${courseId}`)}
          className="w-full"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Course
        </Button>
      </div>
    </div>
  );
};

export default QuizReviewPage;
