
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Plus, Edit, Trash2, X, BookOpen, FileCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCourses } from "@/providers/CoursesProvider";
import { CourseForm } from "@/components/admin/CourseForm";
import { QuizForm } from "@/components/admin/QuizForm";
import { useQuizzes } from "@/providers/QuizzesProvider";
import { Course } from "@/types";

export default function AdminCoursesPage() {
  const { courses, isLoading: isCoursesLoading, deleteCourse } = useCourses();
  const { quizzes, isLoading: isQuizzesLoading } = useQuizzes();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourseForQuiz, setSelectedCourseForQuiz] = useState<Course | null>(null);
  const [isAddQuizOpen, setIsAddQuizOpen] = useState(false);
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  const handleDeleteCourse = async (courseId: string) => {
    await deleteCourse(courseId);
  };

  const getQuizCountByCourse = (courseId: string) => {
    return quizzes.filter(quiz => quiz.courseId === courseId).length;
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="mindpop-heading mb-2">Manage Courses</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create, edit, and manage course content
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Dialog open={isAddCourseOpen} onOpenChange={setIsAddCourseOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center">
                <Plus className="mr-2 h-4 w-4" /> New Course
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Course</DialogTitle>
                <DialogDescription>
                  Fill in the details below to create a new course.
                </DialogDescription>
              </DialogHeader>
              <CourseForm onSuccess={() => setIsAddCourseOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            type="text"
            placeholder="Search courses..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setSearchQuery("")}
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      <Tabs defaultValue="grid" className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="grid">Grid View</TabsTrigger>
            <TabsTrigger value="table">Table View</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="grid">
          {isCoursesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <Card key={item} className="h-80 animate-pulse">
                  <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-t-lg" />
                  <CardHeader>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mt-2" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredCourses.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredCourses.map((course) => (
                <motion.div key={course.id} variants={itemVariants}>
                  <Card className="h-full flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="h-40 overflow-hidden">
                      <img
                        src={course.imageUrl || "https://images.unsplash.com/photo-1501504905252-473c47e087f8"}
                        alt={course.title}
                        className="w-full h-full object-cover transition-transform hover:scale-105"
                      />
                    </div>
                    <CardHeader>
                      <CardTitle>{course.title}</CardTitle>
                      <CardDescription>
                        {new Date(course.createdAt).toLocaleDateString()} · {getQuizCountByCourse(course.id)} quizzes
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                        {course.description}
                      </p>
                    </CardContent>
                    <CardFooter className="flex gap-2">
                      <Dialog open={editingCourse?.id === course.id} onOpenChange={(open) => !open && setEditingCourse(null)}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="flex-1" onClick={() => setEditingCourse(course)}>
                            <Edit className="h-4 w-4 mr-2" /> Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                          <DialogHeader>
                            <DialogTitle>Edit Course</DialogTitle>
                            <DialogDescription>
                              Update the course details below.
                            </DialogDescription>
                          </DialogHeader>
                          {editingCourse && (
                            <CourseForm 
                              initialData={editingCourse} 
                              onSuccess={() => setEditingCourse(null)} 
                            />
                          )}
                        </DialogContent>
                      </Dialog>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="default" size="sm" className="flex-1" onClick={() => setSelectedCourseForQuiz(course)}>
                            <FileCheck className="h-4 w-4 mr-2" /> Quizzes
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[800px]">
                          <DialogHeader>
                            <DialogTitle>Manage Quizzes for {course.title}</DialogTitle>
                            <DialogDescription>
                              View and manage quizzes for this course.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="py-4">
                            <Button onClick={() => setIsAddQuizOpen(true)}>
                              <Plus className="h-4 w-4 mr-2" /> Add Quiz
                            </Button>
                            
                            <Dialog open={isAddQuizOpen} onOpenChange={setIsAddQuizOpen}>
                              <DialogContent className="sm:max-w-[600px]">
                                <DialogHeader>
                                  <DialogTitle>Add Quiz to {selectedCourseForQuiz?.title}</DialogTitle>
                                  <DialogDescription>
                                    Create a new quiz for this course.
                                  </DialogDescription>
                                </DialogHeader>
                                {selectedCourseForQuiz && (
                                  <QuizForm 
                                    courseId={selectedCourseForQuiz.id} 
                                    onSuccess={() => setIsAddQuizOpen(false)} 
                                  />
                                )}
                              </DialogContent>
                            </Dialog>

                            <div className="mt-4">
                              {isQuizzesLoading ? (
                                <div className="text-center py-8">Loading quizzes...</div>
                              ) : (
                                <div className="space-y-4">
                                  {quizzes
                                    .filter(quiz => quiz.courseId === course.id)
                                    .map(quiz => (
                                      <Card key={quiz.id}>
                                        <CardHeader>
                                          <CardTitle>{quiz.title}</CardTitle>
                                          <CardDescription>
                                            {quiz.timeLimit ? `${quiz.timeLimit} minutes` : 'No time limit'} · 
                                            {quiz.passingScore ? ` ${quiz.passingScore}% to pass` : ' No passing score'}
                                          </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                          <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {quiz.description}
                                          </p>
                                        </CardContent>
                                        <CardFooter className="flex justify-end gap-2">
                                          <Link to={`/admin/quizzes/${quiz.id}/edit`}>
                                            <Button variant="outline" size="sm">
                                              <Edit className="h-4 w-4 mr-2" /> Edit
                                            </Button>
                                          </Link>
                                          <Link to={`/admin/quizzes/${quiz.id}/questions`}>
                                            <Button variant="default" size="sm">
                                              <BookOpen className="h-4 w-4 mr-2" /> Questions
                                            </Button>
                                          </Link>
                                        </CardFooter>
                                      </Card>
                                    ))}

                                  {quizzes.filter(quiz => quiz.courseId === course.id).length === 0 && (
                                    <div className="text-center py-8 border rounded-lg">
                                      <p className="text-muted-foreground">No quizzes yet for this course.</p>
                                      <p className="text-sm text-muted-foreground mt-1">Add your first quiz to get started.</p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" className="w-10">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete the course "{course.title}" and all related quizzes and questions.
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-600 hover:bg-red-700"
                              onClick={() => handleDeleteCourse(course.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-16 border rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No courses found
              </h3>
              {searchQuery ? (
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Try adjusting your search criteria.
                </p>
              ) : (
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  You haven't created any courses yet.
                </p>
              )}
              {searchQuery ? (
                <Button onClick={() => setSearchQuery("")}>
                  Clear Search
                </Button>
              ) : (
                <Dialog open={isAddCourseOpen} onOpenChange={setIsAddCourseOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" /> Create Your First Course
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Create New Course</DialogTitle>
                      <DialogDescription>
                        Fill in the details below to create a new course.
                      </DialogDescription>
                    </DialogHeader>
                    <CourseForm onSuccess={() => setIsAddCourseOpen(false)} />
                  </DialogContent>
                </Dialog>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="table">
          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Course</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Created</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Quizzes</th>
                    <th className="px-6 py-3 text-right font-medium text-gray-500 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {isCoursesLoading ? (
                    [1, 2, 3, 4, 5].map((item) => (
                      <tr key={item} className="animate-pulse">
                        <td className="px-6 py-4">
                          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24 ml-auto"></div>
                        </td>
                      </tr>
                    ))
                  ) : filteredCourses.length > 0 ? (
                    filteredCourses.map((course) => (
                      <tr key={course.id} className="bg-white dark:bg-gray-900">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <img 
                                className="h-10 w-10 rounded object-cover" 
                                src={course.imageUrl || "https://images.unsplash.com/photo-1501504905252-473c47e087f8"} 
                                alt={course.title} 
                              />
                            </div>
                            <div className="ml-4">
                              <div className="font-medium text-gray-900 dark:text-white">{course.title}</div>
                              <div className="text-gray-500 dark:text-gray-400 truncate max-w-xs">{course.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                          {new Date(course.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-mindpop-100 text-mindpop-800 dark:bg-mindpop-800 dark:text-mindpop-100">
                            {getQuizCountByCourse(course.id)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-medium flex justify-end space-x-2">
                          <Dialog open={editingCourse?.id === course.id} onOpenChange={(open) => !open && setEditingCourse(null)}>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setEditingCourse(course)}>
                                <Edit className="h-4 w-4 mr-2" /> Edit
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[600px]">
                              <DialogHeader>
                                <DialogTitle>Edit Course</DialogTitle>
                                <DialogDescription>
                                  Update the course details below.
                                </DialogDescription>
                              </DialogHeader>
                              {editingCourse && (
                                <CourseForm 
                                  initialData={editingCourse} 
                                  onSuccess={() => setEditingCourse(null)} 
                                />
                              )}
                            </DialogContent>
                          </Dialog>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete the course "{course.title}" and all related quizzes and questions.
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-600 hover:bg-red-700"
                                  onClick={() => handleDeleteCourse(course.id)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center">
                        <p className="text-gray-500 dark:text-gray-400">
                          {searchQuery ? 'No courses matching your search.' : 'No courses have been created yet.'}
                        </p>
                        {!searchQuery && (
                          <Button 
                            variant="outline" 
                            className="mt-4" 
                            onClick={() => setIsAddCourseOpen(true)}
                          >
                            <Plus className="h-4 w-4 mr-2" /> Create Your First Course
                          </Button>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
