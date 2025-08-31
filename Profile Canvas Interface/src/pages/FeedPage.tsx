import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePostSearch } from '@/hooks/use-post-search';
import PostSearch, { SearchFilters } from '@/components/PostSearch';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Heart, 
  MessageCircle, 
  Eye, 
  RefreshCw, 
  User,
  Home,
  Loader2,
  Users,
  Sparkles
} from 'lucide-react';

const CATEGORIES = [
  { id: '', label: 'All' },
  { id: 'photography', label: 'Photography' },
  { id: 'art', label: 'Art' },
  { id: 'design', label: 'Design' },
  { id: 'tech', label: 'Tech' },
  { id: 'lifestyle', label: 'Lifestyle' },
  { id: 'other', label: 'Other' },
];

export default function FeedPage() {
  const { user } = useAuthStore();
  const { 
    posts, 
    loading, 
    error, 
    hasMore, 
    totalResults,
    loadMore, 
    search,
    refresh 
  } = usePostSearch({
    feedMode: true,
    userUid: user?.uid,
    initialFilters: { status: 'published' }
  });

  const handleFiltersChange = (filters: SearchFilters) => {
    search(filters);
  };

  // Loading skeleton for posts
  const PostSkeleton = () => (
    <div className="break-inside-avoid mb-6">
      <Card className="overflow-hidden">
        <Skeleton className="h-48 w-full" />
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-3" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-16" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Empty state component
  const EmptyFeed = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Users className="h-16 w-16 text-muted-foreground mb-4" />
      <h3 className="text-xl font-semibold mb-2">Your feed is empty</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        Start following other users to see their posts in your feed. Discover amazing content from the community!
      </p>
      <div className="flex gap-3">
        <Button asChild variant="outline">
          <Link to="/">
            <Home className="h-4 w-4 mr-2" />
            Explore Home
          </Link>
        </Button>
        <Button asChild>
          <Link to="/profile">
            <User className="h-4 w-4 mr-2" />
            Find Users
          </Link>
        </Button>
      </div>
    </div>
  );

  // Post card component
  const PostCard = ({ post }) => (
    <div className="break-inside-avoid mb-6">
      <Card className="group overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <Link to={`/post/${post._uid}/${post._id}`} className="block">
          {post.image_url && (
            <div className="relative aspect-[4/3] bg-muted overflow-hidden">
              <img
                src={post.image_url}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {post.is_featured && (
                <Badge className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-orange-500 border-0">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              )}
            </div>
          )}
          
          <CardContent className="p-4">
            {/* Author info */}
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src="" />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
                  {post.author_username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">{post.author_username}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(post.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Post content */}
            <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
              {post.title}
            </h3>
            {post.content && (
              <p className="text-muted-foreground text-sm mb-3 line-clamp-3">
                {post.content}
              </p>
            )}

            {/* Category and tags */}
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="secondary" className="text-xs">
                {post.category}
              </Badge>
              {post.tags?.slice(0, 2).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>

            {/* Engagement stats */}
            <div className="flex items-center justify-between pt-3 border-t">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  <span>{post.likes_count}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  <span>{post.comments_count}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{post.views_count}</span>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-8 px-3 hover:text-red-500 transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Handle like action here
                }}
              >
                <Heart className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Link>
      </Card>
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <User className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Please log in</h3>
            <p className="text-muted-foreground mb-6">
              You need to be logged in to view your personalized feed.
            </p>
            <Button asChild>
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Your Feed</h1>
              <p className="text-muted-foreground text-sm">
                Posts from people you follow
              </p>
            </div>
            <Button 
              onClick={refresh} 
              variant="outline" 
              size="sm"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filter */}
        <div className="mb-8">
          <PostSearch 
            onFiltersChange={handleFiltersChange}
            placeholder="Search your feed..."
            showAdvanced={true}
            initialFilters={{ status: 'published' }}
          />
        </div>

        {/* Results Summary */}
        {totalResults > 0 && (
          <div className="mb-6 p-4 bg-white rounded-lg border">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{totalResults.toLocaleString()}</span> posts from people you follow
            </p>
          </div>
        )}

        {/* Content */}
        <div className="space-y-6">
          {/* Feed content */}
          {loading && posts.length === 0 ? (
            <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <PostSkeleton key={index} />
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={refresh} variant="outline">
                Try Again
              </Button>
            </div>
          ) : posts.length === 0 ? (
            <EmptyFeed />
          ) : (
            <>
              {/* Posts grid */}
              <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6">
                {posts.map((post) => (
                  <PostCard key={`${post._uid}-${post._id}`} post={post} />
                ))}
              </div>

              {/* Load more button */}
              {hasMore && (
                <div className="flex justify-center mt-8">
                  <Button 
                    onClick={loadMore} 
                    variant="outline" 
                    disabled={loading}
                    className="min-w-32"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      'Load More'
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}