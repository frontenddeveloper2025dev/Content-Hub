import { useState, useEffect } from 'react';
import { userPostService, UserPost, CreateUserPostData } from '@/lib/database';
import { useAuthStore } from '@/store/auth-store';
import { useToast } from '@/hooks/use-toast';

export const usePosts = () => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [posts, setPosts] = useState<UserPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(true);

  // Load public posts
  const loadPosts = async (reset = false) => {
    setLoading(true);
    setError(null);

    try {
      const cursor = reset ? undefined : nextCursor;
      const response = await userPostService.getPublicPosts(20, cursor);
      
      if (reset) {
        setPosts(response.posts);
      } else {
        setPosts(prev => [...prev, ...response.posts]);
      }
      
      setNextCursor(response.nextCursor);
      setHasMore(!!response.nextCursor);
    } catch (err) {
      setError('Failed to load posts');
      console.error('Posts load error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load more posts
  const loadMore = () => {
    if (!loading && hasMore) {
      loadPosts(false);
    }
  };

  // Create new post
  const createPost = async (data: CreateUserPostData) => {
    if (!user) {
      setError('User not authenticated');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      // We'll need to get the username from profile
      // For now, use email as fallback
      await userPostService.createPost(data, user.uid, user.email);
      
      toast({
        title: 'Post Created',
        description: 'Your post has been created successfully.',
      });
      
      // Refresh posts
      await loadPosts(true);
      return true;
    } catch (err) {
      setError('Failed to create post');
      toast({
        title: 'Error',
        description: 'Failed to create post. Please try again.',
        variant: 'destructive',
      });
      console.error('Post creation error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Load posts on mount
  useEffect(() => {
    loadPosts(true);
  }, []);

  return {
    posts,
    loading,
    error,
    hasMore,
    loadPosts,
    loadMore,
    createPost,
  };
};

export const useUserPosts = (authorUid?: string) => {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<UserPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(true);

  const uid = authorUid || user?.uid;

  // Load user posts
  const loadUserPosts = async (reset = false) => {
    if (!uid) return;

    setLoading(true);
    setError(null);

    try {
      const cursor = reset ? undefined : nextCursor;
      const response = await userPostService.getUserPosts(uid, 20, cursor);
      
      if (reset) {
        setPosts(response.posts);
      } else {
        setPosts(prev => [...prev, ...response.posts]);
      }
      
      setNextCursor(response.nextCursor);
      setHasMore(!!response.nextCursor);
    } catch (err) {
      setError('Failed to load user posts');
      console.error('User posts load error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load more posts
  const loadMore = () => {
    if (!loading && hasMore) {
      loadUserPosts(false);
    }
  };

  // Delete post
  const deletePost = async (postId: string) => {
    if (!user) return false;

    try {
      await userPostService.deletePost(user.uid, postId);
      setPosts(prev => prev.filter(post => post._id !== postId));
      return true;
    } catch (err) {
      console.error('Delete post error:', err);
      return false;
    }
  };

  // Like post
  const likePost = async (postUid: string, postId: string) => {
    try {
      await userPostService.incrementLikes(postUid, postId);
      // Update local state
      setPosts(prev => prev.map(post => 
        post._id === postId 
          ? { ...post, likes_count: post.likes_count + 1 }
          : post
      ));
      return true;
    } catch (err) {
      console.error('Like post error:', err);
      return false;
    }
  };

  // Load posts when uid changes
  useEffect(() => {
    if (uid) {
      loadUserPosts(true);
    } else {
      setPosts([]);
    }
  }, [uid]);

  return {
    posts,
    loading,
    error,
    hasMore,
    loadUserPosts,
    loadMore,
    deletePost,
    likePost,
  };
};

export const usePostsByCategory = (category: string) => {
  const [posts, setPosts] = useState<UserPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(true);

  // Load posts by category
  const loadPostsByCategory = async (reset = false) => {
    if (!category) return;

    setLoading(true);
    setError(null);

    try {
      const cursor = reset ? undefined : nextCursor;
      const response = await userPostService.getPostsByCategory(category, 20, cursor);
      
      if (reset) {
        setPosts(response.posts);
      } else {
        setPosts(prev => [...prev, ...response.posts]);
      }
      
      setNextCursor(response.nextCursor);
      setHasMore(!!response.nextCursor);
    } catch (err) {
      setError('Failed to load posts');
      console.error('Posts by category load error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load more posts
  const loadMore = () => {
    if (!loading && hasMore) {
      loadPostsByCategory(false);
    }
  };

  // Load posts when category changes
  useEffect(() => {
    if (category) {
      loadPostsByCategory(true);
    } else {
      setPosts([]);
    }
  }, [category]);

  return {
    posts,
    loading,
    error,
    hasMore,
    loadPostsByCategory,
    loadMore,
  };
};