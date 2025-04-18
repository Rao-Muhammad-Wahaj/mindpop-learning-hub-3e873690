
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle>About MindPop</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose dark:prose-invert">
            <p className="text-lg">
              MindPop is an interactive learning platform that makes education engaging and accessible.
              Our platform enables educators to create custom quizzes and courses while providing
              students with an intuitive learning experience.
            </p>
            
            <h3 className="text-xl font-semibold mt-6">Our Mission</h3>
            <p>
              To revolutionize online education by providing a seamless platform for knowledge sharing
              and assessment, making learning more engaging and effective for everyone.
            </p>
            
            <h3 className="text-xl font-semibold mt-6">Key Features</h3>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Interactive quizzes and assessments</li>
              <li>Comprehensive course management</li>
              <li>Real-time performance tracking</li>
              <li>Engaging learning experience</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
