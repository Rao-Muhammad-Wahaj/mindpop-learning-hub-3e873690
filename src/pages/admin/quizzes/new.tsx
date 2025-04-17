
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuizzes } from "@/providers/QuizzesProvider";
import { useCourses } from "@/providers/CoursesProvider";
import { QuizForm } from "@/components/admin/QuizForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";

export default function AdminNewQuizPage() {
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();
  const { isAdmin, isLoading: isAuthLoading } = useAuth();
  const { courses, isLoading: isCoursesLoading } = useCourses();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const course = courseId ? courses.find(c => c.id === courseId) : undefined;

  const handleSuccess = () => {
    navigate("/admin/courses");
  };

  // Check if user is admin
  if (!isAuthLoading && !isAdmin) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-red-600">Access Denied</CardTitle>
            <CardDescription className="text-center">
              You do not have permission to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p>This page is only accessible to administrators.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
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

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <motion.div variants={itemVariants}>
          <h1 className="mindpop-heading mb-2">
            {courseId ? `Add Quiz to ${course?.title || 'Course'}` : 'Create New Quiz'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Fill in the details below to create a new quiz
          </p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Quiz Information</CardTitle>
              <CardDescription>
                Enter the basic information for your quiz
              </CardDescription>
            </CardHeader>
            <CardContent>
              <QuizForm 
                courseId={courseId} 
                onSuccess={handleSuccess}
              />
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
