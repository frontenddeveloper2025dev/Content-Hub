import { table } from '@devvai/devv-code-backend';

// Table IDs
export const TABLES = {
  USER_PROFILES: 'evn2bh5ae8e8',
  USER_POSTS: 'evn2c04m4g00',
  USER_COLLECTIONS: 'evn2ccx4wcn4',
  USER_FOLLOWS: 'evn2cnise0w0',
} as const;

// User Profile Types
export interface UserProfile {
  _uid: string;
  _id: string;
  email: string;
  username: string;
  bio?: string;
  avatar_url?: string;
  banner_url?: string;
  followers_count: number;
  following_count: number;
  posts_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateUserProfileData {
  email: string;
  username: string;
  bio?: string;
  avatar_url?: string;
  banner_url?: string;
}

// User Post Types
export interface UserPost {
  _uid: string;
  _id: string;
  author_uid: string;
  author_username: string;
  title: string;
  content?: string;
  image_url?: string;
  images?: string[]; // JSON parsed from string
  category: string;
  tags?: string[]; // JSON parsed from string
  likes_count: number;
  comments_count: number;
  views_count: number;
  is_featured: boolean;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface CreateUserPostData {
  title: string;
  content?: string;
  image_url?: string;
  images?: string[];
  category: string;
  tags?: string[];
  status?: 'draft' | 'published' | 'archived';
}

// User Collection Types
export interface UserCollection {
  _uid: string;
  _id: string;
  creator_uid: string;
  name: string;
  description?: string;
  cover_image_url?: string;
  post_ids: string[]; // JSON parsed from string
  posts_count: number;
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateUserCollectionData {
  name: string;
  description?: string;
  cover_image_url?: string;
  is_private?: boolean;
}

// User Follow Types
export interface UserFollow {
  _uid: string;
  _id: string;
  follower_uid: string;
  followed_uid: string;
  follower_username: string;
  followed_username: string;
  created_at: string;
}

// User Profile Service
export const userProfileService = {
  async createProfile(data: CreateUserProfileData): Promise<void> {
    const now = new Date().toISOString();
    await table.addItem(TABLES.USER_PROFILES, {
      ...data,
      followers_count: 0,
      following_count: 0,
      posts_count: 0,
      created_at: now,
      updated_at: now,
    });
  },

  async getProfile(uid: string): Promise<UserProfile | null> {
    try {
      const response = await table.getItems(TABLES.USER_PROFILES, {
        query: { _uid: uid },
        limit: 1,
      });
      return response.items[0] as UserProfile || null;
    } catch (error) {
      console.error('Error getting profile:', error);
      return null;
    }
  },

  async getProfileByUsername(username: string): Promise<UserProfile | null> {
    try {
      const response = await table.getItems(TABLES.USER_PROFILES, {
        query: { username },
        limit: 1,
      });
      return response.items[0] as UserProfile || null;
    } catch (error) {
      console.error('Error getting profile by username:', error);
      return null;
    }
  },

  async getProfileByEmail(email: string): Promise<UserProfile | null> {
    try {
      const response = await table.getItems(TABLES.USER_PROFILES, {
        query: { email },
        limit: 1,
      });
      return response.items[0] as UserProfile || null;
    } catch (error) {
      console.error('Error getting profile by email:', error);
      return null;
    }
  },

  async updateProfile(uid: string, id: string, updates: Partial<UserProfile>): Promise<void> {
    await table.updateItem(TABLES.USER_PROFILES, {
      _uid: uid,
      _id: id,
      ...updates,
      updated_at: new Date().toISOString(),
    });
  },

  async incrementFollowersCount(uid: string, id: string): Promise<void> {
    // Note: In a real app, you'd want to use atomic counters
    // For now, we'll fetch and update
    const profile = await this.getProfile(uid);
    if (profile) {
      await this.updateProfile(uid, id, {
        followers_count: profile.followers_count + 1,
      });
    }
  },

  async decrementFollowersCount(uid: string, id: string): Promise<void> {
    const profile = await this.getProfile(uid);
    if (profile) {
      await this.updateProfile(uid, id, {
        followers_count: Math.max(0, profile.followers_count - 1),
      });
    }
  },

  async incrementFollowingCount(uid: string, id: string): Promise<void> {
    const profile = await this.getProfile(uid);
    if (profile) {
      await this.updateProfile(uid, id, {
        following_count: profile.following_count + 1,
      });
    }
  },

  async decrementFollowingCount(uid: string, id: string): Promise<void> {
    const profile = await this.getProfile(uid);
    if (profile) {
      await this.updateProfile(uid, id, {
        following_count: Math.max(0, profile.following_count - 1),
      });
    }
  },

  async incrementPostsCount(uid: string, id: string): Promise<void> {
    const profile = await this.getProfile(uid);
    if (profile) {
      await this.updateProfile(uid, id, {
        posts_count: profile.posts_count + 1,
      });
    }
  },

  async decrementPostsCount(uid: string, id: string): Promise<void> {
    const profile = await this.getProfile(uid);
    if (profile) {
      await this.updateProfile(uid, id, {
        posts_count: Math.max(0, profile.posts_count - 1),
      });
    }
  },
};

// User Post Service
export const userPostService = {
  async createPost(data: CreateUserPostData, authorUid: string, authorUsername: string): Promise<void> {
    const now = new Date().toISOString();
    await table.addItem(TABLES.USER_POSTS, {
      ...data,
      author_uid: authorUid,
      author_username: authorUsername,
      images: data.images ? JSON.stringify(data.images) : '',
      tags: data.tags ? JSON.stringify(data.tags) : '',
      likes_count: 0,
      comments_count: 0,
      views_count: 0,
      is_featured: 'false',
      status: data.status || 'draft',
      created_at: now,
      updated_at: now,
    });
  },

  async getUserPosts(authorUid: string, limit = 20, cursor?: string): Promise<{
    posts: UserPost[];
    nextCursor?: string;
  }> {
    try {
      const response = await table.getItems(TABLES.USER_POSTS, {
        query: { author_uid: authorUid },
        limit,
        cursor,
        sort: 'created_at',
        order: 'desc',
      });

      const posts = response.items.map(item => ({
        ...item,
        images: item.images ? JSON.parse(item.images) : [],
        tags: item.tags ? JSON.parse(item.tags) : [],
        is_featured: item.is_featured === 'true',
      })) as UserPost[];

      return {
        posts,
        nextCursor: response.nextCursor,
      };
    } catch (error) {
      console.error('Error getting user posts:', error);
      return { posts: [] };
    }
  },

  async getPublicPosts(limit = 20, cursor?: string): Promise<{
    posts: UserPost[];
    nextCursor?: string;
  }> {
    try {
      const response = await table.getItems(TABLES.USER_POSTS, {
        query: { status: 'published' },
        limit,
        cursor,
        sort: 'created_at',
        order: 'desc',
      });

      const posts = response.items.map(item => ({
        ...item,
        images: item.images ? JSON.parse(item.images) : [],
        tags: item.tags ? JSON.parse(item.tags) : [],
        is_featured: item.is_featured === 'true',
      })) as UserPost[];

      return {
        posts,
        nextCursor: response.nextCursor,
      };
    } catch (error) {
      console.error('Error getting public posts:', error);
      return { posts: [] };
    }
  },

  async getPostsByCategory(category: string, limit = 20, cursor?: string): Promise<{
    posts: UserPost[];
    nextCursor?: string;
  }> {
    try {
      const response = await table.getItems(TABLES.USER_POSTS, {
        query: { category },
        limit,
        cursor,
        sort: 'created_at',
        order: 'desc',
      });

      const posts = response.items.map(item => ({
        ...item,
        images: item.images ? JSON.parse(item.images) : [],
        tags: item.tags ? JSON.parse(item.tags) : [],
        is_featured: item.is_featured === 'true',
      })) as UserPost[];

      return {
        posts,
        nextCursor: response.nextCursor,
      };
    } catch (error) {
      console.error('Error getting posts by category:', error);
      return { posts: [] };
    }
  },

  async updatePost(uid: string, id: string, updates: Partial<UserPost>): Promise<void> {
    const updateData: any = {
      _uid: uid,
      _id: id,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    // Convert arrays to JSON strings for storage
    if (updates.images) {
      updateData.images = JSON.stringify(updates.images);
    }
    if (updates.tags) {
      updateData.tags = JSON.stringify(updates.tags);
    }
    if (typeof updates.is_featured === 'boolean') {
      updateData.is_featured = updates.is_featured.toString();
    }

    await table.updateItem(TABLES.USER_POSTS, updateData);
  },

  async deletePost(uid: string, id: string): Promise<void> {
    await table.deleteItem(TABLES.USER_POSTS, { _uid: uid, _id: id });
  },

  async incrementLikes(uid: string, id: string): Promise<void> {
    // In a real app, you'd use atomic counters and track individual likes
    // For now, we'll just increment the count
    const response = await table.getItems(TABLES.USER_POSTS, {
      query: { _uid: uid, _id: id },
      limit: 1,
    });
    
    if (response.items[0]) {
      const post = response.items[0];
      await this.updatePost(uid, id, {
        likes_count: (post.likes_count || 0) + 1,
      });
    }
  },

  async incrementViews(uid: string, id: string): Promise<void> {
    const response = await table.getItems(TABLES.USER_POSTS, {
      query: { _uid: uid, _id: id },
      limit: 1,
    });
    
    if (response.items[0]) {
      const post = response.items[0];
      await this.updatePost(uid, id, {
        views_count: (post.views_count || 0) + 1,
      });
    }
  },

  async getPostById(uid: string, id: string): Promise<UserPost | null> {
    try {
      const response = await table.getItems(TABLES.USER_POSTS, {
        query: { _uid: uid, _id: id },
        limit: 1,
      });

      if (response.items[0]) {
        const item = response.items[0];
        return {
          ...item,
          images: item.images ? JSON.parse(item.images) : [],
          tags: item.tags ? JSON.parse(item.tags) : [],
          is_featured: item.is_featured === 'true',
        } as UserPost;
      }
      return null;
    } catch (error) {
      console.error('Error getting post by ID:', error);
      return null;
    }
  },
};

// User Collection Service
export const userCollectionService = {
  async createCollection(data: CreateUserCollectionData, creatorUid: string): Promise<void> {
    const now = new Date().toISOString();
    await table.addItem(TABLES.USER_COLLECTIONS, {
      ...data,
      creator_uid: creatorUid,
      post_ids: '[]',
      posts_count: 0,
      is_private: data.is_private ? 'true' : 'false',
      created_at: now,
      updated_at: now,
    });
  },

  async getUserCollections(creatorUid: string, limit = 20, cursor?: string): Promise<{
    collections: UserCollection[];
    nextCursor?: string;
  }> {
    try {
      const response = await table.getItems(TABLES.USER_COLLECTIONS, {
        query: { creator_uid: creatorUid },
        limit,
        cursor,
        sort: 'updated_at',
        order: 'desc',
      });

      const collections = response.items.map(item => ({
        ...item,
        post_ids: JSON.parse(item.post_ids || '[]'),
        is_private: item.is_private === 'true',
      })) as UserCollection[];

      return {
        collections,
        nextCursor: response.nextCursor,
      };
    } catch (error) {
      console.error('Error getting user collections:', error);
      return { collections: [] };
    }
  },

  async addPostToCollection(uid: string, collectionId: string, postId: string): Promise<void> {
    const response = await table.getItems(TABLES.USER_COLLECTIONS, {
      query: { _uid: uid, _id: collectionId },
      limit: 1,
    });

    if (response.items[0]) {
      const collection = response.items[0];
      const postIds = JSON.parse(collection.post_ids || '[]');
      
      if (!postIds.includes(postId)) {
        postIds.push(postId);
        await table.updateItem(TABLES.USER_COLLECTIONS, {
          _uid: uid,
          _id: collectionId,
          post_ids: JSON.stringify(postIds),
          posts_count: postIds.length,
          updated_at: new Date().toISOString(),
        });
      }
    }
  },

  async removePostFromCollection(uid: string, collectionId: string, postId: string): Promise<void> {
    const response = await table.getItems(TABLES.USER_COLLECTIONS, {
      query: { _uid: uid, _id: collectionId },
      limit: 1,
    });

    if (response.items[0]) {
      const collection = response.items[0];
      const postIds = JSON.parse(collection.post_ids || '[]');
      const updatedPostIds = postIds.filter((id: string) => id !== postId);
      
      await table.updateItem(TABLES.USER_COLLECTIONS, {
        _uid: uid,
        _id: collectionId,
        post_ids: JSON.stringify(updatedPostIds),
        posts_count: updatedPostIds.length,
        updated_at: new Date().toISOString(),
      });
    }
  },

  async deleteCollection(uid: string, id: string): Promise<void> {
    await table.deleteItem(TABLES.USER_COLLECTIONS, { _uid: uid, _id: id });
  },
};

// Helper functions for feed
export async function getUserFollows(uid: string): Promise<UserFollow[]> {
  try {
    const response = await table.getItems(TABLES.USER_FOLLOWS, {
      query: { follower_uid: uid },
      limit: 100, // Get up to 100 followed users for feed
    });
    return response.items as UserFollow[];
  } catch (error) {
    console.error('Error getting user follows:', error);
    return [];
  }
}

export async function getPostsByAuthors(
  authorUids: string[], 
  options: {
    limit?: number;
    cursor?: string;
    category?: string;
    status?: string;
  } = {}
): Promise<{
  posts: UserPost[];
  nextCursor?: string;
}> {
  try {
    // Since we can't query multiple author_uids directly with DynamoDB,
    // we'll need to fetch posts for each author and merge/sort them
    // This is a simplified approach - in production you'd want to optimize this
    const allPosts: UserPost[] = [];
    
    for (const authorUid of authorUids) {
      const query: any = { author_uid: authorUid };
      if (options.status) {
        query.status = options.status;
      }
      if (options.category) {
        query.category = options.category;
      }

      const response = await table.getItems(TABLES.USER_POSTS, {
        query,
        limit: 50, // Get more from each user to ensure good mix
        sort: 'created_at',
        order: 'desc',
      });

      const posts = response.items.map(item => ({
        ...item,
        images: item.images ? JSON.parse(item.images) : [],
        tags: item.tags ? JSON.parse(item.tags) : [],
        is_featured: item.is_featured === 'true',
      })) as UserPost[];

      allPosts.push(...posts);
    }

    // Sort all posts by creation date (newest first)
    allPosts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Apply pagination
    const limit = options.limit || 20;
    const startIndex = options.cursor ? parseInt(options.cursor, 10) : 0;
    const endIndex = startIndex + limit;
    const paginatedPosts = allPosts.slice(startIndex, endIndex);
    
    return {
      posts: paginatedPosts,
      nextCursor: endIndex < allPosts.length ? endIndex.toString() : undefined,
    };
  } catch (error) {
    console.error('Error getting posts by authors:', error);
    return { posts: [] };
  }
}

// User Follow Service
export const userFollowService = {
  async followUser(followerUid: string, followedUid: string, followerUsername: string, followedUsername: string): Promise<void> {
    // Check if already following
    const existing = await this.isFollowing(followerUid, followedUid);
    if (existing) return;

    await table.addItem(TABLES.USER_FOLLOWS, {
      follower_uid: followerUid,
      followed_uid: followedUid,
      follower_username: followerUsername,
      followed_username: followedUsername,
      created_at: new Date().toISOString(),
    });
  },

  async unfollowUser(followerUid: string, followedUid: string): Promise<void> {
    const response = await table.getItems(TABLES.USER_FOLLOWS, {
      query: {
        follower_uid: followerUid,
        followed_uid: followedUid,
      },
      limit: 1,
    });

    if (response.items[0]) {
      await table.deleteItem(TABLES.USER_FOLLOWS, {
        _uid: response.items[0]._uid,
        _id: response.items[0]._id,
      });
    }
  },

  async isFollowing(followerUid: string, followedUid: string): Promise<boolean> {
    try {
      const response = await table.getItems(TABLES.USER_FOLLOWS, {
        query: {
          follower_uid: followerUid,
          followed_uid: followedUid,
        },
        limit: 1,
      });
      return response.items.length > 0;
    } catch (error) {
      console.error('Error checking follow status:', error);
      return false;
    }
  },

  async getFollowers(followedUid: string, limit = 20, cursor?: string): Promise<{
    followers: UserFollow[];
    nextCursor?: string;
  }> {
    try {
      const response = await table.getItems(TABLES.USER_FOLLOWS, {
        query: { followed_uid: followedUid },
        limit,
        cursor,
        sort: 'follower_uid',
        order: 'desc',
      });

      return {
        followers: response.items as UserFollow[],
        nextCursor: response.nextCursor,
      };
    } catch (error) {
      console.error('Error getting followers:', error);
      return { followers: [] };
    }
  },

  async getFollowing(followerUid: string, limit = 20, cursor?: string): Promise<{
    following: UserFollow[];
    nextCursor?: string;
  }> {
    try {
      const response = await table.getItems(TABLES.USER_FOLLOWS, {
        query: { follower_uid: followerUid },
        limit,
        cursor,
        sort: 'followed_uid',
        order: 'desc',
      });

      return {
        following: response.items as UserFollow[],
        nextCursor: response.nextCursor,
      };
    } catch (error) {
      console.error('Error getting following:', error);
      return { following: [] };
    }
  },
};