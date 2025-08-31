import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PostActionsProps {
  postId: string;
  likesCount: number;
  commentsCount: number;
  isLiked?: boolean;
  isSaved?: boolean;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onSave?: () => void;
  className?: string;
}

export function PostActions({
  postId,
  likesCount,
  commentsCount,
  isLiked = false,
  isSaved = false,
  onLike,
  onComment,
  onShare,
  onSave,
  className = '',
}: PostActionsProps) {
  const { toast } = useToast();

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Check out this post',
        url: window.location.href + '/post/' + postId,
      });
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href + '/post/' + postId);
      toast({
        title: "Link copied!",
        description: "Post link has been copied to clipboard.",
      });
    }
    onShare?.();
  };

  const handleAction = (action: () => void, fallbackMessage: string) => {
    try {
      action();
    } catch (error) {
      toast({
        title: "Action unavailable",
        description: fallbackMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {/* Like Button */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 px-2 ${isLiked ? 'text-red-500 hover:text-red-600' : 'text-slate-600 hover:text-red-500'}`}
          onClick={() => handleAction(onLike || (() => {}), "Like feature coming soon")}
        >
          <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
        </Button>
        {likesCount > 0 && (
          <Badge variant="secondary" className="text-xs">
            {likesCount}
          </Badge>
        )}
      </div>

      {/* Comment Button */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-slate-600 hover:text-blue-500"
          onClick={() => handleAction(onComment || (() => {}), "Comments feature coming soon")}
        >
          <MessageCircle className="h-4 w-4" />
        </Button>
        {commentsCount > 0 && (
          <Badge variant="secondary" className="text-xs">
            {commentsCount}
          </Badge>
        )}
      </div>

      {/* Share Button */}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 px-2 text-slate-600 hover:text-green-500"
        onClick={handleShare}
      >
        <Share2 className="h-4 w-4" />
      </Button>

      {/* Save Button */}
      <Button
        variant="ghost"
        size="sm"
        className={`h-8 px-2 ${isSaved ? 'text-yellow-500 hover:text-yellow-600' : 'text-slate-600 hover:text-yellow-500'}`}
        onClick={() => handleAction(onSave || (() => {}), "Save feature coming soon")}
      >
        <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
      </Button>
    </div>
  );
}