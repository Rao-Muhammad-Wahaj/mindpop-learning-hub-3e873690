
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface ChartData {
  name: string;
  students?: number;
  quizzes?: number;
  average?: number;
  value?: number;
}

interface DashboardChartsProps {
  enrollmentData: ChartData[];
  quizCompletionData: ChartData[];
  quizPerformanceData: ChartData[];
}

const COLORS = ['#9b87f5', '#E5DEFF'];

export const DashboardCharts = ({ enrollmentData, quizCompletionData, quizPerformanceData }: DashboardChartsProps) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Course Enrollment</CardTitle>
              <CardDescription>
                Number of students enrolled per course
              </CardDescription>
            </CardHeader>
            <CardContent>
              {enrollmentData.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={enrollmentData}
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
        </div>

        <div className="md:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Quiz Completion</CardTitle>
              <CardDescription>
                Overview of quiz attempts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {quizCompletionData.length > 0 ? (
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
        </div>
      </div>

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
    </>
  );
};
