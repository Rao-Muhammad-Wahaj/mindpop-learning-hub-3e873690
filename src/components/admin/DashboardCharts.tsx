
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ChartData {
  name: string;
  students?: number;
}

interface DashboardChartsProps {
  enrollmentData: ChartData[];
}

export const DashboardCharts = ({ enrollmentData }: DashboardChartsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
      <div className="col-span-1">
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
    </div>
  );
};
