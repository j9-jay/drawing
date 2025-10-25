'use client';

import React, { useState } from 'react';
import { Button, Input, Link, Heading, Text, Card, Badge, Container, Section, Divider, Modal, Tabs, Skeleton, CodeBlock, Breadcrumb, Pagination, useToast } from '@/components/ui';
import { Navbar, Footer, Hero } from '@/components/layout';
import { GameCanvas, ControlPanel } from '@/components/game';
import { theme } from '@/styles/theme';

export default function ComponentsDemo() {
  const [inputValue, setInputValue] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { showToast } = useToast();

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: theme.colors.background.primary,
        color: theme.colors.text.primary,
        fontFamily: theme.typography.fontFamily.primary,
        padding: theme.spacing['4xl'],
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Heading level="h1" style={{ marginBottom: theme.spacing['3xl'] }}>
          Component Library
        </Heading>

        {/* Typography Section */}
        <DemoSection title="Typography">
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xl }}>
            <div>
              <Heading level="h1">Heading 1 (64px)</Heading>
              <Text variant="secondary" style={{ marginTop: theme.spacing.sm }}>
                Font weight: 510, Line height: 67.84px
              </Text>
            </div>
            <div>
              <Heading level="h2">Heading 2 (56px)</Heading>
              <Text variant="secondary" style={{ marginTop: theme.spacing.sm }}>
                Font weight: 538, Line height: 61.6px
              </Text>
            </div>
            <div>
              <Heading level="h3">Heading 3 (21px)</Heading>
              <Text variant="secondary" style={{ marginTop: theme.spacing.sm }}>
                Font weight: 510, Line height: 28px
              </Text>
            </div>
            <div>
              <Heading level="h4">Heading 4 (14px)</Heading>
              <Text variant="secondary" style={{ marginTop: theme.spacing.sm }}>
                Font weight: 510, Line height: 24px
              </Text>
            </div>
            <div>
              <Text variant="body">Body Text (16px, regular)</Text>
            </div>
            <div>
              <Text variant="secondary">Secondary Text (17px, secondary color)</Text>
            </div>
          </div>
        </DemoSection>

        {/* Buttons Section */}
        <DemoSection title="Buttons">
          <div style={{ display: 'flex', gap: theme.spacing.lg, flexWrap: 'wrap' }}>
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="rounded">Rounded Button</Button>
            <Button variant="primary" disabled>
              Disabled Button
            </Button>
          </div>
          <div style={{ marginTop: theme.spacing.xl }}>
            <Heading level="h4" style={{ marginBottom: theme.spacing.md }}>
              Variant Details
            </Heading>
            <Text variant="secondary">
              • Primary: 14px, medium weight, rectangular, primary color background
            </Text>
            <Text variant="secondary">
              • Secondary: 13px, medium weight, rounded (8px), transparent background
            </Text>
            <Text variant="secondary">
              • Rounded: 16px, normal weight, fully rounded (30px), secondary background
            </Text>
          </div>
        </DemoSection>

        {/* Links Section */}
        <DemoSection title="Links">
          <div style={{ display: 'flex', gap: theme.spacing.lg, flexWrap: 'wrap' }}>
            <Link href="#" variant="default">
              Default Link
            </Link>
            <Link href="#" variant="primary">
              Primary Link
            </Link>
            <Link href="#" variant="secondary">
              Secondary Link
            </Link>
          </div>
        </DemoSection>

        {/* Inputs Section */}
        <DemoSection title="Inputs">
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xl, maxWidth: '400px' }}>
            <Input
              label="Email"
              type="email"
              placeholder="Enter your email"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
            />
            <Input
              placeholder="Input without label"
            />
            <Input
              label="Disabled Input"
              disabled
              value="Disabled value"
            />
          </div>
        </DemoSection>

        {/* Colors Section */}
        <DemoSection title="Colors">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: theme.spacing.lg }}>
            <ColorCard title="Primary Main" color={theme.colors.primary.main} />
            <ColorCard title="Primary Light" color={theme.colors.primary.light} />
            <ColorCard title="Primary Dark" color={theme.colors.primary.dark} />
            <ColorCard title="Background Primary" color={theme.colors.background.primary} border />
            <ColorCard title="Background Secondary" color={theme.colors.background.secondary} border />
            <ColorCard title="Text Primary" color={theme.colors.text.primary} />
            <ColorCard title="Text Secondary" color={theme.colors.text.secondary} />
            <ColorCard title="Text Tertiary" color={theme.colors.text.tertiary} />
          </div>
        </DemoSection>

        {/* Spacing Section */}
        <DemoSection title="Spacing">
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.lg }}>
            {Object.entries(theme.spacing).map(([key, value]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.lg }}>
                <Text style={{ minWidth: '80px' }}>{key}:</Text>
                <div
                  style={{
                    width: value,
                    height: '20px',
                    backgroundColor: theme.colors.primary.main,
                  }}
                />
                <Text variant="secondary">{value}</Text>
              </div>
            ))}
          </div>
        </DemoSection>

        {/* Border Radius Section */}
        <DemoSection title="Border Radius">
          <div style={{ display: 'flex', gap: theme.spacing.lg, flexWrap: 'wrap' }}>
            {Object.entries(theme.borderRadius).map(([key, value]) => (
              <div key={key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: theme.spacing.sm }}>
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    backgroundColor: theme.colors.primary.main,
                    borderRadius: value,
                  }}
                />
                <Text variant="secondary">{key}</Text>
                <Text variant="secondary" style={{ fontSize: theme.typography.fontSize.xs }}>
                  {value}
                </Text>
              </div>
            ))}
          </div>
        </DemoSection>

        {/* Navbar Section */}
        <DemoSection title="Navbar">
          <div style={{ position: 'relative', height: '400px', overflow: 'hidden' }}>
            <Navbar />
            <div style={{ padding: theme.spacing.xl, marginTop: '80px' }}>
              <Text variant="secondary">Fixed navbar with blur effect, logo, navigation items.</Text>
              <Text variant="secondary" style={{ marginTop: theme.spacing.md }}>
                Navigation items configured in Navbar component
              </Text>
            </div>
          </div>
        </DemoSection>

        {/* Hero Section */}
        <DemoSection title="Hero">
          <div style={{ position: 'relative', backgroundColor: theme.colors.background.primary, borderRadius: theme.borderRadius.lg, overflow: 'hidden' }}>
            <Hero
              subtitle="New Feature"
              title="Build the future with Linear Dark Theme"
              description="A modern, minimalist design system inspired by Linear.app. Create beautiful interfaces with ease."
              primaryCta={{ text: 'Get Started' }}
              secondaryCta={{ text: 'Learn More' }}
            />
          </div>
          <div style={{ marginTop: theme.spacing.xl }}>
            <Text variant="secondary">
              Props: title, subtitle, description, primaryCta, secondaryCta, centered
            </Text>
          </div>
        </DemoSection>

        {/* Footer Section */}
        <DemoSection title="Footer">
          <div style={{ position: 'relative', backgroundColor: theme.colors.background.primary, borderRadius: theme.borderRadius.lg, overflow: 'hidden' }}>
            <Footer />
          </div>
          <div style={{ marginTop: theme.spacing.xl }}>
            <Text variant="secondary">
              Props: logo, description, columns, socialLinks, copyright
            </Text>
          </div>
        </DemoSection>

        {/* Card Section */}
        <DemoSection title="Card">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: theme.spacing.lg }}>
            <Card variant="default">
              <Heading level="h4" style={{ marginBottom: theme.spacing.md }}>Default Card</Heading>
              <Text variant="secondary">Standard card with border and padding.</Text>
            </Card>
            <Card variant="hover">
              <Heading level="h4" style={{ marginBottom: theme.spacing.md }}>Hover Card</Heading>
              <Text variant="secondary">Hover to see the effect. Perfect for clickable items.</Text>
            </Card>
            <Card variant="bordered">
              <Heading level="h4" style={{ marginBottom: theme.spacing.md }}>Bordered Card</Heading>
              <Text variant="secondary">Card with stronger border.</Text>
            </Card>
          </div>
          <div style={{ marginTop: theme.spacing.xl }}>
            <Text variant="secondary">Props: variant (default | hover | bordered)</Text>
          </div>
        </DemoSection>

        {/* Badge Section */}
        <DemoSection title="Badge">
          <div style={{ display: 'flex', gap: theme.spacing.lg, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
              <Text variant="secondary" style={{ fontSize: theme.typography.fontSize.sm }}>Variants:</Text>
              <div style={{ display: 'flex', gap: theme.spacing.md, flexWrap: 'wrap' }}>
                <Badge variant="default">Default</Badge>
                <Badge variant="primary">Primary</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
              </div>
            </div>
            <Divider orientation="vertical" style={{ height: '60px' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
              <Text variant="secondary" style={{ fontSize: theme.typography.fontSize.sm }}>Sizes:</Text>
              <div style={{ display: 'flex', gap: theme.spacing.md, alignItems: 'center' }}>
                <Badge size="sm" variant="primary">Small</Badge>
                <Badge size="md" variant="primary">Medium</Badge>
                <Badge size="lg" variant="primary">Large</Badge>
              </div>
            </div>
          </div>
          <div style={{ marginTop: theme.spacing.xl }}>
            <Text variant="secondary">Props: variant, size (sm | md | lg)</Text>
          </div>
        </DemoSection>

        {/* Divider Section */}
        <DemoSection title="Divider">
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xl }}>
            <div>
              <Text variant="secondary" style={{ marginBottom: theme.spacing.md }}>Solid (default):</Text>
              <Divider variant="solid" spacing="sm" />
            </div>
            <div>
              <Text variant="secondary" style={{ marginBottom: theme.spacing.md }}>Dashed:</Text>
              <Divider variant="dashed" spacing="sm" />
            </div>
            <div>
              <Text variant="secondary" style={{ marginBottom: theme.spacing.md }}>Gradient:</Text>
              <Divider variant="gradient" spacing="sm" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.lg }}>
              <Text variant="secondary">Vertical</Text>
              <Divider orientation="vertical" style={{ height: '40px' }} />
              <Text variant="secondary">Divider</Text>
            </div>
          </div>
          <div style={{ marginTop: theme.spacing.xl }}>
            <Text variant="secondary">Props: orientation (horizontal | vertical), variant (solid | dashed | gradient), spacing</Text>
          </div>
        </DemoSection>

        {/* Container & Section Section */}
        <DemoSection title="Container & Section">
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xl }}>
            <div>
              <Text variant="secondary" style={{ marginBottom: theme.spacing.md }}>Container sizes (sm, md, lg, xl, full):</Text>
              <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
                {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
                  <Container key={size} size={size} style={{ backgroundColor: theme.colors.background.secondary, padding: theme.spacing.md, borderRadius: theme.borderRadius.sm }}>
                    <Text variant="secondary" style={{ fontSize: theme.typography.fontSize.sm }}>Container size: {size}</Text>
                  </Container>
                ))}
              </div>
            </div>
            <div>
              <Text variant="secondary" style={{ marginBottom: theme.spacing.md }}>Section component (Container + spacing + background):</Text>
              <div style={{ border: `1px solid ${theme.colors.border.primary}`, borderRadius: theme.borderRadius.md, overflow: 'hidden' }}>
                <Section spacing="md" background="secondary" containerSize="md">
                  <Text>Section with medium spacing and secondary background</Text>
                </Section>
              </div>
            </div>
          </div>
          <div style={{ marginTop: theme.spacing.xl }}>
            <Text variant="secondary">Container props: size (sm | md | lg | xl | full)</Text>
            <Text variant="secondary">Section props: containerSize, spacing (sm | md | lg | xl), background (primary | secondary | transparent)</Text>
          </div>
        </DemoSection>

        {/* Modal Section */}
        <DemoSection title="Modal">
          <div style={{ display: 'flex', gap: theme.spacing.lg }}>
            <Button variant="primary" onClick={() => setModalOpen(true)}>
              Open Modal
            </Button>
          </div>
          <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Example Modal" size="md">
            <Text variant="body">This is a modal dialog. Press ESC or click outside to close.</Text>
            <div style={{ marginTop: theme.spacing.lg, display: 'flex', gap: theme.spacing.md }}>
              <Button variant="primary" onClick={() => setModalOpen(false)}>
                Confirm
              </Button>
              <Button variant="secondary" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
            </div>
          </Modal>
          <div style={{ marginTop: theme.spacing.xl }}>
            <Text variant="secondary">Props: isOpen, onClose, title, size (sm | md | lg | full), showCloseButton</Text>
          </div>
        </DemoSection>

        {/* Toast Section */}
        <DemoSection title="Toast">
          <div style={{ display: 'flex', gap: theme.spacing.lg, flexWrap: 'wrap' }}>
            <Button variant="primary" onClick={() => showToast('Success message!', 'success')}>
              Success Toast
            </Button>
            <Button variant="primary" onClick={() => showToast('Error occurred!', 'error')}>
              Error Toast
            </Button>
            <Button variant="primary" onClick={() => showToast('Warning!', 'warning')}>
              Warning Toast
            </Button>
            <Button variant="primary" onClick={() => showToast('Info message', 'info')}>
              Info Toast
            </Button>
          </div>
          <div style={{ marginTop: theme.spacing.xl }}>
            <Text variant="secondary">Use useToast() hook. Types: success, error, warning, info</Text>
          </div>
        </DemoSection>

        {/* Tabs Section */}
        <DemoSection title="Tabs">
          <Tabs
            tabs={[
              { id: 'tab1', label: 'Tab 1', content: <Text>Content for Tab 1</Text> },
              { id: 'tab2', label: 'Tab 2', content: <Text>Content for Tab 2</Text> },
              { id: 'tab3', label: 'Tab 3', content: <Text>Content for Tab 3</Text> },
            ]}
          />
          <div style={{ marginTop: theme.spacing.xl }}>
            <Text variant="secondary">Props: tabs (array of Tab), defaultTab, onChange</Text>
          </div>
        </DemoSection>

        {/* Skeleton Section */}
        <DemoSection title="Skeleton">
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xl }}>
            <div>
              <Text variant="secondary" style={{ marginBottom: theme.spacing.md }}>Text variant:</Text>
              <Skeleton variant="text" width="60%" />
            </div>
            <div>
              <Text variant="secondary" style={{ marginBottom: theme.spacing.md }}>Circular variant:</Text>
              <Skeleton variant="circular" width="60px" height="60px" />
            </div>
            <div>
              <Text variant="secondary" style={{ marginBottom: theme.spacing.md }}>Rectangular variant:</Text>
              <Skeleton variant="rectangular" width="100%" height="120px" />
            </div>
          </div>
          <div style={{ marginTop: theme.spacing.xl }}>
            <Text variant="secondary">Props: variant (text | circular | rectangular), width, height</Text>
          </div>
        </DemoSection>

        {/* CodeBlock Section */}
        <DemoSection title="CodeBlock">
          <CodeBlock
            title="example.js"
            language="javascript"
            code={`function hello() {\n  console.log('Hello World!');\n  return true;\n}`}
          />
          <div style={{ marginTop: theme.spacing.xl }}>
            <Text variant="secondary">Props: code, language, showLineNumbers, title</Text>
          </div>
        </DemoSection>

        {/* Breadcrumb Section */}
        <DemoSection title="Breadcrumb">
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: 'Blog', href: '/blog' },
              { label: 'Post Title' },
            ]}
          />
          <div style={{ marginTop: theme.spacing.xl }}>
            <Text variant="secondary">Props: items (array of BreadcrumbItem), separator</Text>
          </div>
        </DemoSection>

        {/* Pagination Section */}
        <DemoSection title="Pagination">
          <Pagination currentPage={currentPage} totalPages={10} onPageChange={setCurrentPage} />
          <div style={{ marginTop: theme.spacing.xl }}>
            <Text variant="secondary">Props: currentPage, totalPages, onPageChange, maxVisible</Text>
          </div>
        </DemoSection>

        {/* Game Components Section */}
        <DemoSection title="Game Components">
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xl }}>
            <div>
              <Text variant="secondary" style={{ marginBottom: theme.spacing.md }}>GameCanvas:</Text>
              <GameCanvas width={600} height={400} onCanvasReady={(canvas, ctx) => {
                ctx.fillStyle = theme.colors.primary.main;
                ctx.fillRect(50, 50, 100, 100);
              }} />
            </div>
            <div>
              <Text variant="secondary" style={{ marginBottom: theme.spacing.md }}>ControlPanel:</Text>
              <ControlPanel
                title="Game Controls"
                stats={[
                  { label: 'Score', value: 1000 },
                  { label: 'Level', value: 5 },
                  { label: 'Lives', value: 3 },
                ]}
                controls={[
                  { label: 'Start', onClick: () => alert('Start'), variant: 'primary' },
                  { label: 'Pause', onClick: () => alert('Pause'), variant: 'secondary' },
                  { label: 'Reset', onClick: () => alert('Reset'), variant: 'secondary' },
                ]}
              />
            </div>
          </div>
          <div style={{ marginTop: theme.spacing.xl }}>
            <Text variant="secondary">GameCanvas props: width, height, aspectRatio, onCanvasReady</Text>
            <Text variant="secondary">ControlPanel props: controls, stats, title, position</Text>
          </div>
        </DemoSection>
      </div>
    </div>
  );
}

