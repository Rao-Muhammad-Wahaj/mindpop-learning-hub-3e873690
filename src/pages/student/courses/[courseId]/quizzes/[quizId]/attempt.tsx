
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuizzes } from '@/providers/QuizzesProvider';
import { useQuestions } from '@/providers/QuestionsProvider';
import { useQuizAttempts } from '@/providers/QuizAttemptsProvider';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { QuizProgress } from '@/components/quiz-attempt/QuizProgress';
import { QuestionCard } from '@/components/quiz-attempt/QuestionCard';
import { QuestionNavigator } from '@/components/quiz-attempt/QuestionNavigator';
import { AttemptControls } from '@/components/quiz-attempt/AttemptControls';
import { QuizTimerDisplay } from '@/components/quiz-attempt/QuizTimerDisplay';
import { ArrowLeft } from 'lucide-react';
import { QuizStartCard } from '@/components/quiz-attempt/QuizStartCard';
import { Question, Quiz } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';

export default function StudentQuizAttemptPage() {
  const { courseId, quizId } = useParams<{ courseId: string; quizId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { quizzes, isLoading: quizzesLoading } = useQuizzes();
  const { questions, isLoading: questionsLoading } = useQuestions();
  const { hasAttemptedQuiz, createAttempt, completeAttempt } = useQuizAttempts();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
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

  const startAttempt = async () => {
    if (!user || !quizId) return;
    
    try {
      const attempt = await createAttempt({
        quizId,
        userId: user.id,
        score: 0,
        maxScore: quizQuestions.length,
        answers: [],
        studentName: user.name || 'Unknown Student' // Include student name from auth context
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

  const handleSubmit = async () => {
    if (!attemptId || !user || !quizId || !courseId) {
      toast({
        title: 'Error',
        description: 'Unable to submit quiz. Missing attempt information.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let score = 0;
      const safeQuestions = quizQuestions || [];
      const formattedAnswers = safeQuestions.map(question => {
        const userAnswer = answers[question.id] || '';
        let isCorrect = false;
        
        // Fix for MCQ answer comparison
        if (question.type === 'multiple_choice') {
          // If correctAnswer is a number (index), convert it to a letter (A, B, C, D)
          const correctAnswer = question.correctAnswer.toString();
          if (/^[0-9]+$/.test(correctAnswer)) {
            // Convert number to letter (0 -> A, 1 -> B, etc)
            const correctLetter = String.fromCharCode(65 + parseInt(correctAnswer, 10));
            isCorrect = userAnswer === correctLetter;
          } else {
            isCorrect = userAnswer === correctAnswer;
          }
        } else {
          // For other question types (true/false, short_answer)
          isCorrect = userAnswer === question.correctAnswer.toString();
        }
        
        if (isCorrect) score += question.points;
        
        return {
          questionId: question.id,
          answer: userAnswer,
          isCorrect
        };
      });
      
      await completeAttempt({
        id: attemptId,
        quizId: quizId,
        courseId: courseId,
        score,
        answers: formattedAnswers,
        studentName: user.name || 'Unknown Student' // Include student name during completion
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

  if (!attemptStarted) {
    return (
      <div className="container max-w-3xl py-8">
        <QuizStartCard
          quiz={quiz}
          quizQuestions={quizQuestions}
          onStart={startAttempt}
          onBack={() => navigate(`/courses/${courseId}`)}
        />
      </div>
    );
  }

  const currentQuestion = quizQuestions[currentQuestionIndex];
  
  return (
    <div className="container max-w-3xl py-8">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">{quiz?.title}</h1>
          <QuizTimerDisplay timeLeft={timeLeft} onTimeUp={handleSubmit} />
        </div>
        
        <QuizProgress
          currentQuestion={currentQuestionIndex}
          totalQuestions={quizQuestions.length}
          answeredCount={Object.keys(answers).length}
        />
      </div>

      {currentQuestion && (
        <QuestionCard
          question={currentQuestion}
          currentAnswer={answers[currentQuestion.id] || ''}
          onAnswerChange={(answer) => handleAnswer(currentQuestion.id, answer)}
          onNext={() => setCurrentQuestionIndex(prev => prev + 1)}
          onPrevious={() => setCurrentQuestionIndex(prev => prev - 1)}
          isFirst={currentQuestionIndex === 0}
          isLast={currentQuestionIndex === quizQuestions.length - 1}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      )}

      <div className={`mt-6 ${isMobile ? 'overflow-x-auto pb-2' : ''}`}>
        <QuestionNavigator
          questions={quizQuestions}
          currentQuestionIndex={currentQuestionIndex}
          answers={answers}
          onQuestionSelect={setCurrentQuestionIndex}
        />
      </div>

      <AttemptControls
        questionCount={quizQuestions.length}
        answeredCount={Object.keys(answers).length}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
