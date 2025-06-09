import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export default function Home({ 
  params 
}: { 
  params: { locale: string } 
}) {
  // Force Next.js to understand this is a dynamic route
  headers();
  
  // Redirect to the catalog page in the current locale
  redirect(`/${params.locale}/catalog`);
} 