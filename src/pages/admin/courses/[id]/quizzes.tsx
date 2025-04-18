
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCourses } from '@/providers/CoursesProvider';
import { useQuizzes } from '@/providers/QuizzesProvider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Pencil, FileQuestion } from 'lucide-react';
import { QuizForm } from '@/components/admin/QuizForm';
import { Course, Quiz } from '@/types';

const AdminCourseQuizzesPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { courses, isLoading: coursesLoading } = useCourses();
  const { quizzes, isLoading: quizzesLoading } = useQuizzes();
  const [course, setCourse] = useState<Course | null>(null);
  const [courseQuizzes, setCourseQuizzes] = useState<Quiz[]>([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!coursesLoading && courses.length > 0 && id) {
      const foundCourse = courses.find(c => c.id === id);
      if (foundCourse) {
        setCourse(foundCourse);
      } else {
        navigate('/admin/courses');
      }
    }
  }, [id, courses, coursesLoading, navigate]);

  useEffect(() => {
    if (!quizzesLoading && quizzes.length > 0 && id) {
      const filteredQuizzes = quizzes.filter(quiz => quiz.courseId === id);
      setCourseQuizzes(filteredQuizzes);
    }
  }, [id, quizzes, quizzesLoading]);

  const handleSuccess = () => {
    setShowForm(false);
  };

  if (coursesLoading || quizzesLoading) {
    return (
      <div className="container py-8">
        <div className="flex justify-center">
          <p>Loading...</p>
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
          onClick={() => navigate('/admin/courses')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Courses
        </Button>
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">{course?.title} - Quizzes</h1>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-2" /> {showForm ? 'Cancel' : 'Add Quiz'}
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>New Quiz</CardTitle>
          </CardHeader>
          <CardContent>
            <QuizForm courseId={id} onSuccess={handleSuccess} />
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courseQuizzes.length > 0 ? (
          courseQuizzes.map((quiz) => (
            <Card key={quiz.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{quiz.title}</CardTitle>
                <CardDescription>
                  {quiz.description.length > 100
                    ? `${quiz.description.substring(0, 100)}...`
                    : quiz.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <p>
                    <span className="font-medium">Time Limit:</span>{' '}
                    {quiz.timeLimit ? `${quiz.timeLimit} minutes` : 'No limit'}
                  </p>
                  <p>
                    <span className="font-medium">Passing Score:</span>{' '}
                    {quiz.passingScore ? `${quiz.passingScore}%` : 'Not set'}
                  </p>
                  <p>
                    <span className="font-medium">Review Enabled:</span>{' '}
                    {quiz.reviewEnabled ? 'Yes' : 'No'}
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/admin/quizzes/${quiz.id}/edit`)}
                >
                  <Pencil className="h-4 w-4 mr-2" /> Edit Quiz
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => navigate(`/admin/quizzes/${quiz.id}/questions`)}
                >
                  <FileQuestion className="h-4 w-4 mr-2" /> Questions
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <p className="text-lg mb-4">No quizzes found for this course.</p>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Get started by adding your first quiz.
            </p>
            {!showForm && (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" /> Add Quiz
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCourseQuizzesPage;
