import ClientBouquetsAdminPage from '@/components/admin/bouquets/BouquetsPage';

export default async function BouquetsAdminPage({ params }: { params: { locale: string } }) {
  const { locale } = await params;
  return <ClientBouquetsAdminPage locale={locale} />;
} 