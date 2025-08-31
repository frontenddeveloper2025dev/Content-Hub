import { useState, useEffect } from 'react';
import { userCollectionService, UserCollection, CreateUserCollectionData } from '@/lib/database';
import { useAuthStore } from '@/store/auth-store';
import { useToast } from '@/hooks/use-toast';

export const useCollections = (creatorUid?: string) => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [collections, setCollections] = useState<UserCollection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(true);

  const uid = creatorUid || user?.uid;

  // Load user collections
  const loadCollections = async (reset = false) => {
    if (!uid) return;

    setLoading(true);
    setError(null);

    try {
      const cursor = reset ? undefined : nextCursor;
      const response = await userCollectionService.getUserCollections(uid, 20, cursor);
      
      if (reset) {
        setCollections(response.collections);
      } else {
        setCollections(prev => [...prev, ...response.collections]);
      }
      
      setNextCursor(response.nextCursor);
      setHasMore(!!response.nextCursor);
    } catch (err) {
      setError('Failed to load collections');
      console.error('Collections load error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load more collections
  const loadMore = () => {
    if (!loading && hasMore) {
      loadCollections(false);
    }
  };

  // Create new collection
  const createCollection = async (data: CreateUserCollectionData) => {
    if (!user) {
      setError('User not authenticated');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      await userCollectionService.createCollection(data, user.uid);
      
      toast({
        title: 'Collection Created',
        description: 'Your collection has been created successfully.',
      });
      
      // Refresh collections
      await loadCollections(true);
      return true;
    } catch (err) {
      setError('Failed to create collection');
      toast({
        title: 'Error',
        description: 'Failed to create collection. Please try again.',
        variant: 'destructive',
      });
      console.error('Collection creation error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Delete collection
  const deleteCollection = async (collectionId: string) => {
    if (!user) return false;

    try {
      await userCollectionService.deleteCollection(user.uid, collectionId);
      setCollections(prev => prev.filter(collection => collection._id !== collectionId));
      
      toast({
        title: 'Collection Deleted',
        description: 'Your collection has been deleted successfully.',
      });
      
      return true;
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to delete collection. Please try again.',
        variant: 'destructive',
      });
      console.error('Delete collection error:', err);
      return false;
    }
  };

  // Add post to collection
  const addPostToCollection = async (collectionId: string, postId: string) => {
    if (!user) return false;

    try {
      await userCollectionService.addPostToCollection(user.uid, collectionId, postId);
      
      // Update local state
      setCollections(prev => prev.map(collection => 
        collection._id === collectionId 
          ? { 
              ...collection, 
              post_ids: [...collection.post_ids, postId],
              posts_count: collection.posts_count + 1 
            }
          : collection
      ));
      
      toast({
        title: 'Added to Collection',
        description: 'Post has been added to your collection.',
      });
      
      return true;
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to add post to collection. Please try again.',
        variant: 'destructive',
      });
      console.error('Add post to collection error:', err);
      return false;
    }
  };

  // Remove post from collection
  const removePostFromCollection = async (collectionId: string, postId: string) => {
    if (!user) return false;

    try {
      await userCollectionService.removePostFromCollection(user.uid, collectionId, postId);
      
      // Update local state
      setCollections(prev => prev.map(collection => 
        collection._id === collectionId 
          ? { 
              ...collection, 
              post_ids: collection.post_ids.filter(id => id !== postId),
              posts_count: Math.max(0, collection.posts_count - 1) 
            }
          : collection
      ));
      
      toast({
        title: 'Removed from Collection',
        description: 'Post has been removed from your collection.',
      });
      
      return true;
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to remove post from collection. Please try again.',
        variant: 'destructive',
      });
      console.error('Remove post from collection error:', err);
      return false;
    }
  };

  // Load collections when uid changes
  useEffect(() => {
    if (uid) {
      loadCollections(true);
    } else {
      setCollections([]);
    }
  }, [uid]);

  return {
    collections,
    loading,
    error,
    hasMore,
    loadCollections,
    loadMore,
    createCollection,
    deleteCollection,
    addPostToCollection,
    removePostFromCollection,
  };
};