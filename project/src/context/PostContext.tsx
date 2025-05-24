import React, { createContext, useContext, useState } from 'react';
import { Post, Category } from '../types';
import { mockPosts } from '../data/mockData';

interface PostContextType {
  posts: Post[];
  trendingPosts: Post[];
  addPost: (content: string, category?: Category) => void;
  addReaction: (postId: string, reactionType: 'hearts' | 'flames' | 'frowns') => void;
  getPostsByCategory: (category: Category) => Post[];
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export const PostProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [posts, setPosts] = useState<Post[]>(mockPosts);

  const trendingPosts = [...posts]
    .sort((a, b) => {
      const totalA = a.reactions.hearts + a.reactions.flames;
      const totalB = b.reactions.hearts + b.reactions.flames;
      return totalB - totalA;
    })
    .slice(0, 10);

  const addPost = (content: string, category?: Category) => {
    const newPost: Post = {
      id: Date.now().toString(),
      content,
      timestamp: new Date(),
      reactions: {
        hearts: 0,
        flames: 0,
        frowns: 0,
      },
      category,
    };
    
    setPosts(prevPosts => [newPost, ...prevPosts]);
  };

  const addReaction = (postId: string, reactionType: 'hearts' | 'flames' | 'frowns') => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? {
              ...post,
              reactions: {
                ...post.reactions,
                [reactionType]: post.reactions[reactionType] + 1,
              },
            }
          : post
      )
    );
  };

  const getPostsByCategory = (category: Category) => {
    return posts.filter(post => post.category === category);
  };

  return (
    <PostContext.Provider value={{ posts, trendingPosts, addPost, addReaction, getPostsByCategory }}>
      {children}
    </PostContext.Provider>
  );
};

export const usePosts = (): PostContextType => {
  const context = useContext(PostContext);
  if (context === undefined) {
    throw new Error('usePosts must be used within a PostProvider');
  }
  return context;
};