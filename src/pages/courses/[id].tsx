
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Book, Users, Calendar, Clock, FileCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useCourses } from "@/providers/CoursesProvider";
import { useQuizzes } from "@/providers/QuizzesProvider";
import { useQuizAttempts } from "@/providers/QuizAttemptsProvider";
import { supabase } from "@/integrations/supabase/client";

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { courses } = useCourses();
  const { quizzes } = useQuizzes();
  const { attempts, hasAttemptedQuiz } = useQuizAttempts();
  
  const [course, setCourse] = useState<any>(null);
  const [courseQuizzes, setCourseQuizzes] = useState<any[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);

  useEffect(() => {
    const fetchCourseData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Find course in our provider data
        if (!id) {
          setError("Missing course ID");
          return;
        }

        // Get course
        const foundCourse = courses.find(c => c.id === id);
        if (!foundCourse) {
          setError("Course not found");
          return;
        }
        
        setCourse(foundCourse);
          
        // Get quizzes for this course
        const courseQuizzes = quizzes.filter(q => q.courseId === id);
        setCourseQuizzes(courseQuizzes);
        
        // Check if user is enrolled
        if (user) {
          const { data, error } = await supabase
            .from('enrollments')
            .select('*')
            .eq('course_id', id)
            .eq('user_id', user.id)
            .single();
          
          if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
            console.error("Error checking enrollment:", error);
          }
          
          if (data) {
            setIsEnrolled(true);
            setProgress(data.progress);
          } else {
            setIsEnrolled(false);
            setProgress(0);
          }
        }
      } catch (error) {
        console.error("Error fetching course data:", error);
        setError("Failed to load course data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseData();
  }, [id, courses, quizzes, user, attempts]);

  const handleEnroll = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to enroll in this course",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    setEnrollmentLoading(true);
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .insert({
          course_id: id,
          user_id: user.id,
          progress: 0,
          completed_quizzes: []
        })
        .select();
      
      if (error) {
        console.error("Error enrolling in course:", error);
        toast({
          title: "Enrollment failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      setIsEnrolled(true);
      setProgress(0);
      
      toast({
        title: "Enrolled successfully",
        description: `You've been enrolled in ${course.title}`,
      });
    } catch (error: any) {
      console.error("Error enrolling in course:", error);
      toast({
        title: "Enrollment failed",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setEnrollmentLoading(false);
    }
  };

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
          <p className="text-lg font-medium text-gray-900 dark:text-white">Loading Course...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <h2 className="text-lg font-semibold text-red-800 dark:text-red-400 mb-2">{error || "Course not found"}</h2>
          <p className="text-red-600 dark:text-red-300 mb-4">The course you're looking for doesn't exist or has been removed.</p>
          <Link to="/courses">
            <Button>Browse All Courses</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Calculate completion percentage based on attempted quizzes
  const calculateCompletionPercentage = () => {
    if (courseQuizzes.length === 0) return 0;
    
    const attemptedQuizzes = courseQuizzes.filter(quiz => hasAttemptedQuiz(quiz.id));
    return Math.round((attemptedQuizzes.length / courseQuizzes.length) * 100);
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        <motion.div variants={itemVariants}>
          <div className="relative rounded-xl overflow-hidden">
            <div className="aspect-video w-full">
              <img
                src={course.imageUrl || "https://images.unsplash.com/photo-1501504905252-473c47e087f8"}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
              <div className="p-6 sm:p-8 w-full">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
                  {course.title}
                </h1>
                {isEnrolled && (
                  <div className="mt-4">
                    <div className="flex justify-between text-white mb-1">
                      <span className="text-sm font-medium">Your Progress</span>
                      <span className="text-sm font-medium">{calculateCompletionPercentage()}%</span>
                    </div>
                    <Progress value={calculateCompletionPercentage()} className="h-2 bg-white/20" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Course Overview
                </h2>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {course.description}
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Quizzes
                </h2>
                
                {courseQuizzes.length > 0 ? (
                  <div className="space-y-4">
                    {courseQuizzes.map((quiz) => {
                      const attempted = hasAttemptedQuiz(quiz.id);
                      const quizAttempt = attempts.find(a => a.quizId === quiz.id);
                      const score = quizAttempt?.score || 0;
                      const maxScore = quizAttempt?.maxScore || 1;
                      const scorePercentage = Math.round((score / maxScore) * 100);
                      
                      return (
                        <Card key={quiz.id} className="hover:shadow-md transition-shadow">
                          <CardHeader>
                            <CardTitle>{quiz.title}</CardTitle>
                            <CardDescription>
                              {quiz.timeLimit ? `${quiz.timeLimit} minutes · ` : ''}
                              {quiz.passingScore ? `Passing Score: ${quiz.passingScore}%` : 'No passing score set'}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {quiz.description}
                            </p>
                            
                            {attempted && (
                              <div className="mt-4">
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm font-medium">Your Score</span>
                                  <span className="text-sm font-medium">{score}/{maxScore} ({scorePercentage}%)</span>
                                </div>
                                <Progress 
                                  value={scorePercentage} 
                                  className={`h-2 ${
                                    scorePercentage >= (quiz.passingScore || 70) 
                                      ? 'bg-green-100 text-green-700' 
                                      : 'bg-red-100 text-red-700'
                                  }`} 
                                />
                              </div>
                            )}
                          </CardContent>
                          <CardFooter>
                            {isEnrolled ? (
                              attempted ? (
                                <Button variant="outline" disabled={!quiz.reviewEnabled} className="w-full">
                                  {quiz.reviewEnabled ? "Review Answers" : "Review Disabled"}
                                </Button>
                              ) : (
                                <Link to={`/quiz/${quiz.id}/attempt`} className="w-full">
                                  <Button variant="default" className="w-full">
                                    Start Quiz <ArrowRight className="ml-2 h-4 w-4" />
                                  </Button>
                                </Link>
                              )
                            ) : (
                              <Button variant="default" className="w-full" disabled>
                                Enroll to Access
                              </Button>
                            )}
                          </CardFooter>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="text-center py-8">
                      <p className="text-gray-600 dark:text-gray-400">
                        No quizzes available for this course yet.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-mindpop-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</p>
                    <p className="text-gray-900 dark:text-white">
                      {new Date(course.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-mindpop-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Updated</p>
                    <p className="text-gray-900 dark:text-white">
                      {new Date(course.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <FileCheck className="h-5 w-5 text-mindpop-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Quizzes</p>
                    <p className="text-gray-900 dark:text-white">
                      {courseQuizzes.length} available
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                {!isAdmin && (
                  isEnrolled ? (
                    <div className="w-full text-center py-2 px-4 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-md">
                      <p className="font-medium">✓ Enrolled</p>
                    </div>
                  ) : (
                    <Button 
                      onClick={handleEnroll} 
                      className="w-full"
                      disabled={enrollmentLoading}
                    >
                      {enrollmentLoading ? 'Enrolling...' : 'Enroll Now'}
                    </Button>
                  )
                )}
                
                {isAdmin && (
                  <div className="w-full flex flex-col space-y-2">
                    <Link to={`/admin/courses/${course.id}/edit`} className="w-full">
                      <Button variant="outline" className="w-full">
                        Edit Course
                      </Button>
                    </Link>
                    <Link to={`/admin/quizzes/${course.id}/quizzes`} className="w-full">
                      <Button className="w-full">
                        Manage Quizzes
                      </Button>
                    </Link>
                  </div>
                )}
              </CardFooter>
            </Card>
            
            {!isAdmin && isEnrolled && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Course Completion
                      </span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {calculateCompletionPercentage()}%
                      </span>
                    </div>
                    <Progress value={calculateCompletionPercentage()} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Quizzes Completed
                      </span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {courseQuizzes.filter(quiz => hasAttemptedQuiz(quiz.id)).length}/{courseQuizzes.length}
                      </span>
                    </div>
                    <Progress 
                      value={courseQuizzes.length > 0 ? 
                        (courseQuizzes.filter(quiz => hasAttemptedQuiz(quiz.id)).length / courseQuizzes.length) * 100 : 0} 
                      className="h-2" 
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