// Helper Components
interface DemoSectionProps {
  title: string;
  children: React.ReactNode;
}

const DemoSection: React.FC<DemoSectionProps> = ({ title, children }) => {
  return (
    <section
      style={{
        marginBottom: theme.spacing['4xl'],
        padding: theme.spacing.xl,
        backgroundColor: theme.colors.background.secondary,
        borderRadius: theme.borderRadius.lg,
        border: `1px solid ${theme.colors.border.primary}`,
      }}
    >
      <Heading level="h2" style={{ marginBottom: theme.spacing.xl }}>
        {title}
      </Heading>
      {children}
    </section>
  );
};

interface ColorCardProps {
  title: string;
  color: string;
  border?: boolean;
}

const ColorCard: React.FC<ColorCardProps> = ({ title, color, border }) => {
  return (
    <div
      style={{
        padding: theme.spacing.lg,
        backgroundColor: theme.colors.background.primary,
        borderRadius: theme.borderRadius.md,
        border: `1px solid ${theme.colors.border.primary}`,
      }}
    >
      <div
        style={{
          width: '100%',
          height: '80px',
          backgroundColor: color,
          borderRadius: theme.borderRadius.sm,
          marginBottom: theme.spacing.md,
          border: border ? `1px solid ${theme.colors.border.primary}` : 'none',
        }}
      />
      <Text style={{ fontSize: theme.typography.fontSize.sm }}>{title}</Text>
      <Text variant="secondary" style={{ fontSize: theme.typography.fontSize.xs, marginTop: theme.spacing.xs }}>
        {color}
      </Text>
    </div>
  );
};
