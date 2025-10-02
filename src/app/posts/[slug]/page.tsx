import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { Heading, Text, Container, Section, Badge, Breadcrumb } from '@/components/ui';
import { getPost, getPosts } from '@/lib/posts';

interface PostPageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  const posts = getPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const post = getPost(params.slug);

  if (!post) {
    return {
      title: '글을 찾을 수 없습니다',
    };
  }

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: `${post.title} | My Blog`,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      tags: post.tags,
    },
  };
}

export default function PostPage({ params }: PostPageProps) {
  const post = getPost(params.slug);

  if (!post) {
    notFound();
  }

  const breadcrumbItems = [
    { label: '홈', href: '/' },
    { label: '게시판', href: '/posts' },
    { label: post.title, href: `/posts/${params.slug}` },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: {
      '@type': 'Person',
      name: 'Blog Author',
    },
    keywords: post.tags?.join(', '),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Section spacing="xl" background="transparent">
        <Container size="md">
          <div className="space-y-8">
            <Breadcrumb items={breadcrumbItems} />

            <div className="space-y-4">
              <Heading level="h1">{post.title}</Heading>
              <div className="flex items-center gap-4">
                <Text variant="secondary">
                  {new Date(post.date).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="primary" size="sm">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <article className="prose prose-neutral dark:prose-invert max-w-none">
              <MDXRemote source={post.content} />
            </article>
          </div>
        </Container>
      </Section>
    </>
  );
}
