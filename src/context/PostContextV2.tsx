import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
} from 'react';

import { userService } from '../services/userService';
import { useAuth } from './AuthContextV2';

export type PostData = {
  id: string;
  images: string[];
  caption: string;
  createdAt: string;
};

type PostContextType = {
  posts: PostData[];
  isLoading: boolean;
  error: string | null;
  createPost: (images: string[], caption: string) => Promise<void>;
  updatePost: (postId: string, caption: string) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  addLocalPost: (post: PostData) => void;
  removeLocalPost: (postId: string) => void;
};

const PostContext = createContext<PostContextType | undefined>(undefined);

export const PostProvider = ({ children }: { children: ReactNode }) => {
  const { token } = useAuth();
  const [posts, setPosts] = useState<PostData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPost = async (images: string[], caption: string) => {
    if (!token) {
      throw new Error('Not authenticated');
    }

    try {
      setIsLoading(true);
      setError(null);

      const result = await userService.createPost(token, images, caption);
      setPosts(prev => [result.post, ...prev]);
    } catch (err: any) {
      const message = err?.message || 'Failed to create post';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePost = async (postId: string, caption: string) => {
    if (!token) {
      throw new Error('Not authenticated');
    }

    try {
      setIsLoading(true);
      setError(null);

      const result = await userService.updatePost(token, postId, caption);
      setPosts(prev =>
        prev.map(post =>
          post.id === postId ? { ...post, caption: result.post.caption } : post
        )
      );
    } catch (err: any) {
      const message = err?.message || 'Failed to update post';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deletePost = async (postId: string) => {
    if (!token) {
      throw new Error('Not authenticated');
    }

    try {
      setIsLoading(true);
      setError(null);

      await userService.deletePost(token, postId);
      setPosts(prev => prev.filter(post => post.id !== postId));
    } catch (err: any) {
      const message = err?.message || 'Failed to delete post';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const addLocalPost = (post: PostData) => {
    setPosts(prev => [post, ...prev]);
  };

  const removeLocalPost = (postId: string) => {
    setPosts(prev => prev.filter(post => post.id !== postId));
  };

  const value: PostContextType = {
    posts,
    isLoading,
    error,
    createPost,
    updatePost,
    deletePost,
    addLocalPost,
    removeLocalPost,
  };

  return (
    <PostContext.Provider value={value}>{children}</PostContext.Provider>
  );
};

export const usePost = () => {
  const context = useContext(PostContext);

  if (!context) {
    throw new Error('usePost must be used within PostProvider');
  }

  return context;
};
