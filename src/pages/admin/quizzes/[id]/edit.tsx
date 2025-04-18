
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuizzes } from '@/providers/QuizzesProvider';
import { QuizForm } from '@/components/admin/QuizForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Quiz } from '@/types';

const AdminQuizEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { quizzes, isLoading } = useQuizzes();
  const [quiz, setQuiz] = useState<Quiz | null>(null);

  useEffect(() => {
    if (!isLoading && quizzes.length > 0 && id) {
      const foundQuiz = quizzes.find(q => q.id === id);
      if (foundQuiz) {
        setQuiz(foundQuiz);
      } else {
        navigate('/admin/courses');
      }
    }
  }, [id, quizzes, isLoading, navigate]);

  const handleSuccess = () => {
    if (quiz) {
      navigate(`/admin/courses/${quiz.courseId}/quizzes`);
    } else {
      navigate('/admin/courses');
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex justify-center">
          <p>Loading quiz...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => quiz ? navigate(`/admin/courses/${quiz.courseId}/quizzes`) : navigate('/admin/courses')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <h1 className="text-3xl font-bold">Edit Quiz</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quiz Details</CardTitle>
        </CardHeader>
        <CardContent>
          {quiz ? (
            <QuizForm initialData={quiz} onSuccess={handleSuccess} />
          ) : (
            <div>Quiz not found</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminQuizEditPage;
