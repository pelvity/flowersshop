import ClientBouquetEditPage from '@/components/admin/bouquets/EditBouquetPage';

export default async function EditBouquetPage({ params }: { params: { id: string; locale: string } }) {
  const { id, locale } = await params;
  return <ClientBouquetEditPage id={id} locale={locale} />;
} 