import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Clock, AlertCircle, CheckCircle } from "lucide-react";
import { Question, Quiz } from "@/types";
import { useAuth } from "@/lib/auth";

const mockQuiz: Quiz = {
  id: "q1",
  courseId: "1",
  title: "Basic Algebra Quiz",
  description: "Test your knowledge of basic algebraic concepts.",
  timeLimit: 15, // in minutes
  passingScore: 70, // percentage
  createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  reviewEnabled: true,
};

const mockQuestions: Question[] = [
  {
    id: "que1",
    quizId: "q1",
    text: "Solve for x: 3x + 5 = 14",
    type: "multiple_choice",
    options: ["x = 3", "x = 4", "x = 5", "x = 6"],
    correctAnswer: "x = 3",
    points: 1,
  },
  {
    id: "que2",
    quizId: "q1",
    text: "If y = 2x + 3 and x = 4, what is the value of y?",
    type: "multiple_choice",
    options: ["y = 8", "y = 11", "y = 14", "y = 10"],
    correctAnswer: "y = 11",
    points: 1,
  },
  {
    id: "que3",
    quizId: "q1",
    text: "Is the equation 2x + 3 = 2(x + 1.5) true for all values of x?",
    type: "true_false",
    options: [],
    correctAnswer: "true",
    points: 1,
  },
  {
    id: "que4",
    quizId: "q1",
    text: "What is the slope of the line represented by the equation y = -2x + 7?",
    type: "multiple_choice",
    options: ["2", "-2", "7", "-7"],
    correctAnswer: "-2",
    points: 2,
  },
  {
    id: "que5",
    quizId: "q1",
    text: "Solve the equation: 5x - 3 = 2x + 6",
    type: "multiple_choice",
    options: ["x = 3", "x = -3", "x = 9", "x = -9"],
    correctAnswer: "x = 3",
    points: 2,
  },
];

export default function QuizAttemptPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuizData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (id === "q1") {
          setQuiz(mockQuiz);
          setQuestions(mockQuestions);
          setTimeLeft(mockQuiz.timeLimit * 60);
        } else {
          setError("Quiz not found");
        }
      } catch (error) {
        console.error("Error fetching quiz:", error);
        setError("An error occurred while loading the quiz");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchQuizData();
    }
  }, [id]);

  useEffect(() => {
    if (!timeLeft || timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev && prev > 0) {
          return prev - 1;
        }
        return 0;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    if (timeLeft === 0) {
      handleSubmitQuiz();
    }
  }, [timeLeft]);

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const calculateScore = () => {
    let score = 0;
    let totalPoints = 0;
    
    questions.forEach(question => {
      totalPoints += question.points;
      if (answers[question.id] === question.correctAnswer) {
        score += question.points;
      }
    });
    
    return {
      score,
      totalPoints,
      percentage: Math.round((score / totalPoints) * 100)
    };
  };

  const handleSubmitQuiz = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const { score, totalPoints, percentage } = calculateScore();
      
      const quizAttempt = {
        id: `attempt_${Date.now()}`,
        quizId: id!,
        courseId: quiz?.courseId!,
        userId: user?.id,
        score,
        answers: Object.keys(answers).map(questionId => {
          const question = questions.find(q => q.id === questionId);
          return {
            questionId,
            answer: answers[questionId],
            isCorrect: question?.correctAnswer === answers[questionId]
          };
        })
      };
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      navigate(`/quiz/${id}/result`, { 
        state: { 
          quizAttempt,
          percentage,
          isPassed: percentage >= (quiz?.passingScore || 0)
        } 
      });
    } catch (error) {
      console.error("Error submitting quiz:", error);
      setError("An error occurred while submitting your quiz. Please try again.");
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentQuestionIndex];
  const isAnswered = currentQuestion && answers[currentQuestion.id];
  const answeredCount = Object.keys(answers).length;
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-mindpop-300 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-900 dark:text-white">Loading Quiz...</p>
        </div>
      </div>
    );
  }

  if (error || !quiz || !questions.length) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error || "Quiz not found or unavailable"}
            </AlertDescription>
          </Alert>
          <div className="mt-6 text-center">
            <Button onClick={() => navigate(-1)}>Go Back</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <motion.div variants={itemVariants}>
          <div className="flex justify-between items-center mb-4">
            <h1 className="mindpop-heading">{quiz.title}</h1>
            <div className={`flex items-center space-x-2 py-1 px-3 rounded-full ${timeLeft && timeLeft < 60 ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>
              <Clock className="h-4 w-4" />
              <span className="font-medium">{timeLeft ? formatTime(timeLeft) : '--:--'}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Question {currentQuestionIndex + 1} of {questions.length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {answeredCount} of {questions.length} answered
            </div>
          </div>
          
          <Progress value={(answeredCount / questions.length) * 100} className="h-2 mb-6" />
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Question {currentQuestionIndex + 1}</CardTitle>
              <CardDescription>
                {currentQuestion.points > 1 ? `${currentQuestion.points} points` : `${currentQuestion.points} point`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-medium mb-6">{currentQuestion.text}</div>
              
              {currentQuestion.type === 'multiple_choice' && (
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center">
                      <input
                        type="radio"
                        id={`option-${index}`}
                        name={`question-${currentQuestion.id}`}
                        value={option}
                        checked={answers[currentQuestion.id] === option}
                        onChange={() => handleAnswerChange(currentQuestion.id, option)}
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
              
              {currentQuestion.type === 'true_false' && (
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="true"
                      name={`question-${currentQuestion.id}`}
                      value="true"
                      checked={answers[currentQuestion.id] === "true"}
                      onChange={() => handleAnswerChange(currentQuestion.id, "true")}
                      className="h-4 w-4 text-mindpop-400 focus:ring-mindpop-300"
                    />
                    <label
                      htmlFor="true"
                      className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      True
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="false"
                      name={`question-${currentQuestion.id}`}
                      value="false"
                      checked={answers[currentQuestion.id] === "false"}
                      onChange={() => handleAnswerChange(currentQuestion.id, "false")}
                      className="h-4 w-4 text-mindpop-400 focus:ring-mindpop-300"
                    />
                    <label
                      htmlFor="false"
                      className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      False
                    </label>
                  </div>
                </div>
              )}
              
              {currentQuestion.type === 'short_answer' && (
                <div>
                  <textarea
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-mindpop-300 focus:border-mindpop-300"
                    value={answers[currentQuestion.id] || ''}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                    placeholder="Type your answer here"
                  />
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>
              
              {currentQuestionIndex < questions.length - 1 ? (
                <Button
                  onClick={handleNextQuestion}
                  disabled={!isAnswered}
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmitQuiz}
                  disabled={isSubmitting || Object.keys(answers).length !== questions.length}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? "Submitting..." : "Submit Quiz"}
                </Button>
              )}
            </CardFooter>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="flex flex-wrap gap-2 justify-center">
          {questions.map((q, index) => (
            <button
              key={q.id}
              onClick={() => setCurrentQuestionIndex(index)}
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
        </motion.div>

        <motion.div variants={itemVariants} className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            onClick={handleSubmitQuiz}
            disabled={isSubmitting || Object.keys(answers).length !== questions.length}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin mr-2">⟳</span> Submitting...
              </>
            ) : (
              `Submit Quiz (${Object.keys(answers).length}/${questions.length} Answered)`
            )}
          </Button>
          <p className="text-xs text-center mt-2 text-gray-500 dark:text-gray-400">
            You cannot change your answers after submission
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
