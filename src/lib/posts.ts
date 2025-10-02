import { Post, PostMeta } from '@/types/post';
import { getAllPosts, getPostBySlug } from './mdx';

export function getPosts(): PostMeta[] {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post!.slug,
    title: post!.meta.title,
    date: post!.meta.date,
    description: post!.meta.description,
    tags: post!.meta.tags || [],
  }));
}

export function getPost(slug: string): Post | null {
  const post = getPostBySlug(slug);
  if (!post) return null;

  return {
    slug: post.slug,
    title: post.meta.title,
    date: post.meta.date,
    description: post.meta.description,
    tags: post.meta.tags || [],
    content: post.content,
  };
}
