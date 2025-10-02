import Link from 'next/link';
import { Heading, Text, Container, Section, Button } from '@/components/ui';

export default function NotFound() {
  return (
    <Section spacing="xl" background="transparent">
      <Container size="md">
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center">
          <Heading level="h1" style={{ fontSize: '4rem' }}>
            404
          </Heading>
          <div className="space-y-2">
            <Heading level="h2">페이지를 찾을 수 없습니다</Heading>
            <Text variant="secondary">
              요청하신 페이지가 존재하지 않거나 삭제되었습니다.
            </Text>
          </div>
          <Link href="/">
            <Button variant="primary">홈으로 돌아가기</Button>
          </Link>
        </div>
      </Container>
    </Section>
  );
}
