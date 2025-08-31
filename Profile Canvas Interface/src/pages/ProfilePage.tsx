import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Edit3, Heart, MessageSquare, Bookmark, Users, Plus, Image } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { useProfile } from '@/hooks/use-profile';
import { useUserPosts } from '@/hooks/use-posts';
import { useCollections } from '@/hooks/use-collections';
import { useFollowing } from '@/hooks/use-follows';
import { useToast } from '@/hooks/use-toast';

// Create Profile Setup Component
function ProfileSetup() {
  const { user } = useAuthStore();
  const { createProfile } = useProfile();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.name?.toLowerCase().replace(/\s+/g, '') || '',
    bio: '',
    avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`,
    banner_url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&h=300&fit=crop'
  });

  const handleCreateProfile = async () => {
    if (!user || !formData.username.trim()) {
      toast({
        title: 'Error',
        description: 'Username is required',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    const success = await createProfile({
      email: user.email,
      username: formData.username.trim(),
      bio: formData.bio.trim(),
      avatar_url: formData.avatar_url,
      banner_url: formData.banner_url
    });

    if (success) {
      toast({
        title: 'Welcome!',
        description: 'Your profile has been created successfully.'
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Create Your Profile</h1>
          <p className="text-muted-foreground">Let`s set up your profile to get started</p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              placeholder="Enter your username"
            />
          </div>

          <div>
            <Label htmlFor="bio">Bio (Optional)</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="Tell us about yourself..."
              rows={3}
            />
          </div>

          <Button 
            onClick={handleCreateProfile} 
            disabled={isLoading || !formData.username.trim()}
            className="w-full"
          >
            {isLoading ? 'Creating Profile...' : 'Create Profile'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Loading Skeleton Components
function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <Skeleton className="h-48 md:h-64 w-full" />
      <div className="relative px-4 md:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="relative -mt-16 md:-mt-20 mb-4">
            <Skeleton className="w-32 h-32 md:w-40 md:h-40 mx-auto rounded-full" />
          </div>
          <div className="text-center mb-6 space-y-3">
            <Skeleton className="h-8 w-48 mx-auto" />
            <Skeleton className="h-4 w-96 mx-auto" />
            <div className="flex items-center justify-center gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="text-center">
                  <Skeleton className="h-6 w-12 mx-auto mb-1" />
                  <Skeleton className="h-3 w-16 mx-auto" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ title, description, action }: { 
  title: string; 
  description: string; 
  action?: React.ReactNode;
}) {
  return (
    <div className="text-center py-12">
      <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
        <Image className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4">{description}</p>
      {action}
    </div>
  );
}

