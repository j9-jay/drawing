import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
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
  const t = createTranslator(pageTranslations, locale as Locale);

  const jsonLd = generateWebPageSchema({
    locale: locale as Locale,
    path: '/about',
    title: t('about.title'),
    description: t('about.description'),
  });

  return (
    <>
      <JsonLd data={jsonLd} />

      {/* Hero Section */}
      <Section spacing="xl" background="transparent">
        <Container size="lg">
          <div className="text-center space-y-6">
            <div className="flex justify-center mb-8">
              <Image
                src="/images/about/logo-placeholder.svg"
                alt="EasyPicky 브랜드 로고"
                width={200}
                height={200}
                priority
              />
            </div>
            <Heading level="h1" style={{ marginBottom: '1rem' }}>
              {t('about.hero.title')}
            </Heading>
            <Text variant="secondary" style={{ fontSize: '1.25rem', lineHeight: '1.75' }}>
              {t('about.hero.subtitle')}
            </Text>
          </div>
        </Container>
      </Section>

      {/* Introduction Section */}
      <Section spacing="lg" background="transparent">
        <Container size="lg">
          <div className="space-y-6">
            <Heading level="h2" style={{ marginBottom: '1rem' }}>
              {t('about.content.introduction.title')}
            </Heading>
            {t('about.content.introduction.content')
              .split('\n\n')
              .map((paragraph, index) => (
                <Text key={index} variant="body" style={{ marginBottom: '1rem', lineHeight: '1.8' }}>
                  {paragraph}
                </Text>
              ))}
          </div>
        </Container>
      </Section>

      {/* Philosophy Section */}
      <Section spacing="lg" background="transparent">
        <Container size="lg">
          <div className="space-y-6">
            <Heading level="h2" style={{ marginBottom: '1rem' }}>
              {t('about.content.philosophy.title')}
            </Heading>
            {t('about.content.philosophy.content')
              .split('\n\n')
              .map((paragraph, index) => (
                <Text key={index} variant="body" style={{ marginBottom: '1rem', lineHeight: '1.8' }}>
                  {paragraph}
                </Text>
              ))}
          </div>
        </Container>
      </Section>

      {/* Games Section */}
      <Section spacing="lg" background="transparent">
        <Container size="lg">
          <div className="space-y-6">
            <Heading level="h2" style={{ marginBottom: '1rem' }}>
              {t('about.content.games.title')}
            </Heading>
            <div className="flex justify-center my-8">
              <Image
                src="/images/about/game-screenshot-placeholder.svg"
                alt="핀볼 및 룰렛 게임 플레이 화면"
                width={800}
                height={600}
                className="rounded-lg shadow-lg"
              />
            </div>
            {t('about.content.games.content')
              .split('\n\n')
              .map((paragraph, index) => {
                // Add internal links to game pages
                const withLinks = paragraph
                  .replace(/핀볼/g, `<a href="/${locale}/pinball" class="text-blue-600 hover:underline">핀볼</a>`)
                  .replace(/Pinball/g, `<a href="/${locale}/pinball" class="text-blue-600 hover:underline">Pinball</a>`)
                  .replace(/룰렛/g, `<a href="/${locale}/roulette" class="text-blue-600 hover:underline">룰렛</a>`)
                  .replace(/Roulette/g, `<a href="/${locale}/roulette" class="text-blue-600 hover:underline">Roulette</a>`);

                return (
                  <Text
                    key={index}
                    variant="body"
                    style={{ marginBottom: '1rem', lineHeight: '1.8' }}
                    dangerouslySetInnerHTML={{ __html: withLinks }}
                  />
                );
              })}
            <div className="flex gap-4 justify-center mt-6">
              <Link
                href={`/${locale}/pinball`}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {locale === 'ko' ? '핀볼 게임 플레이' : 'Play Pinball'}
              </Link>
              <Link
                href={`/${locale}/roulette`}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                {locale === 'ko' ? '룰렛 게임 플레이' : 'Play Roulette'}
              </Link>
            </div>
          </div>
        </Container>
      </Section>

      {/* Team Section */}
      <Section spacing="lg" background="transparent">
        <Container size="lg">
          <div className="space-y-6">
            <Heading level="h2" style={{ marginBottom: '1rem' }}>
              {t('about.content.team.title')}
            </Heading>
            {t('about.content.team.content')
              .split('\n\n')
              .map((paragraph, index) => (
                <Text key={index} variant="body" style={{ marginBottom: '1rem', lineHeight: '1.8' }}>
                  {paragraph}
                </Text>
              ))}
          </div>
        </Container>
      </Section>

      {/* Feedback Section */}
      <Section spacing="lg" background="transparent">
        <Container size="lg">
          <div className="space-y-6">
            <Heading level="h2" style={{ marginBottom: '1rem' }}>
              {t('about.content.feedback.title')}
            </Heading>
            {t('about.content.feedback.content')
              .split('\n\n')
              .map((paragraph, index) => (
                <Text key={index} variant="body" style={{ marginBottom: '1rem', lineHeight: '1.8' }}>
                  {paragraph}
                </Text>
              ))}
          </div>
        </Container>
      </Section>

      {/* Contact Section */}
      <Section spacing="lg" background="transparent">
        <Container size="lg">
          <div className="space-y-6">
            <Heading level="h2" style={{ marginBottom: '1rem' }}>
              {t('about.content.contact.title')}
            </Heading>
            {t('about.content.contact.content')
              .split('\n\n')
              .map((paragraph, index) => (
                <Text key={index} variant="body" style={{ marginBottom: '1rem', lineHeight: '1.8' }}>
                  {paragraph}
                </Text>
              ))}
            <div className="text-center mt-8">
              <Link
                href={`/${locale}`}
                className="inline-block px-8 py-4 bg-green-600 text-white text-lg rounded-lg hover:bg-green-700 transition-colors"
              >
                {locale === 'ko' ? '홈으로 돌아가기' : 'Back to Home'}
              </Link>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
