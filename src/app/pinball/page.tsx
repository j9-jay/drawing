'use client';

import { useEffect, useRef } from 'react';
import { Heading, Text, Container, Section } from '@/components/ui';

// This will be implemented later
// import { mountPinball } from '@/game/pinball';

export default function PinballPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      // TODO: Implement pinball game mount
      // mountPinball(canvasRef.current);
      console.log('Pinball game will be mounted here');
    }
  }, []);

  return (
    <Section spacing="xl" background="transparent">
      <Container size="lg">
        <div className="space-y-8">
          <div>
            <Heading level="h1" style={{ marginBottom: '0.5rem' }}>
              핀볼게임
            </Heading>
            <Text variant="secondary">인터랙티브 핀볼 게임을 즐겨보세요.</Text>
          </div>

          <div className="flex justify-center">
            <div className="w-full max-w-4xl bg-card rounded-lg p-4 shadow-lg">
              <canvas
                ref={canvasRef}
                className="w-full h-[600px] border border-border rounded"
              />
              <div className="mt-4 text-center">
                <Text variant="secondary">게임 구현 예정</Text>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
