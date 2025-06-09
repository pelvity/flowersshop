import { redirect } from 'next/navigation';

export default function AdminRedirect() {
  // Redirect to the English version of the admin dashboard
  redirect('/en/admin/dashboard');
} 