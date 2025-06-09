import { redirect } from 'next/navigation';

export default function Home({ params }: { params: { locale: string } }) {
  // Redirect to the main shop page with the correct locale
  redirect(`/${params.locale}/catalog`);
} 