// Post Grid Component
function PostGrid({ posts }: { posts: any[] }) {
  if (posts.length === 0) {
    return (
      <EmptyState
        title="No posts yet"
        description="Share your first post to get started!"
        action={
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Post
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {posts.map((post, index) => (
        <Link 
          key={post._id} 
          to={`/post/${post._uid}/${post._id}`}
          className={`relative group cursor-pointer overflow-hidden rounded-lg bg-muted ${index % 7 === 0 ? 'md:row-span-2' : ''}`}
        >
          <div className="aspect-square relative">
            <img
              src={post.image_url || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=300&h=300&fit=crop'}
              alt={post.title}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-4 text-white">
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  <span className="text-sm font-medium">{post.likes_count}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-sm font-medium">{post.comments_count}</span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

// Collection Grid Component
function CollectionGrid({ collections }: { collections: any[] }) {
  if (collections.length === 0) {
    return (
      <EmptyState
        title="No collections yet"
        description="Create collections to organize your favorite posts!"
        action={
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Collection
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {collections.map((collection) => (
        <div key={collection._id} className="group cursor-pointer">
          <div className="relative aspect-square rounded-lg overflow-hidden bg-muted mb-3">
            <img
              src={collection.cover_image_url || 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=300&fit=crop'}
              alt={collection.name}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            <Badge 
              variant="secondary" 
              className="absolute top-3 right-3 bg-black/50 text-white border-0"
            >
              {collection.posts_count}
            </Badge>
          </div>
          <h3 className="font-medium group-hover:text-primary transition-colors">
            {collection.name}
          </h3>
        </div>
      ))}
    </div>
  );
}

// Following Grid Component
function FollowingGrid({ following }: { following: any[] }) {
  if (following.length === 0) {
    return (
      <EmptyState
        title="Not following anyone yet"
        description="Discover and follow creators to see their content here!"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {following.map((follow) => (
        <div key={follow._id} className="flex items-center gap-3 p-4 rounded-lg border hover:bg-accent transition-colors">
          <img
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${follow.followed_username}`}
            alt={follow.followed_username}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className="flex-1 min-w-0">
            <h4 className="font-medium truncate">{follow.followed_username}</h4>
            <p className="text-sm text-muted-foreground">
              Following since {new Date(follow.created_at).toLocaleDateString()}
            </p>
          </div>
          <Button size="sm" variant="outline">
            Following
          </Button>
        </div>
      ))}
    </div>
  );
}

function ProfilePage() {
  const { user } = useAuthStore();
  const { profile, loading: profileLoading, updateProfile, checkProfileExists } = useProfile();
  const { posts, loading: postsLoading } = useUserPosts();
  const { collections, loading: collectionsLoading } = useCollections();
  const { following, loading: followingLoading } = useFollowing(user?.uid || '');
  const { toast } = useToast();
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    bio: ''
  });
  const [needsProfileSetup, setNeedsProfileSetup] = useState(false);

  // Check if user needs profile setup
  useEffect(() => {
    const checkProfile = async () => {
      if (user) {
        const profileExists = await checkProfileExists();
        setNeedsProfileSetup(!profileExists);
      }
    };
    checkProfile();
  }, [user, checkProfileExists]);

  // Update edit form when profile loads
  useEffect(() => {
    if (profile) {
      setEditForm({
        username: profile.username || '',
        bio: profile.bio || ''
      });
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    if (!profile) return;

    const success = await updateProfile({
      username: editForm.username.trim(),
      bio: editForm.bio.trim()
    });

    if (success) {
      setIsEditDialogOpen(false);
    }
  };

  if (!user) {
    return <div>Please log in to view your profile.</div>;
  }

  if (needsProfileSetup) {
    return <ProfileSetup />;
  }

  if (profileLoading) {
    return <ProfileSkeleton />;
  }

  if (!profile) {
    return <div>Profile not found.</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Banner Section */}
      <div className="relative h-48 md:h-64 bg-muted">
        <img
          src={profile.banner_url || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&h=300&fit=crop'}
          alt="Profile banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Profile Header */}
      <div className="relative px-4 md:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Avatar */}
          <div className="relative -mt-16 md:-mt-20 mb-4">
            <div className="w-32 h-32 md:w-40 md:h-40 mx-auto">
              <img
                src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                alt={profile.username}
                className="w-full h-full rounded-full border-4 border-background object-cover"
              />
            </div>
          </div>

          {/* User Info */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-3 mb-2">
              <h1 className="text-2xl md:text-3xl font-bold">{profile.username}</h1>
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-primary hover:bg-primary/90">
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={editForm.username}
                        onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={editForm.bio}
                        onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                        rows={4}
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSaveProfile}>
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              {profile.bio || 'No bio added yet.'}
            </p>
            
            {/* User Details */}
            <div className="text-sm text-muted-foreground mb-4">
              <p>Joined {new Date(profile.created_at).toLocaleDateString()}</p>
              <p>{profile.email}</p>
            </div>
            
            {/* Stats */}
            <div className="flex items-center justify-center gap-6">
              <div className="text-center">
                <div className="font-bold text-lg">{profile.posts_count}</div>
                <div className="text-sm text-muted-foreground">Posts</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg">{profile.followers_count.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Followers</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg">{profile.following_count}</div>
                <div className="text-sm text-muted-foreground">Following</div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="posts" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="posts" className="flex items-center gap-2">
                <div className="w-4 h-4 grid grid-cols-3 gap-px">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="bg-current rounded-sm" />
                  ))}
                </div>
                Posts ({profile.posts_count})
              </TabsTrigger>
              <TabsTrigger value="collections" className="flex items-center gap-2">
                <Bookmark className="w-4 h-4" />
                Collections ({collections.length})
              </TabsTrigger>
              <TabsTrigger value="following" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Following ({profile.following_count})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="posts" className="space-y-6">
              {postsLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[...Array(8)].map((_, i) => (
                    <Skeleton key={i} className="aspect-square rounded-lg" />
                  ))}
                </div>
              ) : (
                <PostGrid posts={posts} />
              )}
            </TabsContent>

            <TabsContent value="collections" className="space-y-6">
              {collectionsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="space-y-3">
                      <Skeleton className="aspect-square rounded-lg" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  ))}
                </div>
              ) : (
                <CollectionGrid collections={collections} />
              )}
            </TabsContent>

            <TabsContent value="following" className="space-y-6">
              {followingLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 rounded-lg border">
                      <Skeleton className="w-12 h-12 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                      <Skeleton className="h-8 w-20" />
                    </div>
                  ))}
                </div>
              ) : (
                <FollowingGrid following={following} />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;