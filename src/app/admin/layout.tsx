import { redirect } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Redirect to the English version of the admin dashboard
  redirect('/en/admin/dashboard');
} 