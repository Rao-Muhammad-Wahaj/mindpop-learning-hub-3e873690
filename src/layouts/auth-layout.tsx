
import { Outlet, Navigate } from "react-router-dom";
import { Logo } from "@/components/ui/logo";
import { useAuth } from "@/lib/auth";

export function AuthLayout() {
  const { user, isLoading } = useAuth();
  
  // If user is already logged in, redirect to appropriate dashboard
  if (!isLoading && user) {
    return <Navigate to={user.role === 'admin' ? "/admin/dashboard" : "/dashboard"} replace />;
  }
  
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo className="mx-auto" size="lg" />
          <h2 className="mt-4 text-2xl font-extrabold text-gray-900 dark:text-white">
            Welcome to MindPop
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Learn, quiz, grow your knowledge
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
