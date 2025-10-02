import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// During build, process.cwd() is the workspace root, not my-app directory
const postsDirectory = path.join(process.cwd(), 'my-app', 'content', 'posts');

export function getPostSlugs() {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }
  return fs.readdirSync(postsDirectory).filter((file) => file.endsWith('.mdx'));
}

export function getPostBySlug(slug: string) {
  const realSlug = slug.replace(/\.mdx$/, '');
  const fullPath = path.join(postsDirectory, `${realSlug}.mdx`);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  return {
    slug: realSlug,
    meta: data,
    content,
  };
}

export function getAllPosts() {
  const slugs = getPostSlugs();
  const posts = slugs
    .map((slug) => getPostBySlug(slug.replace(/\.mdx$/, '')))
    .filter((post) => post !== null)
    .sort((a, b) => {
      if (!a || !b) return 0;
      return new Date(b.meta.date).getTime() - new Date(a.meta.date).getTime();
    });

  return posts;
}
