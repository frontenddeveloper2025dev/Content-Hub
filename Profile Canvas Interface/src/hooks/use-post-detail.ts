import { useState, useEffect } from 'react';
import { UserPost, userPostService } from '@/lib/database';

interface UsePostDetailOptions {
  uid: string;
  id: string;
  autoIncrement?: boolean; // Whether to auto-increment view count
}

interface UsePostDetailReturn {
  post: UserPost | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  incrementViews: () => Promise<void>;
  incrementLikes: () => Promise<void>;
}

export function usePostDetail({ uid, id, autoIncrement = true }: UsePostDetailOptions): UsePostDetailReturn {
  const [post, setPost] = useState<UserPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPost = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const fetchedPost = await userPostService.getPostById(uid, id);
      
      if (!fetchedPost) {
        setError('Post not found');
        return;
      }

      setPost(fetchedPost);

      // Auto-increment view count on first load
      if (autoIncrement) {
        await userPostService.incrementViews(uid, id);
        // Update local state to reflect the increment
        setPost(prev => prev ? { ...prev, views_count: prev.views_count + 1 } : null);
      }
    } catch (err) {
      console.error('Error fetching post:', err);
      setError('Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const incrementViews = async () => {
    if (!post) return;
    
    try {
      await userPostService.incrementViews(uid, id);
      setPost(prev => prev ? { ...prev, views_count: prev.views_count + 1 } : null);
    } catch (err) {
      console.error('Error incrementing views:', err);
    }
  };

  const incrementLikes = async () => {
    if (!post) return;
    
    try {
      await userPostService.incrementLikes(uid, id);
      setPost(prev => prev ? { ...prev, likes_count: prev.likes_count + 1 } : null);
    } catch (err) {
      console.error('Error incrementing likes:', err);
    }
  };

  const refetch = async () => {
    await fetchPost();
  };

  useEffect(() => {
    if (uid && id) {
      fetchPost();
    }
  }, [uid, id]);

  return {
    post,
    loading,
    error,
    refetch,
    incrementViews,
    incrementLikes,
  };
}