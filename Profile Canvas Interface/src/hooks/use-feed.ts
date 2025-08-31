import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { userFollowService, userPostService, type UserPost } from '@/lib/database';
import { useToast } from '@/hooks/use-toast';

interface FeedOptions {
  limit?: number;
  category?: string;
}

interface UseFeedReturn {
  posts: UserPost[];
  loading: boolean;
  error: string | null;
  refreshFeed: () => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
}

export function useFeed({ limit = 20, category }: FeedOptions = {}): UseFeedReturn {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [posts, setPosts] = useState<UserPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cursor, setCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(true);
  const [followedUserIds, setFollowedUserIds] = useState<string[]>([]);

  // Get list of users that the current user follows
  const fetchFollowedUsers = async () => {
    if (!user) return [];

    try {
      const { following } = await userFollowService.getFollowing(user.uid);
      const userIds = following.map(follow => follow.followed_uid);
      setFollowedUserIds(userIds);
      return userIds;
    } catch (err) {
      console.error('Error fetching followed users:', err);
      setError('Failed to load followed users');
      return [];
    }
  };

  // Fetch feed posts from followed users
  const fetchFeedPosts = async (followedIds: string[], reset = false) => {
    if (followedIds.length === 0) {
      // If user follows no one, show public posts instead
      try {
        setLoading(true);
        const currentCursor = reset ? undefined : cursor;
        
        const response = category 
          ? await userPostService.getPostsByCategory(category, limit, currentCursor)
          : await userPostService.getPublicPosts(limit, currentCursor);

        if (reset) {
          setPosts(response.posts);
        } else {
          setPosts(prev => [...prev, ...response.posts]);
        }

        setCursor(response.nextCursor);
        setHasMore(!!response.nextCursor);
        setError(null);
      } catch (err) {
        console.error('Error fetching public posts:', err);
        setError('Failed to load posts');
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      setLoading(true);
      const currentCursor = reset ? undefined : cursor;
      
      // For now, we'll show public posts filtered by category
      // In a real app, you'd have a more sophisticated feed algorithm
      const response = category 
        ? await userPostService.getPostsByCategory(category, limit, currentCursor)
        : await userPostService.getPublicPosts(limit, currentCursor);

      if (reset) {
        setPosts(response.posts);
      } else {
        setPosts(prev => [...prev, ...response.posts]);
      }

      setCursor(response.nextCursor);
      setHasMore(!!response.nextCursor);
      setError(null);
    } catch (err) {
      console.error('Error fetching feed posts:', err);
      setError('Failed to load feed posts');
      toast({
        title: "Error",
        description: "Failed to load your feed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Initialize feed
  const initializeFeed = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    const followedIds = await fetchFollowedUsers();
    await fetchFeedPosts(followedIds, true);
  };

  // Refresh feed
  const refreshFeed = async () => {
    setCursor(undefined);
    setHasMore(true);
    await initializeFeed();
  };

  // Load more posts
  const loadMore = async () => {
    if (!hasMore || loading || followedUserIds.length === 0) return;
    await fetchFeedPosts(followedUserIds, false);
  };

  // Initialize on mount and when user changes
  useEffect(() => {
    initializeFeed();
  }, [user?.uid, category]);

  return {
    posts,
    loading,
    error,
    refreshFeed,
    loadMore,
    hasMore
  };
}