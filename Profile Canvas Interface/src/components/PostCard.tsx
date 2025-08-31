import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserPost } from '@/lib/database';
import { Heart, MessageCircle, Eye, Sparkles } from 'lucide-react';

interface PostCardProps {
  post: UserPost;
  variant?: 'feed' | 'grid' | 'compact';
  showAuthor?: boolean;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
}

export function PostCard({ 
  post, 
  variant = 'feed', 
  showAuthor = true,
  onLike,
  onComment 
}: PostCardProps) {
  
  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onLike?.(post._id);
  };

  const handleComment = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onComment?.(post._id);
  };

  // Grid variant for profile pages
  if (variant === 'grid') {
    return (
      <Link 
        to={`/post/${post._uid}/${post._id}`}
        className="relative group cursor-pointer overflow-hidden rounded-lg bg-muted block"
      >
        <div className="aspect-square relative">
          <img
            src={post.image_url || post.images?.[0] || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=300&h=300&fit=crop'}
            alt={post.title}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
          
          {post.is_featured && (
            <Badge className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-orange-500 border-0">
              <Sparkles className="h-3 w-3 mr-1" />
              Featured
            </Badge>
          )}
          
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-4 text-white">
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                <span className="text-sm font-medium">{post.likes_count}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm font-medium">{post.comments_count}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Compact variant for lists
  if (variant === 'compact') {
    return (
      <Link to={`/post/${post._uid}/${post._id}`}>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex gap-4">
              {(post.image_url || post.images?.[0]) && (
                <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={post.image_url || post.images?.[0]}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors mb-1">
                  {post.title}
                </h3>
                {showAuthor && (
                  <p className="text-xs text-muted-foreground mb-2">
                    by {post.author_username}
                  </p>
                )}
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    {post.likes_count}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {post.views_count}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  // Feed variant (default)
  return (
    <div className="break-inside-avoid mb-6">
      <Card className="group overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <Link to={`/post/${post._uid}/${post._id}`} className="block">
          {(post.image_url || post.images?.[0]) && (
            <div className="relative aspect-[4/3] bg-muted overflow-hidden">
              <img
                src={post.image_url || post.images?.[0]}
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
            {showAuthor && (
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
            )}

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
              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-8 px-3 hover:text-red-500 transition-colors"
                  onClick={handleLike}
                >
                  <Heart className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-8 px-3 hover:text-blue-500 transition-colors"
                  onClick={handleComment}
                >
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Link>
      </Card>
    </div>
  );
}