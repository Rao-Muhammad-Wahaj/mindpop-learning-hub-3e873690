
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileCheck, Calendar } from "lucide-react";

interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  studentName: string;
  quizTitle: string;
  courseId?: string;
  startedAt: string;
  completedAt?: string;
  score: number;
  maxScore: number;
  month: string;
}

interface RecentQuizAttemptsProps {
  attemptsByMonth: Record<string, QuizAttempt[]>;
  isLoading: boolean;
}

export const RecentQuizAttempts = ({ attemptsByMonth, isLoading }: RecentQuizAttemptsProps) => {
  const [activeMonth, setActiveMonth] = useState<string>(
    Object.keys(attemptsByMonth).length > 0 ? Object.keys(attemptsByMonth)[0] : ''
  );
  const { toast } = useToast();

  // If no data or loading, show placeholder
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Quiz Attempts</CardTitle>
          <CardDescription>Loading quiz attempts data...</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (Object.keys(attemptsByMonth).length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Quiz Attempts</CardTitle>
          <CardDescription>Overview of student performances</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <div className="text-center">
            <FileCheck className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No quiz attempts yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Student quiz attempts will appear here when they start taking quizzes.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Quiz Attempts</CardTitle>
        <CardDescription>
          Student quiz performance by month
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={activeMonth} onValueChange={setActiveMonth}>
          <TabsList className="mb-4 flex-wrap">
            {Object.keys(attemptsByMonth).map((month) => (
              <TabsTrigger key={month} value={month} className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                {month}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {Object.keys(attemptsByMonth).map((month) => (
            <TabsContent key={month} value={month} className="space-y-4">
              <ScrollArea className="h-[350px]">
                <div className="space-y-4">
                  {attemptsByMonth[month].map((attempt) => (
                    <div 
                      key={attempt.id} 
                      className="p-4 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{attempt.studentName}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {attempt.quizTitle}
                          </p>
                        </div>
                        <div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            (attempt.score / attempt.maxScore) >= 0.7 
                              ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                              : (attempt.score / attempt.maxScore) >= 0.5
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                                : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                          }`}>
                            {attempt.score}/{attempt.maxScore} ({Math.round((attempt.score / attempt.maxScore) * 100)}%)
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        {new Date(attempt.completedAt || attempt.startedAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};
