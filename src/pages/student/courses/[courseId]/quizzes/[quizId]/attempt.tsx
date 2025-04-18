
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuizzes } from '@/providers/QuizzesProvider';
import { useQuestions } from '@/providers/QuestionsProvider';
import { useQuizAttempts } from '@/providers/QuizAttemptsProvider';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Question, Quiz } from '@/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

const StudentQuizAttemptPage = () => {
  const { courseId, quizId } = useParams<{ courseId: string; quizId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { quizzes, isLoading: quizzesLoading } = useQuizzes();
  const { questions, isLoading: questionsLoading } = useQuestions();
  const { hasAttemptedQuiz, createAttempt, completeAttempt } = useQuizAttempts();
  const { toast } = useToast();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [attemptStarted, setAttemptStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!quizzesLoading && quizzes.length > 0 && quizId) {
      const foundQuiz = quizzes.find(q => q.id === quizId);
      if (foundQuiz) {
        setQuiz(foundQuiz);
        if (foundQuiz.timeLimit) {
          setTimeLeft(foundQuiz.timeLimit * 60); // Convert minutes to seconds
        }
      } else {
        navigate(`/courses/${courseId}`);
      }
    }
  }, [quizId, quizzes, quizzesLoading, navigate, courseId]);

  useEffect(() => {
    if (!questionsLoading && questions.length > 0 && quizId) {
      const filteredQuestions = questions.filter(question => question.quizId === quizId);
      setQuizQuestions(filteredQuestions);
    }
  }, [quizId, questions, questionsLoading]);

  useEffect(() => {
    // Check if user has already attempted this quiz
    try {
      if (quizId && hasAttemptedQuiz(quizId)) {
        navigate(`/courses/${courseId}`);
      }
    } catch (error) {
      console.error("Error checking quiz attempt:", error);
      setError("Error checking previous attempts. Please try again.");
    }
  }, [quizId, hasAttemptedQuiz, navigate, courseId]);

  useEffect(() => {
    // Timer for quiz
    if (attemptStarted && timeLeft !== null && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (attemptStarted && timeLeft === 0) {
      // Auto-submit when time is up
      handleSubmit();
    }
  }, [timeLeft, attemptStarted]);

  const startAttempt = async () => {
    if (!user || !quizId) return;
    
    try {
      const attempt = await createAttempt({
        quizId,
        userId: user.id,
        score: 0,
        maxScore: quizQuestions.length,
        answers: []
      });
      
      if (attempt) {
        setAttemptId(attempt.id);
        setAttemptStarted(true);
      }
    } catch (error) {
      console.error('Error starting quiz attempt:', error);
      setError("Failed to start quiz. Please try again.");
    }
  };

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    if (!attemptId || !user) {
      toast({
        title: 'Error',
        description: 'Unable to submit quiz. Missing attempt information.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Calculate score
      let score = 0;
      const safeQuestions = quizQuestions || [];
      const formattedAnswers = safeQuestions.map(question => {
        const userAnswer = answers[question.id] || '';
        const isCorrect = userAnswer === question.correctAnswer.toString();
        if (isCorrect) score += question.points;
        
        return {
          questionId: question.id,
          answer: userAnswer,
          isCorrect
        };
      });
      
      await completeAttempt({
        id: attemptId,
        score,
        answers: formattedAnswers
      });
      
      navigate(`/courses/${courseId}`);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit quiz. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  if (quizzesLoading || questionsLoading) {
    return (
      <div className="container py-8">
        <div className="flex justify-center">
          <p>Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
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

  if (quizQuestions.length === 0) {
    return (
      <div className="container py-8">
        <Alert>
          <AlertTitle>No questions available</AlertTitle>
          <AlertDescription>
            This quiz doesn't have any questions yet. Please try another quiz.
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

  if (!attemptStarted) {
    return (
      <div className="container max-w-3xl py-8">
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
              onClick={() => navigate(`/courses/${courseId}`)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            <Button onClick={startAttempt}>
              Start Quiz
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const currentQ = quizQuestions[currentQuestion];
  if (!currentQ) {
    return (
      <div className="container py-8">
        <Alert>
          <AlertTitle>Error loading question</AlertTitle>
          <AlertDescription>
            We couldn't load the current question. Please try again.
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

  return (
    <div className="container max-w-3xl py-8">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">{quiz?.title}</h1>
          {timeLeft !== null && (
            <div className="text-lg font-medium">
              Time left: {formatTime(timeLeft)}
            </div>
          )}
        </div>
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Question {currentQuestion + 1} of {quizQuestions.length}</span>
            <span>{Math.round(((currentQuestion + 1) / quizQuestions.length) * 100)}%</span>
          </div>
          <Progress value={((currentQuestion + 1) / quizQuestions.length) * 100} className="h-2" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Question {currentQuestion + 1}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-lg">{currentQ.text}</p>
            
            {currentQ.type === 'multiple_choice' && (
              <RadioGroup
                value={answers[currentQ.id] || ''}
                onValueChange={(value) => handleAnswer(currentQ.id, value)}
              >
                {Array.isArray(currentQ.options) && currentQ.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {currentQ.type === 'true_false' && (
              <RadioGroup
                value={answers[currentQ.id] || ''}
                onValueChange={(value) => handleAnswer(currentQ.id, value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="0" id="true" />
                  <Label htmlFor="true">True</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="false" />
                  <Label htmlFor="false">False</Label>
                </div>
              </RadioGroup>
            )}

            {currentQ.type === 'short_answer' && (
              <Input
                value={answers[currentQ.id] || ''}
                onChange={(e) => handleAnswer(currentQ.id, e.target.value)}
                placeholder="Type your answer here"
              />
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Previous
          </Button>
          
          {currentQuestion < quizQuestions.length - 1 ? (
            <Button onClick={handleNext}>
              Next <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              variant="default"
            >
              <Check className="h-4 w-4 mr-2" /> 
              {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default StudentQuizAttemptPage;
