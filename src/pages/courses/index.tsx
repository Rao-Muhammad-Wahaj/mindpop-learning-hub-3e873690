
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Course } from "@/types";
import { motion } from "framer-motion";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Mock data for courses
const mockCourses: Course[] = [
  {
    id: "1",
    title: "Introduction to Mathematics",
    description: "Learn fundamental mathematical concepts and problem-solving techniques. This course covers arithmetic, algebra, geometry, and statistics to build a strong foundation in mathematics.",
    imageUrl: "https://images.unsplash.com/photo-1509228468518-180dd4864904",
    createdBy: "1", // Admin ID
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    enrolledCount: 42,
  },
  {
    id: "2",
    title: "Basic Physics",
    description: "Understand the fundamental laws that govern our physical world. Explore mechanics, thermodynamics, waves, and modern physics concepts through interactive lessons and experiments.",
    imageUrl: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa",
    createdBy: "1", // Admin ID
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    enrolledCount: 35,
  },
  {
    id: "3",
    title: "Advanced Biology",
    description: "Explore complex biological systems and their functions. This course delves into cellular processes, genetics, evolution, and ecosystems through detailed lessons and virtual labs.",
    imageUrl: "https://images.unsplash.com/photo-1530026454774-5333ea7c057c",
    createdBy: "1", // Admin ID
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    enrolledCount: 28,
  },
  {
    id: "4",
    title: "Chemistry Fundamentals",
    description: "Master the basic principles of chemistry, including atomic structure, periodic trends, chemical reactions, and stoichiometry through engaging lessons and virtual experiments.",
    imageUrl: "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6",
    createdBy: "1", // Admin ID
    createdAt: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    enrolledCount: 31,
  },
  {
    id: "5",
    title: "World History Survey",
    description: "Journey through key moments in human history, from ancient civilizations to modern times. Explore cultural developments, conflicts, and innovations that shaped our world.",
    imageUrl: "https://images.unsplash.com/photo-1447069387593-a5de0862481e",
    createdBy: "1", // Admin ID
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    enrolledCount: 24,
  },
  {
    id: "6",
    title: "Creative Writing",
    description: "Develop your storytelling and creative expression skills through structured writing exercises. Learn techniques for crafting compelling narratives, characters, and dialogue.",
    imageUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a",
    createdBy: "1", // Admin ID
    createdAt: new Date(Date.now() - 105 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    enrolledCount: 29,
  },
];

// Mock categories for filtering
const categories = [
  "Science",
  "Mathematics",
  "History",
  "Language Arts",
  "Computer Science",
  "Art",
];

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would fetch from Supabase
    const fetchCourses = async () => {
      setIsLoading(true);
      try {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setCourses(mockCourses);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // For demo purposes, we'll assign categories based on course title
    const courseCategory = 
      course.title.includes("Mathematics") ? "Mathematics" :
      course.title.includes("Physics") ? "Science" :
      course.title.includes("Biology") ? "Science" :
      course.title.includes("Chemistry") ? "Science" :
      course.title.includes("History") ? "History" :
      course.title.includes("Writing") ? "Language Arts" : "Other";
    
    const matchesCategory = !selectedCategory || courseCategory === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

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
                    {new Date(course.createdAt).toLocaleDateString()} · {course.enrolledCount} students
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
            Try adjusting your search or filter criteria.
          </p>
          <Button onClick={() => { setSearchQuery(""); setSelectedCategory(null); }}>
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}
