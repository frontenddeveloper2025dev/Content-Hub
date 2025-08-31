import { useState, useEffect, useCallback } from 'react';
import { userPostService, getPostsByAuthors, getUserFollows } from '@/lib/database';
import { UserPost } from '@/lib/database';
import type { SearchFilters } from '@/components/PostSearch';

interface UsePostSearchOptions {
  initialFilters?: Partial<SearchFilters>;
  feedMode?: boolean; // If true, search within followed users' posts
  userUid?: string; // Current user ID for feed mode
}

interface UsePostSearchReturn {
  posts: UserPost[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  nextCursor?: string;
  totalResults: number;
  searchResults: UserPost[];
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  search: (filters: SearchFilters) => Promise<void>;
}

export function usePostSearch({ 
  initialFilters = {}, 
  feedMode = false,
  userUid 
}: UsePostSearchOptions = {}): UsePostSearchReturn {
  const [posts, setPosts] = useState<UserPost[]>([]);
  const [searchResults, setSearchResults] = useState<UserPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [totalResults, setTotalResults] = useState(0);
  const [followedUserUids, setFollowedUserUids] = useState<string[]>([]);

  const defaultFilters: SearchFilters = {
    query: '',
    category: '',
    tags: [],
    author: '',
    dateRange: 'all',
    sortBy: 'recent',
    minLikes: 0,
    onlyFeatured: false,
    status: 'published',
    ...initialFilters,
  };

  // Get followed users for feed mode
  useEffect(() => {
    if (feedMode && userUid) {
      getUserFollows(userUid).then(follows => {
        setFollowedUserUids(follows.map(f => f.followed_uid));
      });
    }
  }, [feedMode, userUid]);

  const filterPostsByDate = useCallback((posts: UserPost[], dateRange: string): UserPost[] => {
    if (dateRange === 'all') return posts;

    const now = new Date();
    const filterDate = new Date();

    switch (dateRange) {
      case 'today':
        filterDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        filterDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return posts;
    }

    return posts.filter(post => new Date(post.created_at) >= filterDate);
  }, []);

  const filterPostsByQuery = useCallback((posts: UserPost[], query: string): UserPost[] => {
    if (!query.trim()) return posts;

    const searchTerm = query.toLowerCase().trim();
    
    return posts.filter(post => {
      // Search in title
      if (post.title.toLowerCase().includes(searchTerm)) return true;
      
      // Search in content
      if (post.content?.toLowerCase().includes(searchTerm)) return true;
      
      // Search in tags
      if (post.tags?.some(tag => tag.toLowerCase().includes(searchTerm))) return true;
      
      // Search in author username
      if (post.author_username.toLowerCase().includes(searchTerm)) return true;
      
      // Search in category
      if (post.category.toLowerCase().includes(searchTerm)) return true;
      
      return false;
    });
  }, []);

  const filterPostsByTags = useCallback((posts: UserPost[], tags: string[]): UserPost[] => {
    if (tags.length === 0) return posts;

    return posts.filter(post => 
      tags.some(searchTag => 
        post.tags?.some(postTag => 
          postTag.toLowerCase().includes(searchTag.toLowerCase())
        )
      )
    );
  }, []);

  const filterPostsByAuthor = useCallback((posts: UserPost[], author: string): UserPost[] => {
    if (!author.trim()) return posts;

    const searchAuthor = author.toLowerCase().trim();
    return posts.filter(post => 
      post.author_username.toLowerCase().includes(searchAuthor)
    );
  }, []);

  const filterPostsByEngagement = useCallback((posts: UserPost[], minLikes: number, onlyFeatured: boolean): UserPost[] => {
    let filtered = posts;

    if (minLikes > 0) {
      filtered = filtered.filter(post => post.likes_count >= minLikes);
    }

    if (onlyFeatured) {
      filtered = filtered.filter(post => post.is_featured);
    }

    return filtered;
  }, []);

  const sortPosts = useCallback((posts: UserPost[], sortBy: string): UserPost[] => {
    const sorted = [...posts];

    switch (sortBy) {
      case 'popular':
        return sorted.sort((a, b) => b.likes_count - a.likes_count);
      case 'views':
        return sorted.sort((a, b) => b.views_count - a.views_count);
      case 'comments':
        return sorted.sort((a, b) => b.comments_count - a.comments_count);
      case 'recent':
      default:
        return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
  }, []);

  const fetchPosts = useCallback(async (filters: SearchFilters, cursor?: string): Promise<{
    posts: UserPost[];
    nextCursor?: string;
  }> => {
    try {
      let result;

      if (feedMode && followedUserUids.length > 0) {
        // Fetch posts from followed users
        result = await getPostsByAuthors(followedUserUids, {
          limit: 50,
          cursor,
          category: filters.category || undefined,
          status: filters.status === 'all' ? undefined : filters.status,
        });
      } else if (filters.category) {
        // Fetch posts by category
        result = await userPostService.getPostsByCategory(filters.category, 50, cursor);
      } else {
        // Fetch all public posts
        result = await userPostService.getPublicPosts(50, cursor);
      }

      let filteredPosts = result.posts;

      // Apply client-side filters
      filteredPosts = filterPostsByDate(filteredPosts, filters.dateRange);
      filteredPosts = filterPostsByQuery(filteredPosts, filters.query);
      filteredPosts = filterPostsByTags(filteredPosts, filters.tags);
      filteredPosts = filterPostsByAuthor(filteredPosts, filters.author);
      filteredPosts = filterPostsByEngagement(filteredPosts, filters.minLikes, filters.onlyFeatured);

      // Sort posts
      filteredPosts = sortPosts(filteredPosts, filters.sortBy);

      return {
        posts: filteredPosts,
        nextCursor: result.nextCursor,
      };
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  }, [
    feedMode, 
    followedUserUids, 
    filterPostsByDate, 
    filterPostsByQuery, 
    filterPostsByTags, 
    filterPostsByAuthor, 
    filterPostsByEngagement, 
    sortPosts
  ]);

  const search = useCallback(async (filters: SearchFilters) => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchPosts(filters);
      setPosts(result.posts);
      setSearchResults(result.posts);
      setNextCursor(result.nextCursor);
      setHasMore(!!result.nextCursor);
      setTotalResults(result.posts.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while searching');
      setPosts([]);
      setSearchResults([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  }, [fetchPosts]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading || !nextCursor) return;

    setLoading(true);
    try {
      const result = await fetchPosts(defaultFilters, nextCursor);
      setPosts(prev => [...prev, ...result.posts]);
      setSearchResults(prev => [...prev, ...result.posts]);
      setNextCursor(result.nextCursor);
      setHasMore(!!result.nextCursor);
      setTotalResults(prev => prev + result.posts.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more posts');
    } finally {
      setLoading(false);
    }
  }, [hasMore, loading, nextCursor, fetchPosts, defaultFilters]);

  const refresh = useCallback(async () => {
    await search(defaultFilters);
  }, [search, defaultFilters]);

  // Initial load
  useEffect(() => {
    search(defaultFilters);
  }, []);

  return {
    posts,
    loading,
    error,
    hasMore,
    nextCursor,
    totalResults,
    searchResults,
    loadMore,
    refresh,
    search,
  };
}