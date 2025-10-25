/**
 * Root Layout (Locale-agnostic)
 *
 * 이 레이아웃은 locale에 무관한 설정만 포함합니다.
 * <html>, <body>, Navbar 등은 app/[locale]/layout.tsx로 이동했습니다.
 */

import './globals.css';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
