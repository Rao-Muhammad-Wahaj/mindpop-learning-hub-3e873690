
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { MainLayout } from "./main-layout";

export function DashboardLayout() {
  const { user, isLoading, isAdmin } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // If user is an admin, they should be redirected to the admin dashboard
  if (isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  
  return <MainLayout />;
}
