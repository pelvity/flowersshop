import { redirect } from 'next/navigation';
import { defaultLocale } from '@config/i18n';

// Redirect the user to the default locale when `/` is requested
export default function RootPage() {
  console.log('[ROOT] Redirecting to default locale:', defaultLocale);
  redirect(`/${defaultLocale}`);
} 