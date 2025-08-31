import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePostSearch } from '@/hooks/use-post-search';
import PostSearch, { SearchFilters } from '@/components/PostSearch';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Heart, 
  MessageCircle, 
  Eye, 
  Loader2,
  Search,
  TrendingUp,
  Calendar,
  Users,
  Sparkles
} from 'lucide-react';

const TRENDING_TAGS = [
  { tag: 'photography', count: 1240 },
  { tag: 'art', count: 892 },
  { tag: 'design', count: 756 },
  { tag: 'nature', count: 634 },
  { tag: 'portrait', count: 523 },
  { tag: 'travel', count: 487 },
  { tag: 'minimalist', count: 356 },
  { tag: 'architecture', count: 298 },
];

export default function ExplorePage() {
  const [selectedTab, setSelectedTab] = useState('all');
  const { 
    posts, 
    loading, 
    error, 
    hasMore, 
    totalResults,
    loadMore, 
    search 
  } = usePostSearch({
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

  // Post card component
  const PostCard = ({ post }) => (
    <div className="break-inside-avoid mb-6">
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
            <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
              {post.title}
            </h3>
            {post.content && (
              <p className="text-muted-foreground text-sm mb-3 line-clamp-3">
                {post.content}
              </p>
            )}

            {/* Category and tags */}
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="secondary" className="text-xs capitalize">
                {post.category}
              </Badge>
              {post.tags?.slice(0, 2).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs hover:bg-secondary transition-colors">
                  #{tag}
                </Badge>
              ))}
              {post.tags?.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{post.tags.length - 2}
                </Badge>
              )}
            </div>

            {/* Engagement stats */}
            <div className="flex items-center justify-between pt-3 border-t">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1 hover:text-red-500 transition-colors">
                  <Heart className="h-4 w-4" />
                  <span>{post.likes_count}</span>
                </div>
                <div className="flex items-center gap-1 hover:text-blue-500 transition-colors">
                  <MessageCircle className="h-4 w-4" />
                  <span>{post.comments_count}</span>
                </div>
                <div className="flex items-center gap-1 hover:text-green-500 transition-colors">
                  <Eye className="h-4 w-4" />
                  <span>{post.views_count}</span>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-8 px-3 opacity-0 group-hover:opacity-100 transition-opacity"
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

  // Empty state component
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Search className="h-16 w-16 text-muted-foreground mb-4" />
      <h3 className="text-xl font-semibold mb-2">No posts found</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        Try adjusting your search filters or browse our trending content below.
      </p>
      <div className="flex flex-wrap gap-2 justify-center">
        {TRENDING_TAGS.slice(0, 4).map((item) => (
          <Button
            key={item.tag}
            variant="outline"
            size="sm"
            onClick={() => handleFiltersChange({ 
              query: '', category: '', tags: [item.tag], author: '', 
              dateRange: 'all', sortBy: 'recent', minLikes: 0, 
              onlyFeatured: false, status: 'published' 
            })}
          >
            #{item.tag}
          </Button>
        ))}
      </div>
    </div>
  );

  // Trending sidebar
  const TrendingSidebar = () => (
    <div className="space-y-6">
      {/* Trending Tags */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-orange-500" />
            <h3 className="font-semibold">Trending Tags</h3>
          </div>
          <div className="space-y-2">
            {TRENDING_TAGS.map((item, index) => (
              <div 
                key={item.tag}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary transition-colors cursor-pointer"
                onClick={() => handleFiltersChange({
                  query: '', category: '', tags: [item.tag], author: '',
                  dateRange: 'all', sortBy: 'popular', minLikes: 0,
                  onlyFeatured: false, status: 'published'
                })}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    #{index + 1}
                  </span>
                  <span className="font-medium">#{item.tag}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {item.count.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Filters */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-4">Quick Filters</h3>
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFiltersChange({
                query: '', category: '', tags: [], author: '',
                dateRange: 'today', sortBy: 'recent', minLikes: 0,
                onlyFeatured: false, status: 'published'
              })}
              className="w-full justify-start"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Today's Posts
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFiltersChange({
                query: '', category: '', tags: [], author: '',
                dateRange: 'all', sortBy: 'popular', minLikes: 10,
                onlyFeatured: false, status: 'published'
              })}
              className="w-full justify-start"
            >
              <Heart className="h-4 w-4 mr-2" />
              Popular Posts
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFiltersChange({
                query: '', category: '', tags: [], author: '',
                dateRange: 'all', sortBy: 'recent', minLikes: 0,
                onlyFeatured: true, status: 'published'
              })}
              className="w-full justify-start"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Featured Only
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Explore</h1>
            <p className="text-muted-foreground">
              Discover amazing content from our community
            </p>
          </div>

          {/* Search Component */}
          <PostSearch 
            onFiltersChange={handleFiltersChange}
            placeholder="Search posts, users, tags, or topics..."
            showAdvanced={true}
          />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Results Summary */}
            {totalResults > 0 && (
              <div className="mb-6 p-4 bg-white rounded-lg border">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Found <span className="font-semibold text-foreground">{totalResults.toLocaleString()}</span> posts
                  </p>
                  {loading && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Searching...
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Posts Grid */}
            {loading && posts.length === 0 ? (
              <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
                {Array.from({ length: 9 }).map((_, index) => (
                  <PostSkeleton key={index} />
                ))}
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={() => search({ 
                  query: '', category: '', tags: [], author: '',
                  dateRange: 'all', sortBy: 'recent', minLikes: 0,
                  onlyFeatured: false, status: 'published'
                })} variant="outline">
                  Try Again
                </Button>
              </div>
            ) : posts.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                {/* Posts Grid */}
                <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
                  {posts.map((post) => (
                    <PostCard key={`${post._uid}-${post._id}`} post={post} />
                  ))}
                </div>

                {/* Load More Button */}
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
                        'Load More Posts'
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block w-80">
            <TrendingSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}