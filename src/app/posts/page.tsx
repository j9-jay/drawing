import { Metadata } from 'next';
import Link from 'next/link';
import { Card, Heading, Text, Container, Section, Badge } from '@/components/ui';
import { getPosts } from '@/lib/posts';

export const metadata: Metadata = {
  title: '게시판',
  description: '개발 관련 글을 공유합니다.',
  openGraph: {
    title: '게시판 | My Blog',
    description: '개발 관련 글을 공유합니다.',
  },
};

export default function PostsPage() {
  const posts = getPosts();

  return (
    <Section spacing="xl" background="transparent">
      <Container size="lg">
        <div className="space-y-8">
          <div>
            <Heading level="h1" style={{ marginBottom: '0.5rem' }}>
              게시판
            </Heading>
            <Text variant="secondary">개발 관련 글을 공유합니다.</Text>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link key={post.slug} href={`/posts/${post.slug}`}>
                <Card variant="hover">
                  <div className="space-y-3">
                    <Heading level="h3">{post.title}</Heading>
                    <Text variant="secondary">{post.description}</Text>
                    <div className="flex items-center gap-2">
                      <Text variant="secondary" style={{ fontSize: '0.875rem' }}>
                        {new Date(post.date).toLocaleDateString('ko-KR')}
                      </Text>
                    </div>
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
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
