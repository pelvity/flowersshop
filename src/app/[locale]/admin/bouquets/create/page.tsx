import ClientCreateBouquetPage from '@/components/admin/bouquets/CreateBouquetPage';

export default async function CreateBouquetPage({ params }: { params: { locale: string } }) {
  const { locale } = await params;
  return <ClientCreateBouquetPage locale={locale} />;
} 