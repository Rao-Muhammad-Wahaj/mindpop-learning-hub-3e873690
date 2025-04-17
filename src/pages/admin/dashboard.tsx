
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, BookOpen, FileCheck, Award, Plus, ArrowRight } from "lucide-react";

// Mock data for admin dashboard
const courseEnrollmentData = [
  { name: "Mathematics", students: 42, quizzes: 5 },
  { name: "Physics", students: 35, quizzes: 4 },
  { name: "Biology", students: 28, quizzes: 3 },
  { name: "Chemistry", students: 31, quizzes: 3 },
  { name: "History", students: 24, quizzes: 2 },
  { name: "Creative Writing", students: 29, quizzes: 2 },
];

const quizPerformanceData = [
  { name: "Mathematics", average: 78 },
  { name: "Physics", average: 72 },
  { name: "Biology", average: 85 },
  { name: "Chemistry", average: 68 },
  { name: "History", average: 76 },
  { name: "Creative Writing", average: 82 },
];

const studentActivityData = [
  { name: "Mon", active: 24 },
  { name: "Tue", active: 32 },
  { name: "Wed", active: 41 },
  { name: "Thu", active: 35 },
  { name: "Fri", active: 28 },
  { name: "Sat", active: 18 },
  { name: "Sun", active: 15 },
];

const quizCompletionData = [
  { name: "Completed", value: 158 },
  { name: "Incomplete", value: 42 },
];

const COLORS = ['#9b87f5', '#E5DEFF'];

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    totalQuizzes: 0,
    completionRate: 0,
  });

  const [recentActivity, setRecentActivity] = useState([
    {
      type: "enrollment",
      user: "John Doe",
      course: "Mathematics",
      time: "2 hours ago"
    },
    {
      type: "quiz_completed",
      user: "Jane Smith",
      quiz: "Basic Algebra",
      score: 85,
      time: "4 hours ago"
    },
    {
      type: "course_added",
      course: "Advanced Chemistry",
      time: "1 day ago"
    },
    {
      type: "quiz_added",
      quiz: "Physics Mechanics",
      course: "Physics",
      time: "2 days ago"
    }
  ]);

  useEffect(() => {
    // In a real app, this would fetch data from Supabase
    // For demo, we'll use mock data
    setStats({
      totalStudents: 138,
      totalCourses: 6,
      totalQuizzes: 19,
      completionRate: 79,
    });
  }, []);

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
          <Link to="/admin/courses/new">
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
                <div className="text-2xl font-bold">{stats.totalStudents}</div>
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
                <div className="text-2xl font-bold">{stats.totalCourses}</div>
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
                <div className="text-2xl font-bold">{stats.totalQuizzes}</div>
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
                <div className="text-2xl font-bold">{stats.completionRate}%</div>
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
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-3 last:border-0 last:pb-0">
                    {activity.type === "enrollment" && (
                      <div>
                        <p className="text-sm font-medium">
                          {activity.user} enrolled in {activity.course}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {activity.time}
                        </p>
                      </div>
                    )}
                    {activity.type === "quiz_completed" && (
                      <div>
                        <p className="text-sm font-medium">
                          {activity.user} completed {activity.quiz}
                        </p>
                        <div className="flex items-center mt-1">
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            Score: {activity.score}%
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                            {activity.time}
                          </span>
                        </div>
                      </div>
                    )}
                    {activity.type === "course_added" && (
                      <div>
                        <p className="text-sm font-medium">
                          New course added: {activity.course}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {activity.time}
                        </p>
                      </div>
                    )}
                    {activity.type === "quiz_added" && (
                      <div>
                        <p className="text-sm font-medium">
                          New quiz added to {activity.course}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {activity.quiz} · {activity.time}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-4 text-right">
                <Link to="/admin/activity">
                  <Button variant="ghost" size="sm" className="text-mindpop-400 hover:text-mindpop-500 dark:text-mindpop-300 hover:dark:text-mindpop-200">
                    View all <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
