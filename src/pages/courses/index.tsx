
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCourses } from "@/providers/CoursesProvider";
import { useQuizzes } from "@/providers/QuizzesProvider";

// Define course categories dynamically based on title keywords
const getCourseCategory = (title: string): string => {
  const titleLower = title.toLowerCase();
  if (titleLower.includes("math")) return "Mathematics";
  if (titleLower.includes("physics") || titleLower.includes("chemistry") || titleLower.includes("biology")) return "Science";
  if (titleLower.includes("history")) return "History";
  if (titleLower.includes("writing") || titleLower.includes("literature") || titleLower.includes("english")) return "Language Arts";
  if (titleLower.includes("computer") || titleLower.includes("programming") || titleLower.includes("code")) return "Computer Science";
  if (titleLower.includes("art") || titleLower.includes("design") || titleLower.includes("music")) return "Art";
  return "Other";
};

export default function CoursesPage() {
  const { courses, isLoading } = useCourses();
  const { quizzes } = useQuizzes();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Extract all possible categories from the courses
  const allCategories = [...new Set(courses.map(course => getCourseCategory(course.title)))].sort();
  
  // Display a set of default categories if no courses are available yet
  const categories = allCategories.length > 0 ? allCategories : [
    "Science", "Mathematics", "History", "Language Arts", "Computer Science", "Art"
  ];

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const courseCategory = getCourseCategory(course.title);
    const matchesCategory = !selectedCategory || courseCategory === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Get quiz count for a course
  const getQuizCount = (courseId: string) => {
    return quizzes.filter(quiz => quiz.courseId === courseId).length;
  };

  // Framer Motion variants
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

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="mindpop-heading mb-2">All Courses</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Browse and enroll in our available courses
          </p>
        </div>
      </div>

      {/* Search and filter */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
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
          <div className="flex-shrink-0">
            <div className="relative">
              <Button
                variant="outline"
                className="flex items-center"
                onClick={() => setSelectedCategory(null)}
              >
                <Filter size={18} className="mr-2" />
                {selectedCategory || "All Categories"}
                {selectedCategory && (
                  <X
                    size={16}
                    className="ml-2 text-gray-400 hover:text-gray-600"
                  />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Category filter chips */}
        <div className="flex flex-wrap gap-2 mt-4">
          {categories.map((category) => (
            <Badge
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
            >
              {category}
            </Badge>
          ))}
        </div>
      </div>

      {/* Course listing */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Card key={item} className="h-96 animate-pulse">
              <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-t-lg" />
              <CardHeader>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
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
                    {new Date(course.createdAt).toLocaleDateString()} · {getQuizCount(course.id)} quizzes
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                    {course.description}
                  </p>
                </CardContent>
                <CardFooter className="pt-0">
                  <Link to={`/courses/${course.id}`} className="w-full">
                    <Button variant="default" className="w-full">
                      View Course
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-16">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No courses found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchQuery || selectedCategory 
              ? "Try adjusting your search or filter criteria."
              : "No courses have been created yet."}
          </p>
          <Button onClick={() => { setSearchQuery(""); setSelectedCategory(null); }}>
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}
