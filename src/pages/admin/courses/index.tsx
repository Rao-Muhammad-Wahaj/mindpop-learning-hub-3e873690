
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Eye, Edit, Trash2, Search, Filter, X, FileCheck } from "lucide-react";
import { Course } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// Mock data for courses
const mockCourses: Course[] = [
  {
    id: "1",
    title: "Introduction to Mathematics",
    description: "Learn fundamental mathematical concepts and problem-solving techniques.",
    imageUrl: "https://images.unsplash.com/photo-1509228468518-180dd4864904",
    createdBy: "1", // Admin ID
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    enrolledCount: 42,
  },
  {
    id: "2",
    title: "Basic Physics",
    description: "Understand the fundamental laws that govern our physical world.",
    imageUrl: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa",
    createdBy: "1", // Admin ID
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    enrolledCount: 35,
  },
  {
    id: "3",
    title: "Advanced Biology",
    description: "Explore complex biological systems and their functions.",
    imageUrl: "https://images.unsplash.com/photo-1530026454774-5333ea7c057c",
    createdBy: "1", // Admin ID
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    enrolledCount: 28,
  },
  {
    id: "4",
    title: "Chemistry Fundamentals",
    description: "Master the basic principles of chemistry.",
    imageUrl: "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6",
    createdBy: "1", // Admin ID
    createdAt: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    enrolledCount: 31,
  },
  {
    id: "5",
    title: "World History Survey",
    description: "Journey through key moments in human history.",
    imageUrl: "https://images.unsplash.com/photo-1447069387593-a5de0862481e",
    createdBy: "1", // Admin ID
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    enrolledCount: 24,
  },
  {
    id: "6",
    title: "Creative Writing",
    description: "Develop your storytelling and creative expression skills.",
    imageUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a",
    createdBy: "1", // Admin ID
    createdAt: new Date(Date.now() - 105 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    enrolledCount: 29,
  },
];

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  useEffect(() => {
    // In a real app, this would fetch from Supabase
    const fetchCourses = async () => {
      setIsLoading(true);
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setCourses(mockCourses);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    course.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteCourse = (id: string) => {
    // In a real app, this would call Supabase to delete the course
    setCourses(prevCourses => prevCourses.filter(course => course.id !== id));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="mindpop-heading mb-2">Course Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create, edit, and manage course content
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link to="/admin/courses/new">
            <Button className="flex items-center">
              <Plus className="mr-2 h-4 w-4" /> New Course
            </Button>
          </Link>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative flex-grow max-w-md">
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
          <div className="flex items-center space-x-2">
            <Label htmlFor="view-mode" className="text-sm">View:</Label>
            <div className="flex items-center space-x-1 border rounded-md">
              <button
                className={`p-2 ${viewMode === 'grid' ? 'bg-mindpop-100 dark:bg-mindpop-500/20 text-mindpop-500 dark:text-mindpop-300' : 'text-gray-700 dark:text-gray-300'}`}
                onClick={() => setViewMode('grid')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
              </button>
              <button
                className={`p-2 ${viewMode === 'table' ? 'bg-mindpop-100 dark:bg-mindpop-500/20 text-mindpop-500 dark:text-mindpop-300' : 'text-gray-700 dark:text-gray-300'}`}
                onClick={() => setViewMode('table')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="8" y1="6" x2="21" y2="6" />
                  <line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" />
                  <line x1="3" y1="12" x2="3.01" y2="12" />
                  <line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-t-lg" />
              <CardHeader>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mt-2 w-5/6" />
              </CardContent>
              <CardFooter>
                <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {viewMode === "grid" ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredCourses.length > 0 ? (
                filteredCourses.map(course => (
                  <motion.div key={course.id} variants={itemVariants}>
                    <Card className="h-full flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="h-40 overflow-hidden relative">
                        <img
                          src={course.imageUrl || "https://images.unsplash.com/photo-1501504905252-473c47e087f8"}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2 bg-white dark:bg-gray-800 rounded-md shadow p-1">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="12" cy="12" r="1" />
                                  <circle cx="12" cy="5" r="1" />
                                  <circle cx="12" cy="19" r="1" />
                                </svg>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem>
                                <Link to={`/admin/courses/${course.id}`} className="flex items-center w-full">
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Course
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Link to={`/admin/courses/${course.id}/edit`} className="flex items-center w-full">
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Course
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Link to={`/admin/courses/${course.id}/quizzes`} className="flex items-center w-full">
                                  <FileCheck className="mr-2 h-4 w-4" />
                                  Manage Quizzes
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600 dark:text-red-400"
                                onClick={() => handleDeleteCourse(course.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Course
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      <CardHeader>
                        <CardTitle>{course.title}</CardTitle>
                        <CardDescription>
                          {course.enrolledCount} students enrolled
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {course.description}
                        </p>
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          Last updated: {new Date(course.updatedAt).toLocaleDateString()}
                        </div>
                      </CardContent>
                      <CardFooter className="pt-0 space-x-2">
                        <Link to={`/admin/courses/${course.id}/edit`} className="flex-1">
                          <Button variant="outline" className="w-full">Edit</Button>
                        </Link>
                        <Link to={`/admin/courses/${course.id}/quizzes`} className="flex-1">
                          <Button variant="default" className="w-full">Quizzes</Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center py-16">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No courses found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {searchQuery ? "Try adjusting your search query." : "Create your first course to get started."}
                  </p>
                  {searchQuery ? (
                    <Button onClick={() => setSearchQuery("")}>Clear Search</Button>
                  ) : (
                    <Link to="/admin/courses/new">
                      <Button>Create Course</Button>
                    </Link>
                  )}
                </div>
              )}
            </motion.div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course</TableHead>
                      <TableHead>Students</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCourses.length > 0 ? (
                      filteredCourses.map(course => (
                        <TableRow key={course.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center space-x-3">
                              <div className="h-10 w-10 overflow-hidden rounded">
                                <img
                                  src={course.imageUrl || "https://images.unsplash.com/photo-1501504905252-473c47e087f8"}
                                  alt={course.title}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div>
                                <div>{course.title}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 max-w-xs">
                                  {course.description}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{course.enrolledCount}</TableCell>
                          <TableCell>{new Date(course.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>{new Date(course.updatedAt).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Link to={`/admin/courses/${course.id}`}>
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Link to={`/admin/courses/${course.id}/edit`}>
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Link to={`/admin/courses/${course.id}/quizzes`}>
                                <Button variant="ghost" size="sm">
                                  <FileCheck className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-red-600 dark:text-red-400"
                                onClick={() => handleDeleteCourse(course.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            No courses found
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 mb-4">
                            {searchQuery ? "Try adjusting your search query." : "Create your first course to get started."}
                          </p>
                          {searchQuery ? (
                            <Button onClick={() => setSearchQuery("")}>Clear Search</Button>
                          ) : (
                            <Link to="/admin/courses/new">
                              <Button>Create Course</Button>
                            </Link>
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
