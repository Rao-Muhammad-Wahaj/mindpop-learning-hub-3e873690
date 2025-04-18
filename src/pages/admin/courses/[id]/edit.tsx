
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCourses } from '@/providers/CoursesProvider';
import { CourseForm } from '@/components/admin/CourseForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const AdminCourseEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { courses, isLoading } = useCourses();
  const [course, setCourse] = useState(null);

  useEffect(() => {
    if (!isLoading && courses.length > 0 && id) {
      const foundCourse = courses.find(c => c.id === id);
      if (foundCourse) {
        setCourse(foundCourse);
      } else {
        navigate('/admin/courses');
      }
    }
  }, [id, courses, isLoading, navigate]);

  const handleSuccess = () => {
    navigate('/admin/courses');
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex justify-center">
          <p>Loading course...</p>
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
        <h1 className="text-3xl font-bold">Edit Course</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course Details</CardTitle>
        </CardHeader>
        <CardContent>
          {course ? (
            <CourseForm initialData={course} onSuccess={handleSuccess} />
          ) : (
            <div>Course not found</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCourseEditPage;
