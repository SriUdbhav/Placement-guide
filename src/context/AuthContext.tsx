import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from '../types';

export interface AuthUser {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  rollNo?: string;
  studentId?: string;
  mustChangePassword?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (role: UserRole, identifier: string, password: string) => Promise<{ success: boolean; error?: string; mustChangePassword?: boolean }>;
  registerStudent: (data: any) => Promise<{ success: boolean; error?: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  requestResetOtp: (rollNo: string) => Promise<{ success: boolean; error?: string; message?: string; maskedEmail?: string; otp?: string }>;
  verifyResetOtp: (rollNo: string, otp: string, newPassword: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  resetPassword: (role: UserRole, identifier: string, newPassword: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check saved session in localStorage
    try {
      const savedToken = localStorage.getItem('placemate_auth_token');
      const savedUserStr = localStorage.getItem('placemate_auth_user');

      if (savedToken && savedUserStr) {
        const parsedUser = JSON.parse(savedUserStr);
        setToken(savedToken);
        setUser(parsedUser);
      } else {
        // Default to demo student session on first load so users can immediately interact if not explicitly logged out
        const defaultStudentUser: AuthUser = {
          userId: 'usr-student-01',
          name: 'Aarav Sharma',
          email: 'aarav.sharma@campus.edu',
          role: 'student',
          department: 'Computer Science & Engineering',
          rollNo: '21CS048',
          studentId: 'stu-2025-089',
          mustChangePassword: false,
        };
        setUser(defaultStudentUser);
      }
    } catch (e) {
      console.error('Failed to load session:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (role: UserRole, identifier: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, identifier, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Authentication failed' };
      }

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('placemate_auth_token', data.token);
      localStorage.setItem('placemate_auth_user', JSON.stringify(data.user));

      return { success: true, mustChangePassword: Boolean(data.mustChangePassword) };
    } catch (err: any) {
      return { success: false, error: err.message || 'Connection to authentication service failed' };
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      const currentToken = token || localStorage.getItem('placemate_auth_token');
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(currentToken ? { Authorization: `Bearer ${currentToken}` } : {}),
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Password update failed' };
      }

      if (data.token) {
        setToken(data.token);
        localStorage.setItem('placemate_auth_token', data.token);
      }
      if (data.user) {
        setUser(data.user);
        localStorage.setItem('placemate_auth_user', JSON.stringify(data.user));
      } else if (user) {
        const updatedUser = { ...user, mustChangePassword: false };
        setUser(updatedUser);
        localStorage.setItem('placemate_auth_user', JSON.stringify(updatedUser));
      }

      return { success: true, message: data.message };
    } catch (err: any) {
      return { success: false, error: err.message || 'Password update request failed' };
    }
  };

  const requestResetOtp = async (rollNo: string) => {
    try {
      const res = await fetch('/api/auth/forgot-password-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rollNo }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Failed to dispatch verification code' };
      }

      return {
        success: true,
        message: data.message,
        maskedEmail: data.maskedEmail,
        otp: data.otp,
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Connection to reset service failed' };
    }
  };

  const verifyResetOtp = async (rollNo: string, otp: string, newPassword: string) => {
    try {
      const res = await fetch('/api/auth/verify-reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rollNo, otp, newPassword }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Verification code failed' };
      }

      return { success: true, message: data.message };
    } catch (err: any) {
      return { success: false, error: err.message || 'Password reset failed' };
    }
  };

  const registerStudent = async (studentData: any) => {
    try {
      const res = await fetch('/api/auth/register-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Registration failed' };
      }

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('placemate_auth_token', data.token);
      localStorage.setItem('placemate_auth_user', JSON.stringify(data.user));

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Student registration failed' };
    }
  };

  const resetPassword = async (role: UserRole, identifier: string, newPassword: string) => {
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, identifier, newPassword }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Password reset failed' };
      }

      return { success: true, message: data.message };
    } catch (err: any) {
      return { success: false, error: err.message || 'Password reset request failed' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('placemate_auth_token');
    localStorage.removeItem('placemate_auth_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        changePassword,
        requestResetOtp,
        verifyResetOtp,
        registerStudent,
        resetPassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
