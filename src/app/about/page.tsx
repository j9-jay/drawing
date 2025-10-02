import { Metadata } from 'next';
import { Heading, Text, Container, Section } from '@/components/ui';

export const metadata: Metadata = {
  title: '소개',
  description: 'My Blog에 대한 소개 페이지입니다.',
  openGraph: {
    title: '소개 | My Blog',
    description: 'My Blog에 대한 소개 페이지입니다.',
  },
};

export default function AboutPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'My Blog',
    url: 'https://yourdomain.com',
    description: '웹 개발, 프로그래밍, 게임 개발에 관한 블로그입니다.',
    author: {
      '@type': 'Person',
      name: 'Blog Author',
    },
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
            <div>
              <Heading level="h1" style={{ marginBottom: '1rem' }}>
                My Blog 소개
              </Heading>
              <Text variant="secondary" style={{ fontSize: '1.125rem' }}>
                개발자를 위한 기술 블로그입니다.
              </Text>
            </div>

            <div className="space-y-6">
              <div>
                <Heading level="h2" style={{ marginBottom: '0.75rem' }}>
                  블로그 소개
                </Heading>
                <Text variant="body" style={{ marginBottom: '1rem' }}>
                  이 블로그는 웹 개발, 프로그래밍, 그리고 게임 개발에 관한 다양한 주제를
                  다룹니다. Next.js, React, TypeScript 등 최신 기술 스택을 활용한 실전
                  예제와 팁을 공유합니다.
                </Text>
              </div>

              <div>
                <Heading level="h2" style={{ marginBottom: '0.75rem' }}>
                  주요 콘텐츠
                </Heading>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>웹 개발 튜토리얼</li>
                  <li>프로그래밍 베스트 프랙티스</li>
                  <li>기술 트렌드 및 인사이트</li>
                  <li>인터랙티브 게임 개발</li>
                </ul>
              </div>

              <div>
                <Heading level="h2" style={{ marginBottom: '0.75rem' }}>
                  연락하기
                </Heading>
                <Text variant="body">
                  블로그에 대한 문의사항이나 제안이 있으시면 언제든지 연락주세요.
                </Text>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
