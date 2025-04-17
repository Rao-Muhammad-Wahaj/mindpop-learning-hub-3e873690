
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, CheckCircle, Award } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-mindpop-100 dark:from-mindpop-600 dark:to-gray-900 py-20">
        <div className="mindpop-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
                Expanding Minds Through 
                <span className="text-mindpop-400 dark:text-mindpop-300"> Interactive Learning</span>
              </h1>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                MindPop provides a comprehensive learning platform for students of all ages.
                Create courses, take quizzes, and track your progress with our intuitive interface.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link to="/register">
                  <Button className="w-full sm:w-auto mindpop-button-primary px-8 py-3 text-base">
                    Get Started <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/courses">
                  <Button variant="outline" className="w-full sm:w-auto px-8 py-3 text-base border-mindpop-300 text-mindpop-500 hover:bg-mindpop-100">
                    Browse Courses
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden lg:block relative">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <img 
                  src="https://images.unsplash.com/photo-1501504905252-473c47e087f8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80" 
                  alt="MindPop Learning" 
                  className="w-full h-auto object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 transform -rotate-6 hover:rotate-0 transition-transform duration-300">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium">Quiz completed!</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="mindpop-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Why Choose MindPop?
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Our platform offers a range of features designed to enhance the learning experience for both instructors and students.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-mindpop-100 dark:bg-mindpop-500/20 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-mindpop-500 dark:text-mindpop-300" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Comprehensive Courses
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Create structured courses with quizzes to test knowledge retention and understanding.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-mindpop-100 dark:bg-mindpop-500/20 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-mindpop-500 dark:text-mindpop-300" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                One-Time Quizzes
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Challenge students with one-time accessible quizzes to accurately assess their knowledge.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-mindpop-100 dark:bg-mindpop-500/20 rounded-full flex items-center justify-center mb-4">
                <Award className="h-6 w-6 text-mindpop-500 dark:text-mindpop-300" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Performance Analytics
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Track progress with detailed analytics and insights to improve learning outcomes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-mindpop-100 dark:bg-mindpop-600">
        <div className="mindpop-container">
          <div className="rounded-2xl bg-gradient-to-r from-mindpop-300 to-mindpop-400 p-8 md:p-12 shadow-xl">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to Start Learning?
              </h2>
              <p className="text-lg text-white/90 max-w-2xl mx-auto mb-8">
                Join thousands of students already using MindPop to enhance their knowledge and skills.
              </p>
              <Link to="/register">
                <Button className="bg-white text-mindpop-500 hover:bg-gray-100 px-8 py-3 rounded-md text-base font-medium shadow-sm">
                  Create Your Free Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
