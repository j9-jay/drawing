import { Metadata } from 'next';
import { Heading, Text, Container, Section } from '@/components/ui';
import { JsonLd } from '@/components/seo';
import type { Locale } from '@/lib/i18n/config';
import { generatePageMetadata, generateWebPageSchema } from '@/lib/i18n/metadata';
import { loadTranslations, createTranslator } from '@/lib/i18n/translations';

interface AboutPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const pageTranslations = await loadTranslations(locale as Locale, 'pages');
  const t = createTranslator(pageTranslations, locale as Locale);

  return generatePageMetadata({
    locale: locale as Locale,
    path: '/about',
    title: t('about.title'),
    description: t('about.description'),
    keywords: t('about.keywords') as unknown as string[],
    type: 'website',
  });
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;
  const pageTranslations = await loadTranslations(locale as Locale, 'pages');
  const commonTranslations = await loadTranslations(locale as Locale, 'common');
  const t = createTranslator(pageTranslations, locale as Locale);
  const tc = createTranslator(commonTranslations, locale as Locale);

  const jsonLd = generateWebPageSchema({
    locale: locale as Locale,
    path: '/about',
    title: t('about.title'),
    description: t('about.description'),
  });

  // 한국어 하드코딩된 콘텐츠 (추후 번역 파일로 확장 가능)
  const isKorean = locale === 'ko';

  return (
    <>
      <JsonLd data={jsonLd} />
      <Section spacing="xl" background="transparent">
        <Container size="md">
          <div className="space-y-8">
            <div>
              <Heading level="h1" style={{ marginBottom: '1rem' }}>
                {isKorean ? 'My Blog 소개' : 'About My Blog'}
              </Heading>
              <Text variant="secondary" style={{ fontSize: '1.125rem' }}>
                {isKorean
                  ? '개발자를 위한 기술 블로그입니다.'
                  : 'A technical blog for developers.'}
              </Text>
            </div>

            <div className="space-y-6">
              <div>
                <Heading level="h2" style={{ marginBottom: '0.75rem' }}>
                  {isKorean ? '블로그 소개' : 'About This Blog'}
                </Heading>
                <Text variant="body" style={{ marginBottom: '1rem' }}>
                  {isKorean
                    ? '이 블로그는 웹 개발, 프로그래밍, 그리고 게임 개발에 관한 다양한 주제를 다룹니다. Next.js, React, TypeScript 등 최신 기술 스택을 활용한 실전 예제와 팁을 공유합니다.'
                    : 'This blog covers various topics about web development, programming, and game development. We share practical examples and tips using the latest tech stack including Next.js, React, and TypeScript.'}
                </Text>
              </div>

              <div>
                <Heading level="h2" style={{ marginBottom: '0.75rem' }}>
                  {isKorean ? '주요 콘텐츠' : 'Main Content'}
                </Heading>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>
                    {isKorean ? '웹 개발 튜토리얼' : 'Web Development Tutorials'}
                  </li>
                  <li>
                    {isKorean
                      ? '프로그래밍 베스트 프랙티스'
                      : 'Programming Best Practices'}
                  </li>
                  <li>
                    {isKorean ? '기술 트렌드 및 인사이트' : 'Tech Trends & Insights'}
                  </li>
                  <li>
                    {isKorean ? '인터랙티브 게임 개발' : 'Interactive Game Development'}
                  </li>
                </ul>
              </div>

              <div>
                <Heading level="h2" style={{ marginBottom: '0.75rem' }}>
                  {isKorean ? '연락하기' : 'Contact'}
                </Heading>
                <Text variant="body">
                  {isKorean
                    ? '블로그에 대한 문의사항이나 제안이 있으시면 언제든지 연락주세요.'
                    : 'If you have any questions or suggestions about the blog, feel free to contact us anytime.'}
                </Text>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
