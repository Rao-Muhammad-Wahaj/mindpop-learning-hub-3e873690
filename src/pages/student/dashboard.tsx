
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Clock, Award, CheckCircle, PieChart } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCourses } from '@/providers/CoursesProvider';
import { useQuizAttempts } from '@/providers/QuizAttemptsProvider';
import { Course, EnrolledCourse } from "@/types";

export default function StudentDashboard() {
  const { user } = useAuth();
  const { courses } = useCourses();
  const { attempts } = useQuizAttempts();

  const [enrolledCourses, setEnrolledCourses] = useState<(EnrolledCourse & { course: Course })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    inProgressCourses: 0,
    completedCourses: 0,
    averageScore: 0,
  });

  useEffect(() => {
    const fetchEnrollments = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('enrollments')
          .select('*')
          .eq('user_id', user.id);
          
        if (error) {
          console.error('Error fetching enrollments:', error);
          return;
        }
        
        // Map enrollments to courses
        const enrolled = data.map(enrollment => {
          const course = courses.find(c => c.id === enrollment.course_id);
          if (!course) return null;
          
          return {
            id: enrollment.id,
            courseId: enrollment.course_id,
            userId: enrollment.user_id,
            enrolledAt: enrollment.enrolled_at,
            progress: enrollment.progress,
            completedQuizzes: enrollment.completed_quizzes || [],
            course,
          };
        }).filter(Boolean);
        
        setEnrolledCourses(enrolled);
        
        // Calculate stats
        setStats({
          totalCourses: enrolled.length,
          inProgressCourses: enrolled.filter(e => e.progress < 100).length,
          completedCourses: enrolled.filter(e => e.progress === 100).length,
          averageScore: attempts.length > 0
            ? attempts.reduce((sum, quiz) => sum + (quiz.score / quiz.maxScore) * 100, 0) / attempts.length
            : 0,
        });
      } catch (error) {
        console.error('Error in fetchEnrollments:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (courses.length > 0) {
      fetchEnrollments();
    }
  }, [user, courses, attempts]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  if (isLoading) {
    return (
      <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center py-10">
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="mindpop-heading mb-2">Student Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back, {user?.name || "Student"}! Here's your learning progress.
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link to="/courses">
            <Button>Browse All Courses</Button>
          </Link>
        </div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8"
      >
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Enrolled Courses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <BookOpen className="w-5 h-5 text-mindpop-400 mr-2" />
                <div className="text-2xl font-bold">{stats.totalCourses}</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                In Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-amber-500 mr-2" />
                <div className="text-2xl font-bold">{stats.inProgressCourses}</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                <div className="text-2xl font-bold">{stats.completedCourses}</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Average Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Award className="w-5 h-5 text-mindpop-300 mr-2" />
                <div className="text-2xl font-bold">{stats.averageScore.toFixed(1)}%</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <Tabs defaultValue="courses" className="mb-8">
        <TabsList>
          <TabsTrigger value="courses">My Courses</TabsTrigger>
          <TabsTrigger value="quizzes">Recent Quizzes</TabsTrigger>
          <TabsTrigger value="stats">Performance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="courses">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {enrolledCourses.length > 0 ? (
              enrolledCourses.map((enrollment) => (
                <motion.div key={enrollment.id} variants={itemVariants}>
                  <Card className="h-full flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="h-40 overflow-hidden">
                      <img
                        src={enrollment.course.imageUrl || "https://images.unsplash.com/photo-1501504905252-473c47e087f8"}
                        alt={enrollment.course.title}
                        className="w-full h-full object-cover transition-transform hover:scale-105"
                      />
                    </div>
                    <CardHeader>
                      <CardTitle>{enrollment.course.title}</CardTitle>
                      <CardDescription>
                        Enrolled on {new Date(enrollment.enrolledAt).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <div className="mb-4">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Progress
                          </span>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {enrollment.progress}%
                          </span>
                        </div>
                        <Progress value={enrollment.progress} className="h-2" />
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {enrollment.course.description}
                      </p>
                    </CardContent>
                    <div className="p-4 pt-0 mt-auto">
                      <Link to={`/courses/${enrollment.courseId}`}>
                        <Button variant="default" className="w-full">
                          Continue Learning
                        </Button>
                      </Link>
                    </div>
                  </Card>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-10">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No courses enrolled yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Start exploring courses and begin your learning journey.
                </p>
                <Link to="/courses">
                  <Button>Browse Courses</Button>
                </Link>
              </div>
            )}
          </motion.div>
        </TabsContent>
        
        <TabsContent value="quizzes">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {attempts.length > 0 ? (
              <div className="grid gap-4">
                {attempts.map((quiz) => {
                  const courseId = courses.find(c => 
                    c.id === courses.find(c => c.id === quiz.quizId)?.id
                  )?.id;
                  
                  return (
                    <motion.div key={quiz.id} variants={itemVariants}>
                      <Card>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle>Quiz Attempt</CardTitle>
                              <CardDescription>
                                {new Date(quiz.completedAt || quiz.startedAt).toLocaleDateString()}
                              </CardDescription>
                            </div>
                            <div className="bg-mindpop-100 dark:bg-mindpop-500/20 rounded-full px-3 py-1 text-sm font-medium text-mindpop-500 dark:text-mindpop-300">
                              {((quiz.score / quiz.maxScore) * 100).toFixed(0)}%
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">Score:</span>
                              <span className="font-medium">{quiz.score} / {quiz.maxScore}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">Date:</span>
                              <span className="font-medium">
                                {new Date(quiz.completedAt || quiz.startedAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                              <span className="font-medium">
                                {quiz.completedAt
                                  ? Math.round(
                                      (new Date(quiz.completedAt).getTime() -
                                        new Date(quiz.startedAt).getTime()) /
                                        (1000 * 60)
                                    )
                                  : "N/A"}{" "}
                                minutes
                              </span>
                            </div>
                          </div>
                          {courseId && (
                            <div className="mt-4">
                              <Link to={`/courses/${courseId}`}>
                                <Button variant="outline" className="w-full">
                                  View Course
                                </Button>
                              </Link>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No quiz attempts yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  As you take quizzes, your results will appear here.
                </p>
              </div>
            )}
          </motion.div>
        </TabsContent>
        
        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle>Performance Statistics</CardTitle>
              <CardDescription>
                Your learning progress and achievements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <div className="text-center">
                  <PieChart className="h-24 w-24 mx-auto text-mindpop-300 mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Statistics visualization will appear here
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Quizzes Taken
                  </h4>
                  <p className="text-xl font-bold">{attempts.length}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Average Score
                  </h4>
                  <p className="text-xl font-bold">{stats.averageScore.toFixed(1)}%</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Courses Enrolled
                  </h4>
                  <p className="text-xl font-bold">{stats.totalCourses}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Completion Rate
                  </h4>
                  <p className="text-xl font-bold">
                    {stats.totalCourses > 0
                      ? ((stats.completedCourses / stats.totalCourses) * 100).toFixed(0)
                      : 0}%
                  </p>
                </div>
              </div>
              
              {enrolledCourses.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium mb-2">Learning Goals</h4>
                  <div className="space-y-3">
                    {enrolledCourses.map(enrollment => (
                      <div key={enrollment.id}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Complete {enrollment.course.title}
                          </span>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {enrollment.progress}%
                          </span>
                        </div>
                        <Progress value={enrollment.progress} className="h-2" />
                      </div>
                    ))}
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Achieve 80% average quiz score
                        </span>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {Math.min(100, (stats.averageScore / 80) * 100).toFixed(0)}%
                        </span>
                      </div>
                      <Progress 
                        value={Math.min(100, (stats.averageScore / 80) * 100)} 
                        className="h-2" 
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
