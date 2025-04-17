
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'student';
  name?: string;
  avatar?: string;
  createdAt: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  enrolledCount?: number;
}

export interface Quiz {
  id: string;
  courseId: string;
  title: string;
  description: string;
  timeLimit?: number; // in minutes
  passingScore?: number; // percentage
  createdAt: string;
  updatedAt: string;
  reviewEnabled: boolean;
}

export interface Question {
  id: string;
  quizId: string;
  text: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  options?: string[];
  correctAnswer: string | string[];
  points: number;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  startedAt: string;
  completedAt?: string;
  score: number;
  maxScore: number;
  answers: {
    questionId: string;
    answer: string | string[];
    isCorrect: boolean;
  }[];
}

export interface EnrolledCourse {
  id: string;
  courseId: string;
  userId: string;
  enrolledAt: string;
  progress: number; // percentage
  completedQuizzes: string[]; // quiz IDs
}

export interface UserStats {
  totalCourses: number;
  completedCourses: number;
  averageScore: number;
  quizzesTaken: number;
  quizzesPassed: number;
  bestPerformingSubject?: string;
}
