
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { MainLayout } from "./main-layout";

export function AdminLayout() {
  const { user, isLoading, isAdmin } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <MainLayout />;
}
