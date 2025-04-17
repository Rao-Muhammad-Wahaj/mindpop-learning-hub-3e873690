
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock admin credentials
const ADMIN_EMAIL = 'raowahaj323@gmail.com';
const ADMIN_PASSWORD = 'admin123';

// Mock users for demo purposes
const mockUsers: User[] = [
  {
    id: '1',
    email: ADMIN_EMAIL,
    role: 'admin',
    name: 'Admin User',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    email: 'student@example.com',
    role: 'student',
    name: 'Test Student',
    createdAt: new Date().toISOString(),
  }
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session in localStorage (for demo purposes)
    const storedUser = localStorage.getItem('mindpop_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // In a real implementation, this would call Supabase auth
      // For demo, we'll just use our mock data
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        // Admin login
        const adminUser = mockUsers.find(u => u.email === ADMIN_EMAIL);
        if (adminUser) {
          setUser(adminUser);
          localStorage.setItem('mindpop_user', JSON.stringify(adminUser));
          return true;
        }
      } else {
        // Student login logic (simplified for demo)
        const foundUser = mockUsers.find(u => u.email === email);
        if (foundUser) {
          setUser(foundUser);
          localStorage.setItem('mindpop_user', JSON.stringify(foundUser));
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // In a real implementation, this would call Supabase auth
      // For demo, we'll just create a mock user
      const existingUser = mockUsers.find(u => u.email === email);
      if (existingUser) {
        return false; // User already exists
      }

      const newUser: User = {
        id: `student_${Date.now()}`,
        email,
        role: 'student',
        name,
        createdAt: new Date().toISOString(),
      };
      
      // In a real app, this would be added to the database
      // For demo, we just set it as the current user
      setUser(newUser);
      localStorage.setItem('mindpop_user', JSON.stringify(newUser));
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mindpop_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAdmin: user?.role === 'admin',
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
