import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCourses } from '@/providers/CoursesProvider';
import { useQuizzes } from '@/providers/QuizzesProvider';
import { useQuizAttempts } from '@/providers/QuizAttemptsProvider';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileCheck, Clock, BookOpen, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { EnrolledCourse } from '@/types';

const CourseDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { courses, isLoading: coursesLoading } = useCourses();
  const { quizzes, isLoading: quizzesLoading } = useQuizzes();
  const { attempts, hasAttemptedQuiz } = useQuizAttempts();
  const { user } = useAuth();
  const { toast } = useToast();

  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrollment, setEnrollment] = useState<EnrolledCourse | null>(null);
  const [courseQuizzes, setCourseQuizzes] = useState([]);

  useEffect(() => {
    if (!quizzesLoading && quizzes.length > 0 && id) {
      const filteredQuizzes = quizzes.filter(quiz => quiz.courseId === id);
      setCourseQuizzes(filteredQuizzes);
    }
  }, [id, quizzes, quizzesLoading]);

  useEffect(() => {
    if (user && id) {
      checkEnrollment();
    }
  }, [user, id]);

  const checkEnrollment = async () => {
    if (!user || !id) return;
    
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', id)
        .maybeSingle();
      
      if (error) {
        console.error('Error checking enrollment:', error);
        return;
      }
      
      if (data) {
        setIsEnrolled(true);
        
        let completedQuizzes: string[] = [];
        if (data.completed_quizzes) {
          if (Array.isArray(data.completed_quizzes)) {
            completedQuizzes = data.completed_quizzes.map(id => 
              typeof id === 'string' ? id : String(id)
            );
          }
        }
        
        setEnrollment({
          id: data.id,
          userId: data.user_id,
          courseId: data.course_id,
          enrolledAt: data.enrolled_at,
          progress: data.progress,
          completedQuizzes: completedQuizzes
        });
      }
    } catch (error) {
      console.error('Error checking enrollment:', error);
    }
  };

  const enrollInCourse = async () => {
    if (!user || !id) return;
    
    setIsEnrolling(true);
    
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .insert({
          user_id: user.id,
          course_id: id,
          progress: 0,
          completed_quizzes: []
        })
        .select()
        .single();
      
      if (error) {
        toast({
          title: 'Error',
          description: `Failed to enroll in course: ${error.message}`,
          variant: 'destructive',
        });
        return;
      }
      
      setIsEnrolled(true);
      
      let completedQuizzes: string[] = [];
      if (data.completed_quizzes) {
        if (Array.isArray(data.completed_quizzes)) {
          completedQuizzes = data.completed_quizzes.map(id => 
            typeof id === 'string' ? id : String(id)
          );
        }
      }
      
      setEnrollment({
        id: data.id,
        userId: data.user_id,
        courseId: data.course_id,
        enrolledAt: data.enrolled_at,
        progress: data.progress,
        completedQuizzes: completedQuizzes
      });
      
      toast({
        title: 'Success',
        description: 'You have successfully enrolled in this course',
      });
      
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['total-students'] });
      
    } catch (error) {
      console.error('Error enrolling in course:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsEnrolling(false);
    }
  };

  const course = courses.find(c => c.id === id);

  if (coursesLoading) {
    return (
      <div className="container py-8">
        <div className="flex justify-center">
          <p>Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container py-8">
        <Alert>
          <AlertTitle>Course Not Found</AlertTitle>
          <AlertDescription>
            The course you're looking for doesn't exist or has been removed.
          </AlertDescription>
        </Alert>
        <Button 
          className="mt-4" 
          onClick={() => navigate('/courses')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Courses
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/courses')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Courses
        </Button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">{course.title}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {new Date(course.createdAt).toLocaleDateString()}
            </p>
          </div>
          {!isEnrolled && (
            <Button 
              onClick={enrollInCourse} 
              disabled={isEnrolling}
            >
              {isEnrolling ? 'Enrolling...' : 'Enroll in Course'}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Course Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{course.description}</p>
            </CardContent>
          </Card>

          {isEnrolled ? (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Course Quizzes</h2>
              {courseQuizzes.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {courseQuizzes.map(quiz => {
                    const attempted = hasAttemptedQuiz(quiz.id);
                    const quizAttempt = attempts.find(a => a.quizId === quiz.id);
                    
                    return (
                      <Card key={quiz.id}>
                        <CardHeader>
                          <CardTitle>{quiz.title}</CardTitle>
                          <CardDescription>{quiz.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {quiz.timeLimit && (
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-2 text-gray-500" />
                                <span>{quiz.timeLimit} minutes</span>
                              </div>
                            )}
                            {quiz.passingScore && (
                              <div className="flex items-center">
                                <CheckCircle className="h-4 w-4 mr-2 text-gray-500" />
                                <span>Passing score: {quiz.passingScore}%</span>
                              </div>
                            )}
                            {attempted && quizAttempt && (
                              <div className="flex items-center mt-2">
                                <FileCheck className="h-4 w-4 mr-2 text-green-500" />
                                <span>
                                  Your score: {quizAttempt.score}/{quizAttempt.maxScore} (
                                  {Math.round((quizAttempt.score / quizAttempt.maxScore) * 100)}%)
                                </span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                        <CardFooter>
                          {attempted ? (
                            <div className="w-full">
                              <div className="flex justify-between items-center">
                                <span className="text-green-600 dark:text-green-400 font-medium">
                                  Completed
                                </span>
                                {quiz.reviewEnabled && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => navigate(`/student/courses/${id}/quizzes/${quiz.id}/review`)}
                                  >
                                    Review Quiz
                                  </Button>
                                )}
                              </div>
                            </div>
                          ) : (
                            <Button 
                              className="w-full"
                              onClick={() => navigate(`/student/courses/${id}/quizzes/${quiz.id}/attempt`)}
                            >
                              Start Quiz
                            </Button>
                          )}
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No quizzes available yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Check back later for quizzes in this course.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <Alert>
              <AlertTitle>Enroll to access course content</AlertTitle>
              <AlertDescription>
                You need to enroll in this course to access quizzes and other materials.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Course Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Number of Quizzes
                  </p>
                  <p className="text-lg font-semibold">{courseQuizzes.length}</p>
                </div>
                {isEnrolled && enrollment && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Enrolled On
                    </p>
                    <p className="text-lg font-semibold">
                      {new Date(enrollment.enrolledAt || '').toLocaleDateString()}
                    </p>
                  </div>
                )}
                {isEnrolled && enrollment && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Progress
                    </p>
                    <p className="text-lg font-semibold">
                      {enrollment.progress || 0}%
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
            {isEnrolled && (
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => navigate('/dashboard')}>
                  Go to Dashboard
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;
