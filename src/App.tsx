
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import { CoursesProvider } from "@/providers/CoursesProvider";
import { QuizzesProvider } from "@/providers/QuizzesProvider";
import { QuestionsProvider } from "@/providers/QuestionsProvider";
import { QuizAttemptsProvider } from "@/providers/QuizAttemptsProvider";

// Layouts
import { AuthLayout } from "@/layouts/auth-layout";
import { MainLayout } from "@/layouts/main-layout";
import { DashboardLayout } from "@/layouts/dashboard-layout";
import { AdminLayout } from "@/layouts/admin-layout";

// Pages
import HomePage from "@/pages/home";
import LoginPage from "@/pages/auth/login";
import RegisterPage from "@/pages/auth/register";
import StudentDashboard from "@/pages/student/dashboard";
import AdminDashboard from "@/pages/admin/dashboard";
import CoursesPage from "@/pages/courses/index";
import CourseDetailPage from "@/pages/courses/[id]";
import AdminCoursesPage from "@/pages/admin/courses/index";
import QuizQuestionsPage from "@/pages/admin/quizzes/[id]/questions/index";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CoursesProvider>
        <QuizzesProvider>
          <QuestionsProvider>
            <QuizAttemptsProvider>
              <TooltipProvider>
                <BrowserRouter>
                  <Routes>
                    {/* Public routes */}
                    <Route element={<MainLayout />}>
                      <Route path="/" element={<HomePage />} />
                    </Route>

                    {/* Auth routes */}
                    <Route element={<AuthLayout />}>
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/register" element={<RegisterPage />} />
                    </Route>

                    {/* Student routes */}
                    <Route element={<DashboardLayout />}>
                      <Route path="/dashboard" element={<StudentDashboard />} />
                      <Route path="/courses" element={<CoursesPage />} />
                      <Route path="/courses/:id" element={<CourseDetailPage />} />
                    </Route>

                    {/* Admin routes */}
                    <Route element={<AdminLayout />}>
                      <Route path="/admin/dashboard" element={<AdminDashboard />} />
                      <Route path="/admin/courses" element={<AdminCoursesPage />} />
                      <Route path="/admin/quizzes/:id/questions" element={<QuizQuestionsPage />} />
                    </Route>

                    {/* Catch-all route */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  <Toaster />
                  <Sonner />
                </BrowserRouter>
              </TooltipProvider>
            </QuizAttemptsProvider>
          </QuestionsProvider>
        </QuizzesProvider>
      </CoursesProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
