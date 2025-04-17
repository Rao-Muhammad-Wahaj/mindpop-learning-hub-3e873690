
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, BookOpen, FileCheck, Award, Plus, ArrowRight } from "lucide-react";
import { useCourses } from "@/providers/CoursesProvider";
import { useQuizzes } from "@/providers/QuizzesProvider";
import { useQuizAttempts } from "@/providers/QuizAttemptsProvider";
import { supabase } from "@/integrations/supabase/client";

const COLORS = ['#9b87f5', '#E5DEFF'];

export default function AdminDashboard() {
  const { courses } = useCourses();
  const { quizzes } = useQuizzes();
  const { attempts } = useQuizAttempts();
  
  const [totalStudents, setTotalStudents] = useState(0);
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch total students (profiles with role student)
  useEffect(() => {
    const fetchTotalStudents = async () => {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student');

      if (!error) {
        setTotalStudents(count || 0);
      }
      setIsLoading(false);
    };

    fetchTotalStudents();
  }, []);

  // Prepare data for charts
  const courseEnrollmentData = courses.map(course => ({
    name: course.title,
    students: 0, // Would need an enrollment table to get actual numbers
    quizzes: quizzes.filter(quiz => quiz.courseId === course.id).length
  }));

  const quizPerformanceData = quizzes.map(quiz => {
    const quizAttempts = attempts.filter(attempt => attempt.quizId === quiz.id);
    const averageScore = quizAttempts.length > 0 
      ? quizAttempts.reduce((sum, attempt) => sum + (attempt.score / attempt.maxScore) * 100, 0) / quizAttempts.length 
      : 0;
    
    return {
      name: quiz.title,
      average: Math.round(averageScore)
    };
  });

  // Mock data for student activity (would need to implement tracking)
  const studentActivityData = [
    { name: "Mon", active: 0 },
    { name: "Tue", active: 0 },
    { name: "Wed", active: 0 },
    { name: "Thu", active: 0 },
    { name: "Fri", active: 0 },
    { name: "Sat", active: 0 },
    { name: "Sun", active: 0 },
  ];

  // Calculate quiz completion data
  const completedAttempts = attempts.filter(attempt => attempt.completedAt).length;
  const incompleteAttempts = attempts.filter(attempt => !attempt.completedAt).length;
  
  const quizCompletionData = [
    { name: "Completed", value: completedAttempts },
    { name: "Incomplete", value: incompleteAttempts },
  ];

  // Animation
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

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="mindpop-heading mb-2">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor platform activity and student performance
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
          <Link to="/admin/courses">
            <Button className="flex items-center">
              <Plus className="mr-2 h-4 w-4" /> New Course
            </Button>
          </Link>
          <Link to="/admin/quizzes/new">
            <Button variant="outline" className="flex items-center">
              <Plus className="mr-2 h-4 w-4" /> New Quiz
            </Button>
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
                Total Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Users className="w-5 h-5 text-mindpop-400 mr-2" />
                <div className="text-2xl font-bold">{totalStudents}</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Courses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <BookOpen className="w-5 h-5 text-mindpop-400 mr-2" />
                <div className="text-2xl font-bold">{courses.length}</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Quizzes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <FileCheck className="w-5 h-5 text-mindpop-400 mr-2" />
                <div className="text-2xl font-bold">{quizzes.length}</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Completion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Award className="w-5 h-5 text-mindpop-400 mr-2" />
                <div className="text-2xl font-bold">
                  {attempts.length > 0 
                    ? Math.round((completedAttempts / attempts.length) * 100)
                    : 0}%
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <motion.div 
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="md:col-span-2"
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Course Enrollment</CardTitle>
              <CardDescription>
                Number of students enrolled per course
              </CardDescription>
            </CardHeader>
            <CardContent>
              {courses.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={courseEnrollmentData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="students" fill="#9b87f5" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center text-muted-foreground">
                  No course data available. Create courses to see enrollment statistics.
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="md:col-span-1"
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Quiz Completion</CardTitle>
              <CardDescription>
                Overview of quiz attempts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {attempts.length > 0 ? (
                <div className="h-80 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={quizCompletionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {quizCompletionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center text-muted-foreground">
                  No quiz attempts yet. Students need to take quizzes to see completion data.
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <motion.div 
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="col-span-1 md:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle>Student Activity</CardTitle>
              <CardDescription>
                Active students per day this week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={studentActivityData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="active" fill="#7E69AB" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="col-span-1"
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest platform events
              </CardDescription>
            </CardHeader>
            <CardContent>
              {attempts.length > 0 ? (
                <div className="space-y-4">
                  {/* This would be replaced with actual activity data */}
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Activity tracking will be implemented in a future update.</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No recent activity to display.</p>
                  <p className="text-sm text-muted-foreground mt-1">Activity will appear here as users interact with the platform.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Tabs defaultValue="quiz_performance" className="mb-8">
        <TabsList>
          <TabsTrigger value="quiz_performance">Quiz Performance</TabsTrigger>
          <TabsTrigger value="course_metrics">Course Metrics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="quiz_performance">
          <Card>
            <CardHeader>
              <CardTitle>Average Quiz Scores by Course</CardTitle>
              <CardDescription>
                How students are performing in each course
              </CardDescription>
            </CardHeader>
            <CardContent>
              {quizPerformanceData.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={quizPerformanceData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Bar dataKey="average" fill="#6E59A5" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center text-muted-foreground">
                  No quiz performance data available. Students need to complete quizzes to see performance metrics.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="course_metrics">
          <Card>
            <CardHeader>
              <CardTitle>Quizzes per Course</CardTitle>
              <CardDescription>
                Number of quizzes available in each course
              </CardDescription>
            </CardHeader>
            <CardContent>
              {courseEnrollmentData.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={courseEnrollmentData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="quizzes" fill="#D6BCFA" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center text-muted-foreground">
                  No course metrics available. Create courses and quizzes to see data.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
