
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminDashboard } from "@/hooks/use-admin-dashboard";
import StatisticsCards from "@/components/admin/StatisticsCards";
import { DashboardCharts } from "@/components/admin/DashboardCharts";

export default function AdminDashboard() {
  const {
    totalStudents,
    coursesCount,
    quizzesCount,
    completionRate,
    enrollments,
    quizCompletionData,
    quizPerformanceData
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
      >
        <StatisticsCards 
          totalStudents={totalStudents}
          coursesCount={coursesCount}
          quizzesCount={quizzesCount}
          completionRate={completionRate}
        />

        <DashboardCharts
          enrollmentData={enrollments}
          quizCompletionData={quizCompletionData}
          quizPerformanceData={quizPerformanceData}
        />
      </motion.div>
    </div>
  );
}
