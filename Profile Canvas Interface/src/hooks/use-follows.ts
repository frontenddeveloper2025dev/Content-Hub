import { useState, useEffect } from 'react';
import { userFollowService, UserFollow } from '@/lib/database';
import { useAuthStore } from '@/store/auth-store';
import { useToast } from '@/hooks/use-toast';

export const useFollows = () => {
  const { user } = useAuthStore();
  const { toast } = useToast();

  // Follow a user
  const followUser = async (
    followedUid: string, 
    followerUsername: string, 
    followedUsername: string
  ) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to follow users.',
        variant: 'destructive',
      });
      return false;
    }

    if (user.uid === followedUid) {
      toast({
        title: 'Cannot Follow Yourself',
        description: 'You cannot follow yourself.',
        variant: 'destructive',
      });
      return false;
    }

    try {
      await userFollowService.followUser(
        user.uid, 
        followedUid, 
        followerUsername, 
        followedUsername
      );
      
      toast({
        title: 'Following',
        description: `You are now following ${followedUsername}.`,
      });
      
      return true;
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to follow user. Please try again.',
        variant: 'destructive',
      });
      console.error('Follow user error:', err);
      return false;
    }
  };

  // Unfollow a user
  const unfollowUser = async (followedUid: string, followedUsername: string) => {
    if (!user) return false;

    try {
      await userFollowService.unfollowUser(user.uid, followedUid);
      
      toast({
        title: 'Unfollowed',
        description: `You unfollowed ${followedUsername}.`,
      });
      
      return true;
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to unfollow user. Please try again.',
        variant: 'destructive',
      });
      console.error('Unfollow user error:', err);
      return false;
    }
  };

  // Check if following a user
  const checkIsFollowing = async (followedUid: string): Promise<boolean> => {
    if (!user || user.uid === followedUid) return false;

    try {
      return await userFollowService.isFollowing(user.uid, followedUid);
    } catch (err) {
      console.error('Check following error:', err);
      return false;
    }
  };

  return {
    followUser,
    unfollowUser,
    checkIsFollowing,
  };
};

export const useFollowers = (followedUid: string) => {
  const [followers, setFollowers] = useState<UserFollow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(true);

  // Load followers
  const loadFollowers = async (reset = false) => {
    if (!followedUid) return;

    setLoading(true);
    setError(null);

    try {
      const cursor = reset ? undefined : nextCursor;
      const response = await userFollowService.getFollowers(followedUid, 20, cursor);
      
      if (reset) {
        setFollowers(response.followers);
      } else {
        setFollowers(prev => [...prev, ...response.followers]);
      }
      
      setNextCursor(response.nextCursor);
      setHasMore(!!response.nextCursor);
    } catch (err) {
      setError('Failed to load followers');
      console.error('Followers load error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load more followers
  const loadMore = () => {
    if (!loading && hasMore) {
      loadFollowers(false);
    }
  };

  // Load followers when followedUid changes
  useEffect(() => {
    if (followedUid) {
      loadFollowers(true);
    } else {
      setFollowers([]);
    }
  }, [followedUid]);

  return {
    followers,
    loading,
    error,
    hasMore,
    loadFollowers,
    loadMore,
  };
};

export const useFollowing = (followerUid: string) => {
  const [following, setFollowing] = useState<UserFollow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(true);

  // Load following
  const loadFollowing = async (reset = false) => {
    if (!followerUid) return;

    setLoading(true);
    setError(null);

    try {
      const cursor = reset ? undefined : nextCursor;
      const response = await userFollowService.getFollowing(followerUid, 20, cursor);
      
      if (reset) {
        setFollowing(response.following);
      } else {
        setFollowing(prev => [...prev, ...response.following]);
      }
      
      setNextCursor(response.nextCursor);
      setHasMore(!!response.nextCursor);
    } catch (err) {
      setError('Failed to load following');
      console.error('Following load error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load more following
  const loadMore = () => {
    if (!loading && hasMore) {
      loadFollowing(false);
    }
  };

  // Load following when followerUid changes
  useEffect(() => {
    if (followerUid) {
      loadFollowing(true);
    } else {
      setFollowing([]);
    }
  }, [followerUid]);

  return {
    following,
    loading,
    error,
    hasMore,
    loadFollowing,
    loadMore,
  };
};