
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Sun, Moon, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();
  
  const toggleDarkMode = () => {
    document.documentElement.classList.toggle("dark");
    setIsDarkMode(!isDarkMode);
  };
  
  // Fix for admin vs student courses route
  const getCoursesPath = () => {
    return isAdmin ? "/admin/courses" : "/courses";
  };
  
  const navLinks = [
    ...(user ? [
      { href: isAdmin ? "/admin/dashboard" : "/dashboard", label: "Dashboard" },
      { href: getCoursesPath(), label: "Courses" },
    ] : []),
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white dark:bg-mindpop-600 shadow-sm sticky top-0 z-50">
      <div className="mindpop-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo and desktop navigation */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <Logo />
            </Link>
            <div className="hidden md:block ml-10">
              <div className="flex items-center space-x-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(link.href)
                        ? "bg-mindpop-100 dark:bg-mindpop-500 text-mindpop-500 dark:text-white"
                        : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          
          {/* User actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {user.name || user.email}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="flex items-center text-gray-700 dark:text-gray-200"
                >
                  <LogOut className="h-4 w-4 mr-1" /> Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link to="/register">
                  <Button variant="default" size="sm">Register</Button>
                </Link>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleDarkMode}
              className="p-2 mr-2 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 shadow-lg animate-slide-in">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive(link.href)
                    ? "bg-mindpop-100 dark:bg-mindpop-500 text-mindpop-500 dark:text-white"
                    : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            
            {user ? (
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <div className="flex items-center">
                  <LogOut className="h-5 w-5 mr-2" /> Logout
                </div>
              </button>
            ) : (
              <div className="space-y-2 px-3 py-2">
                <Link
                  to="/login"
                  className="block w-full px-4 py-2 text-center text-sm font-medium text-mindpop-500 bg-white dark:bg-gray-800 border border-mindpop-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block w-full px-4 py-2 text-center text-sm font-medium text-white bg-mindpop-300 border border-transparent rounded-md hover:bg-mindpop-400"
                  onClick={() => setIsOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
