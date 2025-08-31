import { useState, useEffect } from 'react';
import { userProfileService, UserProfile, CreateUserProfileData } from '@/lib/database';
import { useAuthStore } from '@/store/auth-store';
import { useToast } from '@/hooks/use-toast';

export const useProfile = () => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user profile
  const loadProfile = async (uid?: string) => {
    if (!uid && !user) return;
    
    setLoading(true);
    setError(null);

    try {
      const userProfile = await userProfileService.getProfile(uid || user!.uid);
      setProfile(userProfile);
    } catch (err) {
      setError('Failed to load profile');
      console.error('Profile load error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create profile for new user
  const createProfile = async (data: CreateUserProfileData) => {
    if (!user) {
      setError('User not authenticated');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      await userProfileService.createProfile(data);
      await loadProfile(); // Reload profile after creation
      toast({
        title: 'Profile Created',
        description: 'Your profile has been created successfully.',
      });
      return true;
    } catch (err) {
      setError('Failed to create profile');
      toast({
        title: 'Error',
        description: 'Failed to create profile. Please try again.',
        variant: 'destructive',
      });
      console.error('Profile creation error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update profile
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !profile) {
      setError('User not authenticated or profile not loaded');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      await userProfileService.updateProfile(user.uid, profile._id, updates);
      await loadProfile(); // Reload profile after update
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully.',
      });
      return true;
    } catch (err) {
      setError('Failed to update profile');
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
      console.error('Profile update error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Check if profile exists for current user
  const checkProfileExists = async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const existingProfile = await userProfileService.getProfile(user.uid);
      return !!existingProfile;
    } catch (err) {
      console.error('Error checking profile:', err);
      return false;
    }
  };

  // Load profile on user change
  useEffect(() => {
    if (user) {
      loadProfile();
    } else {
      setProfile(null);
    }
  }, [user]);

  return {
    profile,
    loading,
    error,
    loadProfile,
    createProfile,
    updateProfile,
    checkProfileExists,
  };
};

export const useProfileByUsername = (username: string) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) return;

    const loadProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        const userProfile = await userProfileService.getProfileByUsername(username);
        setProfile(userProfile);
      } catch (err) {
        setError('Failed to load profile');
        console.error('Profile load error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [username]);

  return { profile, loading, error };
};