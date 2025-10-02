import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { ToastProvider } from '@/components/ui';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'My Blog - 개발 블로그',
    template: '%s | My Blog',
  },
  description: '웹 개발, 프로그래밍, 게임 개발에 관한 블로그입니다.',
  keywords: ['블로그', '개발', 'Next.js', 'React', '핀볼게임'],
  authors: [{ name: 'Blog Author' }],
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://yourdomain.com',
    siteName: 'My Blog',
    title: 'My Blog - 개발 블로그',
    description: '웹 개발, 프로그래밍, 게임 개발에 관한 블로그입니다.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={inter.className}>
        <ToastProvider>
          <Navbar />
          <main className="min-h-screen">{children}</main>
        </ToastProvider>
      </body>
    </html>
  );
}
