
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Book, Users, Calendar, Clock, FileCheck, ArrowRight } from "lucide-react";
import { Course, Quiz } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/lib/auth";

// Mock course data
const mockCourses: Course[] = [
  {
    id: "1",
    title: "Introduction to Mathematics",
    description: "Learn fundamental mathematical concepts and problem-solving techniques. This course covers arithmetic, algebra, geometry, and statistics to build a strong foundation in mathematics.",
    imageUrl: "https://images.unsplash.com/photo-1509228468518-180dd4864904",
    createdBy: "1", // Admin ID
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    enrolledCount: 42,
  },
];

// Mock quiz data
const mockQuizzes: Quiz[] = [
  {
    id: "q1",
    courseId: "1",
    title: "Basic Algebra Quiz",
    description: "Test your knowledge of basic algebraic concepts.",
    timeLimit: 15, // in minutes
    passingScore: 70, // percentage
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    reviewEnabled: true,
  },
  {
    id: "q2",
    courseId: "1",
    title: "Geometry Fundamentals",
    description: "Assess your understanding of geometric principles and formulas.",
    timeLimit: 20, // in minutes
    passingScore: 65, // percentage
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    reviewEnabled: true,
  },
];

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, isAdmin } = useAuth();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourseData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // In a real app, this would fetch from Supabase
        // For demo, we'll use mock data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const foundCourse = mockCourses.find(c => c.id === id);
        if (foundCourse) {
          setCourse(foundCourse);
          
          // Get quizzes for this course
          const courseQuizzes = mockQuizzes.filter(q => q.courseId === id);
          setQuizzes(courseQuizzes);
          
          // Check if user is enrolled (for demo, we'll assume yes if id is "1")
          if (id === "1") {
            setIsEnrolled(true);
            setProgress(75); // Mock progress percentage
          }
        } else {
          setError("Course not found");
        }
      } catch (error) {
        console.error("Error fetching course data:", error);
        setError("Failed to load course data");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchCourseData();
    }
  }, [id]);

  const handleEnroll = async () => {
    // In a real app, this would call Supabase to enroll the user
    setIsEnrolled(true);
    setProgress(0);
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
                      <span className="text-sm font-medium">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2 bg-white/20" />
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
                
                {quizzes.length > 0 ? (
                  <div className="space-y-4">
                    {quizzes.map((quiz) => (
                      <Card key={quiz.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <CardTitle>{quiz.title}</CardTitle>
                          <CardDescription>
                            {quiz.timeLimit} minutes · Passing Score: {quiz.passingScore}%
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {quiz.description}
                          </p>
                        </CardContent>
                        <CardFooter>
                          {isEnrolled ? (
                            <Link to={`/quiz/${quiz.id}/attempt`} className="w-full">
                              <Button variant="default" className="w-full">
                                Start Quiz <ArrowRight className="ml-2 h-4 w-4" />
                              </Button>
                            </Link>
                          ) : (
                            <Button variant="default" className="w-full" disabled>
                              Enroll to Access
                            </Button>
                          )}
                        </CardFooter>
                      </Card>
                    ))}
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
                  <Users className="h-5 w-5 text-mindpop-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Students</p>
                    <p className="text-gray-900 dark:text-white">
                      {course.enrolledCount || 0} enrolled
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <FileCheck className="h-5 w-5 text-mindpop-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Quizzes</p>
                    <p className="text-gray-900 dark:text-white">
                      {quizzes.length} available
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Book className="h-5 w-5 text-mindpop-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Subject</p>
                    <p className="text-gray-900 dark:text-white">
                      {course.title.includes("Math") ? "Mathematics" : 
                       course.title.includes("Physics") ? "Science" :
                       course.title.includes("History") ? "History" : "General Education"}
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
                    >
                      Enroll Now
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
                    <Link to={`/admin/courses/${course.id}/quizzes`} className="w-full">
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
                        {progress}%
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Quizzes Completed
                      </span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        1/{quizzes.length}
                      </span>
                    </div>
                    <Progress value={(1 / quizzes.length) * 100} className="h-2" />
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
