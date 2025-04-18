
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { QuizForm } from '@/components/admin/QuizForm';

const AdminQuizNewPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const courseId = queryParams.get('courseId');

  const handleSuccess = () => {
    if (courseId) {
      navigate(`/admin/courses/${courseId}/quizzes`);
    } else {
      navigate('/admin/courses');
    }
  };

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => courseId ? navigate(`/admin/courses/${courseId}/quizzes`) : navigate('/admin/courses')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <h1 className="text-3xl font-bold">Create New Quiz</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quiz Details</CardTitle>
        </CardHeader>
        <CardContent>
          <QuizForm courseId={courseId || undefined} onSuccess={handleSuccess} />
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminQuizNewPage;
