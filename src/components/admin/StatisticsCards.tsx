
import { Users, BookOpen, FileCheck, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

interface StatisticsCardsProps {
  totalStudents: number;
  coursesCount: number;
  quizzesCount: number;
  completionRate: number;
  isLoading?: boolean;
}

const cardGradient = "bg-gradient-to-tr from-mindpop-100 via-mindpop-200 to-mindpop-300 dark:from-mindpop-400 dark:via-mindpop-500 dark:to-mindpop-600";
const cardShadow = "shadow-lg hover:shadow-xl hover:scale-[1.02] transition-transform transition-shadow duration-150";

const StatisticsCards = ({ totalStudents, coursesCount, quizzesCount, completionRate, isLoading = false }: StatisticsCardsProps) => {
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      <motion.div variants={itemVariants}>
        <Card className={`${cardGradient} ${cardShadow} border-0`}>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-semibold uppercase text-mindpop-400 dark:text-mindpop-100 tracking-wider">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="w-6 h-6 text-mindpop-400 mr-2" />
              {isLoading ? (
                <Skeleton className="h-7 w-12" />
              ) : (
                <div className="text-3xl font-extrabold text-mindpop-500 dark:text-mindpop-100">{totalStudents}</div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className={`${cardGradient} ${cardShadow} border-0`}>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-semibold uppercase text-mindpop-400 dark:text-mindpop-100 tracking-wider">Total Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <BookOpen className="w-6 h-6 text-mindpop-400 mr-2" />
              {isLoading ? (
                <Skeleton className="h-7 w-12" />
              ) : (
                <div className="text-3xl font-extrabold text-mindpop-500 dark:text-mindpop-100">{coursesCount}</div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className={`${cardGradient} ${cardShadow} border-0`}>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-semibold uppercase text-mindpop-400 dark:text-mindpop-100 tracking-wider">Total Quizzes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <FileCheck className="w-6 h-6 text-mindpop-400 mr-2" />
              {isLoading ? (
                <Skeleton className="h-7 w-12" />
              ) : (
                <div className="text-3xl font-extrabold text-mindpop-500 dark:text-mindpop-100">{quizzesCount}</div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className={`${cardGradient} ${cardShadow} border-0`}>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-semibold uppercase text-mindpop-400 dark:text-mindpop-100 tracking-wider">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Award className="w-6 h-6 text-mindpop-400 mr-2" />
              {isLoading ? (
                <Skeleton className="h-7 w-12" />
              ) : (
                <div className="text-3xl font-extrabold text-mindpop-500 dark:text-mindpop-100">{completionRate}%</div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default StatisticsCards;
