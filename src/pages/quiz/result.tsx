
import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { CheckCircle, XCircle, Award, ArrowLeft } from "lucide-react";
import { Quiz, Question, QuizAttempt } from "@/types";

// Mock quiz data
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

// Mock questions data
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

export default function QuizResultPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizAttempt, setQuizAttempt] = useState<QuizAttempt | null>(null);
  const [percentage, setPercentage] = useState<number>(0);
  const [isPassed, setIsPassed] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would fetch from Supabase
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // If the result data was passed via location state
        if (location.state?.quizAttempt) {
          setQuizAttempt(location.state.quizAttempt);
          setPercentage(location.state.percentage || 0);
          setIsPassed(location.state.isPassed || false);
          setQuiz(mockQuiz);
          setQuestions(mockQuestions);
        } else {
          // Fetch from "API" if data wasn't passed directly
          setQuiz(mockQuiz);
          setQuestions(mockQuestions);
          // Simulate fetching the attempt
          const mockAttempt: QuizAttempt = {
            id: "mock_attempt",
            quizId: id || "",
            userId: "2", // Student ID
            startedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
            completedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
            score: 7,
            maxScore: 10,
            answers: [
              { questionId: "que1", answer: "x = 3", isCorrect: true },
              { questionId: "que2", answer: "y = 11", isCorrect: true },
              { questionId: "que3", answer: "true", isCorrect: true },
              { questionId: "que4", answer: "2", isCorrect: false },
              { questionId: "que5", answer: "x = 3", isCorrect: true },
            ],
          };
          setQuizAttempt(mockAttempt);
          const mockPercentage = Math.round((mockAttempt.score / mockAttempt.maxScore) * 100);
          setPercentage(mockPercentage);
          setIsPassed(mockPercentage >= mockQuiz.passingScore);
        }
      } catch (error) {
        console.error("Error fetching quiz result data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, location.state]);

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

  // Data for the pie chart
  const chartData = [
    { name: "Correct", value: quizAttempt?.answers.filter(a => a.isCorrect).length || 0 },
    { name: "Incorrect", value: quizAttempt?.answers.filter(a => !a.isCorrect).length || 0 }
  ];
  const COLORS = ["#10b981", "#ef4444"];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-mindpop-300 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-900 dark:text-white">Loading Results...</p>
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
        <motion.div variants={itemVariants} className="mb-8">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => navigate(`/courses/${quiz?.courseId}`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Course
          </Button>
          
          <h1 className="mindpop-heading mb-2">{quiz?.title} - Results</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Quiz completed on {quizAttempt?.completedAt ? new Date(quizAttempt.completedAt).toLocaleString() : "N/A"}
          </p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-r from-mindpop-100 to-white dark:from-gray-800 dark:to-gray-900 border-0 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-center text-2xl">
                Your Score: {quizAttempt?.score}/{quizAttempt?.maxScore} ({percentage}%)
              </CardTitle>
              <CardDescription className="text-center text-lg">
                {isPassed ? (
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    Passed! 🎉
                  </span>
                ) : (
                  <span className="text-red-600 dark:text-red-400 font-medium">
                    Not Passed
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-4">
              <div className="w-40 h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={60}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
            <CardFooter className="justify-center pb-6">
              {isPassed ? (
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    <Award className="h-12 w-12 text-yellow-500" />
                  </div>
                  <p className="text-lg font-medium text-gray-800 dark:text-gray-200">
                    Congratulations!
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    You've successfully passed this quiz.
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                    Keep Learning!
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    Review the material and try again with a new quiz.
                  </p>
                </div>
              )}
            </CardFooter>
          </Card>
        </motion.div>

        {quiz?.reviewEnabled && (
          <motion.div variants={itemVariants}>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Review Your Answers
            </h2>
            
            <div className="space-y-4">
              {questions.map((question, index) => {
                const answer = quizAttempt?.answers.find(a => a.questionId === question.id);
                return (
                  <Card key={question.id} className={`border-l-4 ${
                    answer?.isCorrect 
                      ? 'border-l-green-500 dark:border-l-green-600' 
                      : 'border-l-red-500 dark:border-l-red-600'
                  }`}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base">Question {index + 1}</CardTitle>
                        {answer?.isCorrect ? (
                          <div className="flex items-center text-green-600 dark:text-green-400">
                            <CheckCircle className="h-5 w-5 mr-1" />
                            <span className="text-sm font-medium">Correct</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-red-600 dark:text-red-400">
                            <XCircle className="h-5 w-5 mr-1" />
                            <span className="text-sm font-medium">Incorrect</span>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 pb-3">
                      <p className="font-medium">{question.text}</p>
                      
                      {question.type === "multiple_choice" && (
                        <div className="ml-4 space-y-1">
                          {question.options.map((option, i) => (
                            <div 
                              key={i} 
                              className={`flex items-center pl-2 py-1 rounded ${
                                answer?.answer === option
                                  ? answer.isCorrect
                                    ? 'bg-green-100 dark:bg-green-900/20'
                                    : 'bg-red-100 dark:bg-red-900/20'
                                  : option === question.correctAnswer
                                    ? 'bg-green-50 dark:bg-green-900/10'
                                    : ''
                              }`}
                            >
                              <div className={`w-4 h-4 rounded-full flex-shrink-0 mr-2 ${
                                answer?.answer === option
                                  ? answer.isCorrect
                                    ? 'bg-green-500'
                                    : 'bg-red-500'
                                  : option === question.correctAnswer
                                    ? 'border-2 border-green-500'
                                    : 'border border-gray-300 dark:border-gray-600'
                              }`}></div>
                              <span>{option}</span>
                              {answer?.answer === option && !answer.isCorrect && option !== question.correctAnswer && (
                                <XCircle className="h-4 w-4 text-red-500 ml-auto" />
                              )}
                              {option === question.correctAnswer && (
                                <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {question.type === "true_false" && (
                        <div className="ml-4 space-y-1">
                          {["true", "false"].map((option) => (
                            <div 
                              key={option} 
                              className={`flex items-center pl-2 py-1 rounded ${
                                answer?.answer === option
                                  ? answer.isCorrect
                                    ? 'bg-green-100 dark:bg-green-900/20'
                                    : 'bg-red-100 dark:bg-red-900/20'
                                  : option === question.correctAnswer
                                    ? 'bg-green-50 dark:bg-green-900/10'
                                    : ''
                              }`}
                            >
                              <div className={`w-4 h-4 rounded-full flex-shrink-0 mr-2 ${
                                answer?.answer === option
                                  ? answer.isCorrect
                                    ? 'bg-green-500'
                                    : 'bg-red-500'
                                  : option === question.correctAnswer
                                    ? 'border-2 border-green-500'
                                    : 'border border-gray-300 dark:border-gray-600'
                              }`}></div>
                              <span className="capitalize">{option}</span>
                              {answer?.answer === option && !answer.isCorrect && option !== question.correctAnswer && (
                                <XCircle className="h-4 w-4 text-red-500 ml-auto" />
                              )}
                              {option === question.correctAnswer && (
                                <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {question.type === "short_answer" && (
                        <div className="space-y-2">
                          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Your Answer:</p>
                            <p className={`font-medium ${answer?.isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                              {answer?.answer || "No answer provided"}
                            </p>
                          </div>
                          
                          {!answer?.isCorrect && (
                            <div className="bg-green-50 dark:bg-green-900/10 p-3 rounded-md">
                              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Correct Answer:</p>
                              <p className="font-medium text-green-600 dark:text-green-400">
                                {question.correctAnswer as string}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </motion.div>
        )}

        <motion.div variants={itemVariants} className="flex justify-center space-x-4 pt-4">
          <Link to={`/courses/${quiz?.courseId}`}>
            <Button variant="outline">Return to Course</Button>
          </Link>
          <Link to="/dashboard">
            <Button>Go to Dashboard</Button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
