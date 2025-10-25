/**
 * Home Page
 * Redirect to /about
 */

import { redirect } from 'next/navigation';
import type { Locale } from '@/lib/i18n/config';

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  redirect(`/${locale}/about`);
}
