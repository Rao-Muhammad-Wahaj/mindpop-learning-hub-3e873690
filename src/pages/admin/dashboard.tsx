
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminDashboard } from "@/hooks/use-admin-dashboard";
import StatisticsCards from "@/components/admin/StatisticsCards";
import { DashboardCharts } from "@/components/admin/DashboardCharts";
// Removed: import { RecentQuizAttempts } from "@/components/admin/RecentQuizAttempts";

export default function AdminDashboard() {
  const {
    totalStudents,
    coursesCount,
    quizzesCount,
    completionRate,
    enrollments,
    isLoading,
  } = useAdminDashboard();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="py-6 px-2 sm:px-4 lg:px-8 max-w-7xl mx-auto min-h-[100vh] bg-gradient-to-tr from-mindpop-100 via-white to-indigo-50 dark:from-mindpop-600 dark:via-mindpop-500 dark:to-mindpop-400">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-3">
        <div>
          <h1 className="mindpop-heading mb-2 bg-gradient-to-r from-mindpop-500 to-mindpop-300 text-transparent bg-clip-text">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-200 max-w-md">
            Monitor your platform activity and student performance in style.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/courses">
            <Button className="flex items-center bg-mindpop-300 hover:bg-mindpop-400">
              <Plus className="mr-2 h-4 w-4" /> New Course
            </Button>
          </Link>
          <Link to="/admin/quizzes/new">
            <Button variant="outline" className="flex items-center border-mindpop-200 text-mindpop-500 hover:bg-mindpop-100">
              <Plus className="mr-2 h-4 w-4" /> New Quiz
            </Button>
          </Link>
        </div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <StatisticsCards 
          totalStudents={totalStudents}
          coursesCount={coursesCount}
          quizzesCount={quizzesCount}
          completionRate={completionRate}
          isLoading={isLoading}
        />

        {/* Main Course Enrollment Bar Chart */}
        <DashboardCharts
          enrollmentData={enrollments}
        />

        {/* Removed: RecentQuizAttempts (Quiz Completion, Attempts Overview, Average Scores sections) */}
      </motion.div>
    </div>
  );
}
