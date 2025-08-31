import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { auth } from '@devvai/devv-code-backend';

interface User {
  projectId: string;
  uid: string;
  name: string;
  email: string;
  createdTime: number;
  lastLoginTime: number;
}

interface AuthState {
  user: User | null;
  sessionId: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

interface AuthActions {
  sendOTP: (email: string) => Promise<void>;
  verifyOTP: (email: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      sessionId: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,

      // Actions
      sendOTP: async (email: string) => {
        set({ isLoading: true, error: null });
        try {
          await auth.sendOTP(email);
          set({ isLoading: false });
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Failed to send OTP' 
          });
          throw error;
        }
      },

      verifyOTP: async (email: string, code: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await auth.verifyOTP(email, code);
          set({
            user: response.user,
            sessionId: response.sid,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Invalid verification code' 
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await auth.logout();
          set({
            user: null,
            sessionId: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          });
        } catch (error) {
          // Even if logout fails, clear local state
          set({
            user: null,
            sessionId: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      }
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user,
        sessionId: state.sessionId,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);