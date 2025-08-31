import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { usePostDetail } from '@/hooks/use-post-detail';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import {
  Heart,
  MessageCircle,
  Eye,
  Share2,
  BookmarkPlus,
  ArrowLeft,
  Calendar,
  Tag,
  Sparkles,
  User,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink
} from 'lucide-react';

export default function PostDetailPage() {
  const { uid, id } = useParams<{ uid: string; id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const { post, loading, error, incrementLikes, refetch } = usePostDetail({
    uid: uid || '',
    id: id || '',
  });

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to like posts",
        variant: "destructive",
      });
      return;
    }

    if (!liked) {
      await incrementLikes();
      setLiked(true);
      toast({
        title: "Post liked!",
        description: "You liked this post",
      });
    }
  };

  const handleBookmark = () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to bookmark posts",
        variant: "destructive",
      });
      return;
    }

    setBookmarked(!bookmarked);
    toast({
      title: bookmarked ? "Removed from bookmarks" : "Added to bookmarks",
      description: bookmarked ? "Post removed from your bookmarks" : "Post saved to your bookmarks",
    });
  };

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          text: post?.content,
          url: url,
        });
      } catch (err) {
        // User cancelled sharing
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(url);
        toast({
          title: "Link copied!",
          description: "Post link copied to clipboard",
        });
      } catch (err) {
        toast({
          title: "Failed to copy",
          description: "Could not copy link to clipboard",
          variant: "destructive",
        });
      }
    }
  };

  const nextImage = () => {
    if (post?.images && post.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % post.images.length);
    }
  };

  const prevImage = () => {
    if (post?.images && post.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + post.images.length) % post.images.length);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-6">
            <Skeleton className="h-10 w-32" />
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <Skeleton className="h-96 w-full" />
            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              
              <Skeleton className="h-8 w-3/4 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3 mb-6" />
              
              <div className="flex gap-2 mb-6">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-18" />
              </div>
              
              <div className="flex justify-between">
                <div className="flex gap-4">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 w-24" />
                </div>
                <Skeleton className="h-10 w-20" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-6xl mb-4">😵</div>
            <h2 className="text-2xl font-bold mb-2">Post not found</h2>
            <p className="text-muted-foreground mb-6">
              This post might have been removed or you don't have permission to view it.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate(-1)}>
                Go Back
              </Button>
              <Button asChild>
                <Link to="/">
                  Explore Posts
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentImage = post.images?.[currentImageIndex] || post.image_url;
  const hasMultipleImages = post.images && post.images.length > 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 hover:bg-white/80"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Main content */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Image section */}
          {currentImage && (
            <div className="relative">
              <div className="aspect-video bg-muted overflow-hidden">
                <img
                  src={currentImage}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
                
                {/* Featured badge */}
                {post.is_featured && (
                  <Badge className="absolute top-4 left-4 bg-gradient-to-r from-amber-500 to-orange-500 border-0">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                )}

                {/* Image navigation */}
                {hasMultipleImages && (
                  <>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 border-0"
                      onClick={prevImage}
                    >
                      <ChevronLeft className="h-4 w-4 text-white" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 border-0"
                      onClick={nextImage}
                    >
                      <ChevronRight className="h-4 w-4 text-white" />
                    </Button>
                    
                    {/* Image indicator */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                      <div className="flex gap-2">
                        {post.images.map((_, index) => (
                          <button
                            key={index}
                            className={`w-2 h-2 rounded-full transition-colors ${
                              index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                            }`}
                            onClick={() => setCurrentImageIndex(index)}
                          />
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Content section */}
          <div className="p-8">
            {/* Author info */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {post.author_username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Link 
                    to={`/profile/${post.author_username}`}
                    className="font-semibold hover:underline"
                  >
                    {post.author_username}
                  </Link>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(post.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</span>
                  </div>
                </div>
              </div>
              
              {/* Follow button (if not own post) */}
              {user && user.uid !== post.author_uid && (
                <Button variant="outline" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  Follow
                </Button>
              )}
            </div>

            {/* Post title */}
            <h1 className="text-3xl font-bold mb-4 leading-tight">
              {post.title}
            </h1>

            {/* Post content */}
            {post.content && (
              <div className="prose prose-slate max-w-none mb-6">
                <p className="text-lg leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </p>
              </div>
            )}

            {/* Category and tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              <Badge variant="default" className="px-3 py-1">
                <Tag className="h-3 w-3 mr-1" />
                {post.category}
              </Badge>
              {post.tags?.map((tag, index) => (
                <Badge key={index} variant="outline" className="px-3 py-1">
                  #{tag}
                </Badge>
              ))}
            </div>

            <Separator className="my-6" />

            {/* Engagement stats and actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  <span className="font-medium">{post.likes_count.toLocaleString()}</span>
                  <span className="text-sm">likes</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  <span className="font-medium">{post.comments_count.toLocaleString()}</span>
                  <span className="text-sm">comments</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  <span className="font-medium">{post.views_count.toLocaleString()}</span>
                  <span className="text-sm">views</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3">
                <Button
                  variant={liked ? "default" : "outline"}
                  size="sm"
                  onClick={handleLike}
                  className={liked ? "bg-red-500 hover:bg-red-600" : ""}
                >
                  <Heart className={`h-4 w-4 mr-2 ${liked ? 'fill-current' : ''}`} />
                  {liked ? 'Liked' : 'Like'}
                </Button>
                
                <Button
                  variant={bookmarked ? "default" : "outline"}
                  size="sm"
                  onClick={handleBookmark}
                >
                  <BookmarkPlus className={`h-4 w-4 mr-2 ${bookmarked ? 'fill-current' : ''}`} />
                  {bookmarked ? 'Saved' : 'Save'}
                </Button>
                
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            {/* Additional images thumbnails */}
            {post.images && post.images.length > 1 && (
              <div className="mt-8">
                <h3 className="font-semibold mb-4">All Images ({post.images.length})</h3>
                <ScrollArea className="w-full">
                  <div className="flex gap-4 pb-4">
                    {post.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden transition-opacity ${
                          index === currentImageIndex ? 'ring-2 ring-primary' : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${post.title} - Image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {index === currentImageIndex && (
                          <div className="absolute inset-0 bg-primary/20" />
                        )}
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        </div>

        {/* Related posts section placeholder */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">More from {post.author_username}</h2>
          <div className="text-center py-8 text-muted-foreground">
            <p>Related posts coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
}